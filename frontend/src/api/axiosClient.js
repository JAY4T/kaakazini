import axios from "axios";


export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";


  export const BUCKET_URL =
  process.env.REACT_APP_BUCKET_URL ||
  "https://kaakazini-image.frai.digitaloceanspaces.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
