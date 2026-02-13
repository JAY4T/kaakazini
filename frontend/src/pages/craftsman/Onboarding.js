import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosClient";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state || {};
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPhoneNumberValid = (number) => /^2547\d{8}$/.test(number);

  const setCookie = (name, value, days = 30) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }

    if (!isPhoneNumberValid(phoneNumber)) {
      setError("Enter a valid Kenyan phone number (e.g., 2547XXXXXXXX)");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/onboarding/", { full_name: fullName, phone_number: phoneNumber });

      if (res.status === 200) {
        setSuccess("Profile completed successfully! Redirecting...");
        deleteCookie("profileIncomplete");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError("Failed to complete profile");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setCookie("profileIncomplete", "true");
    navigate("/dashboard");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .onboarding-wrapper {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
        }

        /* Subtle decorative blobs */
        .onboarding-wrapper::before {
          content: '';
          position: absolute;
          top: -5%;
          right: -3%;
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
          border-radius: 50%;
          filter: blur(60px);
        }

        .onboarding-wrapper::after {
          content: '';
          position: absolute;
          bottom: -5%;
          left: -3%;
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, rgba(251, 191, 36, 0.04) 100%);
          border-radius: 50%;
          filter: blur(60px);
        }

        .onboarding-container {
          width: 100%;
          max-width: 540px;
          position: relative;
          z-index: 1;
        }

        .onboarding-card {
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 
            0 0 0 1px rgba(0, 0, 0, 0.04),
            0 10px 40px rgba(0, 0, 0, 0.08),
            0 40px 100px rgba(0, 0, 0, 0.06);
          padding: 3.5rem;
          position: relative;
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .onboarding-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 28px 28px 0 0;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          margin-bottom: 2rem;
        }

        .onboarding-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 
            0 8px 30px rgba(251, 191, 36, 0.25),
            0 0 0 8px rgba(251, 191, 36, 0.1);
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .onboarding-icon svg {
          width: 50px;
          height: 50px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .onboarding-card h2 {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.75rem;
          letter-spacing: -0.8px;
        }

        .onboarding-card p {
          color: #6b7280;
          font-size: 1.0625rem;
          margin: 0;
          font-weight: 500;
          line-height: 1.6;
        }

        .progress-container {
          margin: 2.5rem 0 3rem;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .progress-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e5e7eb;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-dot.active {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          width: 48px;
          border-radius: 7px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .progress-label {
          text-align: center;
          font-size: 0.8125rem;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-group-onboarding {
          margin-bottom: 2rem;
        }

        .form-label-onboarding {
          display: block;
          font-weight: 700;
          font-size: 0.9375rem;
          color: #1f2937;
          margin-bottom: 0.625rem;
          letter-spacing: -0.2px;
        }

        .form-label-onboarding .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1.125rem;
          top: 50%;
          transform: translateY(-50%);
          width: 22px;
          height: 22px;
          color: #9ca3af;
          transition: color 0.3s;
          z-index: 1;
        }

        .form-control-onboarding {
          width: 100%;
          padding: 1rem 1.125rem 1rem 3.25rem;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          background: #ffffff;
          color: #1f2937;
        }

        .form-control-onboarding:hover {
          border-color: #d1d5db;
        }

        .form-control-onboarding:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 
            0 0 0 4px rgba(251, 191, 36, 0.12),
            0 1px 3px rgba(0, 0, 0, 0.08);
          background: #fffef9;
        }

        .form-control-onboarding:focus ~ .input-icon {
          color: #fbbf24;
        }

        .form-control-onboarding:disabled {
          background: #f9fafb;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-control-onboarding::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .input-hint {
          font-size: 0.8125rem;
          color: #6b7280;
          margin-top: 0.625rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .input-hint svg {
          width: 15px;
          height: 15px;
          color: #22c55e;
          flex-shrink: 0;
        }

        .char-counter {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: right;
          margin-top: 0.375rem;
          font-weight: 600;
        }

        .char-counter.warning {
          color: #f59e0b;
        }

        .btn-onboarding {
          width: 100%;
          padding: 1.125rem;
          font-size: 1.0625rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          color: #1f2937;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.5px;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-onboarding::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-onboarding:hover::before {
          width: 400px;
          height: 400px;
        }

        .btn-onboarding:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 30px rgba(251, 191, 36, 0.4),
            0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .btn-onboarding:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-onboarding:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(31, 41, 55, 0.2);
          border-radius: 50%;
          border-top-color: #1f2937;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .alert-onboarding {
          padding: 1rem 1.25rem;
          border-radius: 14px;
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-success {
          background: #f0fdf4;
          border-color: #86efac;
          color: #166534;
        }

        .alert-danger {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }

        .alert-onboarding svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 12px;
          font-size: 0.8125rem;
          color: #6b7280;
          font-weight: 600;
        }

        .security-badge svg {
          width: 16px;
          height: 16px;
          color: #22c55e;
        }

        .skip-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f3f4f6;
        }

        .skip-link button {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .skip-link button:hover:not(:disabled) {
          color: #374151;
          background: #f9fafb;
        }

        .skip-link button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 576px) {
          .onboarding-card {
            padding: 2.5rem 1.75rem;
            border-radius: 24px;
          }

          .onboarding-card h2 {
            font-size: 1.875rem;
          }

          .onboarding-icon {
            width: 85px;
            height: 85px;
          }

          .onboarding-icon svg {
            width: 42px;
            height: 42px;
          }

          .logo-text {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="onboarding-wrapper">
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <div className="logo-text">Kaakazini</div>
              
              <div className="onboarding-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h2>Complete Your Profile</h2>
              <p>Just a few details to get you started on your journey</p>
            </div>

            <div className="progress-container">
              <div className="progress-dots">
                <div className="progress-dot active"></div>
                <div className="progress-dot"></div>
                <div className="progress-dot"></div>
              </div>
              <div className="progress-label">Step 1 of 3</div>
            </div>

            {error && (
              <div className="alert-onboarding alert-danger">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="alert-onboarding alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-onboarding">
                <label className="form-label-onboarding">
                  Full Name<span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-control-onboarding"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                    maxLength={100}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {fullName && (
                  <div className={`char-counter ${fullName.length > 80 ? 'warning' : ''}`}>
                    {fullName.length}/100
                  </div>
                )}
              </div>

              <div className="form-group-onboarding">
                <label className="form-label-onboarding">
                  Phone Number<span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="form-control-onboarding"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="2547XXXXXXXX"
                    required
                    disabled={loading}
                    maxLength={12}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="input-hint">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  Format: 254 7XX XXX XXX (Kenyan number)
                </div>
              </div>

              <button type="submit" className="btn-onboarding" disabled={loading}>
                <span className="btn-text">
                  {loading && <span className="loading-spinner"></span>}
                  {loading ? "Saving Profile..." : "Complete Profile"}
                </span>
              </button>
            </form>

            <div className="security-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              Your information is secure and encrypted
            </div>

            <div className="skip-link">
              <button onClick={handleSkip} disabled={loading}>
                I'll do this later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
