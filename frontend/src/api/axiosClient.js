import axios from "axios";

// API base URL (your Django backend)
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "http://127.0.0.1:8000/api");

// Bucket / Media URL (for DigitalOcean/S3)
export const BUCKET_URL =
  process.env.REACT_APP_BUCKET_URL ||
  "https://kaakazini-image.frai.digitaloceanspaces.com";

// Axios instance for API calls (with cookies)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
