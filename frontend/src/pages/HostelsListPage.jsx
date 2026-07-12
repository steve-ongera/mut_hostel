// src/pages/HostelsListPage.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getHostels } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HostelsListPage() {
  const { category } = useParams();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = category === "boys" ? "Boys Hostels" : "Girls Hostels";
  const categoryDisplay = category === "boys" ? "Boys" : "Girls";

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const data = await getHostels(category);
        setHostels(data);
        setError(null);
      } catch (err) {
        setError("Failed to load hostels. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, [category]);

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: "center", minHeight: "400px" }}>
        <LoadingSpinner size="lg" text={`Loading ${title.toLowerCase()}...`} />
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

  if (hostels.length === 0) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          No {categoryDisplay} hostels available at the moment. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="container section">
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle" style={{ margin: "0 auto 2rem" }}>
        Select a hostel to view rooms and available beds
      </p>

      <div className="grid grid-cols-2 gap-4">
        {hostels.map((hostel) => (
          <Link to={`/hostels/${hostel.id}`} key={hostel.id} className="hostel-card">
            <div className="hostel-image">
              {hostel.image ? (
                <img src={hostel.image} alt={hostel.name} />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-4xl">
                  🏫
                </div>
              )}
              <div className="hostel-badge">
                <span className="badge badge-primary">{hostel.category}</span>
              </div>
            </div>
            <div className="hostel-body">
              <h3 className="hostel-title">{hostel.name}</h3>
              <div className="hostel-location">
                <span>📍</span>
                <span>{hostel.location_notes || "Main Campus"}</span>
              </div>
              <p style={{ color: "var(--mut-text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
                {hostel.description || "Comfortable accommodation for students"}
              </p>
              <div className="hostel-stats">
                <div className="stat">
                  <span className="stat-value">{hostel.available_beds || 0}</span>
                  <span className="stat-label">Available Beds</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{hostel.total_beds || 0}</span>
                  <span className="stat-label">Total Beds</span>
                </div>
                <div className="stat">
                  <span className="stat-value">KSh {hostel.fee_amount}</span>
                  <span className="stat-label">Per Semester</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }}>
                View Rooms →
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}