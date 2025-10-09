// HireLogin.js
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

const HireLogin = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();   // 👈 to get the "from" route

  // fallback if no state was passed (go to dashboard after login)
  const from = location.state?.from?.pathname || "/hire";

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage({ text: 'Email and password are required.', type: 'danger' });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/client-login/`, {
        email: form.email,
        password: form.password,
      });

      sessionStorage.setItem('access_token', res.data.token);
      sessionStorage.setItem('client', JSON.stringify(res.data.user));

      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

      // 👇 Redirect back to where the client was going (e.g. /hire/:id)
      setTimeout(() => navigate(from), 1500);

    } catch (error) {
      setMessage({
        text: 'Login failed. ' + (error.response?.data?.detail || 'Invalid credentials.'),
        type: 'danger',
      });
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h3 className="text-center">Client Login</h3>
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="form-control mb-3"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="form-control mb-3"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button className="btn btn-primary w-100" type="submit">Login</button>
            </form>
            <p className="mt-3 text-center">
              Don't have an account? <Link to="/HireSignup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireLogin;
