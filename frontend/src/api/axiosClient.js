import axios from "axios";

// Use env variable or fallback to whichever host you are on
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "http://127.0.0.1:8000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
