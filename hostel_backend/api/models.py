import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator


def hostel_image_path(instance, filename):
    return f"hostels/{instance.category}/{filename}"


def qr_code_path(instance, filename):
    return f"receipts/qrcodes/{instance.booking_reference}.png"


class Hostel(models.Model):
    """A hostel block, either for Boys or Girls, with a fixed fee per bed."""

    CATEGORY_BOYS = "boys"
    CATEGORY_GIRLS = "girls"
    CATEGORY_CHOICES = [
        (CATEGORY_BOYS, "Boys Hostel"),
        (CATEGORY_GIRLS, "Girls Hostel"),
    ]

    name = models.CharField(max_length=150)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    image = models.ImageField(upload_to=hostel_image_path, blank=True, null=True)
    warden_name = models.CharField(max_length=150, blank=True)
    warden_phone = models.CharField(max_length=20, blank=True)
    location_notes = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    @property
    def total_beds(self):
        return Bed.objects.filter(room__hostel=self).count()

    @property
    def available_beds(self):
        return Bed.objects.filter(room__hostel=self, status=Bed.STATUS_AVAILABLE).count()


class Room(models.Model):
    hostel = models.ForeignKey(Hostel, related_name="rooms", on_delete=models.CASCADE)
    room_number = models.CharField(max_length=20)
    floor = models.CharField(max_length=20, blank=True)
    capacity = models.PositiveSmallIntegerField(default=4, help_text="Number of beds in this room")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["hostel", "room_number"]
        unique_together = ("hostel", "room_number")

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"

    @property
    def available_beds_count(self):
        return self.beds.filter(status=Bed.STATUS_AVAILABLE).count()


class Bed(models.Model):
    STATUS_AVAILABLE = "available"
    STATUS_PENDING = "pending"
    STATUS_BOOKED = "booked"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Available"),
        (STATUS_PENDING, "Pending Payment"),
        (STATUS_BOOKED, "Booked"),
    ]

    room = models.ForeignKey(Room, related_name="beds", on_delete=models.CASCADE)
    bed_number = models.CharField(max_length=10)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    hold_expires_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["room", "bed_number"]
        unique_together = ("room", "bed_number")

    def __str__(self):
        return f"{self.room} - Bed {self.bed_number}"

    def is_effectively_available(self):
        """A bed counts as available if free, or its pending hold has expired."""
        if self.status == self.STATUS_AVAILABLE:
            return True
        if self.status == self.STATUS_PENDING and self.hold_expires_at and self.hold_expires_at < timezone.now():
            return True
        return False

    def release_if_expired(self):
        if self.status == self.STATUS_PENDING and self.hold_expires_at and self.hold_expires_at < timezone.now():
            self.status = self.STATUS_AVAILABLE
            self.hold_expires_at = None
            self.save(update_fields=["status", "hold_expires_at", "updated_at"])
            Booking.objects.filter(bed=self, status=Booking.STATUS_PENDING_PAYMENT).update(
                status=Booking.STATUS_EXPIRED
            )
            return True
        return False

    def hold(self, minutes=10):
        self.status = self.STATUS_PENDING
        self.hold_expires_at = timezone.now() + timedelta(minutes=minutes)
        self.save(update_fields=["status", "hold_expires_at", "updated_at"])

    def confirm_booked(self):
        self.status = self.STATUS_BOOKED
        self.hold_expires_at = None
        self.save(update_fields=["status", "hold_expires_at", "updated_at"])

    def release(self):
        self.status = self.STATUS_AVAILABLE
        self.hold_expires_at = None
        self.save(update_fields=["status", "hold_expires_at", "updated_at"])


def generate_booking_reference():
    return f"MUT-HB-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class Booking(models.Model):
    STATUS_PENDING_PAYMENT = "pending_payment"
    STATUS_PAID = "paid"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"
    STATUS_CHOICES = [
        (STATUS_PENDING_PAYMENT, "Pending Payment"),
        (STATUS_PAID, "Paid"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
    ]

    booking_reference = models.CharField(max_length=30, unique=True, default=generate_booking_reference, editable=False)

    # Student details
    full_name = models.CharField(max_length=200, help_text="Full name as per KCSE certificate")
    registration_number = models.CharField(max_length=50)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, help_text="Phone number that will be charged via M-Pesa")

    is_minor = models.BooleanField(default=False)
    id_number = models.CharField(max_length=20, blank=True, help_text="National ID number, required if 18 or older")
    birth_certificate_number = models.CharField(
        max_length=30, blank=True, help_text="Birth certificate number, required if under 18"
    )

    # Hostel selection
    hostel = models.ForeignKey(Hostel, related_name="bookings", on_delete=models.PROTECT)
    room = models.ForeignKey(Room, related_name="bookings", on_delete=models.PROTECT)
    bed = models.OneToOneField(Bed, related_name="booking", on_delete=models.PROTECT)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING_PAYMENT)

    receipt_number = models.CharField(max_length=40, blank=True)
    qr_code = models.ImageField(upload_to=qr_code_path, blank=True, null=True)
    receipt_email_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.booking_reference} - {self.full_name}"

    def mark_paid(self, mpesa_receipt_number=None):
        self.status = self.STATUS_PAID
        self.paid_at = timezone.now()
        self.receipt_number = mpesa_receipt_number or self.booking_reference
        self.save(update_fields=["status", "paid_at", "receipt_number", "updated_at"])
        self.bed.confirm_booked()


class MpesaTransaction(models.Model):
    STATUS_PENDING = "pending"
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled by user"),
    ]

    booking = models.OneToOneField(Booking, related_name="mpesa_transaction", on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    merchant_request_id = models.CharField(max_length=100, blank=True)
    checkout_request_id = models.CharField(max_length=100, blank=True, db_index=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    result_code = models.CharField(max_length=10, blank=True)
    result_desc = models.CharField(max_length=255, blank=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True)
    transaction_date = models.CharField(max_length=20, blank=True)

    raw_callback = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.checkout_request_id or 'N/A'} - {self.status}"