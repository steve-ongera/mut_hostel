import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBooking, getBookingStatus, initiateStkPush, extractErrorMessages } from "../services/api";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("pending");
  const [paymentData, setPaymentData] = useState({ phone_number: "" });
  const [isPolling, setIsPolling] = useState(false);
  const pollInterval = useRef(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 60; // 5 minutes (1 second interval)

  useEffect(() => {
    // Load booking details
    getBooking(id)
      .then(data => {
        setBooking(data);
        setStatus(data.status);
        setLoading(false);
        
        // If already paid, go to receipt
        if (data.status === "paid") {
          navigate(`/booking/${id}/receipt`);
        }
      })
      .catch(err => {
        setError(extractErrorMessages(err).join(" "));
        setLoading(false);
      });

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [id, navigate]);

  const startPolling = () => {
    setIsPolling(true);
    setAttempts(0);
    
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }

    pollInterval.current = setInterval(() => {
      setAttempts(prev => {
        if (prev >= MAX_ATTEMPTS) {
          clearInterval(pollInterval.current);
          setIsPolling(false);
          setError("Payment timed out. Please try again or contact the hostel office.");
          return prev;
        }
        return prev + 1;
      });

      getBookingStatus(id)
        .then(data => {
          if (data.booking_status === "paid") {
            clearInterval(pollInterval.current);
            setIsPolling(false);
            navigate(`/booking/${id}/receipt`);
          } else if (data.booking_status === "cancelled" || data.booking_status === "expired") {
            clearInterval(pollInterval.current);
            setIsPolling(false);
            setError("Payment was cancelled or expired. Please try booking again.");
            setStatus(data.booking_status);
          }
        })
        .catch(() => {
          // Continue polling on error
        });
    }, 2000); // Poll every 2 seconds
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await initiateStkPush({
        bookingId: parseInt(id),
        phoneNumber: paymentData.phone_number
      });
      
      setStatus("pending_payment");
      startPolling();
    } catch (err) {
      setError(extractErrorMessages(err).join(" "));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container text-center">
          <p>Loading payment details...</p>
        </div>
      </section>
    );
  }

  if (error && !isPolling) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px", textAlign: "center" }}>
                <i className="ti-alert" style={{ fontSize: "60px", color: "#f26b65" }}></i>
                <h3 style={{ marginTop: "20px" }}>Payment Error</h3>
                <p style={{ color: "#f26b65" }}>{error}</p>
                <Link to={`/booking/${id}`} className="btn_one" style={{ marginRight: "10px" }}>
                  Try Again
                </Link>
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
      {/* START SECTION TOP */}
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
      {/* END SECTION TOP */}

      {/* START PAYMENT */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px" }}>
                {isPolling ? (
                  // Payment in progress
                  <div style={{ textAlign: "center" }}>
                    <div className="loader" style={{ margin: "30px auto" }}></div>
                    <h3 style={{ marginTop: "20px" }}>Waiting for M-Pesa Confirmation</h3>
                    <p>Please check your phone and enter your M-Pesa PIN to complete payment.</p>
                    <div style={{ marginTop: "20px", padding: "15px", background: "#ECEDFF", borderRadius: "5px" }}>
                      <p><strong>Booking Reference:</strong> {booking?.booking_reference}</p>
                      <p><strong>Amount:</strong> KES {Number(booking?.amount).toLocaleString()}</p>
                    </div>
                    <p style={{ marginTop: "20px", color: "#999" }}>
                      Time remaining: {Math.round((MAX_ATTEMPTS - attempts) / 2)} seconds
                    </p>
                    <button 
                      onClick={() => {
                        if (pollInterval.current) {
                          clearInterval(pollInterval.current);
                          setIsPolling(false);
                          setError("Payment cancelled by user.");
                        }
                      }}
                      className="btn_one"
                      style={{ background: "#f26b65", borderColor: "#f26b65", marginTop: "20px" }}
                    >
                      Cancel Payment
                    </button>
                  </div>
                ) : (
                  // Payment form
                  <>
                    <div className="section-title text-center">
                      <h2>Pay with M-Pesa</h2>
                      <p>Your bed is on hold for 10 minutes. Complete payment to confirm your booking.</p>
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

                    {error && (
                      <div className="alert alert-danger">
                        <i className="ti-alert"></i> {error}
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
                            cursor: loading || isPolling ? "not-allowed" : "pointer"
                          }}
                        >
                          {loading ? "Processing..." : "Pay with M-Pesa"}
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
      {/* END PAYMENT */}
    </>
  );
}