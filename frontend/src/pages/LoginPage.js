import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // loading state
  const googleButtonRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8001/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Invalid email or password!');
      }

      const data = await response.json();
      sessionStorage.setItem('access_token', data.access);
      sessionStorage.setItem('refresh_token', data.refresh);

      // Fetch user profile
      const profileResponse = await fetch('http://127.0.0.1:8001/api/profile/', {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile.');
      }

      const profileData = await profileResponse.json();


      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    const googleToken = response?.credential;
    if (!googleToken) return alert('Invalid Google credential');

    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8001/api/google-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!res.ok) throw new Error('Google login failed.');

      const data = await res.json();
      sessionStorage.setItem('access_token', data.access);
      sessionStorage.setItem('refresh_token', data.refresh);

      // Fetch user profile after Google login
      const profileResponse = await fetch('http://127.0.0.1:8001/api/profile/', {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile.');
      }

     const profileData = await profileResponse.json();

    sessionStorage.setItem('user_profile', JSON.stringify(profileData));


      navigate('/dashboard');

    } catch (err) {
      console.error('Google login error:', err);
      alert(err.message || 'Something went wrong with Google login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id:
            '551247510793-ria1stm1obcn36nkkl2is4tknoqaj2sv.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
        });
      }
    } catch (error) {
      console.error('Failed to load Google Sign-In button:', error);
    }
  }, []);

  return (
    <div
      style={{
        backgroundImage:
          'url("https://jay4t.org/wp-content/uploads/2025/04/pexels-kindelmedia-8487371-1536x1152.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div className="container" style={{ marginTop: '100px', marginBottom: '50px' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#0d6efd' }}>
                  Craftsman Login
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={loading}
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
                      autoComplete="current-password"
                      disabled={loading}
                    />
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button className="btn btn-primary w-100 py-2 mb-3" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="text-center mb-3" ref={googleButtonRef} />

                <p className="mt-3 text-center">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-primary">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
