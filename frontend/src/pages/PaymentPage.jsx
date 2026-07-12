// src/pages/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { initiateSTKPush, getBookingStatus } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PaymentStatusPoller from "../components/PaymentStatusPoller";

export default function PaymentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  useEffect(() => {
    if (!booking) {
      // Try to fetch booking if not in state
      // For now, redirect back
      navigate("/");
    }
  }, [booking, navigate]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.startsWith("0") && value.length <= 10) {
      // Keep as is for display
    }
    setPhoneNumber(value);
  };

  const formatPhoneDisplay = (phone) => {
    if (phone.startsWith("254") && phone.length === 12) {
      return "0" + phone.substring(3);
    }
    return phone;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format phone for API
      let formattedPhone = phoneNumber.replace(/[^0-9]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith("254")) {
        formattedPhone = "254" + formattedPhone;
      }

      const response = await initiateSTKPush({
        booking_id: parseInt(id),
        phone_number: formattedPhone,
      });

      setCheckoutRequestId(response.checkout_request_id);
      setPaymentInitiated(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to initiate payment. Please try again.");
      console.error("Payment initiation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (status) => {
    if (status === "paid") {
      navigate(`/booking/${id}/receipt`);
    } else if (status === "cancelled" || status === "failed") {
      // Show error and allow retry
      setError("Payment was not successful. You can try again or select another bed.");
      setPaymentInitiated(false);
    }
  };

  if (!booking) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h2 className="section-title">Payment</h2>
          <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
            Complete your booking by paying via M-Pesa.
          </p>

          {error && (
            <div className="alert alert-danger mb-4">
              <div className="alert-icon">⚠</div>
              <div className="alert-content">
                <div className="alert-title">Error</div>
                <p className="alert-text">{error}</p>
              </div>
            </div>
          )}

          {!paymentInitiated ? (
            <div>
              <div className="form-group">
                <label className="form-label">
                  M-Pesa Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className="form-control form-control-lg"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="0712345678"
                  disabled={loading}
                />
                <div className="form-text">
                  You will receive an M-Pesa prompt on this number to complete payment
                </div>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleInitiatePayment}
                disabled={loading || !phoneNumber}
                style={{ padding: "1rem" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Initiating Payment...
                  </>
                ) : (
                  "Pay KSh " + booking.amount + " via M-Pesa"
                )}
              </button>

              <div className="mt-4 p-3 bg-light rounded">
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>How it works:</h4>
                <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                  <li>Enter your Safaricom phone number</li>
                  <li>Click "Pay via M-Pesa"</li>
                  <li>Enter your M-Pesa PIN when prompted</li>
                  <li>Wait for payment confirmation</li>
                </ol>
              </div>
            </div>
          ) : (
            <PaymentStatusPoller
              bookingId={id}
              checkoutRequestId={checkoutRequestId}
              onComplete={handlePaymentComplete}
            />
          )}
        </div>

        <div>
          <div className="booking-summary">
            <h3 style={{ marginBottom: "1rem" }}>Booking Summary</h3>
            
            <div className="summary-item">
              <span className="label">Reference</span>
              <span className="value">{booking.booking_reference}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Student</span>
              <span className="value">{booking.full_name}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Registration</span>
              <span className="value">{booking.registration_number}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Hostel</span>
              <span className="value">{booking.hostel_name}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Room</span>
              <span className="value">Room {booking.room_number}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Bed</span>
              <span className="value">Bed {booking.bed_number}</span>
            </div>

            <div className="summary-total">
              <span>Amount</span>
              <span>KSh {booking.amount}</span>
            </div>

            <div className="mt-3">
              <span className={`badge ${booking.status === "pending_payment" ? "badge-warning" : "badge-success"}`}>
                Status: {booking.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}