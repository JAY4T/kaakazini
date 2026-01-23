import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from "../api/axiosClient";

import heroImage from '../assets/craftOnline.jpg';

const HireLogin = () => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/hire";

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage({ text: "Email and password are required.", type: "danger" });
      return;
    }

    try {
      // Login request
      await api.post("/client-login/", {
        email: form.email,
        password: form.password,
        remember: form.remember
      });

      // Verify session via /me/ endpoint
      const meRes = await api.get("/me/");
      if (!meRes.data || meRes.data.role !== "client") {
        throw new Error("Not authorized as client.");
      }

      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      // Redirect to /hire
      setTimeout(() => navigate(from, { replace: true }), 500);

    } catch (error) {
      setMessage({
        text: "Login failed. " + (error.response?.data?.detail || error.message),
        type: "danger"
      });
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${heroImage}) no-repeat center center/cover`,
        height: "80vh", color: "white", width: "100%", position: "relative", paddingTop: "100px", zIndex: 1
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4 shadow">
              <h2 className="text-center mb-4 fw-bold text-success">Client Login</h2>
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
                <div className="form-check mb-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <label htmlFor="remember" className="form-check-label">Remember Me</label>
                </div>
                <button className="btn btn-yellow-solid w-100" type="submit">Login</button>
              </form>

              <p className="mt-3 text-center">
                Don't have an account? <Link to="/HireSignup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireLogin;
