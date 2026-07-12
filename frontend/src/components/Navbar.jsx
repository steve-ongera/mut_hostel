// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "bi bi-house" },
  { to: "/hostels/boys", label: "Boys Hostels", icon: "bi bi-building" },
  { to: "/hostels/girls", label: "Girls Hostels", icon: "bi bi-building" },
  { to: "/about", label: "About", icon: "bi bi-info-circle" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && open) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <i className="bi bi-building" />
          </span>
          <span className="brand-text">
            <strong>MUT Hostel Portal</strong>
            <small>Book your bed online</small>
          </span>
        </Link>

        <nav className={`navbar-nav ${open ? "open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <div key={link.to} className="nav-item">
              <NavLink
                to={link.to}
                className={({ isActive }) => 
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                <i className={link.icon} style={{ marginRight: "6px" }} />
                {link.label}
              </NavLink>
            </div>
          ))}
          
          {/* Mobile-only Book a Bed button */}
          <div className="nav-item" style={{ display: "none" }}>
            <Link 
              to="/hostels/boys" 
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "8px" }}
              onClick={() => setOpen(false)}
            >
              <i className="bi bi-door-open" /> Book a Bed
            </Link>
          </div>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link 
            to="/hostels/boys" 
            className="btn btn-primary desktop-only"
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="bi bi-door-open" /> Book a Bed
          </Link>
          <button
            className="navbar-toggler"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
          >
            <i className={open ? "bi bi-x-lg" : "bi bi-list"} />
          </button>
        </div>
      </div>

      <style>{`
        .desktop-only {
          display: inline-flex !important;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
          .navbar-nav .nav-item:last-child {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}