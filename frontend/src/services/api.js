import axios from "axios";

// Base URL for the Django REST backend. Set VITE_API_BASE_URL in a .env file
// (see .env.example) - defaults to the local dev server.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Media base (for resolving relative image/qr_code paths returned by DRF,
// e.g. "/media/hostels/boys/block-a.jpg")
export const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------
// Helper: normalizes DRF list responses into a plain array, whether the
// endpoint returns a raw list ([...]) or a paginated object
// ({ count, next, previous, results: [...] }).
// ---------------------------------------------------------------------
const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// ---------------------------------------------------------------------
// Hostels & Rooms
// GET  /api/hostels/?category=boys|girls
// GET  /api/hostels/<id>/
// GET  /api/rooms/<id>/
// ---------------------------------------------------------------------
export const getHostels = (category) =>
  api
    .get("/hostels/", { params: category ? { category } : {} })
    .then((res) => normalizeList(res.data));

export const getHostelDetail = (hostelId) =>
  api.get(`/hostels/${hostelId}/`).then((res) => res.data);

export const getRoomDetail = (roomId) =>
  api.get(`/rooms/${roomId}/`).then((res) => res.data);

// ---------------------------------------------------------------------
// Bookings
// POST /api/bookings/
// GET  /api/bookings/<id>/
// GET  /api/bookings/<id>/status/
// GET  /api/bookings/<id>/receipt/   (binary PDF)
// ---------------------------------------------------------------------
export const createBooking = (payload) =>
  api.post("/bookings/", payload).then((res) => res.data);

export const getBooking = (bookingId) =>
  api.get(`/bookings/${bookingId}/`).then((res) => res.data);

export const getBookingStatus = (bookingId) =>
  api.get(`/bookings/${bookingId}/status/`).then((res) => res.data);

export const getReceiptDownloadUrl = (bookingId) =>
  `${API_BASE_URL}/bookings/${bookingId}/receipt/`;

export const downloadReceipt = (bookingId) =>
  api
    .get(`/bookings/${bookingId}/receipt/`, { responseType: "blob" })
    .then((res) => res.data);



// ---------------------------------------------------------------------
// Beds (temporary hold while a student fills out the booking form)
// GET    /api/beds/<id>/          - bed + hostel + room + live countdown
// POST   /api/beds/<id>/hold/     - lock the bed for 5 minutes
// DELETE /api/beds/<id>/hold/     - release the hold early
// ---------------------------------------------------------------------
export const getBedDetail = (bedId) =>
  api.get(`/beds/${bedId}/`).then((res) => res.data);

export const holdBed = (bedId) =>
  api.post(`/beds/${bedId}/hold/`).then((res) => res.data);

export const releaseBedHold = (bedId) =>
  api.delete(`/beds/${bedId}/hold/`).then((res) => res.data).catch(() => {});
// releaseBedHold is best-effort (e.g. called on unmount) so failures are swallowed


// ---------------------------------------------------------------------
// Payments (M-Pesa Daraja)
// POST /api/payments/stk-push/   { booking_id, phone_number }
// The callback endpoint (/api/payments/mpesa/callback/) is server-to-server
// only (Safaricom -> backend) and is never called from the frontend.
// ---------------------------------------------------------------------
export const initiateStkPush = ({ bookingId, phoneNumber }) =>
  api
    .post("/payments/stk-push/", {
      booking_id: bookingId,
      phone_number: phoneNumber,
    })
    .then((res) => res.data);

// ---------------------------------------------------------------------
// Helper: normalizes DRF error payloads (field: [messages]) into a flat
// list of strings for easy display in forms.
// ---------------------------------------------------------------------
export const extractErrorMessages = (error) => {
  const data = error?.response?.data;
  if (!data) return [error?.message || "Something went wrong. Please try again."];
  if (typeof data === "string") return [data];
  if (data.detail) return [data.detail];
  return Object.entries(data).flatMap(([field, messages]) => {
    const list = Array.isArray(messages) ? messages : [messages];
    return list.map((msg) => (field === "non_field_errors" ? msg : `${field}: ${msg}`));
  });
};

export default api;