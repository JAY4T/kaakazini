import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../api/axiosClient"; // ✅ cookie-based axios instance

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

  const isPasswordStrong = (pw) => pw.length >= 8;
  const isPhoneNumberValid = (number) => /^2547\d{8}$/.test(number); // Kenyan numbers

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!isPasswordStrong(password)) {
      setPasswordError('Password should be at least 8 characters long');
      return;
    }
    setPasswordError('');

    // Phone validation
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
      const res = await api.post('/client-signup/', userData); // ✅ cookie-based

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

  // GOOGLE SIGNUP (optional, if supported)
  const handleGoogleResponse = async (response) => {
    const token = response?.credential;
    if (!token) return;

    try {
      setLoading(true);
      await api.post('/google-login/', { token }); // ✅ cookie-based login
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

  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <>
      <div
        className="container-fluid"
        style={{
          backgroundImage: 'url("https://jay4t.org/wp-content/uploads/2025/04/pexels-kindelmedia-8487371-1536x1152.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* --- Form Container --- */}
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4 fw-bold text-success">Client Signup</h2>

                  {apiError && <div className="alert alert-danger">{apiError}</div>}
                  {loading && <div className="alert alert-info">Processing registration...</div>}

                  <form onSubmit={handleSubmit}>
                    {/* --- Full Name --- */}
                    <div className="mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>

                    {/* --- Email --- */}
                    <div className="mb-4">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* --- Phone Number --- */}
                    <div className="mb-4">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="2547XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        required
                        autoComplete="tel"
                      />
                      {phoneError && <div className="text-danger mt-1">{phoneError}</div>}
                    </div>

                    {/* --- Password --- */}
                    <div className="mb-4">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <small className="form-text text-muted">Password must be at least 8 characters</small>
                    </div>

                    {/* --- Confirm Password --- */}
                    <div className="mb-4">
                      <input
                        type="password"
                        className={`form-control ${passwordMismatch ? 'is-invalid' : ''}`}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      {passwordMismatch && <div className="invalid-feedback">Passwords do not match.</div>}
                    </div>

                    {/* --- Agree Terms --- */}
                    <div className="form-check mb-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agree"
                        checked={passwordError.agree}
                        onChange={(e) => setPasswordError({ ...passwordError, agree: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="agree">
                        I agree to the <Link to="/terms">terms and conditions</Link>
                      </label>
                    </div>

                    <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                      Create Account
                    </button>
                  </form>

                  {/* Google Signup */}
                  <div className="text-center mt-2" ref={googleButtonRef}></div>

                  <p className="mt-4 text-center">
                    Already have an account? <Link to="/HireLogin" className="text-primary">Login here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Welcome! A confirmation email has been sent to your inbox.</h5>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => setShowSuccessModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer text-light pt-5 pb-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
                <li><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
                <li><a href="#services" className="text-light text-decoration-none">Services</a></li>
                <li><a href="#how-it-works" className="text-light text-decoration-none">How It Works</a></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Contact Us</h5>
              <p>Kisumu, Kenya</p>
              <p>support@kaakazini.com</p>
            </div>

            <div className="col-lg-5 col-md-12 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Find Us</h5>
              <div className="map-container">
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
