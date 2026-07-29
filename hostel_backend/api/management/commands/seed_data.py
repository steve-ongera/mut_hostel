# api/management/commands/seed_data.py
import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.models import Hostel, Room, Bed, Booking, MpesaTransaction

User = get_user_model()

# --- Seed data pools -------------------------------------------------------

HOSTELS = [
    {
        "name": "Mount Kenya Hostel",
        "category": Hostel.CATEGORY_BOYS,
        "fee_amount": Decimal("15000.00"),
        "warden_name": "Mr. Peter Mwangi",
        "warden_phone": "0712345601",
        "location_notes": "Behind the main sports field, Block A",
        "description": "A boys' hostel named after Mount Kenya, the highest peak in Kenya.",
    },
    {
        "name": "Mount Elgon Hostel",
        "category": Hostel.CATEGORY_BOYS,
        "fee_amount": Decimal("15800.00"),
        "warden_name": "Mr. James Wafula",
        "warden_phone": "0712345602",
        "location_notes": "Next to the library, Block B",
        "description": "A boys' hostel named after Mount Elgon on the Kenya-Uganda border.",
    },
    {
        "name": "Mount Longonot Hostel",
        "category": Hostel.CATEGORY_GIRLS,
        "fee_amount": Decimal("17500.00"),
        "warden_name": "Mrs. Grace Chebet",
        "warden_phone": "0712345603",
        "location_notes": "Opposite the dining hall, Block C",
        "description": "A girls' hostel named after Mount Longonot in the Great Rift Valley.",
    },
    {
        "name": "Aberdare Hostel",
        "category": Hostel.CATEGORY_GIRLS,
        "fee_amount": Decimal("15000.00"),
        "warden_name": "Mrs. Susan Njeri",
        "warden_phone": "0712345604",
        "location_notes": "Near the health center, Block D",
        "description": "A girls' hostel named after the Aberdare (Nyandarua) mountain range.",
    },
]

ROOMS_PER_HOSTEL = 380
BEDS_PER_ROOM = 4

BOY_FIRST_NAMES = [
    "Brian", "Kevin", "Dennis", "Collins", "Victor", "Felix", "Mark",
    "Samuel", "Joseph", "Kelvin", "Elvis", "Robert", "Anthony", "Moses",
]
GIRL_FIRST_NAMES = [
    "Faith", "Mercy", "Grace", "Joy", "Purity", "Esther", "Ann",
    "Beatrice", "Winnie", "Caroline", "Diana", "Sharon", "Vivian", "Lilian",
]
LAST_NAMES = [
    "Mwangi", "Otieno", "Wafula", "Kiptoo", "Njoroge", "Kamau", "Achieng",
    "Chebet", "Wanjiru", "Odhiambo", "Kilonzo", "Mutua", "Njeri", "Cheruiyot",
    "Kariuki", "Barasa", "Nyambura", "Rotich",
]

EMAIL_DOMAIN = "student.mut.ac.ke"


def random_phone():
    return f"07{random.randint(10000000, 99999999)}"


def random_reg_number():
    return f"BSC/{random.randint(1000, 9999)}/{random.choice([2022, 2023, 2024, 2025])}"


class Command(BaseCommand):
    help = "Flushes existing hostel/booking data and seeds fresh demo data (4 hostels, rooms, beds, bookings, admin user)."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Flushing existing data..."))

        # Delete in FK-safe order: transactions -> bookings -> beds -> rooms -> hostels
        MpesaTransaction.objects.all().delete()
        Booking.objects.all().delete()
        Bed.objects.all().delete()
        Room.objects.all().delete()
        Hostel.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Existing hostel data cleared."))

        # --- Create hostels, rooms, beds ------------------------------------------------
        created_hostels = []
        for h in HOSTELS:
            hostel = Hostel.objects.create(
                name=h["name"],
                category=h["category"],
                description=h["description"],
                fee_amount=h["fee_amount"],
                warden_name=h["warden_name"],
                warden_phone=h["warden_phone"],
                location_notes=h["location_notes"],
                is_active=True,
            )
            created_hostels.append(hostel)

            for room_idx in range(1, ROOMS_PER_HOSTEL + 1):
                floor = "Ground" if room_idx <= ROOMS_PER_HOSTEL // 2 else "First"
                room = Room.objects.create(
                    hostel=hostel,
                    room_number=f"{room_idx:02d}",
                    floor=floor,
                    capacity=BEDS_PER_ROOM,
                    is_active=True,
                )
                for bed_letter in ["A", "B", "C", "D"][:BEDS_PER_ROOM]:
                    Bed.objects.create(room=room, bed_number=bed_letter)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created {hostel.name} ({hostel.get_category_display()}) - "
                    f"KES {hostel.fee_amount} - {ROOMS_PER_HOSTEL} rooms / "
                    f"{ROOMS_PER_HOSTEL * BEDS_PER_ROOM} beds"
                )
            )

        # --- Create bookings for ~3/4 of the rooms in each hostel -----------------------
        self.stdout.write(self.style.WARNING("Creating student bookings..."))

        total_bookings = 0
        for hostel in created_hostels:
            rooms = list(hostel.rooms.all())
            num_rooms_to_book = max(1, round(len(rooms) * 0.75))
            rooms_to_book = random.sample(rooms, num_rooms_to_book)

            first_names = BOY_FIRST_NAMES if hostel.category == Hostel.CATEGORY_BOYS else GIRL_FIRST_NAMES

            for room in rooms_to_book:
                beds = list(room.beds.all())
                # Book between 1 and all beds in the room, leaning towards partially full
                num_beds_to_book = random.randint(1, len(beds))
                beds_to_book = random.sample(beds, num_beds_to_book)

                for bed in beds_to_book:
                    first_name = random.choice(first_names)
                    last_name = random.choice(LAST_NAMES)
                    full_name = f"{first_name} {last_name}"
                    is_minor = random.random() < 0.15  # a few underage entrants

                    # The model's default booking_reference only has 6 random hex chars
                    # per day, which collides once you generate thousands of bookings in
                    # one run. Derive a guaranteed-unique reference from the bed's pk
                    # instead (each bed can only ever have one booking, via OneToOneField).
                    booking_reference = f"MUT-HB-{timezone.now().strftime('%Y%m%d')}-{bed.pk:06d}"

                    booking = Booking(
                        booking_reference=booking_reference,
                        full_name=full_name,
                        registration_number=random_reg_number(),
                        email=f"{first_name}.{last_name}{random.randint(1,99)}@{EMAIL_DOMAIN}".lower(),
                        phone_number=random_phone(),
                        is_minor=is_minor,
                        hostel=hostel,
                        room=room,
                        bed=bed,
                        amount=hostel.fee_amount,
                    )
                    if is_minor:
                        booking.birth_certificate_number = f"BC{random.randint(100000, 999999)}"
                    else:
                        booking.id_number = str(random.randint(30000000, 42000000))

                    # Vary booking status: mostly paid, a few pending payment
                    if random.random() < 0.8:
                        booking.status = Booking.STATUS_PAID
                        booking.paid_at = timezone.now()
                        booking.receipt_number = booking.booking_reference
                        booking.receipt_email_sent = True
                        bed.status = Bed.STATUS_BOOKED
                        bed.hold_expires_at = None
                    else:
                        booking.status = Booking.STATUS_PENDING_PAYMENT
                        bed.status = Bed.STATUS_PENDING
                        bed.hold_expires_at = timezone.now() + timezone.timedelta(minutes=10)

                    booking.save()
                    bed.save(update_fields=["status", "hold_expires_at", "updated_at"])

                    # Attach an M-Pesa transaction record for paid bookings
                    if booking.status == Booking.STATUS_PAID:
                        MpesaTransaction.objects.create(
                            booking=booking,
                            phone_number=booking.phone_number,
                            amount=booking.amount,
                            merchant_request_id=f"MR{random.randint(100000,999999)}",
                            checkout_request_id=f"ws_CO_{random.randint(10**14,10**15-1)}",
                            status=MpesaTransaction.STATUS_SUCCESS,
                            result_code="0",
                            result_desc="The service request is processed successfully.",
                            mpesa_receipt_number=f"S{random.randint(10**8,10**9-1)}",
                            transaction_date=timezone.now().strftime("%Y%m%d%H%M%S"),
                        )

                    total_bookings += 1

        self.stdout.write(self.style.SUCCESS(f"Created {total_bookings} student bookings."))

        # --- Create superuser -------------------------------------------------------
        self.stdout.write(self.style.WARNING("Setting up admin superuser..."))

        User.objects.filter(username="admin").delete()
        User.objects.create_superuser(
            username="admin",
            email="admin@mut.ac.ke",
            password="password123",
        )
        self.stdout.write(self.style.SUCCESS("Superuser created -> username: admin / password: password123"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))