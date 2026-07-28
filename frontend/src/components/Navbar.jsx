import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div id="navigation" className="navbar-light bg-faded site-navigation">
      <div className="container-fluid">
        <div className="row">
          <div className="col-20 align-self-center">
            <div className="site-logo">
              <Link to="/">
                <img src="/assets/img/logo.png" alt="Muranga University Hostel Booking" />
              </Link>
            </div>
          </div>
          {/* END Col */}

          <div className="col-60 d-flex">
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
                      <Link to="/hostels?category=boys">Boys Hostels</Link>
                    </li>
                    <li>
                      <Link to="/hostels?category=girls">Girls Hostels</Link>
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
          {/* END Col */}

          <div className="col-20 d-none d-xl-block text-end align-self-center">
           
            <Link to="/hostels" className="btn_one">
              <i className="bi bi-calendar-check me-1"></i>Book Now
            </Link>
          </div>
          {/* END Col */}

          <ul className={`mobile_menu ${mobileOpen ? "show" : ""}`}>
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
                    Boys Hostels
                  </Link>
                </li>
                <li>
                  <Link to="/hostels?category=girls" onClick={() => setMobileOpen(false)}>
                    Girls Hostels
                  </Link>
                </li>
              </ul>
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
          </ul>

          <button
            type="button"
            id="sm_menu_ham"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
            style={{ display: "none" }}
          >
            <i className="fa fa-bars"></i>
          </button>
        </div>
        {/* END ROW */}
      </div>
      {/* END CONTAINER */}
    </div>
  );
}