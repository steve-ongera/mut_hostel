// src/pages/ReceiptPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBooking, getReceiptDownloadUrl } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBooking(id);
        if (data.status !== "paid") {
          setError("This booking has not been paid for yet.");
          return;
        }
        setBooking(data);
      } catch (err) {
        setError("Failed to load receipt. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleDownloadPDF = () => {
    const url = getReceiptDownloadUrl(id);
    window.open(url, "_blank");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: "center", minHeight: "400px" }}>
        <LoadingSpinner size="lg" text="Loading receipt..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <div className="alert alert-danger">
          <div className="alert-icon">⚠</div>
          <div className="alert-content">
            <div className="alert-title">Error</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          Go Home
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <h2>Booking Not Found</h2>
        <Link to="/" className="btn btn-primary mt-3">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="text-center mb-4">
        <h2 className="section-title">Booking Receipt</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Your booking has been confirmed. Keep this receipt for your records.
        </p>
      </div>

      <div className="receipt" id="receipt">
        <div className="receipt-header">
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏫</div>
          <div className="receipt-title">MURANG'A UNIVERSITY</div>
          <div className="receipt-subtitle">Hostel Booking Confirmation</div>
          <div className="receipt-subtitle" style={{ marginTop: "0.5rem" }}>
            <strong>Reference:</strong> {booking.booking_reference}
          </div>
        </div>

        <div className="receipt-body">
          <h4 style={{ color: "var(--mut-maroon)", marginBottom: "1rem" }}>
            Student Details
          </h4>
          
          <div className="receipt-row">
            <span className="label">Full Name</span>
            <span className="value">{booking.full_name}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Registration Number</span>
            <span className="value">{booking.registration_number}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Email</span>
            <span className="value">{booking.email}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Phone</span>
            <span className="value">{booking.phone_number}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">ID / Birth Certificate</span>
            <span className="value">{booking.id_number || booking.birth_certificate_number}</span>
          </div>

          <h4 style={{ color: "var(--mut-maroon)", margin: "1.5rem 0 1rem" }}>
            Hostel Details
          </h4>
          
          <div className="receipt-row">
            <span className="label">Hostel</span>
            <span className="value">{booking.hostel_name}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Room</span>
            <span className="value">Room {booking.room_number}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Bed</span>
            <span className="value">Bed {booking.bed_number}</span>
          </div>

          <h4 style={{ color: "var(--mut-maroon)", margin: "1.5rem 0 1rem" }}>
            Payment Details
          </h4>
          
          <div className="receipt-row">
            <span className="label">Amount</span>
            <span className="value">KSh {booking.amount}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">M-Pesa Receipt</span>
            <span className="value">{booking.receipt_number}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Payment Date</span>
            <span className="value">{new Date(booking.paid_at).toLocaleString()}</span>
          </div>
          
          <div className="receipt-row">
            <span className="label">Status</span>
            <span className="value">
              <span className="badge badge-success">✓ PAID</span>
            </span>
          </div>
        </div>

        <div className="receipt-footer">
          <div className="qr-code">
            {booking.qr_code ? (
              <img 
                src={booking.qr_code} 
                alt="QR Code" 
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div>QR Code</div>
            )}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--mut-text-muted)" }}>
            Scan to verify booking
          </p>
          <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--mut-text-muted)" }}>
            <p>Thank you for choosing Murang'a University Hostel Services</p>
            <p>Visit the hostels office with this receipt for check-in</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 no-print">
        <button className="btn btn-primary mr-2" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
        <button className="btn btn-secondary mr-2" onClick={handlePrintReceipt}>
          🖨️ Print Receipt
        </button>
        <Link to="/" className="btn btn-outline">
          🏠 Home
        </Link>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .receipt {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}