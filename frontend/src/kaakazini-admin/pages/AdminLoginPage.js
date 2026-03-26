import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../api/axiosClient";
import adminAvatar from "../../assets/admin.png";

export default function AdminLoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const response = await api.post("/admin-login/", { email, password });
      const token = response.data.token || "dummy-admin-token";
      localStorage.setItem("adminToken", token);
      setSuccess("Access granted. Redirecting to command centre…");
      setTimeout(() => navigate("/kaakazini-admin/dashboard"), 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError("Invalid credentials. Access denied.");
      else if (status === 400) setError("Bad request. Check your input.");
      else setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --black:  #0a0a0a;
          --dark:   #111111;
          --card:   #161616;
          --border: rgba(255,255,255,.08);
          --gold:   #FFD700;
          --gold2:  #FFA500;
          --green:  #22c55e;
          --green2: #16a34a;
          --text:   #f5f5f5;
          --muted:  #888;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root { margin: 0 !important; padding: 0 !important; }

        .al-root {
          min-height: 100vh;
          display: flex;
          background: var(--black);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .al-left {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem;
          overflow: hidden;
          background: var(--dark);
        }
        .al-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(34,197,94,.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(255,215,0,.08) 0%, transparent 55%);
          pointer-events: none;
        }
        .al-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .al-brand {
          position: relative;
          z-index: 1;
        }
        .al-logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 3.5rem;
        }
        .al-logo-box {
          width: 46px; height: 46px;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 800; font-size: 1.4rem;
          color: var(--black);
          flex-shrink: 0;
        }
        .al-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 800;
          letter-spacing: -.5px;
          color: var(--text);
        }
        .al-logo-name span { color: var(--gold); }
        .al-tagline-badge {
          display: inline-block;
          background: rgba(34,197,94,.15);
          border: 1px solid rgba(34,197,94,.3);
          color: var(--green);
          font-size: .72rem; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 50px;
          margin-bottom: 1.5rem;
        }
        .al-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 2.9rem);
          font-weight: 800;
          line-height: 1.12;
          margin-bottom: 1.25rem;
          letter-spacing: -.5px;
        }
        .al-headline .hl-gold { color: var(--gold); }
        .al-headline .hl-green { color: var(--green); }
        .al-sub {
          color: var(--muted);
          font-size: .95rem;
          line-height: 1.75;
          max-width: 420px;
          margin-bottom: 3rem;
        }
        .al-features {
          display: flex; flex-direction: column; gap: 1rem;
        }
        .al-feat {
          display: flex; align-items: center; gap: 14px;
          padding: 1rem 1.25rem;
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          transition: border-color .2s, background .2s;
        }
        .al-feat:hover {
          background: rgba(255,255,255,.05);
          border-color: rgba(255,215,0,.2);
        }
        .al-feat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem; flex-shrink: 0;
        }
        .al-feat-icon.gold { background: rgba(255,215,0,.12); color: var(--gold); }
        .al-feat-icon.green { background: rgba(34,197,94,.12); color: var(--green); }
        .al-feat-icon.white { background: rgba(255,255,255,.07); color: #aaa; }
        .al-feat-text { font-size: .88rem; color: #ccc; font-weight: 500; }
        .al-feat-text strong { color: var(--text); display: block; margin-bottom: 2px; font-weight: 600; }
        .al-left-footer {
          position: relative; z-index: 1;
          font-size: .75rem; color: var(--muted);
          display: flex; align-items: center; gap: 6px;
        }
        .al-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

        /* ── RIGHT PANEL ── */
        .al-right {
          flex: 0 0 480px;
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem;
          background: var(--black);
          border-left: 1px solid var(--border);
          position: relative;
        }
        .al-right::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .al-form-wrap {
          width: 100%; max-width: 360px;
          position: relative; z-index: 1;
        }
        .al-avatar-wrap {
          text-align: center; margin-bottom: 2rem;
        }
        .al-avatar {
          width: 88px; height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--gold);
          box-shadow: 0 0 0 6px rgba(255,215,0,.1);
        }
        .al-form-title {
          text-align: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; font-weight: 800;
          letter-spacing: -.5px;
          margin-bottom: 4px;
        }
        .al-form-sub {
          text-align: center;
          color: var(--muted); font-size: .88rem;
          margin-bottom: 2rem;
        }
        .al-alert {
          padding: .75rem 1rem;
          border-radius: 10px;
          font-size: .84rem; font-weight: 500;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 8px;
        }
        .al-alert.err { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25); color: #f87171; }
        .al-alert.ok  { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.25);  color: var(--green); }
        .al-label {
          display: block;
          font-size: .78rem; font-weight: 600;
          color: #aaa; letter-spacing: .05em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .al-input-wrap {
          position: relative; margin-bottom: 1.25rem;
        }
        .al-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted); font-size: .9rem; pointer-events: none;
        }
        .al-input {
          width: 100%;
          padding: .875rem 1rem .875rem 2.75rem;
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          color: var(--text); font-size: .95rem;
          font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }
        .al-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(255,215,0,.08);
        }
        .al-input::placeholder { color: #444; }
        .al-eye {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: var(--muted); cursor: pointer;
          padding: 4px; line-height: 1;
          transition: color .15s;
        }
        .al-eye:hover { color: var(--gold); }
        .al-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          color: var(--black);
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; font-weight: 700;
          cursor: pointer;
          transition: all .25s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: .5rem;
          box-shadow: 0 4px 20px rgba(255,215,0,.2);
        }
        .al-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255,215,0,.35);
        }
        .al-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .al-divider {
          text-align: center; margin: 1.5rem 0 .75rem;
          color: var(--muted); font-size: .75rem; letter-spacing: .08em; text-transform: uppercase;
          position: relative;
        }
        .al-divider::before, .al-divider::after {
          content: ''; position: absolute; top: 50%;
          width: 38%; height: 1px; background: var(--border);
        }
        .al-divider::before { left: 0; }
        .al-divider::after  { right: 0; }
        .al-footer-note {
          text-align: center; font-size: .75rem; color: #444; margin-top: 1.5rem;
        }

        /* ── SPINNER ── */
        .al-spin {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,.2);
          border-top-color: var(--black);
          border-radius: 50%;
          animation: alspin .6s linear infinite;
        }
        @keyframes alspin { to { transform: rotate(360deg); } }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) { .al-left { display: none; } }
        @media (max-width: 520px) {
          .al-right { flex: 1; padding: 1.5rem; border-left: none; }
          .al-form-wrap { max-width: 100%; }
        }
      `}</style>

      {/* LEFT */}
      <div className="al-left">
        <div className="al-grid"/>
        <div className="al-brand">
          <div className="al-logo-row">
            <div className="al-logo-box">K</div>
            <span className="al-logo-name">Kaaka<span>Kazini</span></span>
          </div>
          <h1 className="al-headline">
            Manage. Approve.<br/>
            <span className="hl-gold">Deploy</span> the best<br/>
            <span className="hl-green">craftsmen.</span>
          </h1>
          <p className="al-sub">
            The central hub for approving craftsmen, tracking jobs, managing payments, and keeping Kenya's skilled workforce running at full power.
          </p>
          <div className="al-features">
            {[
              { icon: '✦', cls: 'gold',  title: 'Craftsman Approvals', desc: 'Review profiles and approve verified professionals instantly' },
              { icon: '◈', cls: 'green', title: 'Job Management',       desc: 'Assign, track and monitor all service requests in real time' },
              { icon: '◎', cls: 'white', title: 'MPesa Payments',       desc: 'Process craftsman payouts directly via MPesa integration' },
            ].map(({ icon, cls, title, desc }) => (
              <div className="al-feat" key={title}>
                <div className={`al-feat-icon ${cls}`}>{icon}</div>
                <div className="al-feat-text">
                  <strong>{title}</strong>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="al-left-footer">
          <span className="al-dot"/>
          © {new Date().getFullYear()} KaaKazini · Admin Panel
        </div>
      </div>

      {/* RIGHT */}
      <div className="al-right">
        <div className="al-form-wrap">
          <div className="al-avatar-wrap">
            <img src={adminAvatar} alt="Admin" className="al-avatar"
              onError={e => { e.target.style.display = 'none'; }}/>
          </div>
          <h2 className="al-form-title">Welcome back</h2>
          <p className="al-form-sub">Sign in to your admin account</p>

          {error   && <div className="al-alert err">⚠ {error}</div>}
          {success && <div className="al-alert ok">✓ {success}</div>}

          <form onSubmit={handleLogin}>
            <label className="al-label">Email address</label>
            <div className="al-input-wrap">
              <FaEnvelope className="al-icon"/>
              <input className="al-input" type="email" placeholder="admin@kaakazini.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
            </div>

            <label className="al-label">Password</label>
            <div className="al-input-wrap">
              <FaLock className="al-icon"/>
              <input className="al-input" type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required/>
              <button type="button" className="al-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
              </button>
            </div>

            <button className="al-submit" type="submit" disabled={loading}>
              {loading ? <><div className="al-spin"/> Verifying…</> : '→ Sign In to Admin'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
