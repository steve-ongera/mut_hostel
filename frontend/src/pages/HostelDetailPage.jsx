// src/pages/HostelDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHostelDetail } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import BedGrid from "../components/BedGrid";

export default function HostelDetailPage() {
  const { hostelId } = useParams();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        setLoading(true);
        const data = await getHostelDetail(hostelId);
        setHostel(data);
        setError(null);
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
      } catch (err) {
        setError("Failed to load hostel details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [hostelId]);

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: "center", minHeight: "400px" }}>
        <LoadingSpinner size="lg" text="Loading hostel details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <div className="alert alert-danger">
          <div className="alert-icon">⚠</div>
          <div className="alert-content">
            <div className="alert-title">Error</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <h2>Hostel Not Found</h2>
        <p>The hostel you're looking for doesn't exist.</p>
        <Link to="/hostels/boys" className="btn btn-primary mt-3">
          View All Hostels
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-item">
          <Link to={`/hostels/${hostel.category}`}>
            {hostel.category === "boys" ? "Boys Hostels" : "Girls Hostels"}
          </Link>
        </div>
        <div className="breadcrumb-item active">{hostel.name}</div>
      </div>

      {/* Hostel Header */}
      <div className="flex items-center gap-4 mb-4" style={{ flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {hostel.name}
        </h2>
        <span className="badge badge-primary">{hostel.category}</span>
        <span className="badge badge-success">
          {hostel.available_beds || 0} Beds Available
        </span>
      </div>

      <p style={{ color: "var(--mut-text-muted)", marginBottom: "1rem" }}>
        {hostel.description || "Comfortable student accommodation"}
      </p>

      <div className="flex gap-4 mb-4" style={{ flexWrap: "wrap" }}>
        <div>
          <strong>Fee:</strong> KSh {hostel.fee_amount} per semester
        </div>
        {hostel.warden_name && (
          <div>
            <strong>Warden:</strong> {hostel.warden_name}
          </div>
        )}
        {hostel.warden_phone && (
          <div>
            <strong>Contact:</strong> {hostel.warden_phone}
          </div>
        )}
      </div>

      {/* Room Selection Tabs */}
      {hostel.rooms && hostel.rooms.length > 0 ? (
        <>
          <div className="tabs">
            {hostel.rooms.map((room) => (
              <button
                key={room.id}
                className={`tab ${selectedRoom?.id === room.id ? "active" : ""}`}
                onClick={() => setSelectedRoom(room)}
              >
                Room {room.room_number}
                {room.floor && ` (Floor ${room.floor})`}
                <span className="badge badge-info" style={{ marginLeft: "0.5rem", fontSize: "0.7rem" }}>
                  {room.available_beds_count || 0}/{room.capacity}
                </span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {selectedRoom && (
              <div className="tab-pane active">
                <div className="flex justify-between items-center mb-4">
                  <h3>
                    Room {selectedRoom.room_number}
                    {selectedRoom.floor && ` - Floor ${selectedRoom.floor}`}
                  </h3>
                  <span className="text-muted">
                    Capacity: {selectedRoom.capacity} beds
                  </span>
                </div>
                <BedGrid room={selectedRoom} hostelId={hostel.id} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          <div className="alert-icon">ℹ</div>
          <div className="alert-content">
            <div className="alert-title">No Rooms Available</div>
            <p className="alert-text">This hostel currently has no rooms set up.</p>
          </div>
        </div>
      )}
    </div>
  );
}