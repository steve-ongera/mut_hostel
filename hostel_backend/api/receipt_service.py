"""
Utilities to build a QR-coded booking receipt (PDF) and email it to the student.
"""
import io
import logging

import qrcode
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)


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


def build_receipt_pdf(booking):
    """Return a BytesIO buffer containing a simple A5 PDF receipt with the QR code embedded."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A5)
    width, height = A5

    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 20 * mm, "MURANG'A UNIVERSITY OF TECHNOLOGY")
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 26 * mm, "Hostel Booking Payment Receipt")

    c.line(15 * mm, height - 30 * mm, width - 15 * mm, height - 30 * mm)

    y = height - 40 * mm
    line_height = 7 * mm
    rows = [
        ("Receipt No.", booking.receipt_number or booking.booking_reference),
        ("Booking Ref.", booking.booking_reference),
        ("Student Name", booking.full_name),
        ("Registration No.", booking.registration_number),
        ("Hostel", booking.hostel.name),
        ("Room / Bed", f"{booking.room.room_number} / {booking.bed.bed_number}"),
        ("Amount Paid", f"KES {booking.amount}"),
        ("Phone Number", booking.phone_number),
        ("Status", booking.get_status_display()),
        ("Date Paid", booking.paid_at.strftime("%d %b %Y, %H:%M") if booking.paid_at else "-"),
    ]

    c.setFont("Helvetica", 10)
    for label, value in rows:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(15 * mm, y, f"{label}:")
        c.setFont("Helvetica", 10)
        c.drawString(60 * mm, y, str(value))
        y -= line_height

    if booking.qr_code:
        try:
            booking.qr_code.open("rb")
            from reportlab.lib.utils import ImageReader

            qr_image = ImageReader(booking.qr_code)
            qr_size = 35 * mm
            c.drawImage(
                qr_image,
                width - qr_size - 15 * mm,
                15 * mm,
                width=qr_size,
                height=qr_size,
                preserveAspectRatio=True,
            )
        except Exception:
            logger.exception("Could not embed QR code in receipt PDF")

    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(width / 2, 10 * mm, "This is a system-generated receipt. Keep it safe for hostel reporting.")

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
    html_body = render_to_string("emails/receipt_email.html", context)
    text_body = strip_tags(html_body)

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