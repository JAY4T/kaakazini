import axios from "axios";
import { API_BASE_URL } from "../../api/axiosClient"; // reuse main API base URL

// Create an admin-scoped Axios instance
const kaakaziniAdminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends cookies (for session/auth)
  headers: {
    "Content-Type": "application/json",
  },
});

// ----- REQUEST INTERCEPTOR -----
// Automatically attach admin token from localStorage if needed
kaakaziniAdminApi.interceptors.request.use(
  (config) => {
    // Optional: add adminToken if you store a token for frontend checks
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- RESPONSE INTERCEPTOR -----
// Handle unauthorized responses globally
kaakaziniAdminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says unauthorized, log admin out
    if (error.response?.status === 401) {
      console.warn("Admin not authorized, redirecting to login...");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default kaakaziniAdminApi;
