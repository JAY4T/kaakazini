import axios from 'axios';

const token = localStorage.getItem('authToken');  // Store your token in localStorage after login

const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/',
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  },
});

export default api;
