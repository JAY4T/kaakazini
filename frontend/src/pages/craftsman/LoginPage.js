import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient"; 

import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);

  const fetchProfile = async () => {
    const res = await api.get("me/");
    return res.data;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError("Email and password are required.");

    setLoading(true);
    try {
      await api.post("/login/", { email, password });
      await login();
      const user = await fetchProfile();
      console.log("Logged in user:", user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    const token = response?.credential;
    if (!token) return alert("Invalid Google credential");

    setLoading(true);
    try {
      await api.post("/google-login/", { token, role: "craftsman" });
      await login();
      const user = await fetchProfile();
      console.log("Google logged in user:", user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: "551247510793-ria1stm1obcn36nkkl2is4tknoqaj2sv.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "signin_with",
      });
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .login-container {
          background: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(251, 191, 36, 0.3);
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 24px 24px 0 0;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-header h2 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 1.75rem;
          position: relative;
        }

        .form-label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.2px;
        }

        .form-control-custom {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
          background: white;
        }

        .form-control-custom:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .form-control-custom:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #fbbf24;
        }

        .btn-login {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          color: #1f2937;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert-custom {
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: #fee2e2;
          border: 2px solid #fecaca;
          color: #991b1b;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.75rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 2px solid #e5e7eb;
        }

        .divider span {
          padding: 0 1rem;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .google-button-wrapper {
          margin-bottom: 1.5rem;
        }

        .forgot-password {
          text-align: right;
          margin-top: 0.5rem;
        }

        .forgot-password a {
          color: #fbbf24;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .forgot-password a:hover {
          color: #22c55e;
          text-decoration: underline;
        }

        .signup-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f3f4f6;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .signup-link a {
          color: #fbbf24;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .signup-link a:hover {
          color: #22c55e;
          text-decoration: underline;
        }

        .loading-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .login-header h2 {
            font-size: 1.75rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back Craftsman</h2>
            <p>Login to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control-custom" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control-custom" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            {error && <div className="alert-custom">{error}</div>}

            <button 
              className="btn-login" 
              type="submit" 
              disabled={loading}
            >
              {loading && <span className="loading-spinner"></span>}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="google-button-wrapper" ref={googleButtonRef} />

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
