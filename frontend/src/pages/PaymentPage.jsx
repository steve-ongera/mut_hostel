import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBooking, getBookingStatus, initiateStkPush, extractErrorMessages } from "../services/api";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fatal: booking itself couldn't be loaded (bad id, deleted, network down on
  // initial fetch). Nothing to recover here, so we show a full-page error.
  const [loadError, setLoadError] = useState(null);

  // Recoverable: an STK push attempt failed for any reason (init error,
  // wrong PIN, insufficient funds, cancelled, timeout). The booking + bed
  // hold stay valid, so we keep the user on this page and let them retry.
  const [payError, setPayError] = useState(null);

  const [status, setStatus] = useState("pending");
  const [paymentData, setPaymentData] = useState({ phone_number: "" });
  const [isPolling, setIsPolling] = useState(false);
  const pollInterval = useRef(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 60; // 2 minutes at 2s interval

  useEffect(() => {
    getBooking(id)
      .then(data => {
        setBooking(data);
        setStatus(data.status);
        setLoading(false);
        if (data.status === "paid") {
          navigate(`/booking/${id}/receipt`);
        }
      })
      .catch(err => {
        setLoadError(extractErrorMessages(err).join(" "));
        setLoading(false);
      });

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [id, navigate]);

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
    setIsPolling(false);
  };

  const startPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
    setIsPolling(true);
    setAttempts(0);

    pollInterval.current = setInterval(() => {
      setAttempts(prev => {
        if (prev >= MAX_ATTEMPTS) {
          stopPolling();
          setPayError("We didn't get a response in time. You can try again below.");
          return prev;
        }
        return prev + 1;
      });

      getBookingStatus(id)
        .then(data => {
          setStatus(data.booking_status);

          // Booking-level terminal states (e.g. the hold itself expired
          // mid-payment - separate from a single failed push attempt).
          if (data.booking_status === "paid") {
            stopPolling();
            navigate(`/booking/${id}/receipt`);
            return;
          }
          if (data.booking_status === "cancelled" || data.booking_status === "expired") {
            stopPolling();
            return;
          }

          // M-Pesa-level outcome for this specific push attempt.
          if (data.mpesa_status === "success") {
            stopPolling();
            navigate(`/booking/${id}/receipt`);
          } else if (data.mpesa_status === "failed" || data.mpesa_status === "cancelled") {
            stopPolling();
            setPayError(data.mpesa_result_desc || "Payment did not go through. Please try again.");
          }
          // status === "pending" -> keep polling, keep showing the spinner
        })
        .catch(() => {
          // Transient error, keep polling
        });
    }, 2000);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPayError(null);
    setLoading(true);

    try {
      await initiateStkPush({
        bookingId: parseInt(id),
        phoneNumber: paymentData.phone_number,
      });
      setStatus("pending_payment");
      startPolling();
    } catch (err) {
      setPayError(extractErrorMessages(err).join(" "));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading && !booking) {
    return (
      <section className="section-padding">
        <div className="container text-center">
          <p>Loading payment details...</p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px", textAlign: "center" }}>
                <i className="ti-alert" style={{ fontSize: "60px", color: "#f26b65" }}></i>
                <h3 style={{ marginTop: "20px" }}>Couldn't Load Booking</h3>
                <p style={{ color: "#f26b65" }}>{loadError}</p>
                <Link to="/hostels" className="btn_one" style={{ background: "#f26b65", borderColor: "#f26b65" }}>
                  Back to Hostels
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (status === "cancelled" || status === "expired") {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px", textAlign: "center" }}>
                <i className="ti-close" style={{ fontSize: "60px", color: "#f26b65" }}></i>
                <h3 style={{ marginTop: "20px" }}>Booking {status}</h3>
                <p>Your booking has been {status}. The bed has been released.</p>
                <Link to="/hostels" className="btn_one">
                  Browse Hostels Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-top-title">
                <h1>Complete Payment</h1>
                <ul>
                  <li><Link to="/">Home</Link> /</li>
                  <li><Link to="/hostels">Hostels</Link> /</li>
                  <li>Payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px" }}>
                {isPolling ? (
                  <div style={{ textAlign: "center" }}>
                    <div className="loader" style={{ margin: "30px auto" }}></div>
                    <h3 style={{ marginTop: "20px" }}>Waiting for M-Pesa Confirmation</h3>
                    <p>Please check your phone and enter your M-Pesa PIN to complete payment.</p>
                    <div style={{ marginTop: "20px", padding: "15px", background: "#ECEDFF", borderRadius: "5px" }}>
                      <p><strong>Booking Reference:</strong> {booking?.booking_reference}</p>
                      <p><strong>Amount:</strong> KES {Number(booking?.amount).toLocaleString()}</p>
                    </div>
                    <p style={{ marginTop: "20px", color: "#999" }}>
                      Time remaining: {Math.max(0, (MAX_ATTEMPTS - attempts) * 2)} seconds
                    </p>
                    <button
                      onClick={() => {
                        stopPolling();
                        setPayError("Payment cancelled. You can try again below.");
                      }}
                      className="btn_one"
                      style={{ background: "#f26b65", borderColor: "#f26b65", marginTop: "20px" }}
                    >
                      Cancel Payment
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="section-title text-center">
                      <h2>Pay with M-Pesa</h2>
                      <p>Your bed is on hold. Complete payment to confirm your booking.</p>
                    </div>

                    {booking && (
                      <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "5px", marginBottom: "30px" }}>
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
                            <p><strong>Hostel:</strong> {booking.hostel_name}</p>
                            <p><strong>Room:</strong> {booking.room_number}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Bed:</strong> {booking.bed_number}</p>
                            <p><strong>Student:</strong> {booking.full_name}</p>
                            <p><strong>Amount:</strong> <span style={{ color: "#525fe1", fontWeight: "700", fontSize: "20px" }}>KES {Number(booking.amount).toLocaleString()}</span></p>
                          </div>
                        </div>
                      </div>
                    )}

                    {payError && (
                      <div className="alert alert-danger">
                        <i className="ti-alert"></i> {payError}
                      </div>
                    )}

                    <form onSubmit={handlePayment}>
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>M-Pesa Phone Number *</label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={paymentData.phone_number}
                          onChange={handleChange}
                          placeholder="0712345678"
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                          disabled={isPolling}
                        />
                        <small style={{ color: "#666" }}>
                          You will receive an STK push on this Safaricom number.
                        </small>
                      </div>

                      <div className="text-center" style={{ marginTop: "30px" }}>
                        <button
                          type="submit"
                          className="btn_one"
                          disabled={loading || isPolling}
                          style={{
                            padding: "15px 50px",
                            opacity: loading || isPolling ? 0.7 : 1,
                            cursor: loading || isPolling ? "not-allowed" : "pointer",
                          }}
                        >
                          {loading ? "Processing..." : payError ? "Retry Payment" : "Pay with M-Pesa"}
                          <i className="ti-arrow-right"></i>
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}