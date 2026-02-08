import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaUsers, FaChartLine } from "react-icons/fa";
import api from "../../api/axiosClient";
import adminAvatar from "../../assets/admin.png";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Send login request
      const response = await api.post("/admin-login/", { email, password });

      // Assuming backend returns a token (or you can set a dummy token for testing)
      const token = response.data.token || "dummy-admin-token";
      localStorage.setItem("adminToken", token);

      // Show success message
      setSuccess("Successfully logged in! Redirecting...");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/kaakazini-admin/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        const status = err.response.status;
        if (status === 401) setError("Invalid email or password.");
        else if (status === 400) setError("Bad request. Please check your input.");
        else setError("Login failed. Please try again later.");
      } else {
        setError("Network or server error. Please check your connection.");
      }
    }
  };

  return (
    <div className="login-page">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }

        /* Left Side - Branding */
        .branding-section {
          flex: 1;
          background: linear-gradient(135deg, #fbbf24 0%, #ffffff 100%);
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #1f2937;
          position: relative;
          overflow: hidden;
        }

        .branding-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .branding-content {
          position: relative;
          z-index: 1;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fbbf24;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 5px;
        }

        .brand-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
        }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .brand-description {
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          color: #374151;
        }

        .feature-list {
          list-style: none;
          padding: 0;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .feature-item:hover {
          background: #ffffff;
          transform: translateX(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          width: 45px;
          height: 45px;
          background: #fef3c7;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .feature-content p {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .branding-footer {
          position: relative;
          z-index: 1;
          font-size: 0.875rem;
          color: #374151;
        }

        /* Right Side - Login Form */
        .login-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #ffffff;
        }

        .login-container {
          width: 100%;
          max-width: 450px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .admin-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 1.5rem;
          border: 4px solid #fbbf24;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .login-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
        }

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-label .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #1f2937;
        }

        .form-input:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
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
          padding: 0.5rem;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #fbbf24;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #fbbf24;
        }

        .checkbox-label {
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #fbbf24;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #f59e0b;
          text-decoration: underline;
        }

        .error-message {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 300px;
          max-width: 500px;
          text-align: center;
        }

        .success-message {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #16a34a;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 300px;
          max-width: 500px;
          text-align: center;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #1f2937;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .branding-section {
            padding: 3rem 2.5rem;
          }

          .brand-title {
            font-size: 2.25rem;
          }

          .brand-description {
            font-size: 1.05rem;
          }

          .feature-item {
            padding: 1.25rem;
          }
        }

        @media (max-width: 992px) {
          .branding-section {
            display: none;
          }

          .login-section {
            flex: 1;
            padding: 2rem 1.5rem;
          }

          .login-container {
            max-width: 500px;
          }
        }

        @media (max-width: 768px) {
          .login-section {
            padding: 1.5rem 1rem;
          }

          .login-container {
            max-width: 100%;
          }

          .login-header {
            margin-bottom: 2rem;
          }

          .admin-avatar {
            width: 90px;
            height: 90px;
            border-width: 3px;
          }

          .login-title {
            font-size: 1.625rem;
          }

          .login-subtitle {
            font-size: 0.9rem;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          .form-input {
            padding: 0.8rem 0.9rem 0.8rem 2.75rem;
            font-size: 0.9rem;
          }

          .input-icon {
            left: 0.9rem;
          }

          .password-toggle {
            right: 0.9rem;
          }

          .submit-button {
            padding: 0.95rem;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 576px) {
          .login-section {
            padding: 1.25rem 0.875rem;
            background: #fafafa;
          }

          .login-container {
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          }

          .login-header {
            margin-bottom: 1.75rem;
          }

          .admin-avatar {
            width: 80px;
            height: 80px;
            border-width: 3px;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-subtitle {
            font-size: 0.85rem;
          }

          .brand-title {
            font-size: 1.875rem;
          }

          .form-label {
            font-size: 0.8rem;
          }

          .form-input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 0.75rem 0.85rem 0.75rem 2.6rem;
            border-radius: 8px;
          }

          .input-icon {
            left: 0.85rem;
          }

          .password-toggle {
            right: 0.85rem;
            padding: 0.4rem;
          }

          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .checkbox-label {
            font-size: 0.8rem;
          }

          .forgot-link {
            font-size: 0.8rem;
          }

          .submit-button {
            padding: 0.9rem;
            font-size: 0.9rem;
            border-radius: 8px;
          }

          .error-message {
            padding: 0.75rem 0.85rem;
            font-size: 0.8rem;
            min-width: 280px;
            max-width: 90%;
            top: 15px;
          }

          .success-message {
            padding: 0.75rem 0.85rem;
            font-size: 0.8rem;
            min-width: 280px;
            max-width: 90%;
            top: 15px;
          }
        }

        @media (max-width: 400px) {
          .login-section {
            padding: 1rem 0.75rem;
          }

          .login-container {
            padding: 1.25rem;
          }

          .admin-avatar {
            width: 70px;
            height: 70px;
          }

          .login-title {
            font-size: 1.375rem;
          }

          .form-input {
            padding: 0.7rem 0.8rem 0.7rem 2.5rem;
          }

          .submit-button {
            padding: 0.85rem;
          }
        }

        /* Landscape orientation on mobile */
        @media (max-height: 600px) and (orientation: landscape) {
          .login-section {
            padding: 1rem;
          }

          .login-header {
            margin-bottom: 1.25rem;
          }

          .admin-avatar {
            width: 60px;
            height: 60px;
            margin-bottom: 1rem;
          }

          .login-title {
            font-size: 1.375rem;
            margin-bottom: 0.25rem;
          }

          .login-subtitle {
            font-size: 0.8rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-options {
            margin-bottom: 1rem;
          }

          .submit-button {
            padding: 0.75rem;
          }
        }

        /* Touch-friendly for tablets in portrait */
        @media (min-width: 577px) and (max-width: 991px) {
          .form-input,
          .submit-button {
            font-size: 16px; /* Prevents zoom on iPad */
          }

          .login-container {
            max-width: 480px;
            margin: 0 auto;
          }
        }

        /* Large tablets and small laptops */
        @media (min-width: 992px) and (max-width: 1199px) {
          .branding-section {
            padding: 3rem 2rem;
          }

          .brand-title {
            font-size: 2.25rem;
          }

          .feature-item {
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .feature-icon {
            width: 40px;
            height: 40px;
          }

          .feature-content h3 {
            font-size: 1.05rem;
          }

          .feature-content p {
            font-size: 0.9rem;
          }
        }
      `}</style>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Left Side - Branding */}
      <div className="branding-section">
        <div className="branding-content">
          <div className="brand-logo">
            <div className="logo-icon">
              {/* <img 
                src={kaakaziniLogo} 
                alt="Kaakazini Logo" 
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = 'K';
                }}
              /> */}
            </div>
            <span className="brand-name">Kaakazini Admin</span>
          </div>

          <h1 className="brand-title">
            Empowering Communities with Professional Craftsmanship
          </h1>
          
          <p className="brand-description">
            Manage and connect skilled craftsmen with clients. Make data-driven decisions for better service delivery and community growth.
          </p>

          <ul className="feature-list">
            <li className="feature-item">
              <div className="feature-icon">
                <FaCheckCircle style={{ color: '#fbbf24' }} size={20} />
              </div>
              <div className="feature-content">
                <h3>Craftsman Management</h3>
                <p>Approve, manage, and monitor skilled craftsmen efficiently</p>
              </div>
            </li>

            <li className="feature-item">
              <div className="feature-icon">
                <FaUsers style={{ color: '#fbbf24' }} size={20} />
              </div>
              <div className="feature-content">
                <h3>Service Coordination</h3>
                <p>Organize and assign service requests to qualified professionals</p>
              </div>
            </li>

            <li className="feature-item">
              <div className="feature-icon">
                <FaChartLine style={{ color: '#fbbf24' }} size={20} />
              </div>
              <div className="feature-content">
                <h3>Performance Analytics</h3>
                <p>Track and analyze service delivery and craftsman performance</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="branding-footer">
          {/* © 2024 Kaakazini. All rights reserved. */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-section">
        <div className="login-container">
          <div className="login-header">
            <img
              src={adminAvatar}
              alt="Admin Avatar"
              className="admin-avatar"
            />
            <h2 className="login-title">Welcome back!</h2>
            <p className="login-subtitle">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email<span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" size={16} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="admin@kaakazini.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password<span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaLock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
