import axios from "axios";

// ---------------------------
// API URLs based on environment
// ---------------------------
const ENV = process.env.REACT_APP_ENV || "local"; // "local", "staging", "production"

let API_BASE_URL;
let BUCKET_URL;

if (ENV === "production") {
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://kaakazini.com/api";
  BUCKET_URL =
    process.env.REACT_APP_BUCKET_URL ||
    "https://kaakazini-image.frai.digitaloceanspaces.com";
} else if (ENV === "staging") {
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://staging.kaakazini.com/api";
  BUCKET_URL =
    process.env.REACT_APP_BUCKET_URL ||
    "https://staging-kaakazini-image.frai.digitaloceanspaces.com";
} else {
  // Local / development
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
  BUCKET_URL =
    process.env.REACT_APP_BUCKET_URL ||
    "http://localhost:8000/media"; // or your local bucket
}

// ---------------------------
// Axios instance
// ---------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------
// CSRF token interceptor
// ---------------------------
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;

  return config;
});

export { API_BASE_URL, BUCKET_URL };
export default api;
