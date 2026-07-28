import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHostels, resolveMediaUrl, extractErrorMessages } from "../services/api";

export default function HomePage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      {/* START HOME */}
      <section
        className="home_bg hb_height"
        style={{
          backgroundImage: "url(/assets/img/bg/home-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="hero-text ht_top">
                <h1>
                  <span>Smart Stay</span> Where Comfort Meets Campus
                </h1>
                <p>
                  Book your Muranga University hostel bed in minutes, pay securely with M-Pesa,
                  and get an instant e-receipt with a scannable QR code.
                </p>
              </div>
              <div className="home_sb">
                <form
                  className="banner_subs"
                  onSubmit={(e) => e.preventDefault()}
                  action="/hostels"
                >
                  <input
                    type="text"
                    className="form-control home_si"
                    placeholder="Search hostels, e.g. Block A, Boys Hostel"
                    required
                  />
                  <button type="submit" className="subscribe__btn">
                    Search <i className="fa fa-paper-plane-o"></i>
                  </button>
                </form>
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="hero-text-img">
                <img src="/assets/img/home-img2.png" className="img-fluid" alt="Student moving into hostel" />
                <div className="home_ps">
                  <span className="ti-user"></span>
                  <h2>4500+</h2>
                  <p>Students housed</p>
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
              <div className="single-counter">
                <span className="ti-folder sc_one"></span>
                <h2 className="counter-num">{hostels.length || "—"}</h2>
                <p>Hostels Listed</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter">
                <span className="ti-medall-alt sc_two"></span>
                <h2 className="counter-num">
                  {hostels.reduce((sum, h) => sum + (h.available_beds || 0), 0) || "—"}
                </h2>
                <p>Beds Available Now</p>
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter">
                <span className="ti-id-badge sc_three"></span>
                <h2 className="counter-num">10 Min</h2>
                <p>Bed Hold While You Pay</p>
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single-counter">
                <span className="ti-user sc_four"></span>
                <h2 className="counter-num">M-Pesa</h2>
                <p>Instant Secure Payment</p>
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
                <span className="sc_one">01</span>
                <h3>
                  Choose Your <br />Hostel
                </h3>
                <p>Browse Boys and Girls hostels and see live bed availability per room.</p>
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
                <span className="sc_two">02</span>
                <h3>
                  Pick Your <br />Bed
                </h3>
                <p>Select an exact bed in a room and we hold it for 10 minutes while you pay.</p>
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
                <span className="sc_three">03</span>
                <h3>
                  Pay With <br />M-Pesa
                </h3>
                <p>Enter your Safaricom number and confirm the STK push on your phone.</p>
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
                <span className="sc_four">04</span>
                <h3>
                  Get Your <br />Receipt
                </h3>
                <p>Download your e-receipt with a QR code and present it at check-in.</p>
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
                <img src="/assets/img/about1.png" className="img-fluid" alt="Muranga University hostel" />
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
                    <span className="ti-check"></span> Live bed-by-bed availability for every room
                  </li>
                  <li>
                    <span className="ti-check"></span> Instant M-Pesa payment with automatic
                    confirmation
                  </li>
                  <li>
                    <span className="ti-check"></span> Downloadable receipt with a scannable QR
                    code
                  </li>
                </ul>
                <Link className="btn_one" to="/hostels">
                  View All Hostels <i className="ti-arrow-top-right"></i>
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
                      <img src="/assets/img/e4.png" alt="Nearest to lecture halls" /> Near
                      Lecture Halls
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

      {/* START HOSTELS (live listing, was "course" section) */}
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-sm-6 col-xs-12">
              <div className="section-title">
                <h2>
                  Browse <b>{hostels.length || ""} </b> <br />
                  Hostels With Live Availability
                </h2>
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="cour_btn">
                <Link to="/hostels" className="btn_one">
                  View all Hostels <i className="ti-arrow-top-right"></i>
                </Link>
              </div>
            </div>
            {/* END COL */}
          </div>
          {/* END ROW */}

          <div className="row">
            {loading && (
              <div className="col-12">
                <p>Loading hostels…</p>
              </div>
            )}
            {error && (
              <div className="col-12">
                <p>Could not load hostels right now: {error}</p>
              </div>
            )}
            {!loading && !error && hostels.length === 0 && (
              <div className="col-12">
                <p>No hostels are published yet - check back soon.</p>
              </div>
            )}
            {hostels.slice(0, 6).map((hostel) => (
              <div className="col-lg-4 col-sm-6 col-xs-12" key={hostel.id}>
                <div className="single_course">
                  <div className="single_c_img">
                    <img
                      src={resolveMediaUrl(hostel.image) || "/assets/img/course/1.png"}
                      className="img-fluid"
                      alt={hostel.name}
                    />
                    <span>{hostel.category === "boys" ? "Boys Hostel" : "Girls Hostel"}</span>
                  </div>
                  <h4>
                    <Link to={`/hostels/${hostel.id}`}>{hostel.name}</Link>
                  </h4>
                  <p>
                    <span className="ti-user"> </span> {hostel.available_beds} / {hostel.total_beds}{" "}
                    beds available
                  </p>
                  {hostel.location_notes && (
                    <p>
                      <span className="ti-location-pin"> </span> {hostel.location_notes}
                    </p>
                  )}
                  <div className="price">Fee - KES {hostel.fee_amount}</div>
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
                  backgroundImage: "url(/assets/img/bg/video.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                }}
              >
                <a
                  href="https://www.youtube.com/watch?v=RXv_uIN6e-Y"
                  className="magnific_popup video-button"
                >
                  <i className="fa fa-play"></i>
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
              <div className="our-team">
                <div className="team-content">
                  <a href="#">
                    <img src="/assets/img/team/team1.jpg" alt="Hostel warden" />
                  </a>
                  <ul className="social-links">
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof">
                  <h3>Mrs. Wanjiru Kamau</h3>
                  <span>Warden, Boys Hostel Block A</span>
                </div>
                <div className="sth_det2">
                  <span className="ti-home"> <u>Block A</u></span>
                  <span className="ti-user"> <u>120 Students</u></span>
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
              <div className="our-team">
                <div className="team-content">
                  <a href="#">
                    <img src="/assets/img/team/team2.jpg" alt="Hostel warden" />
                  </a>
                  <ul className="social-links">
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof">
                  <h3>Mr. Otieno Mwangi</h3>
                  <span>Warden, Boys Hostel Block B</span>
                </div>
                <div className="sth_det2">
                  <span className="ti-home"> <u>Block B</u></span>
                  <span className="ti-user"> <u>96 Students</u></span>
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
              <div className="our-team">
                <div className="team-content">
                  <a href="#">
                    <img src="/assets/img/team/team3.jpg" alt="Hostel warden" />
                  </a>
                  <ul className="social-links">
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof">
                  <h3>Mrs. Achieng Otieno</h3>
                  <span>Warden, Girls Hostel Block A</span>
                </div>
                <div className="sth_det2">
                  <span className="ti-home"> <u>Block A</u></span>
                  <span className="ti-user"> <u>140 Students</u></span>
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
              <div className="our-team">
                <div className="team-content">
                  <a href="#">
                    <img src="/assets/img/team/team4.jpg" alt="Hostel warden" />
                  </a>
                  <ul className="social-links">
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof">
                  <h3>Ms. Faith Njeri</h3>
                  <span>Warden, Girls Hostel Block B</span>
                </div>
                <div className="sth_det2">
                  <span className="ti-home"> <u>Block B</u></span>
                  <span className="ti-user"> <u>110 Students</u></span>
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
                    <span className="ti-check"></span> A 10-minute hold protects your bed while
                    you pay
                  </li>
                  <li>
                    <span className="ti-check"></span> Works for both national ID and birth
                    certificate holders
                  </li>
                  <li>
                    <span className="ti-check"></span> Get an emailed receipt the moment you pay
                  </li>
                </ul>
                <Link className="btn_one" to="/hostels">
                  Book Your Bed <i className="ti-arrow-top-right"></i>
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
                <img src="/assets/img/about3.png" className="img-fluid" alt="Booking on a laptop" />
                <div className="home_ps2">
                  <span className="ti-book"></span>
                  <h2>{hostels.reduce((sum, h) => sum + (h.total_beds || 0), 0) || "3300+"}</h2>
                  <p>Total Beds Managed</p>
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
          <div className="section-title">
            <h2>
              What Students Say About <br />Booking Online
            </h2>
          </div>
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div className="ab_img">
                <img src="/assets/img/review.png" className="img-fluid" alt="Student review" />
              </div>
            </div>
            {/* END COL */}
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div id="testimonial-slider" className="owl-carousel">
                <div className="testimonial">
                  <img src="/assets/img/quote.png" alt="" />
                  <div className="testimonial_content">
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <p>
                      I booked my bed from home the day admissions opened and paid with M-Pesa in
                      under two minutes. No queues at all.
                    </p>
                  </div>
                  <div className="testi_pic_title">
                    <img src="/assets/img/testimonial/1.png" alt="" />
                    <h4>Brian Kiptoo</h4>
                    <p>First Year, Boys Hostel Block A</p>
                  </div>
                </div>
                {/* END TESTIMONIAL */}
                <div className="testimonial">
                  <img src="/assets/img/quote.png" alt="" />
                  <div className="testimonial_content">
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <p>
                      Seeing exactly which bed was free before paying gave me confidence I would
                      not lose my money on a room that was already full.
                    </p>
                  </div>
                  <div className="testi_pic_title">
                    <img src="/assets/img/testimonial/2.png" alt="" />
                    <h4>Sharon Achieng</h4>
                    <p>Second Year, Girls Hostel Block A</p>
                  </div>
                </div>
                {/* END TESTIMONIAL */}
                <div className="testimonial">
                  <img src="/assets/img/quote.png" alt="" />
                  <div className="testimonial_content">
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <i className="ti-star"></i>
                    <p>
                      My receipt with the QR code made check-in day so fast - the warden just
                      scanned it and I was done.
                    </p>
                  </div>
                  <div className="testi_pic_title">
                    <img src="/assets/img/testimonial/3.png" alt="" />
                    <h4>Kevin Mutua</h4>
                    <p>Third Year, Boys Hostel Block B</p>
                  </div>
                </div>
                {/* END TESTIMONIAL */}
              </div>
              {/* END TESTIMONIAL SLIDER */}
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
                <img src="/assets/img/blog/1.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Aug 1, 2026 | <a href="#">Booking</a>
                  </span>
                  <h2>
                    <a href="#">First-Year Booking Opens Next Week</a>
                  </h2>
                  <a className="btn_one" href="#">
                    Read More <i className="ti-arrow-top-right"></i>
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
                <img src="/assets/img/blog/2.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Jul 20, 2026 | <a href="#">Payments</a>
                  </span>
                  <h2>
                    <a href="#">M-Pesa Is Now The Only Accepted Payment Method</a>
                  </h2>
                  <a className="btn_one" href="#">
                    Read More <i className="ti-arrow-top-right"></i>
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
                <img src="/assets/img/blog/3.jpg" className="img-fluid" alt="Hostel announcement" />
                <div className="content_box">
                  <span>
                    Jul 5, 2026 | <a href="#">Notice</a>
                  </span>
                  <h2>
                    <a href="#">Beds Are Held For Only 10 Minutes During Checkout</a>
                  </h2>
                  <a className="btn_one" href="#">
                    Read More <i className="ti-arrow-top-right"></i>
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