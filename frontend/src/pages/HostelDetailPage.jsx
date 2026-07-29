import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHostelDetail, resolveMediaUrl, extractErrorMessages } from "../services/api";

export default function HostelDetailPage() {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    getHostelDetail(hostelId)
      .then((data) => {
        if (isMounted) setHostel(data);
      })
      .catch((err) => {
        if (isMounted) setError(extractErrorMessages(err).join(" "));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [hostelId]);

  const handleBookBed = () => {
    if (!selectedBed) {
      alert("Please select a bed first.");
      return;
    }
    navigate(`/booking/${selectedBed}`);
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading hostel details...</p>
        </div>
      </section>
    );
  }

  if (error || !hostel) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> 
            {error || "Hostel not found"}
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
                <h1>{hostel.name}</h1>
                <ul className="breadcrumb-list">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/hostels">Hostels</Link></li>
                  <li className="active">{hostel.name}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START HOSTEL DETAIL */}
      <section className="course_details_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="single_course">
                {/* Hostel Image */}
                <div className="hostel-card-image">
                  <img
                    src={resolveMediaUrl(hostel.image) || "/assets/img/course/1.png"}
                    className="img-fluid"
                    alt={hostel.name}
                  />
                  <span style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "#525fe1",
                    color: "#fff",
                    padding: "4px 15px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {hostel.category === "boys" ? "Boys Hostel" : "Girls Hostel"}
                  </span>
                </div>
                
                <div style={{ padding: "30px" }}>
                  {/* Hostel Information */}
                  <div className="hostel-info">
                    <h3 style={{ 
                      fontSize: "20px", 
                      fontWeight: "600", 
                      marginBottom: "20px",
                      paddingBottom: "10px",
                      borderBottom: "2px solid #f0f0f0"
                    }}>
                      <i className="bi bi-info-circle me-2"></i> Hostel Information
                    </h3>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-geo-alt me-1"></i> Location
                        </span>
                        <span style={{ fontWeight: "500" }}>{hostel.location_notes || "Not specified"}</span>
                      </div>
                      
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-person-badge me-1"></i> Warden
                        </span>
                        <span style={{ fontWeight: "500" }}>{hostel.warden_name || "Not assigned"}</span>
                      </div>
                      
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-telephone me-1"></i> Warden Phone
                        </span>
                        <span style={{ fontWeight: "500" }}>{hostel.warden_phone || "Not available"}</span>
                      </div>
                      
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-grid me-1"></i> Total Beds
                        </span>
                        <span style={{ fontWeight: "500" }}>{hostel.total_beds || 0}</span>
                      </div>
                      
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-check-circle me-1"></i> Available Beds
                        </span>
                        <span style={{ fontWeight: "500", color: "#22c55e" }}>{hostel.available_beds || 0}</span>
                      </div>
                      
                      <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ display: "block", fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                          <i className="bi bi-currency-dollar me-1"></i> Fee per Bed
                        </span>
                        <span style={{ fontWeight: "600", fontSize: "18px", color: "#0b104a" }}>
                          KES {Number(hostel.fee_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div style={{ marginTop: "35px" }}>
                    <h4 style={{ 
                      fontSize: "18px", 
                      fontWeight: "600", 
                      marginBottom: "15px",
                      paddingBottom: "10px",
                      borderBottom: "2px solid #f0f0f0"
                    }}>
                      <i className="bi bi-file-text me-2"></i> Description
                    </h4>
                    <p style={{ lineHeight: "1.8", color: "#4a5355" }}>
                      {hostel.description || "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Room & Bed Selection */}
            <div className="col-lg-4">
              <div className="course_features" style={{ 
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #e8e8e9",
                overflow: "hidden"
              }}>
                <h3 style={{ 
                  background: "#0b104a", 
                  color: "#fff", 
                  padding: "15px 20px", 
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: 0
                }}>
                  <i className="bi bi-bed me-2"></i> Select Your Bed
                </h3>
                
                <div style={{ padding: "20px", maxHeight: "600px", overflowY: "auto" }}>
                  {hostel.rooms && hostel.rooms.length > 0 ? (
                    hostel.rooms.map((room) => (
                      <div key={room.id} style={{ 
                        marginBottom: "20px", 
                        paddingBottom: "15px",
                        borderBottom: "1px solid #f0f0f0"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          marginBottom: "10px"
                        }}>
                          <span style={{ fontWeight: "600", fontSize: "15px" }}>
                            Room {room.room_number}
                          </span>
                          <span style={{ 
                            fontSize: "13px", 
                            color: room.available_beds_count > 0 ? "#22c55e" : "#6c757d"
                          }}>
                            {room.available_beds_count || 0} beds available
                          </span>
                        </div>
                        
                        {room.beds && room.beds.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {room.beds.map((bed) => {
                              const isAvailable = bed.is_available || false;
                              const isSelected = selectedBed === bed.id;
                              return (
                                <button
                                  key={bed.id}
                                  onClick={() => {
                                    if (isAvailable) {
                                      setSelectedRoom(room.id);
                                      setSelectedBed(bed.id);
                                    }
                                  }}
                                  disabled={!isAvailable}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: "4px",
                                    border: isSelected ? "2px solid #0b104a" : "1px solid #e0e0e0",
                                    background: isSelected ? "#0b104a" : (isAvailable ? "#f8f9fa" : "#f5f5f5"),
                                    color: isSelected ? "#fff" : (isAvailable ? "#0b104a" : "#ccc"),
                                    cursor: isAvailable ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                    fontSize: "13px",
                                    fontWeight: isSelected ? "600" : "400",
                                    minWidth: "36px"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (isAvailable && !isSelected) {
                                      e.target.style.borderColor = "#0b104a";
                                      e.target.style.background = "#f0f0f0";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isAvailable && !isSelected) {
                                      e.target.style.borderColor = "#e0e0e0";
                                      e.target.style.background = "#f8f9fa";
                                    }
                                  }}
                                >
                                  {bed.bed_number}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ color: "#999", fontSize: "13px", margin: 0 }}>
                            <i className="bi bi-exclamation-circle me-1"></i> No beds available
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
                      <i className="bi bi-exclamation-circle me-1" style={{ fontSize: "20px", display: "block", marginBottom: "10px" }}></i>
                      No rooms available
                    </p>
                  )}

                  {/* Selected Bed Confirmation */}
                  {selectedBed && (
                    <div style={{ 
                      background: "#f0fdf4", 
                      border: "1px solid #bbf7d0",
                      borderRadius: "6px",
                      padding: "10px 15px",
                      fontSize: "14px",
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center"
                    }}>
                      <i className="bi bi-check-circle-fill me-2" style={{ color: "#22c55e" }}></i>
                      <span>Bed <strong>{selectedBed}</strong> selected</span>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBookBed}
                    disabled={!selectedBed}
                    className="btn_one"
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      opacity: selectedBed ? 1 : 0.5,
                      cursor: selectedBed ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      fontSize: "16px"
                    }}
                  >
                    <i className="bi bi-calendar-check"></i>
                    Book Selected Bed
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <Link 
                to="/hostels" 
                className="btn_one" 
                style={{ 
                  width: "100%", 
                  marginTop: "20px", 
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#6c757d",
                  borderColor: "#6c757d"
                }}
              >
                <i className="bi bi-arrow-left"></i> Back to Hostels
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* END HOSTEL DETAIL */}
    </>
  );
}