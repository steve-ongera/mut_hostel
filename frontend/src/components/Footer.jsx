// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="grid grid-cols-4 gap-5">
          {/* Brand & About */}
          <div>
            <div className="footer-brand">
              <span className="brand-icon">
                <i className="bi bi-building" />
              </span>
              <span className="brand-text">MUT Hostel Portal</span>
            </div>
            <p style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>
              Secure your accommodation at Murang'a University with ease. 
              Book your bed online, pay via M-Pesa, and get instant confirmation.
            </p>
            <div className="footer-social">
              <a 
                href="https://facebook.com/murangaauniversity" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook" />
              </a>
              <a 
                href="https://twitter.com/murangaauni" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="bi bi-twitter-x" />
              </a>
              <a 
                href="https://instagram.com/murangaauniversity" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram" />
              </a>
              <a 
                href="https://youtube.com/murangaauniversity" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <i className="bi bi-youtube" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/hostels/boys">Boys Hostels</Link>
              </li>
              <li>
                <Link to="/hostels/girls">Girls Hostels</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4>Support</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:hostels@mut.ac.ke">
                  <i className="bi bi-envelope" /> hostels@mut.ac.ke
                </a>
              </li>
              <li>
                <a href="tel:+254712345678">
                  <i className="bi bi-telephone" /> +254 712 345 678
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-whatsapp" /> +254 712 345 678
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-clock" /> 24/7 Support
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4>Location</h4>
            <ul className="footer-links">
              <li>
                <i className="bi bi-geo-alt" /> Murang'a University
              </li>
              <li>
                <i className="bi bi-pin-map" /> Murang'a Town, Kenya
              </li>
              <li>
                <i className="bi bi-phone" /> +254 712 345 678
              </li>
              <li>
                <i className="bi bi-globe" /> www.mut.ac.ke
              </li>
            </ul>
            <div style={{ marginTop: "1rem" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127650.123456789!2d36.0!3d-1.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDAnMDAuMCJTIDM2wrAwMCcwMC4wIkU!5e0!3m2!1sen!2ske!4v1234567890"
                width="100%"
                height="120"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Murang'a University Location"
              />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} Murang'a University. All rights reserved.
          </p>
          <p>
            <Link to="/privacy" style={{ marginRight: "1rem" }}>Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}