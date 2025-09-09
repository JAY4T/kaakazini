// src/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  },
});

// ✅ Automatically attach Bearer token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');  // or localStorage if you prefer
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      // localStorage.clear(); or sessionStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
