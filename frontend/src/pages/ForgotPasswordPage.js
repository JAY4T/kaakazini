import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient"; 

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/password-reset/", { email });
      setMessage("If this email is registered, you'll receive reset instructions shortly.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .forgot-password-container {
          background: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .forgot-password-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
          border: 2px solid rgba(251, 191, 36, 0.3);
          padding: 3rem;
          max-width: 480px;
          width: 100%;
          position: relative;
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

        .forgot-password-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 24px 24px 0 0;
        }

        .forgot-password-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .forgot-password-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
        }

        .forgot-password-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .forgot-password-header h2 {
          font-size: 1.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .forgot-password-header p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 500;
          line-height: 1.5;
        }

        .form-group-forgot {
          margin-bottom: 1.75rem;
        }

        .form-label-forgot {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.2px;
        }

        .form-control-forgot {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
          background: white;
        }

        .form-control-forgot:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .form-control-forgot:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .btn-forgot-password {
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

        .btn-forgot-password:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
        }

        .btn-forgot-password:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-forgot-password:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert-forgot {
          padding: 0.875rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 1.5rem;
          text-align: center;
          line-height: 1.5;
        }

        .alert-success-forgot {
          background: #f0fdf4;
          border: 2px solid #86efac;
          color: #16a34a;
          animation: slideDown 0.4s ease-out;
        }

        .alert-danger-forgot {
          background: #fee2e2;
          border: 2px solid #fecaca;
          color: #991b1b;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .back-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f3f4f6;
        }

        .back-link a {
          color: #fbbf24;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-link a:hover {
          color: #22c55e;
          text-decoration: underline;
        }

        .loading-spinner-forgot {
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
          .forgot-password-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .forgot-password-header h2 {
            font-size: 1.5rem;
          }

          .forgot-password-icon {
            width: 70px;
            height: 70px;
          }

          .forgot-password-icon svg {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <div className="forgot-password-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2>Forgot Password?</h2>
            <p>Enter your email and we'll send you reset instructions</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-forgot">
              <label className="form-label-forgot">Email Address</label>
              <input
                type="email"
                className="form-control-forgot"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              className="btn-forgot-password" 
              type="submit" 
              disabled={loading}
            >
              {loading && <span className="loading-spinner-forgot"></span>}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <div className="alert-forgot alert-success-forgot">
              {message}
            </div>
          )}
          
          {error && (
            <div className="alert-forgot alert-danger-forgot">
              {error}
            </div>
          )}

          <div className="back-link">
            <Link to="/login">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;
