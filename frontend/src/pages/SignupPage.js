import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

function Signup() {
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

  const isPasswordStrong = (pw) => pw.length >= 8;

  // ✅ Validate Kenyan phone number
  const isPhoneNumberValid = (number) => {
    const regex = /^2547\d{8}$/; // Kenya mobile numbers starting with 2547
    return regex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password checks
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!isPasswordStrong(password)) {
      setPasswordError('Password should be at least 8 characters long');
      return;
    }
    setPasswordError('');

    // Phone number check
    if (!isPhoneNumberValid(phoneNumber)) {
      setPhoneError('Enter a valid Kenyan phone number (e.g., 2547XXXXXXXX)');
      return;
    }
    setPhoneError('');

    setApiError(null);

    const userData = {
      full_name: fullName,
      email,
      password,
      subscription: 'free',
      phone_number: phoneNumber,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/signup/`, userData);

      if (res.status !== 201) {
        throw new Error(res.data.detail || 'Signup failed');
      }

      setShowSuccessModal(true);

      // Navigate to login after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Signup failed';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGNUP HANDLER
  const handleGoogleResponse = async (response) => {
    const token = response?.credential;
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/google-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error('Google signup failed');

      const data = await res.json();
      sessionStorage.setItem('access_token', data.access);
      sessionStorage.setItem('refresh_token', data.refresh);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err.message);
      setApiError('Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Button
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
      <div
        className="container-fluid"
        style={{
          backgroundImage:
            'url("https://jay4t.org/wp-content/uploads/2025/04/pexels-kindelmedia-8487371-1536x1152.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4 fw-bold text-success">
                    Group Craftsman Signup
                  </h2>

                  {apiError && <div className="alert alert-danger">{apiError}</div>}
                  {loading && <div className="alert alert-info">Processing registration...</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label">Company or Group Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="organization"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <small className="form-text text-muted">
                        Password must be at least 8 characters
                      </small>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      {passwordError && <div className="text-danger mt-1">{passwordError}</div>}
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={phoneNumber}
                        onChange={(e) => {
                          const input = e.target.value.replace(/\D/g, '');
                          setPhoneNumber(input);
                        }}
                        required
                        autoComplete="tel"
                        placeholder="2547XXXXXXXX"
                      />
                      {phoneError && <div className="text-danger mt-1">{phoneError}</div>}
                    </div>

                    <button className="btn btn-yellow-solid w-100 py-2" disabled={loading}>
                      Sign Up
                    </button>
                  </form>

                  <div className="text-center mt-2" ref={googleButtonRef}></div>

                  <p className="mt-4 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Welcome! A confirmation email has been sent to your inbox.
                </h5>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer text-light pt-5 pb-4 mt-5">
        <div className="container">
          <div className="row">
            {/* Quick Links */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Quick Links</h5>
              <ul className="list-unstyled" data-aos="fade-right">
                <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
                <li className="mb-2"><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
                <li className="mb-2"><a href="#services" className="text-light text-decoration-none">Services</a></li>
                <li className="mb-2"><a href="#how-it-works" className="text-light text-decoration-none">How It Works</a></li>
              </ul>
            </div>
      
            {/* Contact Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2 " data-aos="fade-right"></i> Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2" data-aos="fade-right"></i> support@kaakazini.com
      
      </p>
              {/* Social Icons */}
              <div className="mt-4 social-icons" data-aos="fade-right">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <a href="#" className="me-3 text-light"><i className="fab fa-facebook-f fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-twitter fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-instagram fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-linkedin-in fa-lg"></i></a>
              </div>
            </div>
            
            {/* Map */}
            <div className="col-lg-5 col-md-12 mb-4">
              <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Find Us</h5>
              <div className="map-container" data-aos="fade-right">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kisumu Location Map"
                />
              </div>
            </div>
          </div>
          
          <hr className="border-secondary mt-0" />
          
          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
            <p className="mb-md-0 text-center ">© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
            <div className="mt-2 mt-md-0 text-center">
              <a href="#top" className="text-light text-decoration-none">Back to top <i className="fas fa-arrow-up ms-2"></i></a>
            </div>
          </div>
        </div>
      
        <style>{`
          .footer {
           background-color: #222222ff;
          }
          .footer-links li a {
            transition: color 0.3s ease-in-out;
          }
          .footer-links li a:hover {
            color: #0d6efd !important;
          }
          .social-icons a {
            font-size: 1.5rem;
            transition: transform 0.3s ease-in-out;
          }
          .social-icons a:hover {
            transform: scale(1.1);
            color: #0d6efd !important;
          }
          .map-container {
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }
           @keyframes slide {
                0% { transform: translateX(0px); }
                100% { transform: translateX(20px); }
              }
      
        `
        
        
        }</style>
        <style>{`
        .hero-buttons {
          flex-wrap: nowrap !important; /* prevents wrapping on smaller screens */
          gap: 1rem;
        }
      
        .hero-buttons a {
          min-width: 150px;
        }
      
        @media (max-width: 576px) {
          .hero-buttons {
            flex-direction: row !important;
            justify-content: center;
            align-items: center;
            flex-wrap: nowrap !important;
          }
          .hero-buttons a {
            font-size: 0.9rem;
            padding: 0.6rem 1rem;
          }
        }
      `}</style>
      
        
      </footer>
    </>
  );
}

export default Signup;
