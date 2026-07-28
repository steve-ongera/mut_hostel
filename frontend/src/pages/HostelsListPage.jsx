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
                  <li><Link to="/">Home</Link> /</li>
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
                      All Hostels
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange("boys")}
                      className={`btn ${activeCategory === "boys" ? "btn_one" : "btn-outline-primary"}`}
                      style={{ borderRadius: "30px", padding: "10px 30px", margin: "0 5px" }}
                    >
                      <img src="/assets/img/e1.png" alt="Boys" style={{ width: "30px", marginRight: "10px" }} />
                      Boys Hostels
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleCategoryChange("girls")}
                      className={`btn ${activeCategory === "girls" ? "btn_one" : "btn-outline-primary"}`}
                      style={{ borderRadius: "30px", padding: "10px 30px", margin: "0 5px" }}
                    >
                      <img src="/assets/img/e2.png" alt="Girls" style={{ width: "30px", marginRight: "10px" }} />
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
                  Back to Home <i className="ti-arrow-top-right"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            {loading && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
                <p>Loading hostels...</p>
              </div>
            )}
            
            {error && (
              <div className="col-12">
                <div className="alert alert-danger">
                  <i className="ti-alert"></i> {error}
                </div>
              </div>
            )}
            
            {!loading && !error && hostels.length === 0 && (
              <div className="col-12 text-center" style={{ padding: "60px 0" }}>
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
                    <span className="ti-user"> </span> 
                    {hostel.available_beds || 0} / {hostel.total_beds || 0} beds available
                  </p>
                  {hostel.location_notes && (
                    <p>
                      <span className="ti-location-pin"> </span> {hostel.location_notes}
                    </p>
                  )}
                  {hostel.warden_name && (
                    <p>
                      <span className="ti-user"> </span> Warden: {hostel.warden_name}
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
                    View Details <i className="ti-arrow-right"></i>
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