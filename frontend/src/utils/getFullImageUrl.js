import { API_BASE_URL, BUCKET_URL } from "../api/axiosClient";

export const getFullImageUrl = (path) => {
  if (!path) return null;

  if (path.startsWith("blob:")) return path;

  if (path.startsWith("http")) return path;

  if (path.startsWith("/media/")) {
    if (window.location.hostname === "localhost") {
      const baseUrl = API_BASE_URL.replace(/\/api\/?$/, ""); 
      return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
    }
    return `${BUCKET_URL}${path.startsWith("/") ? path : "/" + path}`;
  }
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
};
