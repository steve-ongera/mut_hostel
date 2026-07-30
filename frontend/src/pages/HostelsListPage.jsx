import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getHostels, resolveMediaUrl, extractErrorMessages } from "../services/api";

export default function HostelsListPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");

  useEffect(() => {
    let isMounted = true;
    const category = activeCategory !== "all" ? activeCategory : null;

    setLoading(true);
    getHostels(category)
      .then((data) => {
        if (isMounted) setHostels(data);
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
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Config-driven filter buttons so the markup stays clean and consistent
  // across breakpoints. Styling/responsiveness now lives entirely in
  // main.css (.cat_list_hostel / .filter-btn), not inline styles, since
  // inline styles can't respond to media queries.
  const categoryFilters = [
    { key: "all", label: "All Hostels", icon: "bi-grid-3x3-gap-fill" },
    { key: "boys", label: "Boys Hostels", icon: "bi-person-fill" },
    { key: "girls", label: "Girls Hostels", icon: "bi-person-fill", extraClass: "girls-btn" },
  ];

  return (
    <>
      {/* START SECTION TOP */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-top-title">
                <h1>Our Hostels</h1>
                <ul className="breadcrumb-list">
                  <li><Link to="/">Home</Link></li>
                  <li className="active">Hostels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START CATEGORY FILTER */}
      <section className="top_cat__area" style={{ paddingTop: "40px", paddingBottom: "0" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="cat_list_hostel">
                <ul>
                  {categoryFilters.map((filter) => {
                    const isActive = activeCategory === filter.key;
                    return (
                      <li key={filter.key}>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(filter.key)}
                          className={`filter-btn${filter.extraClass ? ` ${filter.extraClass}` : ""}${isActive ? " active" : ""}`}
                        >
                          <i className={`bi ${filter.icon}`}></i>
                          {filter.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END CATEGORY FILTER */}

      {/* START HOSTELS LIST */}
      <section className="home_course section-padding" style={{ paddingTop: "0" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-sm-6 col-xs-12">
              <div className="section-title" style={{ marginBottom: "30px" }}>
                <h2>
                  <b>{hostels.length}</b> Hostels Available
                  {activeCategory !== "all" && (
                    <span style={{ fontSize: "20px", color: "#525fe1" }}>
                      {" "} - {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                    </span>
                  )}
                </h2>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="cour_btn" style={{ marginTop: "0", float: "right" }}>
                <Link to="/" className="btn_one">
                  <i className="bi bi-arrow-left me-2"></i> Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Loading State */}
            {loading && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
                <div className="spinner-border text-primary" role="status" style={{ width: "50px", height: "50px" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3" style={{ fontWeight: "500" }}>Loading hostels...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="col-12">
                <div className="alert alert-danger d-flex align-items-center" style={{
                  padding: "15px 20px",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                  background: "#f8d7da",
                  color: "#721c24"
                }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: "20px" }}></i>
                  {error}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && hostels.length === 0 && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
                <i className="bi bi-building" style={{
                  fontSize: "64px",
                  color: "#ccc",
                  display: "block",
                  marginBottom: "20px"
                }}></i>
                <h3 style={{ fontWeight: "600", marginBottom: "10px" }}>No hostels available</h3>
                <p style={{ color: "#6c757d" }}>Please check back later for available accommodations.</p>
              </div>
            )}

            {/* Hostels Grid */}
            {hostels.map((hostel) => (
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12" key={hostel.id}>
                <div className="single_course">
                  {/* Hostel Image with uniform sizing */}
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
                      background: hostel.category === "boys" ? "#525fe1" : "#e83e8c",
                      color: "#fff",
                      padding: "4px 15px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transform: "none"
                    }}>
                      {hostel.category === "boys" ? "Boys" : "Girls"}
                    </span>
                  </div>

                  <h4 style={{ padding: "20px 20px 10px", marginBottom: "5px" }}>
                    <Link to={`/hostels/${hostel.id}`} style={{
                      fontWeight: "600",
                      fontSize: "20px",
                      lineHeight: "28px"
                    }}>
                      {hostel.name}
                    </Link>
                  </h4>

                  <div style={{ padding: "0 20px" }}>
                    <p style={{ marginBottom: "5px" }}>
                      <i className="bi bi-person me-1" style={{ color: "#525fe1" }}></i>
                      <span style={{ fontWeight: "600" }}>{hostel.available_beds || 0}</span> / {hostel.total_beds || 0} beds available
                    </p>
                    {hostel.location_notes && (
                      <p style={{ marginBottom: "5px" }}>
                        <i className="bi bi-geo-alt me-1" style={{ color: "#525fe1" }}></i>
                        {hostel.location_notes}
                      </p>
                    )}
                  </div>

                  <div className="price" style={{
                    padding: "15px 20px",
                    marginTop: "15px",
                    borderTop: "1px solid #e8e8e9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "#525fe1"
                      }}>
                        KES {Number(hostel.fee_amount).toLocaleString()}
                      </span>
                      <br />
                      <small style={{ fontSize: "13px", fontWeight: "400", color: "#6c757d" }}>per bed</small>
                    </div>
                    <Link
                      to={`/hostels/${hostel.id}`}
                      className="btn_one"
                      style={{
                        padding: "8px 20px",
                        fontSize: "14px",
                        borderRadius: "6px"
                      }}
                    >
                      View <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* END HOSTELS LIST */}
    </>
  );
}