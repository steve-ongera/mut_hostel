// src/pages/BookingFormPage.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createBooking, getRoomDetail } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BookingFormPage() {
  const { bedId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bedInfo, setBedInfo] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    registration_number: "",
    email: "",
    phone_number: "",
    is_minor: false,
    id_number: "",
    birth_certificate_number: "",
    hostel: location.state?.hostelId || null,
    room: location.state?.roomId || null,
    bed: parseInt(bedId),
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchBedInfo = async () => {
      try {
        const roomData = await getRoomDetail(location.state?.roomId);
        const bed = roomData.beds?.find(b => b.id === parseInt(bedId));
        if (bed) {
          setBedInfo({
            bedNumber: bed.bed_number,
            roomNumber: roomData.room_number,
            fee: location.state?.fee || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch bed info:", err);
      }
    };

    if (location.state?.roomId) {
      fetchBedInfo();
    }
  }, [bedId, location.state]);

  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (formData.full_name.length < 3) {
      errors.full_name = "Full name must be at least 3 characters";
    }

    if (!formData.registration_number.trim()) {
      errors.registration_number = "Registration number is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (!/^[0-9]{10,12}$/.test(formData.phone_number.replace(/[^0-9]/g, ""))) {
      errors.phone_number = "Please enter a valid phone number";
    }

    if (formData.is_minor) {
      if (!formData.birth_certificate_number.trim()) {
        errors.birth_certificate_number = "Birth certificate number is required for minors";
      }
    } else {
      if (!formData.id_number.trim()) {
        errors.id_number = "National ID number is required for students 18 or older";
      } else if (!/^[0-9]{8}$/.test(formData.id_number.trim())) {
        errors.id_number = "Please enter a valid 8-digit ID number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format phone number
      let phone = formData.phone_number.replace(/[^0-9]/g, "");
      if (phone.startsWith("0")) phone = phone.substring(1);
      if (!phone.startsWith("254")) phone = "254" + phone;

      const payload = {
        ...formData,
        phone_number: phone,
      };

      const response = await createBooking(payload);
      
      // Navigate to payment page
      navigate(`/booking/${response.id}/pay`, {
        state: {
          booking: response,
          fee: bedInfo?.fee || 0,
          bedNumber: bedInfo?.bedNumber,
          roomNumber: bedInfo?.roomNumber,
        },
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Failed to create booking. Please try again.");
      console.error("Booking creation error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!location.state) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <div className="alert alert-danger">
          <div className="alert-icon">⚠</div>
          <div className="alert-content">
            <div className="alert-title">Invalid Access</div>
            <p className="alert-text">Please select a bed first before proceeding to booking.</p>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h2 className="section-title">Student Details</h2>
          <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
            Please provide your personal information to complete the booking.
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                className={`form-control ${formErrors.full_name ? "is-invalid" : ""}`}
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full name as per KCSE certificate"
                disabled={submitting}
              />
              {formErrors.full_name && (
                <div className="form-error">{formErrors.full_name}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Registration Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="registration_number"
                className={`form-control ${formErrors.registration_number ? "is-invalid" : ""}`}
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="e.g., EDU-2024-001"
                disabled={submitting}
              />
              {formErrors.registration_number && (
                <div className="form-error">{formErrors.registration_number}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                disabled={submitting}
              />
              {formErrors.email && (
                <div className="form-error">{formErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                className={`form-control ${formErrors.phone_number ? "is-invalid" : ""}`}
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0712345678"
                disabled={submitting}
              />
              <div className="form-text">This number will be used for M-Pesa payment</div>
              {formErrors.phone_number && (
                <div className="form-error">{formErrors.phone_number}</div>
              )}
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                name="is_minor"
                className="form-check-input"
                checked={formData.is_minor}
                onChange={handleChange}
                disabled={submitting}
              />
              <label className="form-check-label">
                I am under 18 years old
              </label>
            </div>

            {!formData.is_minor ? (
              <div className="form-group">
                <label className="form-label">
                  National ID Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="id_number"
                  className={`form-control ${formErrors.id_number ? "is-invalid" : ""}`}
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="e.g., 12345678"
                  disabled={submitting}
                />
                {formErrors.id_number && (
                  <div className="form-error">{formErrors.id_number}</div>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  Birth Certificate Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="birth_certificate_number"
                  className={`form-control ${formErrors.birth_certificate_number ? "is-invalid" : ""}`}
                  value={formData.birth_certificate_number}
                  onChange={handleChange}
                  placeholder="e.g., BC-12345"
                  disabled={submitting}
                />
                {formErrors.birth_certificate_number && (
                  <div className="form-error">{formErrors.birth_certificate_number}</div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting}
              style={{ marginTop: "1rem" }}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment →"
              )}
            </button>
          </form>
        </div>

        <div>
          <div className="booking-summary">
            <h3 style={{ marginBottom: "1rem" }}>Booking Summary</h3>
            
            <div className="summary-item">
              <span className="label">Hostel</span>
              <span className="value">{location.state?.hostelName || "Loading..."}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Room</span>
              <span className="value">Room {bedInfo?.roomNumber || location.state?.roomNumber || "Loading..."}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Bed</span>
              <span className="value">Bed {bedInfo?.bedNumber || location.state?.bedNumber || "Loading..."}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Fee</span>
              <span className="value">KSh {bedInfo?.fee || location.state?.fee || 0}</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>KSh {bedInfo?.fee || location.state?.fee || 0}</span>
            </div>

            <div className="mt-4" style={{ fontSize: "0.9rem", color: "var(--mut-text-muted)" }}>
              <p>🔒 Your selected bed will be held for <strong>10 minutes</strong> to complete payment.</p>
              <p>📱 M-Pesa payment will be initiated after you submit this form.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}