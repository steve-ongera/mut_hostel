import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      {/* START FOOTER */}
      <div className="footer section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single_footer">
                <Link to="/">
                  <img src="/assets/img/logo.png" alt="Muranga University Hostel Booking" />
                </Link>
                <p>
                  The official online platform for booking, paying for and managing student
                  hostel accommodation at Muranga University.
                </p>
                <div className="social_profile">
                  <ul>
                    <li>
                      <a className="f_facebook" href="#">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                    </li>
                    <li>
                      <a className="f_twitter" href="#">
                        <i className="fa-solid fa-x"></i>
                      </a>
                    </li>
                    <li>
                      <a className="f_instagram" href="#">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a className="f_linkedin" href="#">
                        <i className="fa-brands fa-linkedin-in"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* END COL */}

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Quick Links</h4>
                <ul>
                  <li>
                    <Link to="/about">About the Hostels</Link>
                  </li>
                  <li>
                    <Link to="/hostels">Book a Bed</Link>
                  </li>
                  <li>
                    <Link to="/bookings/lookup">Track a Booking</Link>
                  </li>
                  <li>
                    <a href="#faq">Frequently Asked Questions</a>
                  </li>
                  <li>
                    <Link to="/contact">Contact Us</Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* END COL */}

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Hostels</h4>
                <ul>
                  <li>
                    <Link to="/hostels?category=boys">Boys Hostels</Link>
                  </li>
                  <li>
                    <Link to="/hostels?category=girls">Girls Hostels</Link>
                  </li>
                  <li>
                    <a href="#">Bed Availability</a>
                  </li>
                  <li>
                    <a href="#">Hostel Fees</a>
                  </li>
                  <li>
                    <a href="#">M-Pesa Payment Guide</a>
                  </li>
                </ul>
              </div>
            </div>
            {/* END COL */}

            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Contact Info</h4>
                <div className="sf_contact">
                  <span className="ti-map"></span>
                  <p>Muranga University of Technology, Muranga, Kenya</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile"></span>
                  <p>+254 700 000 000</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile"></span>
                  <p>
                    <a href="tel:+254700000000">Chat with the Hostel Office</a>
                  </p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email"></span>
                  <p>hostels@mut.ac.ke</p>
                </div>
              </div>
            </div>
            {/* END COL */}

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Payments</h4>
                <p>All bookings are secured instantly via M-Pesa. No cash is handled on campus.</p>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}
        </div>
        {/* END CONTAINER */}
      </div>
      {/* END FOOTER */}

      {/* START FOOTER COPYRIGHT */}
      <div className="foot_copy">
        <div className="footer_copyright">
          <p>&copy; {new Date().getFullYear()} Muranga University Hostel Booking. All Rights Reserved.</p>
        </div>
      </div>
      {/* END FOOTER COPYRIGHT */}
    </>
  );
}