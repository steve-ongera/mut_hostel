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

  return (
    <>
      {/* START SECTION TOP */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-top-title">
                <h1>Our Hostels</h1>
                <ul>
                  <li><Link to="/">Home</Link> <span className="separator">/</span></li>
                  <li>Hostels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START CATEGORY FILTER */}
      <section className="top_cat__area section-padding" style={{ paddingTop: "40px" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="cat_list" style={{ marginBottom: "40px" }}>
                <ul>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange("all")}
                      className={`btn ${activeCategory === "all" ? "btn_one" : "btn-outline-primary"}`}
                      style={{ borderRadius: "30px", padding: "10px 30px", margin: "0 5px" }}
                    >
                      <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                      All Hostels
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange("boys")}
                      className={`btn ${activeCategory === "boys" ? "btn_one" : "btn-outline-primary"}`}
                      style={{ borderRadius: "30px", padding: "10px 30px", margin: "0 5px" }}
                    >
                      <i className="bi bi-person-fill me-2"></i>
                      Boys Hostels
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange("girls")}
                      className={`btn ${activeCategory === "girls" ? "btn_one" : "btn-outline-primary"}`}
                      style={{ borderRadius: "30px", padding: "10px 30px", margin: "0 5px" }}
                    >
                      <i className="bi bi-person-fill me-2" style={{ color: "#e83e8c" }}></i>
                      Girls Hostels
                    </button>
                  </li>
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
              <div className="section-title">
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
              <div className="cour_btn" style={{ marginTop: "0" }}>
                <Link to="/" className="btn_one">
                  <i className="bi bi-arrow-left me-2"></i> Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            {loading && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading hostels...</p>
              </div>
            )}
            
            {error && (
              <div className="col-12">
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                  {error}
                </div>
              </div>
            )}
            
            {!loading && !error && hostels.length === 0 && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
                <i className="bi bi-building" style={{ fontSize: "48px", color: "#ccc", display: "block", marginBottom: "20px" }}></i>
                <h3>No hostels available</h3>
                <p>Please check back later for available accommodations.</p>
              </div>
            )}

            {hostels.map((hostel) => (
              <div className="col-lg-4 col-sm-6 col-xs-12" key={hostel.id}>
                <div className="single_course">
                  <div className="single_c_img">
                    <img
                      src={resolveMediaUrl(hostel.image) || "/assets/img/course/1.png"}
                      className="img-fluid"
                      alt={hostel.name}
                    />
                    <span>{hostel.category === "boys" ? "Boys" : "Girls"}</span>
                  </div>
                  <h4>
                    <Link to={`/hostels/${hostel.id}`}>{hostel.name}</Link>
                  </h4>
                  <p>
                    <i className="bi bi-person me-1"></i> 
                    {hostel.available_beds || 0} / {hostel.total_beds || 0} beds available
                  </p>
                  {hostel.location_notes && (
                    <p>
                      <i className="bi bi-geo-alt me-1"></i> {hostel.location_notes}
                    </p>
                  )}
                 
                  <div className="price">
                    KES {Number(hostel.fee_amount).toLocaleString()}
                    <br />
                    <small style={{ fontSize: "14px", fontWeight: "400" }}>per bed</small>
                  </div>
                  <Link 
                    to={`/hostels/${hostel.id}`}
                    className="btn_one"
                    style={{ display: "inline-block", marginBottom: "20px" }}
                  >
                    View Details <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
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