import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';


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
      const res = await fetch(`${API_BASE_URL}/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to request password reset");
      }

      setMessage("If this email is registered, you’ll receive reset instructions shortly.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold text-primary">Forgot Password</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && <div className="alert alert-success mt-3 text-center">{message}</div>}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}

          <p className="mt-3 text-center">
            <Link to="/login" className="text-decoration-none">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
