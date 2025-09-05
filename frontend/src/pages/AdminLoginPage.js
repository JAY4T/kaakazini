import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ Base URL from .env file
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/token/`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data.access;

      if (!token) {
        setError('Login failed: No access token received.');
        return;
      }

      // ✅ Store token securely
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('is_admin', 'true');

      // ✅ Redirect to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Login error:', err);

      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError('Invalid email or password.');
        } else if (status === 400) {
          setError('Bad request. Please check your input.');
        } else {
          setError('Login failed. Please try again later.');
        }
      } else {
        setError('Network or server error. Please check your connection.');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h4 className="text-center mb-3">Admin Login</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-danger small">{error}</p>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;