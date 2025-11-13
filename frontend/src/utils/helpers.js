import { API_BASE_URL } from "../api/axiosClient";

export const getFullImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};
