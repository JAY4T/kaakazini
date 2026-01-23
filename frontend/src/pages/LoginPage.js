import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      await api.post("/login/", { email, password }); // backend sets cookie
      await login(); // fetch user and update context
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

  // Google login
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
    <div style={{ backgroundImage: 'url("/background.webp")', backgroundSize: "cover", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div className="container" style={{ marginTop: "150px" }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <h2 className="text-center mb-4 fw-bold text-success">Group Login</h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="mb-4">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button className="btn btn-yellow-solid w-100 py-2 mb-3" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                </form>
                <div className="text-center mb-3" ref={googleButtonRef} />
                <p className="mt-3 text-center">
                  Don&apos;t have an account? <Link to="/signup" className="text-primary">Sign Up</Link>
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