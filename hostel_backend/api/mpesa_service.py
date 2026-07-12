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
    """Raised when a Daraja API call fails or returns an unexpected payload."""


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
        """Optional: actively query Daraja for the status of a push (fallback to callback)."""
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
            return response.json()
        except requests.RequestException as exc:
            logger.exception("STK status query failed")
            raise MpesaError("Could not confirm payment status with M-Pesa.") from exc