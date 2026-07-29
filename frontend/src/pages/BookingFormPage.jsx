import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { holdBed, releaseBedHold, createBooking, extractErrorMessages } from "../services/api";

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function BookingFormPage() {
  const { bedId } = useParams();
  const navigate = useNavigate();
  const submittedRef = useRef(false);

  const [bedInfo, setBedInfo] = useState(null);
  const [holding, setHolding] = useState(true);
  const [holdError, setHoldError] = useState(null);

  const [secondsLeft, setSecondsLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    registration_number: "",
    email: "",
    phone_number: "",
    is_minor: false,
    id_number: "",
    birth_certificate_number: "",
  });

  // ---- Lock the bed for this student the moment they land on this page ----
  useEffect(() => {
    let isMounted = true;
    setHolding(true);
    setHoldError(null);

    holdBed(bedId)
      .then((data) => {
        if (isMounted) setBedInfo(data);
      })
      .catch((err) => {
        if (isMounted) setHoldError(extractErrorMessages(err).join(" "));
      })
      .finally(() => {
        if (isMounted) setHolding(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bedId]);

  // ---- Release the hold automatically if the student leaves without booking ----
  useEffect(() => {
    return () => {
      if (!submittedRef.current) {
        releaseBedHold(bedId);
      }
    };
  }, [bedId]);

  // ---- Live countdown, driven by the backend's hold_expires_at ----
  useEffect(() => {
    if (!bedInfo?.hold_expires_at || expired) return;

    const expiresAt = new Date(bedInfo.hold_expires_at).getTime();
    let intervalId;

    const tick = () => {
      const diff = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(intervalId);
        setExpired(true);
      }
    };

    tick();
    intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [bedInfo, expired]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bedInfo) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        hostel: bedInfo.hostel_id,
        room: bedInfo.room_id,
        bed: bedInfo.id,
      };

      const response = await createBooking(payload);
      submittedRef.current = true; // don't release the hold on unmount, we're moving to payment
      navigate(`/booking/${response.id}/pay`);
    } catch (err) {
      const messages = extractErrorMessages(err);
      setError(messages.join("\n"));
      setLoading(false);
    }
  };

  // ---- Still locking the bed on the backend ----
  if (holding) {
    return (
      <section className="section-padding">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Reserving your bed...</p>
        </div>
      </section>
    );
  }

  // ---- Bed couldn't be held (already booked, doesn't exist, etc.) ----
  if (holdError) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {holdError}
          </div>
          <Link to="/hostels" className="btn_one">
            <i className="bi bi-arrow-left me-2"></i> Back to Hostels
          </Link>
        </div>
      </section>
    );
  }

  // ---- Hold expired while filling out the form ----
  if (expired) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="alert alert-warning d-flex align-items-center">
            <i className="bi bi-clock-history me-2"></i>
            Your 5-minute hold on this bed has expired. Please select a bed again.
          </div>
          <Link to="/hostels" className="btn_one">
            <i className="bi bi-arrow-left me-2"></i> Back to Hostels
          </Link>
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
                <h1>Book Your Bed</h1>
                <ul>
                  <li><Link to="/">Home</Link> <span className="separator">/</span></li>
                  <li><Link to="/hostels">Hostels</Link> <span className="separator">/</span></li>
                  <li>Booking Form</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START BOOKING FORM */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            {/* ---- Form (left) ---- */}
            <div className="col-lg-8">
              <div className="single_course" style={{ padding: "40px" }}>
                <div className="section-title">
                  <h2>
                    <i className="bi bi-clipboard-check me-2" style={{ color: "#525fe1" }}></i>
                    Student Registration
                  </h2>
                  <p>Please fill in your details to book a bed.</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center" style={{ whiteSpace: "pre-line" }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <i className="bi bi-person me-1" style={{ color: "#525fe1" }}></i>
                          Full Name (as per KCSE certificate) *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <i className="bi bi-card-text me-1" style={{ color: "#525fe1" }}></i>
                          Registration Number *
                        </label>
                        <input
                          type="text"
                          name="registration_number"
                          value={formData.registration_number}
                          onChange={handleChange}
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <i className="bi bi-envelope me-1" style={{ color: "#525fe1" }}></i>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <i className="bi bi-phone me-1" style={{ color: "#525fe1" }}></i>
                          Phone Number (for M-Pesa) *
                        </label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="0712345678"
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                        />
                        <small style={{ color: "#666" }}>
                          <i className="bi bi-info-circle me-1"></i>
                          Format: 0712345678 (Safaricom number)
                        </small>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <input
                            type="checkbox"
                            name="is_minor"
                            checked={formData.is_minor}
                            onChange={handleChange}
                            style={{ marginRight: "10px" }}
                          />
                          <i className="bi bi-person-check me-1" style={{ color: "#525fe1" }}></i>
                          I am under 18 years old
                        </label>
                      </div>
                    </div>

                    {!formData.is_minor ? (
                      <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: "20px" }}>
                          <label style={{ fontWeight: "600" }}>
                            <i className="bi bi-card-id me-1" style={{ color: "#525fe1" }}></i>
                            National ID Number *
                          </label>
                          <input
                            type="text"
                            name="id_number"
                            value={formData.id_number}
                            onChange={handleChange}
                            className="form-control"
                            style={{ height: "50px", borderRadius: "5px" }}
                            required={!formData.is_minor}
                            placeholder="Enter your National ID number"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="col-md-12">
                        <div className="form-group" style={{ marginBottom: "20px" }}>
                          <label style={{ fontWeight: "600" }}>
                            <i className="bi bi-file-earmark-text me-1" style={{ color: "#525fe1" }}></i>
                            Birth Certificate Number *
                          </label>
                          <input
                            type="text"
                            name="birth_certificate_number"
                            value={formData.birth_certificate_number}
                            onChange={handleChange}
                            className="form-control"
                            style={{ height: "50px", borderRadius: "5px" }}
                            required={formData.is_minor}
                            placeholder="Enter your Birth Certificate number"
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-md-12" style={{ marginTop: "10px" }}>
                      <button
                        type="submit"
                        className="btn_one"
                        disabled={loading}
                        style={{
                          padding: "15px 50px",
                          opacity: loading ? 0.7 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-credit-card"></i>
                            Proceed to Payment
                            <i className="bi bi-arrow-right"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* ---- Selection summary + countdown (right sidebar) ---- */}
            <div className="col-lg-4">
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8e8e9",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "sticky",
                  top: "20px",
                }}
              >
                <h3
                  style={{
                    background: "#0b104a",
                    color: "#fff",
                    padding: "15px 20px",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  <i className="bi bi-bookmark-check me-2"></i> Your Selection
                </h3>

                <div style={{ padding: "20px" }}>
                  {secondsLeft !== null && (
                    <div
                      style={{
                        background: secondsLeft <= 60 ? "#fef2f2" : "#eff6ff",
                        border: `1px solid ${secondsLeft <= 60 ? "#fecaca" : "#bfdbfe"}`,
                        borderRadius: "6px",
                        padding: "12px 15px",
                        marginBottom: "20px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                        <i className="bi bi-clock me-1"></i> Bed held for
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: secondsLeft <= 60 ? "#dc2626" : "#0b104a",
                        }}
                      >
                        {formatMMSS(secondsLeft)}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                      <i className="bi bi-building me-1"></i> Hostel
                    </span>
                    <span style={{ fontWeight: "600" }}>{bedInfo?.hostel_name}</span>
                  </div>

                  <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                      <i className="bi bi-door-open me-1"></i> Room
                    </span>
                    <span style={{ fontWeight: "600" }}>{bedInfo?.room_number}</span>
                  </div>

                  <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                      <i className="bi bi-circle me-1"></i> Bed
                    </span>
                    <span style={{ fontWeight: "600" }}>{bedInfo?.bed_number}</span>
                  </div>

                  {bedInfo?.fee_amount != null && (
                    <div style={{ padding: "10px 0" }}>
                      <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                        <i className="bi bi-currency-dollar me-1"></i> Fee
                      </span>
                      <span style={{ fontWeight: "700", fontSize: "18px", color: "#0b104a" }}>
                        KES {Number(bedInfo.fee_amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Link
                    to="/hostels"
                    className="btn_one"
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "#6c757d",
                      borderColor: "#6c757d",
                    }}
                  >
                    <i className="bi bi-arrow-left-right"></i> Change Selection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END BOOKING FORM */}
    </>
  );
}