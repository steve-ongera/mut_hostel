// src/services/api.js (Enhanced)
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Hostels & Rooms
// ---------------------------------------------------------------------------

/** List hostels, optionally filtered by category: "boys" | "girls" */
export const getHostels = (category) =>
  api.get("/hostels/", { params: category ? { category } : {} }).then((res) => res.data);

/** Get a single hostel with its rooms and live bed availability */
export const getHostelDetail = (hostelId) => api.get(`/hostels/${hostelId}/`).then((res) => res.data);

/** Get a single room with its beds (used for the bus-seat style bed picker) */
export const getRoomDetail = (roomId) => api.get(`/rooms/${roomId}/`).then((res) => res.data);

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

/**
 * Create a booking (holds the selected bed for 10 minutes while the student pays).
 * payload: { full_name, registration_number, email, phone_number, is_minor,
 *            id_number, birth_certificate_number, hostel, room, bed }
 */
export const createBooking = (payload) => api.post("/bookings/", payload).then((res) => res.data);

/** Fetch full booking details */
export const getBooking = (bookingId) => api.get(`/bookings/${bookingId}/`).then((res) => res.data);

/** Lightweight polling endpoint used while waiting for M-Pesa confirmation */
export const getBookingStatus = (bookingId) =>
  api.get(`/bookings/${bookingId}/status/`).then((res) => res.data);

/** Download URL for the PDF receipt (open in a new tab / <a href>) */
export const getReceiptDownloadUrl = (bookingId) => `${API_BASE_URL}/bookings/${bookingId}/receipt/`;

// ---------------------------------------------------------------------------
// Payments (M-Pesa Daraja STK Push)
// ---------------------------------------------------------------------------

/** Trigger the STK push prompt on the student's phone. payload: { booking_id, phone_number } */
export const initiateSTKPush = (payload) => api.post("/payments/stk-push/", payload).then((res) => res.data);

// Note: /payments/mpesa/callback/ is called by Safaricom directly and is not
// invoked from the frontend.

export default api;