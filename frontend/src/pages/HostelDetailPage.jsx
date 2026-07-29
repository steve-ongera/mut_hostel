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
                <div className="single_c_img">
                  <img
                    src={resolveMediaUrl(hostel.image) || "/assets/img/course/1.png"}
                    className="img-fluid"
                    alt={hostel.name}
                  />
                  <span>{hostel.category === "boys" ? "Boys Hostel" : "Girls Hostel"}</span>
                </div>
                <div style={{ padding: "30px" }}>
                  <div className="course_features">
                    <h3 style={{ background: "#525fe1", color: "#fff", padding: "15px", borderRadius: "5px" }}>
                      <i className="bi bi-info-circle me-2"></i> Hostel Information
                    </h3>
                    <ul style={{ listStyle: "none", padding: "20px" }}>
                      <li className="d-flex align-items-center py-2 border-bottom">
                        <i className="bi bi-geo-alt me-2" style={{ color: "#525fe1", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Location:</b> {hostel.location_notes || "Not specified"}
                      </li>
                      <li className="d-flex align-items-center py-2 border-bottom">
                        <i className="bi bi-person-badge me-2" style={{ color: "#525fe1", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Warden:</b> {hostel.warden_name || "Not assigned"}
                      </li>
                      <li className="d-flex align-items-center py-2 border-bottom">
                        <i className="bi bi-telephone me-2" style={{ color: "#525fe1", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Warden Phone:</b> {hostel.warden_phone || "Not available"}
                      </li>
                      <li className="d-flex align-items-center py-2 border-bottom">
                        <i className="bi bi-grid me-2" style={{ color: "#525fe1", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Total Beds:</b> {hostel.total_beds || 0}
                      </li>
                      <li className="d-flex align-items-center py-2 border-bottom">
                        <i className="bi bi-check-circle me-2" style={{ color: "#28a745", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Available Beds:</b> {hostel.available_beds || 0}
                      </li>
                      <li className="d-flex align-items-center py-2">
                        <i className="bi bi-currency-dollar me-2" style={{ color: "#525fe1", fontSize: "18px", width: "24px" }}></i>
                        <b className="me-2">Fee:</b> KES {Number(hostel.fee_amount).toLocaleString()}
                      </li>
                    </ul>
                  </div>
                  
                  <div style={{ marginTop: "30px" }}>
                    <h4 style={{ fontWeight: "700", marginBottom: "15px" }}>
                      <i className="bi bi-file-text me-2" style={{ color: "#525fe1" }}></i> Description
                    </h4>
                    <p>{hostel.description || "No description available."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="course_features">
                <h3 style={{ background: "#525fe1", color: "#fff", padding: "15px", borderRadius: "5px" }}>
                  <i className="bi bi-bed me-2"></i> Select Your Room & Bed
                </h3>
                <div style={{ padding: "20px", maxHeight: "600px", overflowY: "auto" }}>
                  {hostel.rooms && hostel.rooms.length > 0 ? (
                    hostel.rooms.map((room) => (
                      <div key={room.id} style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                        <h5 style={{ 
                          fontWeight: "600", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          fontSize: "15px"
                        }}>
                          <span>Room {room.room_number}</span>
                          <span style={{ fontSize: "13px", color: "#22c55e" }}>
                            {room.available_beds_count || 0} beds available
                          </span>
                        </h5>
                        {room.beds && room.beds.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
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
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    border: isSelected ? "2px solid #525fe1" : "1px solid #ddd",
                                    background: isAvailable 
                                      ? (isSelected ? "#525fe1" : "#dcfce7")
                                      : "#f5f5f5",
                                    color: isAvailable 
                                      ? (isSelected ? "#fff" : "#166534")
                                      : "#ccc",
                                    cursor: isAvailable ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                    fontSize: "13px",
                                    flex: "0 0 auto",
                                    fontWeight: isAvailable ? "500" : "normal"
                                  }}
                                >
                                  {bed.bed_number}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ color: "#999", fontSize: "13px" }}>
                            <i className="bi bi-exclamation-circle me-1"></i> No beds available
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>
                      <i className="bi bi-exclamation-circle me-1" style={{ color: "#f26b65" }}></i> 
                      No rooms available
                    </p>
                  )}

                  {selectedBed && (
                    <div className="alert alert-success d-flex align-items-center" style={{ fontSize: "13px", padding: "10px" }}>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Bed {selectedBed} selected
                    </div>
                  )}

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
                      gap: "8px"
                    }}
                  >
                    <i className="bi bi-calendar-check"></i>
                    Book Selected Bed
                  </button>
                </div>
              </div>

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