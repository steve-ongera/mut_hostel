from django.utils import timezone
from rest_framework import serializers

from .models import Hostel, Room, Bed, Booking, MpesaTransaction


class BedSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Bed
        fields = ["id", "bed_number", "status", "is_available"]

    def get_is_available(self, obj):
        obj.release_if_expired()
        return obj.status == Bed.STATUS_AVAILABLE


class RoomSerializer(serializers.ModelSerializer):
    beds = BedSerializer(many=True, read_only=True)
    available_beds_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ["id", "room_number", "floor", "capacity", "available_beds_count", "beds"]

    def get_available_beds_count(self, obj):
        for bed in obj.beds.all():
            bed.release_if_expired()
        return obj.beds.filter(status=Bed.STATUS_AVAILABLE).count()


class HostelListSerializer(serializers.ModelSerializer):
    available_beds = serializers.SerializerMethodField()
    total_beds = serializers.IntegerField(read_only=True)

    class Meta:
        model = Hostel
        fields = [
            "id",
            "name",
            "category",
            "description",
            "fee_amount", 
            "image",
            "warden_name",
            "warden_phone",
            "location_notes",
            "available_beds",
            "total_beds",
        ]

    def get_available_beds(self, obj):
        for bed in Bed.objects.filter(room__hostel=obj):
            bed.release_if_expired()
        return obj.available_beds


class HostelDetailSerializer(HostelListSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta(HostelListSerializer.Meta):
        fields = HostelListSerializer.Meta.fields + ["rooms"]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "full_name",
            "registration_number",
            "email",
            "phone_number",
            "is_minor",
            "id_number",
            "birth_certificate_number",
            "hostel",
            "room",
            "bed",
        ]

    def validate(self, attrs):
        is_minor = attrs.get("is_minor", False)
        id_number = attrs.get("id_number", "")
        birth_cert = attrs.get("birth_certificate_number", "")

        if is_minor and not birth_cert:
            raise serializers.ValidationError(
                {"birth_certificate_number": "Birth certificate number is required for students under 18."}
            )
        if not is_minor and not id_number:
            raise serializers.ValidationError(
                {"id_number": "National ID number is required for students 18 years or older."}
            )

        bed = attrs.get("bed")
        room = attrs.get("room")
        hostel = attrs.get("hostel")

        if bed.room_id != room.id:
            raise serializers.ValidationError({"bed": "Selected bed does not belong to the selected room."})
        if room.hostel_id != hostel.id:
            raise serializers.ValidationError({"room": "Selected room does not belong to the selected hostel."})

        bed.release_if_expired()
        if bed.status != Bed.STATUS_AVAILABLE:
            raise serializers.ValidationError({"bed": "This bed is no longer available. Please choose another bed."})

        return attrs

    def create(self, validated_data):
        bed = validated_data["bed"]
        hostel = validated_data["hostel"]
        validated_data["amount"] = hostel.fee_amount
        booking = Booking.objects.create(**validated_data)
        bed.hold(minutes=10)
        return booking


class BookingSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source="hostel.name", read_only=True)
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    bed_number = serializers.CharField(source="bed.bed_number", read_only=True)
    qr_code = serializers.ImageField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_reference",
            "full_name",
            "registration_number",
            "email",
            "phone_number",
            "is_minor",
            "id_number",
            "birth_certificate_number",
            "hostel",
            "hostel_name",
            "room",
            "room_number",
            "bed",
            "bed_number",
            "amount",
            "status",
            "receipt_number",
            "qr_code",
            "created_at",
            "paid_at",
        ]
        read_only_fields = fields


class STKPushRequestSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    phone_number = serializers.CharField(
        max_length=15, help_text="Safaricom number in the format 2547XXXXXXXX"
    )

    def validate_phone_number(self, value):
        cleaned = value.strip().replace(" ", "").replace("+", "")
        if cleaned.startswith("0") and len(cleaned) == 10:
            cleaned = "254" + cleaned[1:]
        if cleaned.startswith("7") and len(cleaned) == 9:
            cleaned = "254" + cleaned
        if not (cleaned.startswith("254") and len(cleaned) == 12 and cleaned.isdigit()):
            raise serializers.ValidationError("Enter a valid Safaricom number, e.g. 0712345678.")
        return cleaned


class MpesaTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaTransaction
        fields = [
            "id",
            "phone_number",
            "amount",
            "status",
            "result_desc",
            "mpesa_receipt_number",
            "transaction_date",
            "created_at",
        ]
        read_only_fields = fields