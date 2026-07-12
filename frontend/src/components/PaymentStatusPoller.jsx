// src/components/PaymentStatusPoller.jsx
import { useState, useEffect } from "react";
import { getBookingStatus } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

export default function PaymentStatusPoller({ bookingId, checkoutRequestId, onComplete }) {
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Waiting for M-Pesa confirmation...");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let interval;
    let timeout;

    const pollStatus = async () => {
      try {
        const data = await getBookingStatus(bookingId);
        setAttempts((prev) => prev + 1);

        // Check booking status
        if (data.booking_status === "paid") {
          setStatus("success");
          setMessage("✅ Payment confirmed! Redirecting to receipt...");
          clearInterval(interval);
          if (onComplete) onComplete("paid");
          return;
        }

        if (data.booking_status === "cancelled" || data.booking_status === "expired") {
          setStatus("failed");
          setMessage("❌ Payment was cancelled or expired. Please try again.");
          clearInterval(interval);
          if (onComplete) onComplete("failed");
          return;
        }

        // Check M-Pesa status
        if (data.mpesa_status === "success") {
          setStatus("success");
          setMessage("✅ Payment confirmed! Redirecting to receipt...");
          clearInterval(interval);
          if (onComplete) onComplete("paid");
          return;
        }

        if (data.mpesa_status === "failed" || data.mpesa_status === "cancelled") {
          setStatus("failed");
          setMessage("❌ Payment failed. Please try again.");
          clearInterval(interval);
          if (onComplete) onComplete("failed");
          return;
        }

        // Update message based on attempts
        if (attempts > 10) {
          setMessage("⏳ Still waiting for confirmation. Please check your phone for the M-Pesa prompt.");
        }

        if (attempts > 20) {
          setMessage("⏳ Taking longer than expected. You can check your M-Pesa messages to confirm.");
        }

      } catch (err) {
        console.error("Status polling error:", err);
        // Don't stop on error, keep trying
      }
    };

    // Poll every 3 seconds
    interval = setInterval(pollStatus, 3000);

    // Initial poll
    pollStatus();

    // Timeout after 2 minutes
    timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === "pending") {
        setStatus("timeout");
        setMessage("⏰ Payment is taking too long. Please check your phone and try again if needed.");
        if (onComplete) onComplete("timeout");
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId, onComplete, attempts]);

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return "✅";
      case "failed":
        return "❌";
      case "timeout":
        return "⏰";
      default:
        return "⏳";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-success";
      case "failed":
        return "text-danger";
      case "timeout":
        return "text-warning";
      default:
        return "text-info";
    }
  };

  return (
    <div className="text-center" style={{ padding: "2rem" }}>
      <div className="mb-4">
        <div className={`text-4xl ${getStatusColor()}`}>{getStatusIcon()}</div>
      </div>

      <h3 className={getStatusColor()}>{message}</h3>

      {status === "pending" && (
        <>
          <div className="my-4">
            <LoadingSpinner size="lg" color="maroon" />
          </div>
          <p className="text-muted">
            Check your phone for the M-Pesa prompt. Enter your PIN to complete payment.
          </p>
          <p className="text-muted text-sm">
            Your bed is on hold for 10 minutes while we wait for payment.
          </p>
          <div className="mt-3">
            <div className="progress">
              <div 
                className="progress-bar animated" 
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </>
      )}

      {(status === "failed" || status === "timeout") && (
        <div className="mt-4">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {status === "success" && (
        <div className="mt-4">
          <LoadingSpinner size="sm" color="success" text="Redirecting..." />
        </div>
      )}

      <p className="text-muted text-sm mt-4">
        Reference: {checkoutRequestId || "Processing..."}
      </p>
    </div>
  );
}