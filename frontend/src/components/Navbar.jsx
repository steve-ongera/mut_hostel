import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on window resize (when going back to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen) {
        const menu = document.querySelector(".mobile_menu");
        const ham = document.getElementById("sm_menu_ham");
        if (menu && !menu.contains(e.target) && ham && !ham.contains(e.target)) {
          setMobileOpen(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <div
      id="navigation"
      className={`navbar-light bg-faded site-navigation ${isScrolled ? "navbar-fixed" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: isScrolled ? "#ffffff" : "transparent",
        boxShadow: isScrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s ease",
        padding: isScrolled ? "10px 20px" : "20px 30px",
        borderBottom: isScrolled ? "1px solid #eee" : "none",
      }}
    >
      <div className="container-fluid">
        <div className="navbar-row">
          {/* Logo - Left */}
          <div className="navbar-logo-col">
            <div className="site-logo">
              <Link to="/">
                <img
                  src="/assets/img/mut_logo2.png"
                  alt="Muranga University Hostel Booking"
                  style={{
                    height: "50px",
                    width: "auto",
                    maxHeight: "50px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="desktop-nav">
            <nav id="main-menu">
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li className="menu-item-has-children">
                  <Link to="/hostels">Hostels</Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/hostels?category=boys">
                        <i className="bi bi-person me-1"></i> Boys Hostels
                      </Link>
                    </li>
                    <li>
                      <Link to="/hostels?category=girls">
                        <i className="bi bi-person-female me-1"></i> Girls Hostels
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/hostels">Book a Bed</Link>
                </li>
                <li>
                  <Link to="/bookings/lookup">Track Booking</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Desktop CTA Button and Hamburger - Right */}
          <div className="navbar-actions">
            <Link to="/hostels" className="btn_one desktop-cta">
              <i className="bi bi-calendar-check me-2"></i> Book Now
            </Link>

            {/* Hamburger Menu Button - Always visible, positioned at the end */}
            <button
              type="button"
              id="sm_menu_ham"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(!mobileOpen);
              }}
              className={mobileOpen ? "active" : ""}
            >
              <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998,
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Mobile Menu - Slides from right */}
      <ul
        className={`mobile_menu ${mobileOpen ? "show" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: mobileOpen ? "0" : "-320px",
          width: "300px",
          maxWidth: "85%",
          height: "100%",
          background: "#0b104a",
          zIndex: 9999,
          padding: "80px 25px 30px",
          overflowY: "auto",
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
          listStyle: "none",
          margin: 0,
        }}
      >
        <li className="mobile-menu-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px", marginBottom: "20px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <img
              src="/assets/img/mut_logo2.png"
              alt="Logo"
              style={{ height: "35px", width: "auto", objectFit: "contain" }}
            />
            <button
              type="button"
              className="close-menu"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "28px",
                cursor: "pointer",
                padding: "4px",
                lineHeight: 1,
                transition: "transform 0.3s ease",
              }}
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            Home
          </Link>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            About
          </Link>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/hostels"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            Hostels
          </Link>
          <ul className="sub-menu" style={{ paddingLeft: "20px", marginTop: "5px", listStyle: "none" }}>
            <li>
              <Link
                to="/hostels?category=boys"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  color: "#a8b0d0",
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: "500",
                  textTransform: "none",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
              >
                <i className="bi bi-person me-2"></i> Boys Hostels
              </Link>
            </li>
            <li>
              <Link
                to="/hostels?category=girls"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  color: "#a8b0d0",
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: "500",
                  textTransform: "none",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
              >
                <i className="bi bi-person-female me-2"></i> Girls Hostels
              </Link>
            </li>
          </ul>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/hostels"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            Book a Bed
          </Link>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/bookings/lookup"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            Track Booking
          </Link>
        </li>
        <li style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              color: "#fff",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              textDecoration: "none",
            }}
          >
            Contact
          </Link>
        </li>
        <li className="mobile-cta" style={{ marginTop: "30px" }}>
          <Link
            to="/hostels"
            onClick={() => setMobileOpen(false)}
            className="btn_one mobile-cta-btn"
            style={{
              display: "block",
              textAlign: "center",
              background: "#525fe1",
              color: "#fff",
              padding: "14px 30px",
              borderRadius: "5px",
              fontWeight: "600",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              textDecoration: "none",
              border: "1px solid #525fe1",
            }}
          >
            <i className="bi bi-calendar-check me-2"></i> Book Now
          </Link>
        </li>
      </ul>
    </div>
  );
}