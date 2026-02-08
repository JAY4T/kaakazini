import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient"; 

const HireSignup = () => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

    const userData = {
      full_name: fullName,
      email,
      phone_number: phoneNumber,
      password,
      subscription: 'free',
      role: 'client',
    };

    try {
      setLoading(true);
      const res = await api.post('/client-signup/', userData);

      if (res.status !== 201) throw new Error(res.data.detail || 'Signup failed');

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/HireLogin');
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
      await api.post('/google-login/', { token, role: 'client' });
      navigate('/dashboard');
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

  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .hire-signup-container {
          background: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .hire-signup-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
          border: 2px solid rgba(34, 197, 94, 0.3);
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

        .hire-signup-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 24px 24px 0 0;
        }

        .hire-signup-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .hire-signup-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .hire-signup-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .hire-signup-header h2 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .hire-signup-header p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 500;
        }

        .form-group-hire {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-label-hire {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.2px;
        }

        .form-control-hire {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
          background: white;
        }

        .form-control-hire:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        .form-control-hire:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .form-control-hire.is-invalid {
          border-color: #ef4444;
        }

        .password-wrapper-hire {
          position: relative;
        }

        .password-toggle-hire {
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

        .password-toggle-hire:hover {
          color: #22c55e;
        }

        .btn-hire-signup {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .btn-hire-signup:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        }

        .btn-hire-signup:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-hire-signup:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert-custom-hire {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        .alert-danger-hire {
          background: #fee2e2;
          border: 2px solid #fecaca;
          color: #991b1b;
          animation: shake 0.5s;
        }

        .alert-info-hire {
          background: #dbeafe;
          border: 2px solid #bfdbfe;
          color: #1e40af;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .divider-hire {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
        }

        .divider-hire::before,
        .divider-hire::after {
          content: '';
          flex: 1;
          border-bottom: 2px solid #e5e7eb;
        }

        .divider-hire span {
          padding: 0 1rem;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-link-hire {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f3f4f6;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .login-link-hire a {
          color: #22c55e;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .login-link-hire a:hover {
          color: #fbbf24;
          text-decoration: underline;
        }

        .loading-spinner-hire {
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

        .error-text-hire {
          color: #dc2626;
          font-size: 0.8rem;
          margin-top: 0.35rem;
          font-weight: 500;
        }

        .helper-text-hire {
          color: #6b7280;
          font-size: 0.8rem;
          margin-top: 0.35rem;
        }

        .success-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .success-modal-content {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 450px;
          width: 90%;
          text-align: center;
          animation: slideDown 0.4s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .success-icon svg {
          width: 45px;
          height: 45px;
          color: white;
        }

        .success-modal h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .success-modal p {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .btn-success-modal {
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-success-modal:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        @media (max-width: 576px) {
          .hire-signup-container {
            padding: 2rem 1rem;
          }

          .hire-signup-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .hire-signup-header h2 {
            font-size: 1.75rem;
          }

          .hire-signup-icon {
            width: 70px;
            height: 70px;
          }

          .hire-signup-icon svg {
            width: 35px;
            height: 35px;
          }

          .form-group-hire {
            margin-bottom: 1.25rem;
          }
        }
      `}</style>

      <div className="hire-signup-container">
        <div className="hire-signup-card">
          <div className="hire-signup-header">
            <div className="hire-signup-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2>Join as a Client</h2>
            <p>Find and hire skilled craftsmen for your projects</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-hire">
              <label className="form-label-hire">Full Name</label>
              <input 
                type="text" 
                className="form-control-hire" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name"
                required 
                autoComplete="name" 
                disabled={loading}
              />
            </div>

            <div className="form-group-hire">
              <label className="form-label-hire">Email Address</label>
              <input 
                type="email" 
                className="form-control-hire" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group-hire">
              <label className="form-label-hire">Phone Number</label>
              <input 
                type="tel" 
                className="form-control-hire" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="2547XXXXXXXX"
                required 
                autoComplete="tel"
                disabled={loading}
              />
              {phoneError && <div className="error-text-hire">{phoneError}</div>}
            </div>

            <div className="form-group-hire">
              <label className="form-label-hire">Password</label>
              <div className="password-wrapper-hire">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control-hire" 
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
                  className="password-toggle-hire"
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
              <div className="helper-text-hire">Password must be at least 8 characters</div>
            </div>

            <div className="form-group-hire">
              <label className="form-label-hire">Confirm Password</label>
              <div className="password-wrapper-hire">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control-hire ${passwordMismatch ? 'is-invalid' : ''}`}
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
                  className="password-toggle-hire"
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
              {passwordMismatch && <div className="error-text-hire">Passwords do not match</div>}
              {passwordError && <div className="error-text-hire">{passwordError}</div>}
            </div>

            {apiError && <div className="alert-custom-hire alert-danger-hire">{apiError}</div>}
            {loading && <div className="alert-custom-hire alert-info-hire">Processing registration...</div>}

            <button 
              className="btn-hire-signup" 
              type="submit" 
              disabled={loading}
            >
              {loading && <span className="loading-spinner-hire"></span>}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="divider-hire">
            <span>Or continue with</span>
          </div>

          {/* <div ref={googleButtonRef} style={{ marginBottom: '1.5rem' }}></div> */}

          <div className="login-link-hire">
            Already have an account? <Link to="/HireLogin">Login here</Link>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal-content">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3>Welcome to Kaakazini!</h3>
            <p>A confirmation email has been sent to your inbox. Redirecting you to login...</p>
            <button className="btn-success-modal" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer text-light pt-5 pb-4" style={{ backgroundColor: '#1f2937' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
                <li className="mb-2"><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2"></i> Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2"></i> support@kaakazini.com</p>
            </div>

            <div className="col-lg-5 col-md-12 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Find Us</h5>
              <div style={{ width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kisumu Location Map"
                />
              </div>
            </div>
          </div>

          <hr className="border-secondary mt-4" />
          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
            <p className="mb-md-0 text-center">© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
            <div className="mt-2 mt-md-0 text-center">
              <a href="#top" className="text-light text-decoration-none">Back to top <i className="fas fa-arrow-up ms-2"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HireSignup;
