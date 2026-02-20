import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from "../../api/axiosClient"; 
import { useAuth } from "../../context/AuthContext";

import heroImage from '../../assets/craftOnline.jpg';

const HireLogin = () => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // 🔥 AuthContext login function

  const fromPath = location.state?.from?.pathname;
  const from = fromPath && fromPath !== "/HireLogin" ? fromPath : "/hire";

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
      setLoading(true);

      // Login request
      await api.post("/client-login/", {
        email: form.email,
        password: form.password,
        remember: form.remember
      });

      // Update AuthContext user
      await login();

      // Navigate to target page
      navigate(from, { replace: true });

    } catch (error) {
      setMessage({
        text: "Login failed. " + (error.response?.data?.detail || error.message),
        type: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .hire-login-container {
          background: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .hire-login-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
          border: 2px solid rgba(34, 197, 94, 0.3);
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          position: relative;
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hire-login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 24px 24px 0 0;
        }

        .hire-login-header { text-align: center; margin-bottom: 2.5rem; }
        .hire-login-icon {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }
        .hire-login-header h2 {
          font-size: 2rem; font-weight: 800;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin: 0 0 0.5rem 0; letter-spacing: -0.5px;
        }
        .hire-login-header p { color: #6b7280; font-size: 0.95rem; margin: 0; font-weight: 500; }

        .form-group-login { margin-bottom: 1.5rem; position: relative; }
        .form-label-login { display: block; font-weight: 600; font-size: 0.875rem; color: #374151; margin-bottom: 0.5rem; letter-spacing: 0.2px; }
        .form-control-login {
          width: 100%; padding: 0.75rem 1rem; font-size: 0.95rem;
          border: 2px solid #e5e7eb; border-radius: 12px; transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif; background: white;
        }
        .form-control-login:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1); }

        .password-wrapper-login { position: relative; }
        .password-toggle-login { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem; transition: color 0.2s; }
        .password-toggle-login:hover { color: #22c55e; }

        .remember-forgot-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .form-check-login { display: flex; align-items: center; gap: 0.5rem; }
        .form-check-login input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: #22c55e; }
        .form-check-login label { font-size: 0.875rem; color: #6b7280; cursor: pointer; font-weight: 500; }
        .forgot-link { font-size: 0.875rem; color: #22c55e; text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .forgot-link:hover { color: #fbbf24; text-decoration: underline; }

        .btn-login {
          width: 100%; padding: 0.875rem; font-size: 1rem; font-weight: 700;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          color: white; border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.3s ease; letter-spacing: 0.3px; text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }
        .btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .alert-custom-login { padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .alert-danger-login { background: #fee2e2; border: 2px solid #fecaca; color: #991b1b; animation: shake 0.5s; }
        .alert-success-login { background: #d1fae5; border: 2px solid #a7f3d0; color: #065f46; }

        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>

      <div className="hire-login-container">
        <div className="hire-login-card">
          <div className="hire-login-header">
            <div className="hire-login-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2>Welcome Back</h2>
            <p>Login to access your client dashboard</p>
          </div>

          {message.text && (
            <div className={`alert-custom-login ${message.type === 'danger' ? 'alert-danger-login' : 'alert-success-login'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-login">
              <label className="form-label-login">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="form-control-login"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group-login">
              <label className="form-label-login">Password</label>
              <div className="password-wrapper-login">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="form-control-login"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle-login"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="remember-forgot-row">
              <div className="form-check-login">
                <input
                  id="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="signup-link-login">
            Don't have an account? <Link to="/HireSignup">Sign up here</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HireLogin;
