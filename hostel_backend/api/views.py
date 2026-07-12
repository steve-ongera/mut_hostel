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
    BookingCreateSerializer,
    BookingSerializer,
    STKPushRequestSerializer,
)
from .mpesa_service import MpesaClient, MpesaError
from .receipt_service import generate_qr_code, send_receipt_email, build_receipt_pdf

logger = logging.getLogger(__name__)


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
    Creates a booking in `pending_payment` state and places a 10-minute hold on the
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
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        MpesaTransaction.objects.update_or_create(
            booking=booking,
            defaults={
                "phone_number": phone_number,
                "amount": booking.amount,
                "merchant_request_id": data.get("MerchantRequestID", ""),
                "checkout_request_id": data.get("CheckoutRequestID", ""),
                "status": MpesaTransaction.STATUS_PENDING,
                "result_desc": data.get("CustomerMessage", ""),
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

        if str(result_code) == "0":
            metadata_items = callback.get("CallbackMetadata", {}).get("Item", [])
            metadata = {item.get("Name"): item.get("Value") for item in metadata_items}

            transaction.status = MpesaTransaction.STATUS_SUCCESS
            transaction.mpesa_receipt_number = metadata.get("MpesaReceiptNumber", "")
            transaction.transaction_date = str(metadata.get("TransactionDate", ""))
            transaction.save()

            booking = transaction.booking
            booking.mark_paid(mpesa_receipt_number=transaction.mpesa_receipt_number)

            generate_qr_code(booking)
            send_receipt_email(booking)
        else:
            transaction.status = (
                MpesaTransaction.STATUS_CANCELLED if str(result_code) == "1032" else MpesaTransaction.STATUS_FAILED
            )
            transaction.save()

            booking = transaction.booking
            booking.status = Booking.STATUS_CANCELLED
            booking.save(update_fields=["status", "updated_at"])
            booking.bed.release()

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


class BookingStatusView(APIView):
    """GET /api/bookings/<id>/status/ - lightweight polling endpoint for the frontend."""

    def get(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        booking.bed.release_if_expired()
        data = {
            "booking_status": booking.status,
            "bed_status": booking.bed.status,
        }
        if hasattr(booking, "mpesa_transaction"):
            data["mpesa_status"] = booking.mpesa_transaction.status
            data["mpesa_result_desc"] = booking.mpesa_transaction.result_desc
        return Response(data)


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