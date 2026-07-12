from django.contrib import admin

from .models import Hostel, Room, Bed, Booking, MpesaTransaction


class RoomInline(admin.TabularInline):
    model = Room
    extra = 0


class BedInline(admin.TabularInline):
    model = Bed
    extra = 0


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "fee_amount", "total_beds", "available_beds", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("name",)
    inlines = [RoomInline]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "hostel", "floor", "capacity", "available_beds_count", "is_active")
    list_filter = ("hostel", "is_active")
    search_fields = ("room_number", "hostel__name")
    inlines = [BedInline]


@admin.register(Bed)
class BedAdmin(admin.ModelAdmin):
    list_display = ("room", "bed_number", "status", "hold_expires_at", "updated_at")
    list_filter = ("status", "room__hostel")
    search_fields = ("room__room_number", "room__hostel__name")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "booking_reference",
        "full_name",
        "registration_number",
        "hostel",
        "room",
        "bed",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "hostel", "is_minor")
    search_fields = ("booking_reference", "full_name", "registration_number", "email", "phone_number")
    readonly_fields = ("booking_reference", "created_at", "updated_at", "paid_at", "qr_code")


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "phone_number",
        "amount",
        "status",
        "mpesa_receipt_number",
        "checkout_request_id",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("checkout_request_id", "merchant_request_id", "mpesa_receipt_number", "booking__booking_reference")
    readonly_fields = ("raw_callback",)