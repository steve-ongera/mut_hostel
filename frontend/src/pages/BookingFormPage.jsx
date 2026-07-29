import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getHostels, createBooking, extractErrorMessages } from "../services/api";

export default function BookingFormPage() {
  const { bedId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    registration_number: "",
    email: "",
    phone_number: "",
    is_minor: false,
    id_number: "",
    birth_certificate_number: "",
    hostel: "",
    room: "",
    bed: bedId || ""
  });

  // Load hostels for dropdown
  useEffect(() => {
    getHostels()
      .then(data => setHostels(data))
      .catch(err => console.error("Error loading hostels:", err));
  }, []);

  // When hostel changes, load its rooms
  useEffect(() => {
    if (formData.hostel) {
      const hostel = hostels.find(h => h.id === parseInt(formData.hostel));
      if (hostel && hostel.rooms) {
        setRooms(hostel.rooms);
      } else {
        setRooms([]);
      }
    }
  }, [formData.hostel, hostels]);

  // When room changes, load its beds
  useEffect(() => {
    if (formData.room && formData.hostel) {
      const hostel = hostels.find(h => h.id === parseInt(formData.hostel));
      if (hostel && hostel.rooms) {
        const room = hostel.rooms.find(r => r.id === parseInt(formData.room));
        if (room && room.beds) {
          setBeds(room.beds.filter(b => b.is_available));
        } else {
          setBeds([]);
        }
      }
    }
  }, [formData.room, formData.hostel, hostels]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        hostel: parseInt(formData.hostel),
        room: parseInt(formData.room),
        bed: parseInt(formData.bed)
      };

      const response = await createBooking(payload);
      
      // Navigate to payment page
      navigate(`/booking/${response.id}/pay`);
    } catch (err) {
      const messages = extractErrorMessages(err);
      setError(messages.join("\n"));
      setLoading(false);
    }
  };

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
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px" }}>
                <div className="section-title text-center">
                  <h2>
                    <i className="bi bi-clipboard-check me-2" style={{ color: "#525fe1" }}></i>
                    Student Registration
                  </h2>
                  <p>Please fill in your details to book a bed. Your bed will be held for 10 minutes while you complete payment.</p>
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

                    <div className="col-md-12">
                      <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "600" }}>
                          <i className="bi bi-building me-1" style={{ color: "#525fe1" }}></i>
                          Select Hostel *
                        </label>
                        <select
                          name="hostel"
                          value={formData.hostel}
                          onChange={handleChange}
                          className="form-control"
                          style={{ height: "50px", borderRadius: "5px" }}
                          required
                        >
                          <option value="">-- Select Hostel --</option>
                          {hostels.map(hostel => (
                            <option key={hostel.id} value={hostel.id}>
                              {hostel.name} ({hostel.category}) - KES {Number(hostel.fee_amount).toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.hostel && (
                      <div className="col-md-6">
                        <div className="form-group" style={{ marginBottom: "20px" }}>
                          <label style={{ fontWeight: "600" }}>
                            <i className="bi bi-door-open me-1" style={{ color: "#525fe1" }}></i>
                            Select Room *
                          </label>
                          <select
                            name="room"
                            value={formData.room}
                            onChange={handleChange}
                            className="form-control"
                            style={{ height: "50px", borderRadius: "5px" }}
                            required
                          >
                            <option value="">-- Select Room --</option>
                            {rooms.map(room => (
                              <option key={room.id} value={room.id}>
                                Room {room.room_number} ({room.available_beds_count || 0} beds available)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {formData.room && beds.length > 0 && (
                      <div className="col-md-6">
                        <div className="form-group" style={{ marginBottom: "20px" }}>
                          <label style={{ fontWeight: "600" }}>
                            <i className="bi bi-circle me-1" style={{ color: "#525fe1" }}></i>
                            Select Bed *
                          </label>
                          <select
                            name="bed"
                            value={formData.bed}
                            onChange={handleChange}
                            className="form-control"
                            style={{ height: "50px", borderRadius: "5px" }}
                            required
                          >
                            <option value="">-- Select Bed --</option>
                            {beds.map(bed => (
                              <option key={bed.id} value={bed.id}>
                                Bed {bed.bed_number} {bed.id === parseInt(bedId) ? "⭐ (Recommended)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="col-md-12 text-center" style={{ marginTop: "20px" }}>
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
                          gap: "8px"
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
          </div>
        </div>
      </section>
      {/* END BOOKING FORM */}
    </>
  );
}