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
    "http://localhost:8000/media";
}

// ---------------------------
// Axios instance
// ---------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------
// Request interceptors
// ---------------------------
api.interceptors.request.use((config) => {
  // 1. CSRF token
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;

  // 2. When sending FormData, DELETE the Content-Type header entirely.
  //    The browser will then set it automatically to:
  //      "multipart/form-data; boundary=----WebKitFormBoundaryXYZ"
  //    with the correct boundary string.
  //
  //    If we leave the instance-level "application/json" in place,
  //    Django's MultiPartParser never runs → 415 Unsupported Media Type.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export { API_BASE_URL, BUCKET_URL };
export default api;
