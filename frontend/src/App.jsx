// App.jsx
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import HomePage from "./pages/HomePage.jsx";
import About from "./pages/About.jsx";
import HostelsListPage from "./pages/HostelsListPage.jsx";
import HostelDetailPage from "./pages/HostelDetailPage.jsx";
import BookingFormPage from "./pages/BookingFormPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import ReceiptPage from "./pages/ReceiptPage.jsx";

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
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "70vh" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/hostels/boys" element={<HostelsListPage />} />
          <Route path="/hostels/girls" element={<HostelsListPage />} />
          <Route path="/hostels/:hostelId" element={<HostelDetailPage />} />
          <Route path="/booking/:bedId" element={<BookingFormPage />} />
          <Route path="/booking/:id/pay" element={<PaymentPage />} />
          <Route path="/booking/:id/receipt" element={<ReceiptPage />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}