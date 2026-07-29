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
    >
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* Logo - 20% width */}
          <div className="col-20 align-self-center">
            <div className="site-logo">
              <Link to="/">
                <img 
                  src="/assets/img/logo.png" 
                  alt="Muranga University Hostel Booking" 
                  className="img-fluid"
                />
              </Link>
            </div>
          </div>

          {/* Main Navigation - 60% width */}
          <div className="col-60 d-none d-xl-block">
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
                  <ul>
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

          {/* CTA Button - 20% width */}
          <div className="col-20 d-none d-xl-block text-end align-self-center">
            <Link to="/hostels" className="btn_one">
              <i className="bi bi-calendar-check me-2"></i> Book Now
            </Link>
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
                background: "rgba(0,0,0,0.5)",
                zIndex: 9998,
                transition: "opacity 0.3s ease"
              }}
            />
          )}

          {/* Mobile Menu */}
          <ul className={`mobile_menu ${mobileOpen ? "show" : ""}`}>
            <li className="mobile-menu-header">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <img 
                  src="/assets/img/logo-light.png" 
                  alt="Logo" 
                  style={{ height: "40px" }}
                />
                <button 
                  type="button" 
                  className="close-menu"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: "28px",
                    cursor: "pointer"
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </li>
            <li>
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMobileOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/hostels" onClick={() => setMobileOpen(false)}>
                Hostels
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/hostels?category=boys" onClick={() => setMobileOpen(false)}>
                    <i className="bi bi-person me-2"></i> Boys Hostels
                  </Link>
                </li>
                <li>
                  <Link to="/hostels?category=girls" onClick={() => setMobileOpen(false)}>
                    <i className="bi bi-person-female me-2"></i> Girls Hostels
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/hostels" onClick={() => setMobileOpen(false)}>
                Book a Bed
              </Link>
            </li>
            <li>
              <Link to="/bookings/lookup" onClick={() => setMobileOpen(false)}>
                Track Booking
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
            </li>
            <li className="mobile-cta">
              <Link 
                to="/hostels" 
                onClick={() => setMobileOpen(false)}
                className="btn_one"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "20px"
                }}
              >
                <i className="bi bi-calendar-check me-2"></i> Book Now
              </Link>
            </li>
          </ul>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            id="sm_menu_ham"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={mobileOpen ? "active" : ""}
          >
            <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"}`}></i>
          </button>
        </div>
        {/* END ROW */}
      </div>
      {/* END CONTAINER */}
    </div>
  );
}