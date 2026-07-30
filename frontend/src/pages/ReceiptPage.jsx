import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBooking, downloadReceipt, resolveMediaUrl, extractErrorMessages } from "../services/api";

export default function ReceiptPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getBooking(id)
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        setError(extractErrorMessages(err).join(" "));
        setLoading(false);
      });
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReceipt(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${booking?.booking_reference}_receipt.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading receipt...</p>
        </div>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> 
            {error || "Booking not found"}
          </div>
          <Link to="/hostels" className="btn_one">
            <i className="bi bi-arrow-left me-2"></i> Back to Hostels
          </Link>
        </div>
      </section>
    );
  }

  if (booking.status !== "paid") {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="single_course" style={{ padding: "40px", textAlign: "center" }}>
                <i className="bi bi-exclamation-circle" style={{ fontSize: "60px", color: "#f26b65" }}></i>
                <h3 style={{ marginTop: "20px" }}>Payment Not Confirmed</h3>
                <p>This booking has not been paid yet. Please complete payment first.</p>
                <Link to={`/booking/${id}/pay`} className="btn_one">
                  <i className="bi bi-credit-card me-2"></i> Go to Payment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* START SECTION TOP */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-top-title">
                <h1>Payment Receipt</h1>
                <ul className="breadcrumb-list">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/hostels">Hostels</Link></li>
                  <li className="active">Receipt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END SECTION TOP */}

      {/* START RECEIPT */}
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <div className="single_course" style={{ padding: "40px" }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "60px", color: "#525fe1", background: "#ECEDFF", padding: "20px", borderRadius: "50%" }}></i>
                  <h2 style={{ marginTop: "20px", color: "#525fe1" }}>Payment Successful!</h2>
                  <p>Your booking has been confirmed. Show this receipt at check-in.</p>
                </div>

                <div style={{ background: "#f8f9fa", padding: "30px", borderRadius: "5px" }}>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Booking Reference:</strong> <span style={{ color: "#525fe1" }}>{booking.booking_reference}</span></p>
                      <p><strong>Student Name:</strong> {booking.full_name}</p>
                      <p><strong>Registration Number:</strong> {booking.registration_number}</p>
                      <p><strong>Email:</strong> {booking.email}</p>
                      <p><strong>Phone:</strong> {booking.phone_number}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Hostel:</strong> {booking.hostel_name}</p>
                      <p><strong>Room Number:</strong> {booking.room_number}</p>
                      <p><strong>Bed Number:</strong> {booking.bed_number}</p>
                      <p><strong>Amount Paid:</strong> <span style={{ color: "#525fe1", fontWeight: "700", fontSize: "18px" }}>KES {Number(booking.amount).toLocaleString()}</span></p>
                      <p><strong>Payment Date:</strong> {booking.paid_at ? new Date(booking.paid_at).toLocaleString() : "N/A"}</p>
                      {booking.receipt_number && (
                        <p><strong>Receipt Number:</strong> {booking.receipt_number}</p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.qr_code && (
                  <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <h4>Scan QR Code at Check-in</h4>
                    <img 
                      src={resolveMediaUrl(booking.qr_code)} 
                      alt="QR Code" 
                      style={{ maxWidth: "200px", marginTop: "10px" }}
                    />
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: "30px" }}>
                  <button 
                    onClick={handleDownload}
                    className="btn_one"
                    disabled={downloading}
                    style={{
                      padding: "15px 40px",
                      opacity: downloading ? 0.7 : 1,
                      cursor: downloading ? "not-allowed" : "pointer",
                      
                    }}
                  >
                    {downloading ? "Downloading..." : "Download PDF Receipt"}
                    <i className="bi bi-download ms-2"></i>
                  </button>
                  <Link 
                    to="/hostels" 
                    className="btn_one" 
                    style={{ 
                      background: "#f26b65", 
                      borderColor: "#f26b65", 
                      marginLeft: "10px",
                      padding: "15px 40px"
                    }}
                  >
                    Browse More Hostels
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END RECEIPT */}
    </>
  );
}