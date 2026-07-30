#api/mpesa_service.py
"""
Thin wrapper around Safaricom's Daraja STK Push (Lipa na M-Pesa Online) API.
"""
import base64
import datetime
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class MpesaError(Exception):
    """Raised when a Daraja API call fails outright (network/auth issue)."""


# Common Daraja STK ResultCode values -> friendly, student-facing messages.
# Full list: https://developer.safaricom.co.ke/docs (M-Pesa Express result codes)
RESULT_CODE_MESSAGES = {
    "0": "Payment completed successfully.",
    "1": "Insufficient funds in your M-Pesa account.",
    "1032": "Payment was cancelled on your phone.",
    "1037": "No response was received on your phone in time. Please try again.",
    "1025": "Unable to reach your phone. Please check your network and try again.",
    "1001": "A transaction is already in progress for this number. Please wait a moment and try again.",
    "2001": "Incorrect M-Pesa PIN entered.",
    "9999": "Payment could not be completed. Please try again.",
}


def describe_result(result_code, fallback=""):
    return RESULT_CODE_MESSAGES.get(str(result_code), fallback or "Payment could not be completed. Please try again.")


class MpesaClient:
    def __init__(self):
        self.env = getattr(settings, "MPESA_ENV", "sandbox")
        self.base_url = (
            "https://api.safaricom.co.ke" if self.env == "production" else "https://sandbox.safaricom.co.ke"
        )
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL

    def _get_access_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        try:
            response = requests.get(url, auth=(self.consumer_key, self.consumer_secret), timeout=30)
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.exception("Failed to obtain M-Pesa access token")
            raise MpesaError("Could not authenticate with M-Pesa. Please try again shortly.") from exc
        return response.json()["access_token"]

    def _password(self, timestamp):
        raw = f"{self.shortcode}{self.passkey}{timestamp}".encode("utf-8")
        return base64.b64encode(raw).decode("utf-8")

    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        token = self._get_access_token()
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password = self._password(timestamp)

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": self.callback_url,
            "AccountReference": account_reference[:12],
            "TransactionDesc": transaction_desc[:100],
        }
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            data = response.json()
        except requests.RequestException as exc:
            logger.exception("STK push request failed")
            raise MpesaError("Could not reach M-Pesa. Please try again shortly.") from exc

        if response.status_code != 200 or "CheckoutRequestID" not in data:
            logger.error("STK push rejected: %s", data)
            raise MpesaError(data.get("errorMessage", "M-Pesa rejected the payment request."))

        return data

    def query_stk_status(self, checkout_request_id):
        """
        Actively ask Daraja for the outcome of a previously-sent STK push.
        This is the fallback path used when the passive callback hasn't
        arrived yet (ngrok down, network blip, callback URL stale, etc.)
        so the frontend isn't stuck polling forever.

        Returns a normalized dict:
            {"status": "success" | "failed" | "pending", "result_code": str|None, "result_desc": str}

        Raises MpesaError only for actual request/auth failures - a
        transaction that is simply still being processed on the customer's
        phone is returned as status="pending", not an exception.
        """
        token = self._get_access_token()
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password = self._password(timestamp)

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id,
        }
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            data = response.json()
        except requests.RequestException as exc:
            logger.exception("STK status query failed (network error)")
            raise MpesaError("Could not confirm payment status with M-Pesa.") from exc
        except ValueError as exc:
            # response.json() raises this (JSONDecodeError, a ValueError
            # subclass) if Daraja ever returns a non-JSON body - has
            # happened on sandbox under load. Treat the same as a network
            # failure rather than letting it bubble up and crash the
            # polling endpoint.
            logger.exception("STK status query returned non-JSON response")
            raise MpesaError("Could not confirm payment status with M-Pesa.") from exc

        logger.debug("STK query raw response for %s: %s", checkout_request_id, data)

        # While the customer hasn't yet responded on their phone, Daraja
        # returns an error payload (no ResultCode) instead of a real result.
        if "ResultCode" not in data:
            logger.info("STK query still processing for %s: %s", checkout_request_id, data)
            return {
                "status": "pending",
                "result_code": None,
                "result_desc": data.get("errorMessage", "Payment still being processed."),
            }

        result_code = str(data.get("ResultCode"))
        result_desc = data.get("ResultDesc", "")

        if result_code == "0":
            return {"status": "success", "result_code": result_code, "result_desc": result_desc}

        return {
            "status": "failed",
            "result_code": result_code,
            "result_desc": describe_result(result_code, result_desc),
        }