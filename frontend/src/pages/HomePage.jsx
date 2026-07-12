// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getHostels } from "../services/api";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBeds: 0,
    availableBeds: 0,
    hostels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero Carousel Images (HTTP links for SEO)
  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=600&fit=crop",
      title: "Modern Hostel Accommodation",
      subtitle: "Comfortable rooms designed for student success",
      cta: "View Hostels",
      link: "/hostels/boys",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=600&fit=crop",
      title: "Safe & Secure Environment",
      subtitle: "24/7 security and warden support for all students",
      cta: "Learn More",
      link: "/about",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=600&fit=crop",
      title: "Easy Online Booking",
      subtitle: "Book your bed in minutes with M-Pesa payment",
      cta: "Book Now",
      link: "/hostels/girls",
    },
  ];

  // Features data
  const features = [
    {
      icon: "bi-clock-history",
      title: "10-Minute Hold",
      description: "Your selected bed is held for 10 minutes while you complete payment",
      color: "var(--mut-maroon)",
    },
    {
      icon: "bi-phone",
      title: "M-Pesa Payment",
      description: "Pay instantly via M-Pesa STK push on your phone",
      color: "var(--mut-gold)",
    },
    {
      icon: "bi-qr-code",
      title: "QR Receipt",
      description: "Get a digital receipt with QR code for verification",
      color: "var(--mut-maroon)",
    },
    {
      icon: "bi-shield-check",
      title: "Secure Booking",
      description: "Your booking is confirmed instantly with a unique reference",
      color: "var(--mut-gold)",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: "John Mwangi",
      course: "Computer Science, Year 3",
      text: "The online booking system made it so easy to secure my hostel. I booked in 5 minutes!",
      avatar: "https://ui-avatars.com/api/?name=John+Mwangi&background=800020&color=fff&size=100",
    },
    {
      id: 2,
      name: "Mary Wanjiru",
      course: "Business Administration, Year 2",
      text: "The M-Pesa payment was seamless. I received my receipt instantly after payment.",
      avatar: "https://ui-avatars.com/api/?name=Mary+Wanjiru&background=800020&color=fff&size=100",
    },
    {
      id: 3,
      name: "Peter Ochieng",
      course: "Engineering, Year 4",
      text: "I love how I could see available beds in real-time and choose exactly where I want to stay.",
      avatar: "https://ui-avatars.com/api/?name=Peter+Ochieng&background=800020&color=fff&size=100",
    },
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [boys, girls] = await Promise.all([
          getHostels("boys"),
          getHostels("girls"),
        ]);
        
        const allHostels = [...boys, ...girls];
        const totalBeds = allHostels.reduce((sum, h) => sum + (h.total_beds || 0), 0);
        const availableBeds = allHostels.reduce((sum, h) => sum + (h.available_beds || 0), 0);
        
        setStats({
          totalBeds,
          availableBeds,
          hostels: allHostels.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <>
      {/* Hero Carousel Section */}
      <section className="hero-carousel" style={{ position: "relative", overflow: "hidden" }}>
        <div 
          className="carousel-slides"
          style={{
            display: "flex",
            transition: "transform 0.8s ease-in-out",
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="carousel-slide"
              style={{
                minWidth: "100%",
                minHeight: "600px",
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div 
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(128,0,32,0.85) 0%, rgba(0,0,0,0.4) 100%)",
                }}
              />
              <div className="container" style={{ position: "relative", zIndex: 1, color: "#fff" }}>
                <div style={{ maxWidth: "600px" }}>
                  <h1 
                    style={{ 
                      fontSize: "3.5rem", 
                      fontWeight: 700, 
                      marginBottom: "1rem",
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {slide.title}
                  </h1>
                  <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "rgba(255,255,255,0.9)" }}>
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link} className="btn btn-primary btn-lg">
                    <i className="bi bi-arrow-right" /> {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            fontSize: "2rem",
            padding: "1rem",
            borderRadius: "50%",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s",
            zIndex: 2,
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          aria-label="Previous slide"
        >
          <i className="bi bi-chevron-left" />
        </button>

        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            fontSize: "2rem",
            padding: "1rem",
            borderRadius: "50%",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s",
            zIndex: 2,
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          aria-label="Next slide"
        >
          <i className="bi bi-chevron-right" />
        </button>

        {/* Carousel Indicators */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px",
            zIndex: 2,
          }}
        >
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: "none",
                background: currentSlide === index ? "var(--mut-gold)" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="section section-dark">
        <div className="container">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.hostels
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-building" /> Hostel Blocks
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.totalBeds
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-bed" /> Total Beds
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.availableBeds
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-check-circle" /> Available Now
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                24/7
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-headset" /> Student Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">Why Book With Us?</h2>
          <p className="section-subtitle center" style={{ marginBottom: "2rem" }}>
            We make it simple and convenient to secure your hostel accommodation
          </p>

          <div className="grid grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card card-hover text-center"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div 
                  className="feature-icon" 
                  style={{ 
                    margin: "0 auto",
                    background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                    border: `2px solid ${feature.color}30`,
                  }}
                >
                  <i className={feature.icon} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{feature.title}</h3>
                <p style={{ fontSize: "0.95rem" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section section-light">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle center" style={{ marginBottom: "2rem" }}>
            Book your hostel bed in three simple steps
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center" style={{ padding: "2rem" }}>
              <div 
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--mut-maroon)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1rem",
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: "1.2rem" }}>Choose Your Hostel</h3>
              <p style={{ color: "var(--mut-text-muted)" }}>
                Browse available hostels and select your preferred room and bed
              </p>
            </div>

            <div className="text-center" style={{ padding: "2rem" }}>
              <div 
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--mut-gold)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1rem",
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: "1.2rem" }}>Provide Your Details</h3>
              <p style={{ color: "var(--mut-text-muted)" }}>
                Fill in your student details and confirm your booking
              </p>
            </div>

            <div className="text-center" style={{ padding: "2rem" }}>
              <div 
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--mut-maroon)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1rem",
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: "1.2rem" }}>Pay via M-Pesa</h3>
              <p style={{ color: "var(--mut-text-muted)" }}>
                Complete payment via M-Pesa and get instant confirmation
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/hostels/boys" className="btn btn-primary btn-lg">
              <i className="bi bi-door-open" /> Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">What Students Say</h2>
          <p className="section-subtitle center" style={{ marginBottom: "2rem" }}>
            Hear from students who have successfully booked their hostels
          </p>

          <div className="grid grid-cols-3 gap-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                  <div>
                    <h4 style={{ marginBottom: 0, fontSize: "1rem" }}>{testimonial.name}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--mut-text-muted)", marginBottom: 0 }}>
                      {testimonial.course}
                    </p>
                  </div>
                </div>
                <p style={{ fontStyle: "italic", marginBottom: 0 }}>
                  "{testimonial.text}"
                </p>
                <div style={{ marginTop: "0.5rem", color: "var(--mut-gold)" }}>
                  <i className="bi bi-star-fill" />
                  <i className="bi bi-star-fill" />
                  <i className="bi bi-star-fill" />
                  <i className="bi bi-star-fill" />
                  <i className="bi bi-star-fill" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-gold text-center">
        <div className="container">
          <h2 style={{ color: "#fff", fontSize: "2.5rem" }}>
            Ready to Book Your Hostel?
          </h2>
          <p style={{ 
            color: "rgba(255,255,255,0.9)", 
            maxWidth: "600px", 
            margin: "0 auto 2rem",
            fontSize: "1.2rem",
          }}>
            Choose from our comfortable hostel accommodations and secure your bed today.
            <br />
            <strong>Available beds are filling up fast!</strong>
          </p>
          <div className="btn-group" style={{ justifyContent: "center" }}>
            <Link to="/hostels/boys" className="btn btn-dark btn-lg">
              <i className="bi bi-eye" /> View Available Hostels
            </Link>
            <Link to="/about" className="btn btn-outline-light btn-lg">
              <i className="bi bi-info-circle" /> Learn More
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero-carousel {
          min-height: 600px;
          background: var(--mut-maroon);
        }

        .carousel-slide {
          min-height: 600px;
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .card:hover .feature-icon {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .carousel-slide {
            min-height: 400px;
          }

          .hero-carousel {
            min-height: 400px;
          }

          .hero-carousel h1 {
            font-size: 2rem !important;
          }

          .hero-carousel .btn {
            font-size: 0.9rem;
            padding: 0.6rem 1.2rem;
          }

          .carousel-slides button {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.2rem !important;
            padding: 0.5rem !important;
          }

          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }

          .grid-cols-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .grid-cols-4 {
            grid-template-columns: 1fr 1fr;
          }

          .carousel-slide {
            min-height: 350px;
          }

          .hero-carousel {
            min-height: 350px;
          }

          .hero-carousel h1 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </>
  );
}