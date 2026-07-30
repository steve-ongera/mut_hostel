import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHostels, resolveMediaUrl, extractErrorMessages } from "../services/api";

const TESTIMONIALS = [
  {
    text:
      "I booked my bed from home the day admissions opened and paid with M-Pesa in under two minutes. No queues at all.",
    name: "Brian Kiptoo",
    role: "First Year, Boys Hostel Block A",
    image: "/assets/img/testimonial/1.png",
  },
  {
    text:
      "Seeing exactly which bed was free before paying gave me confidence I would not lose my money on a room that was already full.",
    name: "Sharon Achieng",
    role: "Second Year, Girls Hostel Block A",
    image: "/assets/img/testimonial/2.png",
  },
  {
    text:
      "My receipt with the QR code made check-in day so fast - the warden just scanned it and I was done.",
    name: "Kevin Mutua",
    role: "Third Year, Boys Hostel Block B",
    image: "/assets/img/testimonial/3.png",
  },
];

export default function HomePage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Testimonial carousel state (self-contained, no Bootstrap JS dependency)
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getHostels()
      .then((data) => {
        if (isMounted) setHostels(Array.isArray(data) ? data : []);
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
  }, []);

  // Auto-advance the testimonial carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToTestimonial = (index) => {
    setActiveTestimonial(index);
  };

  const goToPrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <>
      {/* START HOME */}
      <section
        id="hero-home-section"
        className="home_bg"
        style={{
          backgroundImage: "url(/assets/img/bg/home-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          minHeight: "auto",
          padding: "120px 0 80px",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="hero-text">
                <h1>
                  Muranga University <br />
                  <span>Hostel Booking</span>
                </h1>
                <p>
                  Book your Muranga University hostel bed in minutes, pay securely with M-Pesa,
                  and get an instant e-receipt with a scannable QR code.
                </p>
                {/* View Hostels Button - Always visible */}
                <div style={{ marginTop: "30px" }}>
                  <Link to="/hostels" className="btn_one" style={{ 
                    padding: "15px 40px", 
                    fontSize: "18px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "3px",
                  }}>
                    <i className="bi bi-building"></i>
                    View All Hostels
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="hero-text-img" style={{ 
                position: "relative", 
                textAlign: "center",
                marginTop: "30px"
              }}>
                <img 
                  src="/assets/img/hero_image.png" 
                  className="img-fluid" 
                  alt="Student moving into hostel"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <div className="home_ps" style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "10%",
                  background: "#fff",
                  padding: "15px 20px",
                  borderRadius: "8px",
                  boxShadow: "0px 0 30px rgba(1, 41, 112, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px"
                }}>
                  <div className="icon-box" style={{
                    width: "50px",
                    height: "50px",
                    background: "#ECEDFF",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2D36BB",
                    fontSize: "20px"
                  }}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <h2 style={{ fontWeight: "500", margin: 0 }}>4500+</h2>
                    <p style={{ margin: 0 }}>Students housed</p>
                  </div>
                </div>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END HOME */}

      {/* START COUNTER */}
      <section className="count_area counter_feature">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter" style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "20px 25px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{
                  width: "55px",
                  height: "55px",
                  minWidth: "55px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#eef0ff",
                  color: "#525fe1",
                  fontSize: "24px",
                  marginRight: "15px"
                }}>
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0b104a" }}>
                    {hostels.length || "—"}
                  </h2>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>Hostels Listed</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter" style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "20px 25px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{
                  width: "55px",
                  height: "55px",
                  minWidth: "55px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e8f5e9",
                  color: "#4caf50",
                  fontSize: "24px",
                  marginRight: "15px"
                }}>
                  <i className="bi bi-bed-fill"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0b104a" }}>
                    {hostels.reduce((sum, h) => sum + (h.available_beds || 0), 0) || "—"}
                  </h2>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>Beds Available</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter" style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "20px 25px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{
                  width: "55px",
                  height: "55px",
                  minWidth: "55px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff3e0",
                  color: "#ff9800",
                  fontSize: "24px",
                  marginRight: "15px"
                }}>
                  <i className="bi bi-clock-fill"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0b104a" }}>10 Min</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>Bed Hold Time</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter" style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "20px 25px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{
                  width: "55px",
                  height: "55px",
                  minWidth: "55px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e3f2fd",
                  color: "#2196f3",
                  fontSize: "24px",
                  marginRight: "15px"
                }}>
                  <i className="bi bi-phone-fill"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0b104a" }}>M-Pesa</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>Secure Payment</p>
                </div>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END COUNTER */}

      {/* START CATEGORY (how it works) */}
      <section
        className="top_cat__area section-padding"
        style={{
          backgroundImage: "url(/assets/img/bg/shape-1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="container">
          <div className="section-title text-center">
            <h2>Book Your Bed In Four Simple Steps</h2>
            <p>
              From choosing a hostel to walking into your room, the whole process happens online -
              no queues, no paperwork.
            </p>
          </div>
          <div className="row">
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
              data-wow-offset="0"
            >
              <div className="single_tp">
                <div className="icon-box sc_one">01</div>
                <div className="tp-content">
                  <h3>
                    Choose Your <br />Hostel
                  </h3>
                  <p>Browse Boys and Girls hostels and see live bed availability per room.</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.3s"
              data-wow-offset="0"
            >
              <div className="single_tp">
                <div className="icon-box sc_two">02</div>
                <div className="tp-content">
                  <h3>
                    Pick Your <br />Bed
                  </h3>
                  <p>Select an exact bed in a room and we hold it for 10 minutes while you pay.</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.4s"
              data-wow-offset="0"
            >
              <div className="single_tp">
                <div className="icon-box sc_three">03</div>
                <div className="tp-content">
                  <h3>
                    Pay With <br />M-Pesa
                  </h3>
                  <p>Enter your Safaricom number and confirm the STK push on your phone.</p>
                </div>
              </div>
            </div>
            {/* END COL */}
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.4s"
              data-wow-offset="0"
            >
              <div className="single_tp">
                <div className="icon-box sc_four">04</div>
                <div className="tp-content">
                  <h3>
                    Get Your <br />Receipt
                  </h3>
                  <p>Download your e-receipt with a QR code and present it at check-in.</p>
                </div>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END CATEGORY */}

      {/* START ABOUT US */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div
              className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
              data-wow-offset="0"
            >
              <div className="ab_img">
                <img src="/assets/img/about.jpg" className="img-fluid" alt="Muranga University hostel" />
              </div>
            </div>
            {/* END COL */}
            <div
              className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="ab_content">
                <h2>Comfortable, Secure Accommodation Inside Muranga University</h2>
                <p>
                  Our hostels are managed directly by the university, giving every student a
                  guarded, well-maintained place to stay a short walk from lecture halls.
                </p>
                <p>
                  Every booking is tied to your registration details and confirmed instantly once
                  M-Pesa payment goes through - no manual approval, no waiting in line at the
                  accommodation office.
                </p>
                <ul>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> Live bed-by-bed availability for every room
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> Instant M-Pesa payment with automatic confirmation
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> Downloadable receipt with a scannable QR code
                  </li>
                </ul>
                <Link className="btn_one" to="/hostels">
                  View All Hostels <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END ABOUT US */}

      {/* START CATEGORY (hostel types) */}
      <section
        className="top_cat__area section-padding"
        style={{
          backgroundImage: "url(/assets/img/bg/section-2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="container">
          <div className="section-title text-center">
            <h2>Find Accommodation By Category</h2>
            <p>Filter hostels by the categories students look for most.</p>
          </div>
          <div className="row">
            <div
              className="col-lg-12 col-sm-12 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="cat_list">
                <ul>
                  <li>
                    <Link to="/hostels?category=boys">
                      <img src="/assets/img/e1.png" alt="Boys hostels" /> Boys Hostels
                    </Link>
                  </li>
                  <li>
                    <Link to="/hostels?category=girls">
                      <img src="/assets/img/e2.png" alt="Girls hostels" /> Girls Hostels
                    </Link>
                  </li>
                  <li>
                    <Link to="/hostels">
                      <img src="/assets/img/e3.png" alt="Available beds" /> Available Beds
                    </Link>
                  </li>
                  <li>
                    <Link to="/hostels">
                      <img src="/assets/img/e4.png" alt="Nearest to lecture halls" /> Near Lecture Halls
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookings/lookup">
                      <img src="/assets/img/e5.png" alt="Track booking" /> Track My Booking
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact">
                      <img src="/assets/img/e6.png" alt="Wardens" /> Talk To A Warden
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END CATEGORY */}

      {/* START HOSTELS */}
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-sm-6 col-xs-12">
              <div className="section-title" style={{ marginBottom: "20px" }}>
                <h2>
                  Browse <b>{hostels.length || ""} </b> <br />
                  Hostels With Live Availability
                </h2>
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="cour_btn" style={{ marginTop: "0", float: "right" }}>
                <Link to="/hostels" className="btn_one">
                  View all Hostels <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}

          <div className="row">
            {loading && (
              <div className="col-12 text-center" style={{ padding: "40px 0" }}>
                <div className="spinner-border text-primary" role="status" style={{ width: "40px", height: "40px" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3" style={{ color: "#6c757d" }}>Loading hostels…</p>
              </div>
            )}
            
            {error && (
              <div className="col-12">
                <div className="alert alert-danger d-flex align-items-center" style={{ 
                  padding: "12px 16px", 
                  borderRadius: "6px",
                  border: "1px solid #f5c6cb",
                  background: "#f8d7da",
                  color: "#721c24"
                }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                  {error}
                </div>
              </div>
            )}
            
            {!loading && !error && hostels.length === 0 && (
              <div className="col-12 text-center" style={{ padding: "40px 0" }}>
                <i className="bi bi-building" style={{ fontSize: "48px", color: "#ccc", display: "block", marginBottom: "15px" }}></i>
                <p style={{ color: "#6c757d" }}>No hostels are published yet - check back soon.</p>
              </div>
            )}
            
            {hostels.slice(0, 6).map((hostel) => (
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12" key={hostel.id}>
                <div className="single_course">
                  {/* Hostel Image with uniform sizing */}
                  <div className="hostel-card-image">
                    <img
                      src={resolveMediaUrl(hostel.image) || "/assets/img/course/1.png"}
                      className="img-fluid"
                      alt={hostel.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                    <span style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      background: "#525fe1",
                      color: "#fff",
                      padding: "3px 14px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {hostel.category === "boys" ? "Boys" : "Girls"}
                    </span>
                  </div>
                  
                  <h4 style={{ padding: "18px 20px 8px", marginBottom: "5px" }}>
                    <Link to={`/hostels/${hostel.id}`} style={{ 
                      fontWeight: "600",
                      fontSize: "19px",
                      lineHeight: "26px",
                      color: "#0b104a"
                    }}>
                      {hostel.name}
                    </Link>
                  </h4>
                  
                  <div style={{ padding: "0 20px" }}>
                    <p style={{ marginBottom: "4px", fontSize: "14px", color: "#4a5355" }}>
                      <i className="bi bi-person me-1" style={{ color: "#6c757d" }}></i> 
                      <span style={{ fontWeight: "500" }}>{hostel.available_beds || 0}</span> / {hostel.total_beds || 0} beds available
                    </p>
                    {hostel.location_notes && (
                      <p style={{ marginBottom: "4px", fontSize: "14px", color: "#4a5355" }}>
                        <i className="bi bi-geo-alt me-1" style={{ color: "#6c757d" }}></i> 
                        {hostel.location_notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="price" style={{ 
                    padding: "12px 20px",
                    marginTop: "12px",
                    borderTop: "1px solid #e8e8e9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{ 
                        fontSize: "20px", 
                        fontWeight: "700", 
                        color: "#0b104a"
                      }}>
                        KES {Number(hostel.fee_amount).toLocaleString()}
                      </span>
                      <br />
                      <small style={{ fontSize: "12px", fontWeight: "400", color: "#6c757d" }}>per bed</small>
                    </div>
                    <Link 
                      to={`/hostels/${hostel.id}`}
                      className="btn_one"
                      style={{ 
                        padding: "6px 18px",
                        fontSize: "13px",
                        borderRadius: "4px",
                        background: "#0b104a",
                        borderColor: "#0b104a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      View Details <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END HOSTELS */}

      {/* START VIDEO */}
      <section className="vid_area section-padding">
        <div className="container">
          <div className="row">
            <div
              className="col-lg-12 vp_top wow fadeInUDown"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
              data-wow-offset="0"
            >
              <div
                className="video-area"
                style={{
                  backgroundImage: "url(/assets/img/bg/video.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                }}
              >
                <a
                  href="https://www.youtube.com/watch?v=RXv_uIN6e-Y"
                  className="magnific_popup video-button"
                >
                  <i className="bi bi-play-fill"></i>
                </a>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END VIDEO */}

      {/* START TEAM (hostel wardens) */}
      <section className="team_area section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h2>Meet Your Hostel Wardens</h2>
            <p>Every hostel block has a dedicated warden you can reach directly for anything you need.</p>
          </div>
          <div className="row">
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="our-team" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: '1px solid #ddd',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                background: '#fff',
                transition: 'all 0.3s ease'
              }}>
                <div className="team-content" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f5f5f5'
                  }}>
                    <a href="#" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img 
                        src="/assets/img/team/team4.webp" 
                        alt="Hostel warden" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </a>
                  </div>
                  <ul className="social-links" style={{
                    padding: '0',
                    margin: '0',
                    listStyle: 'none',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '10px 0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                  }}>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-telephone-fill"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-envelope-fill"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof" style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '15px 0 5px'
                }}>
                  <h3 style={{
                    fontWeight: '600',
                    margin: '0 0 5px',
                    fontSize: '18px',
                    color: '#0b104a'
                  }}>Mrs. Wanjiru Kamau</h3>
                  <span style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>Warden, Boys Hostel Block A</span>
                </div>
                <div className="sth_det2" style={{
                  flexShrink: 0,
                  padding: '10px 0 5px'
                }}>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-house-door me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>Block A</u>
                  </span>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-person me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>120 Students</u>
                  </span>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="our-team" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: '1px solid #ddd',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                background: '#fff',
                transition: 'all 0.3s ease'
              }}>
                <div className="team-content" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f5f5f5'
                  }}>
                    <a href="#" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img 
                        src="/assets/img/team/warden2.jpg" 
                        alt="Hostel warden" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </a>
                  </div>
                  <ul className="social-links" style={{
                    padding: '0',
                    margin: '0',
                    listStyle: 'none',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '10px 0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                  }}>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-telephone-fill"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-envelope-fill"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof" style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '15px 0 5px'
                }}>
                  <h3 style={{
                    fontWeight: '600',
                    margin: '0 0 5px',
                    fontSize: '18px',
                    color: '#0b104a'
                  }}>Mr. Otieno Mwangi</h3>
                  <span style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>Warden, Boys Hostel Block B</span>
                </div>
                <div className="sth_det2" style={{
                  flexShrink: 0,
                  padding: '10px 0 5px'
                }}>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-house-door me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>Block B</u>
                  </span>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-person me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>96 Students</u>
                  </span>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="our-team" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: '1px solid #ddd',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                background: '#fff',
                transition: 'all 0.3s ease'
              }}>
                <div className="team-content" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f5f5f5'
                  }}>
                    <a href="#" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img 
                        src="/assets/img/team/warden3.jpg" 
                        alt="Hostel warden" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </a>
                  </div>
                  <ul className="social-links" style={{
                    padding: '0',
                    margin: '0',
                    listStyle: 'none',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '10px 0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                  }}>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-telephone-fill"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-envelope-fill"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof" style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '15px 0 5px'
                }}>
                  <h3 style={{
                    fontWeight: '600',
                    margin: '0 0 5px',
                    fontSize: '18px',
                    color: '#0b104a'
                  }}>Mrs. Achieng Otieno</h3>
                  <span style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>Warden, Girls Hostel Block A</span>
                </div>
                <div className="sth_det2" style={{
                  flexShrink: 0,
                  padding: '10px 0 5px'
                }}>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-house-door me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>Block A</u>
                  </span>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-person me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>140 Students</u>
                  </span>
                </div>
              </div>
            </div>
            {/* END COL */}
            
            <div
              className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="our-team" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: '1px solid #ddd',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                background: '#fff',
                transition: 'all 0.3s ease'
              }}>
                <div className="team-content" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f5f5f5'
                  }}>
                    <a href="#" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img 
                        src="/assets/img/team/warden4.jpg" 
                        alt="Hostel warden" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </a>
                  </div>
                  <ul className="social-links" style={{
                    padding: '0',
                    margin: '0',
                    listStyle: 'none',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '10px 0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                  }}>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-telephone-fill"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{
                        padding: '8px 12px',
                        color: '#fff',
                        display: 'block',
                        background: '#525fe1',
                        borderRadius: '4px',
                        transition: 'all 0.3s linear 0s'
                      }}>
                        <i className="bi bi-envelope-fill"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof" style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '15px 0 5px'
                }}>
                  <h3 style={{
                    fontWeight: '600',
                    margin: '0 0 5px',
                    fontSize: '18px',
                    color: '#0b104a'
                  }}>Ms. Faith Njeri</h3>
                  <span style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>Warden, Girls Hostel Block B</span>
                </div>
                <div className="sth_det2" style={{
                  flexShrink: 0,
                  padding: '10px 0 5px'
                }}>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-house-door me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>Block B</u>
                  </span>
                  <span style={{
                    color: '#525fe1',
                    display: 'inline-block',
                    margin: '5px 8px',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-person me-1"></i> <u style={{
                      color: '#1a2d62',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>110 Students</u>
                  </span>
                </div>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END TEAM */}

      {/* START PROMO */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div
              className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="ab_content">
                <h2>Why Students Choose Our Online Booking</h2>
                <p>
                  No more standing in line outside the accommodation office. Reserve your bed the
                  moment admissions open and pay from anywhere.
                </p>
                <p>
                  Every payment is reconciled automatically through M-Pesa Daraja, so your bed is
                  confirmed the second your STK push succeeds.
                </p>
                <ul>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> A 10-minute hold protects your bed while you pay
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> Works for both national ID and birth certificate holders
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> Get an emailed receipt the moment you pay
                  </li>
                </ul>
                <Link className="btn_one" to="/hostels">
                  Book Your Bed <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
            {/* END COL */}
            <div
              className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
              data-wow-offset="0"
            >
              <div className="ab_img">
                <img src="/assets/img/about3.jpg" className="img-fluid" alt="Booking on a laptop" />
                <div className="home_ps2">
                  <div className="icon-box">
                    <i className="bi bi-book"></i>
                  </div>
                  <div>
                    <h2>{hostels.reduce((sum, h) => sum + (h.total_beds || 0), 0) || "3300+"}</h2>
                    <p>Total Beds Managed</p>
                  </div>
                </div>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END PROMO */}

      {/* START TESTIMONIALS */}
      <section className="testi_area section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h2>
              What Students Say About <br />Booking Online
            </h2>
          </div>
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="ab_img">
                <img src="/assets/img/about4.jpg" className="img-fluid" alt="Student review" />
              </div>
            </div>
            {/* END COL */}

            <div className="col-lg-6 col-sm-12 col-xs-12">
              {/*
                Self-contained React testimonial carousel.
                This does NOT rely on Bootstrap's JS carousel plugin, which only
                auto-initializes elements present at initial page load. Because this
                section is rendered by React (and can remount on route changes),
                data-bs-ride="carousel" never got wired up, so it never advanced.
                State + setInterval below guarantees it always works.
              */}
              <div className="carousel slide" style={{ position: "relative" }}>
                {/* Carousel Indicators */}
                <div className="carousel-indicators" style={{
                  position: 'relative',
                  marginTop: '20px',
                  marginBottom: '0'
                }}>
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToTestimonial(idx)}
                      aria-current={activeTestimonial === idx ? "true" : undefined}
                      aria-label={`Slide ${idx + 1}`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid #525fe1',
                        backgroundColor: activeTestimonial === idx ? '#525fe1' : 'transparent',
                        margin: '0 5px',
                        padding: '0',
                        cursor: 'pointer'
                      }}
                    ></button>
                  ))}
                </div>

                {/* Carousel Inner */}
                <div className="carousel-inner" style={{ padding: '10px 0' }}>
                  {TESTIMONIALS.map((t, idx) => (
                    <div
                      key={idx}
                      className={`carousel-item${activeTestimonial === idx ? " active" : ""}`}
                    >
                      <div className="testimonial" style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '30px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0',
                        margin: '0'
                      }}>
                        <img src="/assets/img/quote.png" alt="" style={{ width: '50px', marginBottom: '15px' }} />
                        <div className="testimonial_content">
                          <div className="stars" style={{ marginBottom: '12px' }}>
                            <i className="bi bi-star-fill" style={{ color: '#FFB800', fontSize: '18px', marginRight: '4px' }}></i>
                            <i className="bi bi-star-fill" style={{ color: '#FFB800', fontSize: '18px', marginRight: '4px' }}></i>
                            <i className="bi bi-star-fill" style={{ color: '#FFB800', fontSize: '18px', marginRight: '4px' }}></i>
                            <i className="bi bi-star-fill" style={{ color: '#FFB800', fontSize: '18px', marginRight: '4px' }}></i>
                            <i className="bi bi-star-fill" style={{ color: '#FFB800', fontSize: '18px', marginRight: '4px' }}></i>
                          </div>
                          <p style={{
                            fontSize: '18px',
                            lineHeight: '30px',
                            color: '#1a1a2e',
                            fontStyle: 'italic',
                            marginBottom: '20px'
                          }}>
                            "{t.text}"
                          </p>
                        </div>
                        <div className="testi_pic_title" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: '#f8f9fa',
                          padding: '15px 20px',
                          borderRadius: '8px',
                          marginTop: '5px'
                        }}>
                          <img
                            src={t.image}
                            alt=""
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              border: '3px solid #fff',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              margin: '0 0 4px 0',
                              color: '#0b104a'
                            }}>
                              {t.name}
                            </h4>
                            <p style={{
                              fontSize: '14px',
                              color: '#6c757d',
                              margin: '0'
                            }}>
                              {t.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Controls with Bootstrap Icons */}
                <button
                  className="carousel-control-prev"
                  type="button"
                  onClick={goToPrevTestimonial}
                  aria-label="Previous testimonial"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#525fe1',
                    borderRadius: '50%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '-50px',
                    opacity: '1',
                    position: 'absolute',
                    border: 'none',
                    zIndex: '10',
                    cursor: 'pointer'
                  }}
                >
                  <i className="bi bi-chevron-left" style={{ fontSize: '20px', color: '#fff' }}></i>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  onClick={goToNextTestimonial}
                  aria-label="Next testimonial"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#525fe1',
                    borderRadius: '50%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '-50px',
                    opacity: '1',
                    position: 'absolute',
                    border: 'none',
                    zIndex: '10',
                    cursor: 'pointer'
                  }}
                >
                  <i className="bi bi-chevron-right" style={{ fontSize: '20px', color: '#fff' }}></i>
                </button>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </section>
      {/* END TESTIMONIALS */}

      {/* START BLOG (hostel announcements) */}
      <section id="blog" className="blog_area section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h2>Latest Hostel Announcements</h2>
            <p>Stay up to date with booking deadlines, fee changes and hostel notices.</p>
          </div>
          <div className="row">
            <div
              className="col-lg-4 col-sm-4 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="single_blog">
                <img src="/assets/img/blog/news1.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Aug 1, 2026 | <a href="#">Booking</a>
                  </span>
                  <h2>
                    <a href="#">First-Year Booking Opens Next Week</a>
                  </h2>
                  <a className="arti_btn" href="#">
                    Read More <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
            {/* END COL*/}
            <div
              className="col-lg-4 col-sm-4 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
              data-wow-offset="0"
            >
              <div className="single_blog">
                <img src="/assets/img/blog/new2.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Jul 20, 2026 | <a href="#">Payments</a>
                  </span>
                  <h2>
                    <a href="#">M-Pesa Is Now The Only Accepted Payment Method</a>
                  </h2>
                  <a className="arti_btn" href="#">
                    Read More <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
            {/* END COL*/}
            <div
              className="col-lg-4 col-sm-4 col-xs-12 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay="0.3s"
              data-wow-offset="0"
            >
              <div className="single_blog">
                <img src="/assets/img/blog/news3.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Jul 5, 2026 | <a href="#">Notice</a>
                  </span>
                  <h2>
                    <a href="#">Beds Are Held For Only 10 Minutes During Checkout</a>
                  </h2>
                  <a className="arti_btn" href="#">
                    Read More <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
            {/* END COL*/}
          </div>
          {/* / END ROW */}
        </div>
        {/* END CONTAINER  */}
      </section>
      {/* END BLOG */}
    </>
  );
}