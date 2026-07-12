import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/hostels/boys", label: "Boys Hostels" },
  { to: "/hostels/girls", label: "Girls Hostels" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--mut-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "var(--mut-maroon)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
            }}
          >
            <i className="bi bi-building" />
          </span>
          <span style={{ lineHeight: 1.1 }}>
            <strong style={{ display: "block", fontSize: "1rem" }}>MUT Hostel Portal</strong>
            <small style={{ color: "var(--mut-text-muted)" }}>Book your bed online</small>
          </span>
        </Link>

        <nav
          className="nav-links"
          style={{
            display: window.innerWidth > 860 ? "flex" : open ? "flex" : "none",
            position: window.innerWidth > 860 ? "static" : "absolute",
            top: window.innerWidth > 860 ? "auto" : 72,
            left: 0,
            right: 0,
            background: "#fff",
            flexDirection: window.innerWidth > 860 ? "row" : "column",
            gap: window.innerWidth > 860 ? 28 : 0,
            padding: window.innerWidth > 860 ? 0 : "8px 20px 16px",
            borderBottom: window.innerWidth > 860 ? "none" : "1px solid var(--mut-border)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                padding: "12px 0",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: isActive ? "var(--mut-maroon)" : "var(--mut-text)",
                borderBottom: isActive ? "2px solid var(--mut-maroon)" : "2px solid transparent",
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/hostels/boys" className="btn btn-primary" style={{ display: window.innerWidth > 860 ? "inline-flex" : "none" }}>
            <i className="bi bi-door-open" /> Book a Bed
          </Link>
          <button
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
            style={{
              display: window.innerWidth > 860 ? "none" : "inline-flex",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--mut-text)",
            }}
          >
            <i className={open ? "bi bi-x-lg" : "bi bi-list"} />
          </button>
        </div>
      </div>
    </header>
  );
}