import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        'http://127.0.0.1:8001/api/token/',
        { email, password }, // Send email instead of username
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data.access;

      if (!token) {
        setError('Login failed: No access token received.');
        return;
      }

      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('is_admin', 'true');

      navigate('/admin-dashboard');
    } catch (err) {
      if (err.response) {
        console.error('Error response data:', err.response.data);
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else if (err.response.status === 400) {
          setError('Bad Request: Please check your input');
        } else {
          setError('Login failed. Please try again later.');
        }
      } else {
        setError('Network or server error');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h4 className="text-center mb-3">Admin Login</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
