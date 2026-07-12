//src/app.jsx

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import About from "./pages/About.jsx";

/**
 * Placeholder for routes we will build out in later sessions:
 * - /hostels/boys and /hostels/girls  (hostel list + bus-seat style bed picker)
 * - /booking/:bedId                   (student details form)
 * - /booking/:id/pay                  (M-Pesa STK push + status polling)
 * - /booking/:id/receipt              (QR receipt + PDF download)
 */
function ComingSoon({ title }) {
  return (
    <div className="container section" style={{ textAlign: "center" }}>
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle" style={{ margin: "0 auto" }}>
        This page is under construction. We're building it next.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "70vh" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/hostels/boys" element={<ComingSoon title="Boys Hostels" />} />
          <Route path="/hostels/girls" element={<ComingSoon title="Girls Hostels" />} />
          <Route path="/hostels/:hostelId" element={<ComingSoon title="Select Room & Bed" />} />
          <Route path="/booking/:bedId" element={<ComingSoon title="Student Details" />} />
          <Route path="/booking/:id/pay" element={<ComingSoon title="M-Pesa Payment" />} />
          <Route path="/booking/:id/receipt" element={<ComingSoon title="Booking Receipt" />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}