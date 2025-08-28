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
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ New

  const isPasswordStrong = (pw) => pw.length >= 8;

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

      setShowSuccessModal(true); // ✅ Show modal

      // Wait 2 seconds, then navigate
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/login');
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Signup failed';
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
                  <h2 className="text-center mb-4 fw-bold" style={{ color: '#0d6efd' }}>
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
                    </div>

                    <button className="btn btn-primary w-100 py-2" disabled={loading}>
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

      {/* ✅ Success Modal */}
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
                <h5 className="modal-title">Thanks for registering your team!</h5>
              </div>
              <div className="modal-body">
                <p>You can now invite other members via email or share your team code.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => setShowSuccessModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Signup;
