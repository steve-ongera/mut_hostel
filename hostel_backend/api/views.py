#api/views.py
import logging

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Hostel, Room, Bed, Booking, MpesaTransaction
from .serializers import (
    HostelListSerializer,
    HostelDetailSerializer,
    RoomSerializer,
    BedHoldSerializer,
    BookingCreateSerializer,
    BookingSerializer,
    STKPushRequestSerializer,
)

from .mpesa_service import MpesaClient, MpesaError
from .receipt_service import generate_qr_code, send_receipt_email, build_receipt_pdf

logger = logging.getLogger(__name__)

# Don't hammer Daraja on every 2-second frontend poll - only actively query
# again if at least this many seconds have passed since we last touched the
# transaction record (covers both the initial push and any prior query).
# Kept comfortably above the frontend's 2s poll interval - repeatedly
# hitting Daraja's endpoints in quick succession is what trips Safaricom's
# sandbox WAF (Incapsula) into rate-limiting/challenging the requesting IP.
ACTIVE_QUERY_MIN_INTERVAL_SECONDS = 5


class BedDetailView(APIView):
    """
    GET /api/beds/<id>/
    Returns the bed with its hostel/room context and current hold countdown.
    Used by the booking form to rehydrate state purely from the URL's bedId,
    regardless of how the page was reached (fresh nav, refresh, back button).
    """

    def get(self, request, pk):
        bed = get_object_or_404(Bed.objects.select_related("room", "room__hostel"), pk=pk)
        bed.release_if_expired()
        serializer = BedHoldSerializer(bed)
        return Response(serializer.data)


class BedHoldView(APIView):
    """
    POST   /api/beds/<id>/hold/   - lock the bed for HOLD_DURATION_MINUTES (5 min)
    DELETE /api/beds/<id>/hold/   - release the hold early (e.g. user navigates away)
    """

    def post(self, request, pk):
        bed = get_object_or_404(Bed.objects.select_related("room", "room__hostel"), pk=pk)
        bed.release_if_expired()

        if bed.status == Bed.STATUS_BOOKED:
            return Response(
                {"detail": "This bed has already been booked. Please choose another bed."},
                status=status.HTTP_409_CONFLICT,
            )

        bed.hold()
        serializer = BedHoldSerializer(bed)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        bed = get_object_or_404(Bed, pk=pk)
        bed.release_if_expired()
        if bed.status == Bed.STATUS_PENDING:
            bed.release()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HostelListView(generics.ListAPIView):
    """GET /api/hostels/?category=boys|girls"""

    serializer_class = HostelListSerializer

    def get_queryset(self):
        qs = Hostel.objects.filter(is_active=True)
        category = self.request.query_params.get("category")
        if category in (Hostel.CATEGORY_BOYS, Hostel.CATEGORY_GIRLS):
            qs = qs.filter(category=category)
        return qs


class HostelDetailView(generics.RetrieveAPIView):
    """GET /api/hostels/<id>/ - includes rooms and live bed availability."""

    queryset = Hostel.objects.filter(is_active=True)
    serializer_class = HostelDetailSerializer


class RoomDetailView(generics.RetrieveAPIView):
    """GET /api/rooms/<id>/ - a single room with its beds (bus-seat style selection)."""

    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Creates a booking in `pending_payment` state and refreshes the hold on the
    selected bed so no other student can select it while this one is paying.
    """

    serializer_class = BookingCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        output = BookingSerializer(booking, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    """GET /api/bookings/<id>/ - used by the frontend to poll payment status."""

    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    lookup_field = "pk"


class InitiateSTKPushView(APIView):
    """POST /api/payments/stk-push/  {booking_id, phone_number}"""

    def post(self, request):
        serializer = STKPushRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking_id = serializer.validated_data["booking_id"]
        phone_number = serializer.validated_data["phone_number"]

        booking = get_object_or_404(Booking, pk=booking_id)

        booking.bed.release_if_expired()
        if booking.status != Booking.STATUS_PENDING_PAYMENT:
            return Response(
                {"detail": "This booking is no longer awaiting payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.bed.status != Bed.STATUS_PENDING:
            return Response(
                {"detail": "The hold on this bed has expired. Please select a bed again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = MpesaClient()
        try:
            data = client.stk_push(
                phone_number=phone_number,
                amount=booking.amount,
                account_reference=booking.booking_reference,
                transaction_desc=f"MUT Hostel Booking {booking.booking_reference}",
            )
        except MpesaError as exc:
            return Response(
                {"detail": str(exc), "daraja_error": exc.daraja_body},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        MpesaTransaction.objects.update_or_create(
            booking=booking,
            defaults={
                "phone_number": phone_number,
                "amount": booking.amount,
                "merchant_request_id": data.get("MerchantRequestID", ""),
                "checkout_request_id": data.get("CheckoutRequestID", ""),
                "status": MpesaTransaction.STATUS_PENDING,
                "result_code": "",
                "result_desc": data.get("CustomerMessage", ""),
                "mpesa_receipt_number": "",
                "transaction_date": "",
            },
        )

        return Response(
            {
                "detail": "STK push sent. Enter your M-Pesa PIN on your phone to complete payment.",
                "checkout_request_id": data.get("CheckoutRequestID"),
            },
            status=status.HTTP_200_OK,
        )


class MpesaCallbackView(APIView):
    """
    POST /api/payments/mpesa/callback/
    Public endpoint that Safaricom Daraja calls once the STK push has been
    accepted, declined, or timed out on the customer's phone.

    This is the passive path. BookingStatusView also actively polls Daraja
    as a fallback in case this callback never arrives (tunnel down, stale
    URL, etc.) - both paths converge on the same MpesaTransaction/Booking
    update logic below, and both are safe to run more than once.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        body = request.data.get("Body", {})
        callback = body.get("stkCallback", {})
        checkout_request_id = callback.get("CheckoutRequestID")
        result_code = callback.get("ResultCode")
        result_desc = callback.get("ResultDesc", "")

        if not checkout_request_id:
            logger.warning("M-Pesa callback missing CheckoutRequestID: %s", request.data)
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        try:
            transaction = MpesaTransaction.objects.select_related("booking", "booking__bed").get(
                checkout_request_id=checkout_request_id
            )
        except MpesaTransaction.DoesNotExist:
            logger.warning("No matching MpesaTransaction for %s", checkout_request_id)
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        transaction.raw_callback = request.data
        transaction.result_code = str(result_code)
        transaction.result_desc = result_desc

        booking = transaction.booking

        if str(result_code) == "0":
            metadata_items = callback.get("CallbackMetadata", {}).get("Item", [])
            metadata = {item.get("Name"): item.get("Value") for item in metadata_items}

            transaction.status = MpesaTransaction.STATUS_SUCCESS
            transaction.mpesa_receipt_number = metadata.get("MpesaReceiptNumber", "")
            transaction.transaction_date = str(metadata.get("TransactionDate", ""))
            transaction.save()

            # Idempotent: the active-query fallback in BookingStatusView may
            # have already marked this booking paid before this callback
            # arrived. Don't double-send the receipt email in that case.
            if booking.status != Booking.STATUS_PAID:
                booking.mark_paid(mpesa_receipt_number=transaction.mpesa_receipt_number)
                # Receipt generation / emailing must never take down the
                # callback response to Safaricom (they expect a fast 200
                # regardless) - the booking is already correctly marked
                # paid at this point either way.
                try:
                    generate_qr_code(booking)
                    send_receipt_email(booking)
                except Exception:
                    logger.exception("Receipt generation/email failed for booking %s (payment still recorded)", booking.id)
        else:
            transaction.status = (
                MpesaTransaction.STATUS_CANCELLED if str(result_code) == "1032" else MpesaTransaction.STATUS_FAILED
            )
            transaction.save()
            # Deliberately NOT cancelling the booking or releasing the bed
            # here. A failed/cancelled push (wrong PIN, insufficient funds,
            # user cancelled, timeout) is common and recoverable - the
            # student should be able to retry immediately from the same
            # payment page while their hold is still active. The bed only
            # gets released if the hold genuinely expires
            # (Bed.release_if_expired), which is checked on every relevant
            # request.

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


class BookingStatusView(APIView):
    """
    GET /api/bookings/<id>/status/ - polling endpoint used by the frontend
    while waiting for M-Pesa confirmation.

    In addition to reporting the current DB state, this actively queries
    Daraja for the transaction outcome if it's still pending and the
    passive callback hasn't updated it yet. This means the frontend gets a
    result within a couple of poll cycles even if the callback never
    reaches this server (e.g. ngrok tunnel down or URL stale) - instead of
    polling forever.
    """

    def get(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        booking.bed.release_if_expired()

        transaction = getattr(booking, "mpesa_transaction", None)

        if (
            transaction
            and transaction.status == MpesaTransaction.STATUS_PENDING
            and transaction.checkout_request_id
            and booking.status == Booking.STATUS_PENDING_PAYMENT
            and (timezone.now() - transaction.updated_at).total_seconds() >= ACTIVE_QUERY_MIN_INTERVAL_SECONDS
        ):
            self._actively_check_mpesa(booking, transaction)
            transaction.refresh_from_db()
            booking.refresh_from_db()

        data = {
            "booking_status": booking.status,
            "bed_status": booking.bed.status,
        }
        if transaction:
            data["mpesa_status"] = transaction.status
            data["mpesa_result_desc"] = transaction.result_desc
        return Response(data)

    def _actively_check_mpesa(self, booking, transaction):
        try:
            client = MpesaClient()
            result = client.query_stk_status(transaction.checkout_request_id)
        except MpesaError as exc:
            logger.warning("Active M-Pesa status query failed for booking %s: %s", booking.id, exc)
            return
        except Exception:
            # Belt-and-braces: whatever goes wrong here, the /status/
            # endpoint the frontend polls every 2 seconds must never 500 -
            # that would silently wedge the spinner since the frontend
            # swallows polling errors and just keeps trying. Worst case we
            # just fall back to waiting for the passive callback.
            logger.exception("Unexpected error during active M-Pesa status check for booking %s", booking.id)
            return

        if result["status"] == "pending":
            # Still being processed on the customer's phone - nothing to do,
            # just touch updated_at so we don't re-query on the very next
            # poll (throttling handled by ACTIVE_QUERY_MIN_INTERVAL_SECONDS).
            transaction.save(update_fields=["updated_at"])
            return

        transaction.result_code = result["result_code"] or ""
        transaction.result_desc = result["result_desc"]

        if result["status"] == "success":
            transaction.status = MpesaTransaction.STATUS_SUCCESS
            transaction.save()
            if booking.status != Booking.STATUS_PAID:
                booking.mark_paid(mpesa_receipt_number=None)
                # Same reasoning as the callback path: the /status/ endpoint
                # is polled every couple seconds by the frontend and must
                # stay up. The booking is already correctly marked paid
                # regardless of whether the receipt/email step succeeds.
                try:
                    generate_qr_code(booking)
                    send_receipt_email(booking)
                except Exception:
                    logger.exception(
                        "Receipt generation/email failed for booking %s (payment still recorded)", booking.id
                    )
        else:
            transaction.status = (
                MpesaTransaction.STATUS_CANCELLED if transaction.result_code == "1032" else MpesaTransaction.STATUS_FAILED
            )
            transaction.save()
            # Same as the callback path: don't cancel the booking or release
            # the bed on a failed attempt, so the student can retry.


class ReceiptDownloadView(APIView):
    """GET /api/bookings/<id>/receipt/ - downloads the PDF receipt for a paid booking."""

    def get(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        if booking.status != Booking.STATUS_PAID:
            return Response({"detail": "Receipt is only available once payment is confirmed."}, status=400)

        buffer = build_receipt_pdf(booking)
        response = FileResponse(
            buffer, as_attachment=True, filename=f"{booking.booking_reference}_receipt.pdf"
        )
        return response