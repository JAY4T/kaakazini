import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient"; 

const Signup = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordStrong = (pw) => pw.length >= 8;
  const isPhoneNumberValid = (number) => /^2547\d{8}$/.test(number);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!isPasswordStrong(password)) {
      setPasswordError('Password should be at least 8 characters long');
      return;
    }
    setPasswordError('');

    if (!isPhoneNumberValid(phoneNumber)) {
      setPhoneError('Enter a valid Kenyan phone number (e.g., 2547XXXXXXXX)');
      return;
    }
    setPhoneError('');

    setApiError(null);

    const userData = { full_name: fullName, email, password, subscription: 'free', phone_number: phoneNumber };

    try {
      setLoading(true);
      const res = await api.post('/signup/', userData);

      if (res.status !== 201) throw new Error(res.data.detail || 'Signup failed');

      setSuccessMessage('Welcome! A confirmation email has been sent to your inbox. Redirecting to login...');

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/login');
      }, 3000);
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Signup failed';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    const token = response?.credential;
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.post('/google-login/', { token, role: "craftsman" });
      
      // ✅ Check if user needs onboarding
      const userData = res.data.user;
      
      // If user doesn't have full_name or phone_number, redirect to onboarding
      if (!userData.full_name || !userData.phone_number) {
        navigate('/onboarding', {
          state: {
            fullName: userData.full_name || '',
            phoneNumber: userData.phone_number || ''
          }
        });
      } else {
        // User already has complete profile, go to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err.message);
      setApiError('Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: '551247510793-ria1stm1obcn36nkkl2is4tknoqaj2sv.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with',
      });
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .signup-container {
          background: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .signup-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
          border: 2px solid rgba(251, 191, 36, 0.3);
          padding: 3rem;
          max-width: 550px;
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

        .signup-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 24px 24px 0 0;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .signup-header h2 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .signup-header p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 500;
        }

        .form-group-signup {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-label-signup {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.2px;
        }

        .form-control-signup {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
          background: white;
        }

        .form-control-signup:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .form-control-signup:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .password-wrapper-signup {
          position: relative;
        }

        .password-toggle-signup {
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

        .password-toggle-signup:hover {
          color: #fbbf24;
        }

        .btn-signup {
          width: 100%;
          padding: 0.875rem;
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

        .btn-signup:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
        }

        .btn-signup:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-signup:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert-custom-signup {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        .alert-danger-signup {
          background: #fee2e2;
          border: 2px solid #fecaca;
          color: #991b1b;
          animation: shake 0.5s;
        }

        .alert-info-signup {
          background: #dbeafe;
          border: 2px solid #bfdbfe;
          color: #1e40af;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .divider-signup {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
        }

        .divider-signup::before,
        .divider-signup::after {
          content: '';
          flex: 1;
          border-bottom: 2px solid #e5e7eb;
        }

        .divider-signup span {
          padding: 0 1rem;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-link-signup {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f3f4f6;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .login-link-signup a {
          color: #fbbf24;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .login-link-signup a:hover {
          color: #22c55e;
          text-decoration: underline;
        }

        .loading-spinner-signup {
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

        .error-text-signup {
          color: #dc2626;
          font-size: 0.8rem;
          margin-top: 0.35rem;
          font-weight: 500;
        }

        .helper-text-signup {
          color: #6b7280;
          font-size: 0.8rem;
          margin-top: 0.35rem;
        }

        .success-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #f0fdf4;
          border: 2px solid #86efac;
          color: #16a34a;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          min-width: 320px;
          max-width: 520px;
          text-align: center;
          animation: slideDown 0.4s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 576px) {
          .signup-container {
            padding: 2rem 1rem;
          }

          .signup-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .signup-header h2 {
            font-size: 1.75rem;
          }

          .form-group-signup {
            margin-bottom: 1.25rem;
          }

          .success-notification {
            min-width: 280px;
            font-size: 0.85rem;
            padding: 0.875rem 1.25rem;
          }
        }
      `}</style>

      {successMessage && (
        <div className="success-notification">
          {successMessage}
        </div>
      )}

      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2>Join Kaakazini</h2>
            <p>Create your craftsman account to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-signup">
              <label className="form-label-signup">Company or Group Name</label>
              <input 
                type="text" 
                className="form-control-signup" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your company name"
                required 
                autoComplete="organization" 
                disabled={loading}
              />
            </div>

            <div className="form-group-signup">
              <label className="form-label-signup">Email Address</label>
              <input 
                type="email" 
                className="form-control-signup" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group-signup">
              <label className="form-label-signup">Phone Number</label>
              <input 
                type="tel" 
                className="form-control-signup" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="2547XXXXXXXX"
                required 
                autoComplete="tel"
                disabled={loading}
              />
              {phoneError && <div className="error-text-signup">{phoneError}</div>}
            </div>

            <div className="form-group-signup">
              <label className="form-label-signup">Password</label>
              <div className="password-wrapper-signup">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control-signup" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle-signup"
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
              <div className="helper-text-signup">Password must be at least 8 characters</div>
            </div>

            <div className="form-group-signup">
              <label className="form-label-signup">Confirm Password</label>
              <div className="password-wrapper-signup">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control-signup" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle-signup"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
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
              {passwordError && <div className="error-text-signup">{passwordError}</div>}
            </div>

            {apiError && <div className="alert-custom-signup alert-danger-signup">{apiError}</div>}
            {loading && <div className="alert-custom-signup alert-info-signup">Processing registration...</div>}

            <button 
              className="btn-signup" 
              type="submit" 
              disabled={loading}
            >
              {loading && <span className="loading-spinner-signup"></span>}
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="divider-signup">
            <span>Or continue with</span>
          </div>

          <div ref={googleButtonRef} style={{ marginBottom: '1.5rem' }}></div>

          <div className="login-link-signup">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
