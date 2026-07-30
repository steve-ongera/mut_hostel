#api/receipt_service.py
"""
Utilities to build a branded, QR-coded booking receipt (PDF) and email it to
the student.
"""
import io
import logging
import os

import qrcode
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Branding
# ---------------------------------------------------------------------------
INSTITUTION_NAME = "MURANG'A UNIVERSITY OF TECHNOLOGY"
INSTITUTION_TAGLINE = "Hostel Booking Payment Receipt"
INSTITUTION_CONTACT = "P.O. Box 75-10200, Murang'a, Kenya  |  hostels@mut.ac.ke  |  +254 700 000000"

# Drop a logo file here (any of these paths, checked in order) to have it
# appear in the receipt header automatically - no code changes needed.
# Recommended: a square or near-square PNG/JPG, transparent background.
_LOGO_CANDIDATE_PATHS = [
    getattr(settings, "RECEIPT_LOGO_PATH", None),
    os.path.join(settings.BASE_DIR, "static", "images", "mut_logo.png"),
    os.path.join(settings.BASE_DIR, "static", "mut_logo.png"),
]

PRIMARY = HexColor("#0b104a")       # deep navy - matches the site's header color
ACCENT = HexColor("#525fe1")        # site accent purple-blue
ACCENT_LIGHT = HexColor("#ECEDFF")  # light tint for panels
TEXT_DARK = HexColor("#1a1a2e")
TEXT_GRAY = HexColor("#6c757d")
BORDER_GRAY = HexColor("#e0e0e6")
SUCCESS_GREEN = HexColor("#1e8e3e")


def _find_logo_path():
    for path in _LOGO_CANDIDATE_PATHS:
        if path and os.path.exists(path):
            return path
    return None


def generate_qr_code(booking):
    """Generate a QR code encoding the booking reference and verification info, save to booking.qr_code."""
    qr_payload = (
        f"MUT HOSTEL RECEIPT\n"
        f"Ref: {booking.booking_reference}\n"
        f"Name: {booking.full_name}\n"
        f"Reg No: {booking.registration_number}\n"
        f"Hostel: {booking.hostel.name}\n"
        f"Room: {booking.room.room_number} Bed: {booking.bed.bed_number}\n"
        f"Amount: KES {booking.amount}\n"
    )
    qr = qrcode.QRCode(box_size=8, border=2)
    qr.add_data(qr_payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    booking.qr_code.save(f"{booking.booking_reference}.png", ContentFile(buffer.getvalue()), save=True)
    return booking.qr_code


def _draw_header(c, width, height):
    """Branded header band: logo (if present) + institution name + tagline."""
    band_height = 32 * mm
    c.setFillColor(PRIMARY)
    c.rect(0, height - band_height, width, band_height, stroke=0, fill=1)

    # Thin accent underline beneath the header band
    c.setFillColor(ACCENT)
    c.rect(0, height - band_height - 1.2 * mm, width, 1.2 * mm, stroke=0, fill=1)

    text_x = 15 * mm
    logo_path = _find_logo_path()
    if logo_path:
        try:
            logo_size = 18 * mm
            c.drawImage(
                ImageReader(logo_path),
                12 * mm,
                height - band_height / 2 - logo_size / 2,
                width=logo_size,
                height=logo_size,
                preserveAspectRatio=True,
                mask="auto",
            )
            text_x = 12 * mm + logo_size + 6 * mm
        except Exception:
            logger.exception("Could not draw logo on receipt PDF; continuing without it")

    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 13)
    c.drawString(text_x, height - 13 * mm, INSTITUTION_NAME)
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#d8dbff"))
    c.drawString(text_x, height - 19 * mm, INSTITUTION_TAGLINE)

    return height - band_height - 1.2 * mm  # y-coordinate where the header ends


def _draw_watermark(c, width, height):
    c.saveState()
    c.translate(width / 2, height / 2)
    c.rotate(38)
    c.setFillColor(Color(0.12, 0.55, 0.25, alpha=0.10))
    c.setFont("Helvetica-Bold", 70)
    c.drawCentredString(0, 0, "PAID")
    c.restoreState()


def _draw_info_card(c, x, y, w, rows):
    """A bordered card with alternating-shade rows of label/value pairs. Returns the y-coordinate below the card."""
    row_height = 8 * mm
    card_height = row_height * len(rows) + 6 * mm
    top = y

    c.setStrokeColor(BORDER_GRAY)
    c.setLineWidth(0.6)
    c.roundRect(x, top - card_height, w, card_height, 3, stroke=1, fill=0)

    cursor_y = top - 3 * mm - row_height + 5.5
    for i, (label, value) in enumerate(rows):
        if i % 2 == 1:
            c.setFillColor(ACCENT_LIGHT)
            c.rect(x + 0.6 * mm, cursor_y - 2, w - 1.2 * mm, row_height, stroke=0, fill=1)

        c.setFillColor(TEXT_GRAY)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 5 * mm, cursor_y, label)

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica", 9)
        c.drawString(x + 55 * mm, cursor_y, str(value))

        cursor_y -= row_height

    return top - card_height


def build_receipt_pdf(booking):
    """Return a BytesIO buffer containing a branded A5 PDF receipt with the QR code embedded."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A5)
    width, height = A5

    _draw_watermark(c, width, height)
    header_bottom = _draw_header(c, width, height)

    # "OFFICIAL RECEIPT" badge + receipt number, right-aligned under the header
    badge_y = header_bottom - 8 * mm
    c.setFillColor(SUCCESS_GREEN)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(width - 15 * mm, badge_y, "\u2713  PAYMENT CONFIRMED")
    c.setFillColor(TEXT_GRAY)
    c.setFont("Helvetica", 8)
    c.drawRightString(
        width - 15 * mm,
        badge_y - 5 * mm,
        f"Receipt No. {booking.receipt_number or booking.booking_reference}",
    )

    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(15 * mm, badge_y, "Student & Booking Details")

    card_top = badge_y - 10 * mm
    rows = [
        ("Booking Reference", booking.booking_reference),
        ("Student Name", booking.full_name),
        ("Registration No.", booking.registration_number),
        ("Hostel", booking.hostel.name),
        ("Room / Bed", f"{booking.room.room_number} / {booking.bed.bed_number}"),
        ("Phone Number", booking.phone_number),
        ("Status", booking.get_status_display()),
        ("Date Paid", booking.paid_at.strftime("%d %b %Y, %H:%M") if booking.paid_at else "-"),
    ]
    card_bottom = _draw_info_card(c, 15 * mm, card_top, width - 30 * mm, rows)

    # Amount paid - highlighted panel
    amount_top = card_bottom - 6 * mm
    amount_height = 16 * mm
    c.setFillColor(PRIMARY)
    c.roundRect(15 * mm, amount_top - amount_height, width - 30 * mm, amount_height, 3, stroke=0, fill=1)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, amount_top - 6 * mm, "AMOUNT PAID")
    c.setFont("Helvetica-Bold", 16)
    c.drawString(20 * mm, amount_top - 13 * mm, f"KES {booking.amount:,.2f}")

    # QR code, bottom-right, in its own small bordered box
    qr_size = 28 * mm
    qr_box_y = 22 * mm
    if booking.qr_code:
        try:
            booking.qr_code.open("rb")
            qr_image = ImageReader(booking.qr_code)
            qr_x = width - 15 * mm - qr_size
            c.setStrokeColor(BORDER_GRAY)
            c.roundRect(qr_x - 2 * mm, qr_box_y - 2 * mm, qr_size + 4 * mm, qr_size + 8 * mm, 3, stroke=1, fill=0)
            c.drawImage(qr_image, qr_x, qr_box_y + 4 * mm, width=qr_size, height=qr_size, preserveAspectRatio=True)
            c.setFillColor(TEXT_GRAY)
            c.setFont("Helvetica", 6.5)
            c.drawCentredString(qr_x + qr_size / 2, qr_box_y, "Scan to verify at check-in")
        except Exception:
            logger.exception("Could not embed QR code in receipt PDF")

    # Footer
    c.setStrokeColor(BORDER_GRAY)
    c.setLineWidth(0.5)
    c.line(15 * mm, 16 * mm, width - 15 * mm, 16 * mm)
    c.setFillColor(TEXT_GRAY)
    c.setFont("Helvetica-Oblique", 7)
    c.drawCentredString(width / 2, 12 * mm, "This is a system-generated receipt and does not require a signature.")
    c.setFont("Helvetica", 6.5)
    c.drawCentredString(width / 2, 8 * mm, INSTITUTION_CONTACT)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer


def send_receipt_email(booking):
    """Email the receipt PDF (with QR code) to the student."""
    if not booking.qr_code:
        generate_qr_code(booking)

    pdf_buffer = build_receipt_pdf(booking)

    context = {"booking": booking}
    try:
        html_body = render_to_string("emails/receipt_email.html", context)
        text_body = strip_tags(html_body)
    except Exception:
        # Missing/broken email template should never block a booking that's
        # already been paid - fall back to a plain-text body instead of
        # raising (previously this crashed the caller, including the
        # /status/ polling endpoint, right after a successful payment).
        logger.exception(
            "emails/receipt_email.html could not be rendered - sending plain-text fallback instead"
        )
        text_body = (
            f"Dear {booking.full_name},\n\n"
            f"Your MUT Hostel booking payment has been confirmed.\n\n"
            f"Booking Reference: {booking.booking_reference}\n"
            f"Hostel: {booking.hostel.name}\n"
            f"Room: {booking.room.room_number}  Bed: {booking.bed.bed_number}\n"
            f"Amount Paid: KES {booking.amount}\n\n"
            f"Your official receipt is attached as a PDF.\n\n"
            f"{INSTITUTION_NAME}\n"
            f"{INSTITUTION_CONTACT}"
        )

    email = EmailMessage(
        subject=f"MUT Hostel Booking Receipt - {booking.booking_reference}",
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[booking.email],
    )
    email.content_subtype = "plain"
    email.attach(f"{booking.booking_reference}_receipt.pdf", pdf_buffer.read(), "application/pdf")

    try:
        email.send(fail_silently=False)
        booking.receipt_email_sent = True
        booking.save(update_fields=["receipt_email_sent"])
    except Exception:
        logger.exception("Failed to send receipt email for booking %s", booking.booking_reference)