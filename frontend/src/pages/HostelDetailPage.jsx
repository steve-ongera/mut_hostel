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
          <p>Loading hostel details...</p>
        </div>
      </section>
    );
  }

  if (error || !hostel) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="alert alert-danger">
            <i className="ti-alert"></i> {error || "Hostel not found"}
          </div>
          <Link to="/hostels" className="btn_one">
            Back to Hostels <i className="ti-arrow-top-right"></i>
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
                <ul>
                  <li><Link to="/">Home</Link> /</li>
                  <li><Link to="/hostels">Hostels</Link> /</li>
                  <li>{hostel.name}</li>
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
                      Hostel Information
                    </h3>
                    <ul style={{ listStyle: "none", padding: "20px" }}>
                      <li><i className="ti-location-pin"></i> <b>Location:</b> {hostel.location_notes || "Not specified"}</li>
                      <li><i className="ti-user"></i> <b>Warden:</b> {hostel.warden_name || "Not assigned"}</li>
                      <li><i className="ti-mobile"></i> <b>Warden Phone:</b> {hostel.warden_phone || "Not available"}</li>
                      <li><i className="ti-layout-grid2"></i> <b>Total Beds:</b> {hostel.total_beds || 0}</li>
                      <li><i className="ti-check-box"></i> <b>Available Beds:</b> {hostel.available_beds || 0}</li>
                      <li><i className="ti-money"></i> <b>Fee:</b> KES {Number(hostel.fee_amount).toLocaleString()}</li>
                    </ul>
                  </div>
                  
                  <div style={{ marginTop: "30px" }}>
                    <h4 style={{ fontWeight: "700", marginBottom: "15px" }}>Description</h4>
                    <p>{hostel.description || "No description available."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="course_features">
                <h3 style={{ background: "#525fe1", color: "#fff", padding: "15px", borderRadius: "5px" }}>
                  Select Your Room & Bed
                </h3>
                <div style={{ padding: "20px" }}>
                  {hostel.rooms && hostel.rooms.length > 0 ? (
                    hostel.rooms.map((room) => (
                      <div key={room.id} style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                        <h5 style={{ fontWeight: "600" }}>
                          Room {room.room_number}
                          <span style={{ float: "right", fontSize: "14px", color: "#525fe1" }}>
                            {room.available_beds_count || 0} beds available
                          </span>
                        </h5>
                        {room.beds && room.beds.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
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
                                    padding: "8px 16px",
                                    borderRadius: "5px",
                                    border: isSelected ? "2px solid #525fe1" : "1px solid #ddd",
                                    background: isAvailable 
                                      ? (isSelected ? "#525fe1" : "#fff")
                                      : "#f5f5f5",
                                    color: isAvailable 
                                      ? (isSelected ? "#fff" : "#333")
                                      : "#999",
                                    cursor: isAvailable ? "pointer" : "not-allowed",
                                    transition: "all 0.3s"
                                  }}
                                >
                                  Bed {bed.bed_number}
                                  {!isAvailable && " 🔒"}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ color: "#999", fontSize: "14px" }}>No beds available in this room</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No rooms available</p>
                  )}

                  <button
                    onClick={handleBookBed}
                    disabled={!selectedBed}
                    className="btn_one"
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      opacity: selectedBed ? 1 : 0.5,
                      cursor: selectedBed ? "pointer" : "not-allowed"
                    }}
                  >
                    Book Selected Bed
                  </button>
                </div>
              </div>

              <Link to="/hostels" className="btn_one" style={{ width: "100%", marginTop: "20px", textAlign: "center" }}>
                <i className="ti-arrow-left"></i> Back to Hostels
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* END HOSTEL DETAIL */}
    </>
  );
}