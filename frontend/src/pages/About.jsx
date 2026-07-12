// src/pages/About.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getHostels } from "../services/api";

export default function About() {
  const [stats, setStats] = useState({
    totalBeds: 0,
    availableBeds: 0,
    hostels: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const missionPoints = [
    {
      icon: "bi-mortarboard",
      title: "Excellence in Education",
      description: "Providing quality education and accommodation to foster student success.",
    },
    {
      icon: "bi-people",
      title: "Community & Belonging",
      description: "Creating a vibrant community where students feel at home and supported.",
    },
    {
      icon: "bi-shield-check",
      title: "Safety & Security",
      description: "Ensuring a safe and secure environment for all students to thrive.",
    },
    {
      icon: "bi-gear",
      title: "Innovation & Technology",
      description: "Leveraging technology to simplify the hostel booking experience.",
    },
  ];

  const teamMembers = [
    {
      name: "Dr. Jane Mwangi",
      role: "Dean of Students",
      department: "Student Affairs",
      image: "https://ui-avatars.com/api/?name=Jane+Mwangi&background=800020&color=fff&size=200",
    },
    {
      name: "Mr. Peter Ochieng",
      role: "Hostel Manager",
      department: "Accommodation Services",
      image: "https://ui-avatars.com/api/?name=Peter+Ochieng&background=800020&color=fff&size=200",
    },
    {
      name: "Ms. Mary Wanjiru",
      role: "Student Welfare Officer",
      department: "Student Support",
      image: "https://ui-avatars.com/api/?name=Mary+Wanjiru&background=800020&color=fff&size=200",
    },
    {
      name: "Mr. David Kiprop",
      role: "ICT Officer",
      department: "Digital Services",
      image: "https://ui-avatars.com/api/?name=David+Kiprop&background=800020&color=fff&size=200",
    },
  ];

  const faqs = [
    {
      question: "How do I book a hostel bed?",
      answer: "Simply browse available hostels, select your preferred room and bed, fill in your details, and complete payment via M-Pesa. Your booking is confirmed instantly."
    },
    {
      question: "How long is my bed held for?",
      answer: "Your selected bed is held for 10 minutes while you complete payment. If payment is not completed within this time, the bed becomes available again."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept M-Pesa payments via STK push. Simply enter your phone number and follow the prompt on your phone to complete payment."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking by contacting the hostels office directly. Cancellation policies apply."
    },
    {
      question: "What documents do I need?",
      answer: "You'll need your registration number, email, phone number, and either your National ID (if 18+) or Birth Certificate (if under 18)."
    },
    {
      question: "Is my booking confirmation valid?",
      answer: "Yes, your booking is valid once payment is confirmed. You'll receive a receipt with a unique QR code for verification."
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero hero-sm">
        <div className="container">
          <div style={{ maxWidth: "700px" }}>
            <h1 style={{ color: "#fff", marginBottom: "1rem" }}>
              About <span className="highlight" style={{ color: "var(--mut-gold)" }}>MUT</span> Hostel Portal
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem" }}>
              Simplifying student accommodation at Murang'a University through 
              technology and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 gap-5" style={{ alignItems: "center" }}>
            <div>
              <h2 className="section-title">Welcome to MUT Hostel Portal</h2>
              <p style={{ fontSize: "1.1rem", color: "var(--mut-text)" }}>
                The MUT Hostel Portal is an innovative platform designed to streamline 
                the hostel booking process for students at Murang'a University.
              </p>
              <p>
                Our mission is to provide a seamless, transparent, and efficient 
                accommodation booking system that ensures every student can secure 
                a comfortable place to stay during their academic journey.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="d-flex align-center" style={{ gap: "0.5rem" }}>
                  <i className="bi bi-check-circle" style={{ color: "var(--mut-success)", fontSize: "1.2rem" }} />
                  <span>Easy Online Booking</span>
                </div>
                <div className="d-flex align-center" style={{ gap: "0.5rem" }}>
                  <i className="bi bi-check-circle" style={{ color: "var(--mut-success)", fontSize: "1.2rem" }} />
                  <span>Secure M-Pesa Payment</span>
                </div>
                <div className="d-flex align-center" style={{ gap: "0.5rem" }}>
                  <i className="bi bi-check-circle" style={{ color: "var(--mut-success)", fontSize: "1.2rem" }} />
                  <span>Instant Confirmation</span>
                </div>
                <div className="d-flex align-center" style={{ gap: "0.5rem" }}>
                  <i className="bi bi-check-circle" style={{ color: "var(--mut-success)", fontSize: "1.2rem" }} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <img 
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop"
                alt="Murang'a University Hostel Accommodation"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  objectFit: "cover",
                  maxHeight: "400px",
                }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section section-dark">
        <div className="container">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? "..." : stats.hostels}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-building" /> Hostel Blocks
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? "..." : stats.totalBeds}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-bed" /> Total Bed Capacity
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                {loading ? "..." : stats.availableBeds}
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-check-circle" /> Currently Available
              </p>
            </div>
            <div>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--mut-gold)" }}>
                95%
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                <i className="bi bi-emoji-smile" /> Student Satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section-light">
        <div className="container">
          <div className="grid grid-cols-2 gap-5">
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                <i className="bi bi-eye" style={{ color: "var(--mut-maroon)" }} />
              </div>
              <h3 style={{ color: "var(--mut-maroon)" }}>Our Vision</h3>
              <p style={{ fontSize: "1.1rem", marginBottom: 0 }}>
                To be the leading provider of seamless, technology-driven 
                student accommodation solutions in Kenyan universities.
              </p>
            </div>
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                <i className="bi bi-bullseye" style={{ color: "var(--mut-maroon)" }} />
              </div>
              <h3 style={{ color: "var(--mut-maroon)" }}>Our Mission</h3>
              <p style={{ fontSize: "1.1rem", marginBottom: 0 }}>
                To simplify the hostel booking process through innovation, 
                ensuring every student has access to quality accommodation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-5">
            {missionPoints.map((point, index) => (
              <div key={index} className="card text-center" style={{ padding: "1.5rem" }}>
                <div 
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--mut-maroon)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <i className={point.icon} />
                </div>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{point.title}</h4>
                <p style={{ fontSize: "0.9rem", marginBottom: 0 }}>{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">Our Team</h2>
          <p className="section-subtitle center" style={{ marginBottom: "2rem" }}>
            Dedicated professionals committed to your comfort and success
          </p>

          <div className="grid grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="card text-center" style={{ padding: "1.5rem" }}>
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    margin: "0 auto 1rem",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                />
                <h4 style={{ marginBottom: "0.25rem", fontSize: "1.1rem" }}>{member.name}</h4>
                <p style={{ color: "var(--mut-maroon)", fontWeight: 600, marginBottom: "0.25rem" }}>
                  {member.role}
                </p>
                <p style={{ fontSize: "0.9rem", color: "var(--mut-text-muted)", marginBottom: 0 }}>
                  {member.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-light">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <p className="section-subtitle center" style={{ marginBottom: "2rem" }}>
            Find answers to common questions about the hostel booking process
          </p>

          <div className="grid grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card" style={{ padding: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-question-circle" style={{ color: "var(--mut-gold)" }} />
                  {faq.question}
                </h4>
                <p style={{ fontSize: "0.95rem", marginBottom: 0, color: "var(--mut-text-muted)" }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-gold text-center">
        <div className="container">
          <h2 style={{ color: "#fff", fontSize: "2.5rem" }}>
            Ready to Secure Your Accommodation?
          </h2>
          <p style={{ 
            color: "rgba(255,255,255,0.9)", 
            maxWidth: "600px", 
            margin: "0 auto 2rem",
            fontSize: "1.2rem",
          }}>
            Join thousands of students who have already booked their hostel beds 
            through our platform.
          </p>
          <div className="btn-group" style={{ justifyContent: "center" }}>
            <Link to="/hostels/boys" className="btn btn-dark btn-lg">
              <i className="bi bi-door-open" /> Book Your Hostel Now
            </Link>
            <Link to="/" className="btn btn-outline-light btn-lg">
              <i className="bi bi-arrow-left" /> Back to Home
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .section-light {
          background: var(--mut-background-light);
        }

        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }

          .grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .about-hero h1 {
            font-size: 2rem;
          }

          .team-member img {
            width: 80px !important;
            height: 80px !important;
          }
        }

        @media (max-width: 480px) {
          .grid-cols-4 {
            grid-template-columns: 1fr 1fr;
          }

          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}