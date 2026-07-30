#api/mpesa_service.py
"""
Thin wrapper around Safaricom's Daraja STK Push (Lipa na M-Pesa Online) API.

Note on headers: Safaricom's sandbox sits behind an Incapsula WAF that will
occasionally return an HTML "bot challenge" page instead of a JSON error when
a request doesn't look like it came from a normal browser (e.g. the default
python-requests User-Agent). We send a standard browser User-Agent on every
call to avoid that, and detect+label the challenge page if it slips through
anyway, instead of letting response.json() blow up with a confusing
JSONDecodeError.
"""
import base64
import datetime
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}

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


def _safe_json(response):
    """
    Parses a Daraja response as JSON, but if it's actually an HTML WAF
    challenge page (or anything else non-JSON), returns a diagnostic dict
    instead of raising - so callers always get a dict back and can decide
    what to do, rather than crashing on response.json().
    """
    try:
        return response.json()
    except ValueError:
        text = response.text
        if "Incapsula" in text or "<html" in text.lower():
            return {
                "raw_text": text[:500],
                "note": (
                    "This looks like a WAF/bot-protection challenge page (e.g. "
                    "Incapsula) from Safaricom's edge, not a real Daraja JSON "
                    "response. Usually caused by a missing/unusual User-Agent "
                    "header, or resolves itself after a short wait."
                ),
            }
        return {"raw_text": text[:500]}


class MpesaError(Exception):
    """
    Raised when a Daraja API call fails or returns an unexpected payload.
    Carries the parsed/diagnostic response body so callers can surface
    something more useful than a generic message when needed.
    """

    def __init__(self, message, status_code=None, daraja_body=None):
        super().__init__(message)
        self.status_code = status_code
        self.daraja_body = daraja_body or {}


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
            response = requests.get(
                url,
                auth=(self.consumer_key, self.consumer_secret),
                headers=_REQUEST_HEADERS,
                timeout=30,
            )
        except requests.RequestException as exc:
            logger.exception("Failed to reach M-Pesa token endpoint")
            raise MpesaError("Could not reach M-Pesa. Please try again shortly.") from exc

        if not response.ok:
            body = _safe_json(response)
            logger.error("M-Pesa token request rejected (%s): %s", response.status_code, body)
            raise MpesaError(
                f"Could not authenticate with M-Pesa (HTTP {response.status_code}). "
                "Check MPESA_CONSUMER_KEY/SECRET and MPESA_ENV.",
                status_code=response.status_code,
                daraja_body=body,
            )

        body = _safe_json(response)
        if "access_token" not in body:
            logger.error("M-Pesa token response missing access_token: %s", body)
            raise MpesaError(
                "M-Pesa did not return an access token.",
                status_code=response.status_code,
                daraja_body=body,
            )
        return body["access_token"]

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
        headers = {**_REQUEST_HEADERS, "Authorization": f"Bearer {token}"}
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
        except requests.RequestException as exc:
            logger.exception("STK push request failed")
            raise MpesaError("Could not reach M-Pesa. Please try again shortly.") from exc

        body = _safe_json(response)

        if not response.ok or "CheckoutRequestID" not in body:
            logger.error("STK push rejected (%s): %s", response.status_code, body)
            error_message = body.get("errorMessage") or body.get("note") or str(body)
            raise MpesaError(
                f"M-Pesa rejected the payment request: {error_message}",
                status_code=response.status_code,
                daraja_body=body,
            )

        return body

    def query_stk_status(self, checkout_request_id):
        """
        Actively ask Daraja for the outcome of a previously-sent STK push.
        Used as a fallback when the passive callback hasn't arrived yet
        (tunnel down, stale URL, WAF hiccup, etc).

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
        headers = {**_REQUEST_HEADERS, "Authorization": f"Bearer {token}"}
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
        except requests.RequestException as exc:
            logger.exception("STK status query failed (network error)")
            raise MpesaError("Could not confirm payment status with M-Pesa.") from exc

        data = _safe_json(response)
        logger.debug("STK query raw response for %s: %s", checkout_request_id, data)

        # While the customer hasn't yet responded on their phone (or we hit
        # a transient WAF/error page), Daraja returns a payload without a
        # ResultCode instead of a real result. Treat both as "still pending"
        # rather than a hard failure - the next poll will try again.
        if "ResultCode" not in data:
            return {
                "status": "pending",
                "result_code": None,
                "result_desc": data.get("errorMessage") or data.get("note") or "Payment still being processed.",
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