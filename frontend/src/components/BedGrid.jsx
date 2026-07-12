// src/components/BedGrid.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomDetail } from "../services/api";

export default function BedGrid({ room: initialRoom, hostelId }) {
  const [room, setRoom] = useState(initialRoom);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Refresh bed availability every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getRoomDetail(room.id);
        setRoom(data);
        // If selected bed is no longer available, clear selection
        if (selectedBed) {
          const updatedBed = data.beds.find(b => b.id === selectedBed.id);
          if (!updatedBed || !updatedBed.is_available) {
            setSelectedBed(null);
          }
        }
      } catch (err) {
        console.error("Failed to refresh bed status:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [room.id, selectedBed]);

  const handleBedSelect = (bed) => {
    if (!bed.is_available) return;
    if (selectedBed?.id === bed.id) {
      setSelectedBed(null);
    } else {
      setSelectedBed(bed);
    }
  };

  const handleBookNow = () => {
    if (selectedBed) {
      navigate(`/booking/${selectedBed.id}`, {
        state: {
          hostelId,
          roomId: room.id,
          bed: selectedBed,
          fee: room.hostel?.fee_amount || 0,
        },
      });
    }
  };

  const availableCount = room.beds?.filter(b => b.is_available).length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="badge badge-success">
            {availableCount} Beds Available
          </span>
          <span className="badge badge-warning ml-2">
            {room.beds?.filter(b => b.status === "pending").length || 0} Pending
          </span>
          <span className="badge badge-danger ml-2">
            {room.beds?.filter(b => b.status === "booked").length || 0} Booked
          </span>
        </div>
        {selectedBed && (
          <button className="btn btn-primary" onClick={handleBookNow}>
            Book Selected Bed
          </button>
        )}
      </div>

      <div className="bed-grid">
        {room.beds?.map((bed) => {
          const isAvailable = bed.is_available;
          const isSelected = selectedBed?.id === bed.id;
          const status = bed.status;

          let bedClass = "bed";
          if (isAvailable && !isSelected) bedClass += " bed-available";
          if (isSelected) bedClass += " bed-selected";
          if (status === "booked") bedClass += " bed-unavailable";
          if (status === "pending") bedClass += " bed-pending";

          return (
            <div
              key={bed.id}
              className={bedClass}
              onClick={() => handleBedSelect(bed)}
              style={{
                cursor: isAvailable ? "pointer" : "not-allowed",
              }}
            >
              <span className="bed-number">{bed.bed_number}</span>
              {status === "booked" && (
                <span style={{ position: "absolute", fontSize: "0.6rem", bottom: "4px" }}>
                  Booked
                </span>
              )}
              {status === "pending" && (
                <span style={{ position: "absolute", fontSize: "0.6rem", bottom: "4px", color: "var(--mut-warning)" }}>
                  Hold
                </span>
              )}
            </div>
          );
        })}
      </div>

      {selectedBed && (
        <div className="mt-4 p-3 bg-light rounded">
          <p>
            <strong>Selected Bed:</strong> Bed {selectedBed.bed_number}
          </p>
          <button className="btn btn-primary" onClick={handleBookNow}>
            Continue to Booking →
          </button>
        </div>
      )}

      <style>{`
        .bed-pending {
          background: rgba(212, 160, 36, 0.2);
          border-color: var(--mut-warning);
          color: var(--mut-warning-dark);
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}