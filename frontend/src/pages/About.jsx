import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* START SECTION TOP */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-top-title">
                <h1>About Our Hostels</h1>
                <ul>
                  <li><Link to="/">Home</Link> /</li>
                  <li>About</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START ABOUT */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="ab_img">
                <img src="/assets/img/about.jpg" className="img-fluid" alt="About Muranga University Hostels" />
              </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="ab_content">
                <h2>Comfortable, Secure Accommodation at Muranga University</h2>
                <p>
                  Muranga University offers modern, well-maintained hostel facilities for both male and female students. 
                  Our hostels are strategically located within the campus, providing easy access to lecture halls, 
                  the library, and other university amenities.
                </p>
                <p>
                  The university manages all hostel accommodations directly, ensuring the highest standards of safety, 
                  cleanliness, and comfort. Each hostel block is supervised by a dedicated warden who is available 
                  24/7 to assist students.
                </p>
                <ul>
                  <li>
                    <span className="ti-check"></span> Secure, guarded premises with 24/7 security
                  </li>
                  <li>
                    <span className="ti-check"></span> Modern rooms with comfortable beds and study areas
                  </li>
                  <li>
                    <span className="ti-check"></span> Clean, well-maintained common areas and facilities
                  </li>
                  <li>
                    <span className="ti-check"></span> Dedicated wardens for each hostel block
                  </li>
                  <li>
                    <span className="ti-check"></span> Easy online booking and payment system
                  </li>
                </ul>
                <Link className="btn_one" to="/hostels">
                  View Available Hostels <i className="ti-arrow-top-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END ABOUT */}

      {/* START WHY CHOOSE US */}
      <section className="ab_area section-padding" style={{ background: "#f5f5fd" }}>
        <div className="container">
          <div className="section-title text-center">
            <h2>Why Choose Our Hostel Booking System</h2>
            <p>We've made the booking process simple, fast, and secure for all students.</p>
          </div>
          <div className="row">
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_one">01</span>
                <h3>Instant Booking</h3>
                <p>Book your bed in minutes with our streamlined online process. No paperwork, no queues.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_two">02</span>
                <h3>Secure M-Pesa Payment</h3>
                <p>Pay instantly through M-Pesa Daraja. Your booking is confirmed the moment payment succeeds.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_three">03</span>
                <h3>10-Minute Hold</h3>
                <p>We hold your selected bed for 10 minutes while you complete payment, so you don't lose it.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_four">04</span>
                <h3>Digital Receipt</h3>
                <p>Get an instant downloadable receipt with a QR code for easy check-in at the hostel.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_one">05</span>
                <h3>Live Availability</h3>
                <p>See real-time bed availability per room before booking. No surprises at check-in.</p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_tp" style={{ padding: "30px" }}>
                <span className="sc_two">06</span>
                <h3>Dedicated Support</h3>
                <p>Each hostel has a dedicated warden you can reach directly for any assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END WHY CHOOSE US */}
    </>
  );
}