import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.hl-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Outfit', sans-serif;
  background: #0d0d0d;
}

/* ─── LEFT PANEL ─── */
.hl-left {
  background: #0d0d0d;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 56px 60px;
  overflow: hidden;
  border-right: 1px solid rgba(255,215,0,.08);
}

.hl-left::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.07) 0%, transparent 65%);
  pointer-events: none;
}

.hl-left::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 65%);
  pointer-events: none;
}

.hl-grid-lines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,215,0,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,215,0,.03) 1px, transparent 1px);
  background-size: 44px 44px;
}

.hl-eyebrow {
  position: relative; z-index: 1;
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,215,0,.1);
  border: 1px solid rgba(255,215,0,.25);
  border-radius: 4px;
  padding: 5px 14px;
  margin-bottom: 24px;
  font-size: .64rem; font-weight: 700; color: #FFD700;
  letter-spacing: .12em; text-transform: uppercase;
  width: fit-content;
}

.hl-dot { width: 5px; height: 5px; border-radius: 50%; background: #FFD700; }

.hl-headline {
  position: relative; z-index: 1;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900; color: #fff;
  line-height: 1.1; margin-bottom: 18px;
  letter-spacing: -.03em;
}

.hl-headline em {
  font-style: italic;
  color: #FFD700;
  font-weight: 800;
}

.hl-desc {
  position: relative; z-index: 1;
  font-size: .86rem; color: rgba(255,255,255,.45);
  line-height: 1.85; max-width: 360px; margin-bottom: 48px;
  font-weight: 400;
}

.hl-perks {
  position: relative; z-index: 1;
  list-style: none;
  display: flex; flex-direction: column; gap: 13px;
}

.hl-perk {
  display: flex; align-items: center; gap: 11px;
  font-size: .8rem; color: rgba(255,255,255,.65); font-weight: 500;
}

.hl-tick {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,215,0,.1);
  border: 1.5px solid rgba(255,215,0,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: .5rem; color: #FFD700;
}

/* ─── RIGHT PANEL ─── */
.hl-right {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 68px;
}

.hl-box { width: 100%; max-width: 420px; }

.hl-brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 44px;
}

.hl-brand-mark {
  width: 36px; height: 36px; border-radius: 9px;
  background: #0d0d0d;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}

.hl-brand-mark i { color: #FFD700; font-size: .88rem; }
.hl-brand-name { font-size: 1.1rem; font-weight: 800; color: #0d0d0d; letter-spacing: -.01em; }

.hl-title {
  font-size: 2rem; font-weight: 900; color: #0d0d0d;
  margin-bottom: 5px; letter-spacing: -.03em;
}

.hl-sub {
  font-size: .84rem; color: #64748b;
  margin-bottom: 32px; font-weight: 500;
}

.hl-err {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 11px 14px;
  margin-bottom: 20px;
  font-size: .8rem; color: #b91c1c;
  display: flex; align-items: center; gap: 8px;
  font-weight: 600;
}

.hl-field { margin-bottom: 18px; }

.hl-lbl {
  display: block;
  font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: #475569; margin-bottom: 7px;
}

.hl-inp {
  width: 100%; padding: 13px 15px;
  font-size: .9rem; font-weight: 500;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #1e293b;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

.hl-inp:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 4px rgba(255,215,0,.12);
}

.hl-pw-wrap { position: relative; }

.hl-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #94a3b8;
  cursor: pointer; font-size: .84rem; padding: 4px;
  transition: color .15s; line-height: 1;
}

.hl-eye:hover { color: #0d0d0d; }

.hl-row {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 24px;
}

.hl-ck-wrap { display: flex; align-items: center; gap: 8px; }

.hl-ck {
  width: 15px; height: 15px;
  accent-color: #0d0d0d; cursor: pointer;
}

.hl-ck-lbl {
  font-size: .8rem; color: #64748b;
  cursor: pointer; font-weight: 500;
}

.hl-forgot {
  font-size: .8rem; font-weight: 700;
  color: #0d0d0d; text-decoration: none;
  transition: color .15s;
}

.hl-forgot:hover { color: #e6c200; }

/* THE MAIN BUTTON — black + gold matching dashboard */
.hl-btn {
  width: 100%; padding: 14px;
  font-size: .92rem; font-weight: 800;
  background: linear-gradient(135deg, #FFD700, #e6c200);
  color: #0d0d0d;
  border: none; border-radius: 12px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
  box-shadow: 0 6px 22px rgba(255,215,0,.35);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  letter-spacing: -.01em;
}

.hl-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(255,215,0,.45);
  filter: brightness(1.05);
}

.hl-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

@keyframes hl-spin { to { transform: rotate(360deg); } }

.hl-spin {
  display: inline-block; width: 14px; height: 14px;
  border: 2.5px solid rgba(0,0,0,.2);
  border-top-color: #0d0d0d;
  border-radius: 50%;
  animation: hl-spin .7s linear infinite;
}

.hl-div {
  display: flex; align-items: center; gap: 12px;
  margin: 26px 0;
}

.hl-div-line { flex: 1; height: 1px; background: #e2e8f0; }

.hl-div-txt {
  font-size: .68rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .08em;
}

.hl-signup {
  text-align: center; font-size: .83rem; color: #64748b;
}

.hl-signup a {
  color: #0d0d0d; font-weight: 800; text-decoration: none;
  border-bottom: 2px solid #FFD700;
  padding-bottom: 1px;
  transition: color .15s;
}

.hl-signup a:hover { color: #e6c200; }

@media (max-width: 780px) {
  .hl-root { grid-template-columns: 1fr; }
  .hl-left { display: none; }
  .hl-right { padding: 44px 24px; background: #fff; }
}
`;

const HireLogin = () => {
  const [form, setForm]       = useState({ email: '', password: '', remember: false });
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const fromPath = location.state?.from?.pathname;
  const from     = fromPath && fromPath !== '/HireLogin' ? fromPath : '/hire';

  const handleChange = e => {
    const { id, value, type, checked } = e.target;
    setForm(p => ({ ...p, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Both fields are required.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/client-login/', { email: form.email, password: form.password, remember: form.remember });
      await login();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="hl-root">

        {/* ── LEFT PANEL ── */}
        <div className="hl-left">
          <div className="hl-grid-lines"/>
          {/* <span className="hl-eyebrow"><span className="hl-dot"/>KaaKazini</span> */}
          <h1 className="hl-headline">
            Hire skilled<br/>craftsmen.<br/><em>Get it done right.</em>
          </h1>
          <p className="hl-desc">
            Kenya's verified marketplace for craftsmen and artisans.
            Browse portfolios, read reviews, hire directly.
          </p>
          <ul className="hl-perks">
            {[
              'Every craftsman is manually verified',
              'Real portfolios & honest reviews',
              'Direct hire — no commission for clients',
              'Track your job from request to completion',
            ].map((t, i) => (
              <li className="hl-perk" key={i}>
                <span className="hl-tick"><i className="fas fa-check"/></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="hl-right">
          <div className="hl-box">

            {/* <div className="hl-brand"> */}
              {/* <span className="hl-brand-mark"><i className="fas fa-hard-hat"/></span> */}
              {/* <span className="hl-brand-name">KaaKazini</span> */}
            {/* </div> */}

            <h2 className="hl-title">Welcome back</h2>
            <p className="hl-sub">Log in to your client account</p>

            {error && (
              <div className="hl-err">
                <i className="fas fa-exclamation-circle"/>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="hl-field">
                <label className="hl-lbl" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" className="hl-inp"
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  required disabled={loading} autoComplete="email"
                />
              </div>

              <div className="hl-field">
                <label className="hl-lbl" htmlFor="password">Password</label>
                <div className="hl-pw-wrap">
                  <input
                    id="password" type={showPw ? 'text' : 'password'}
                    className="hl-inp"
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    required disabled={loading}
                    style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button" className="hl-eye"
                    onClick={() => setShowPw(!showPw)} tabIndex="-1"
                  >
                    <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}/>
                  </button>
                </div>
              </div>

              <div className="hl-row">
                <div className="hl-ck-wrap">
                  <input
                    id="remember" type="checkbox" className="hl-ck"
                    checked={form.remember} onChange={handleChange}
                  />
                  <label className="hl-ck-lbl" htmlFor="remember">Keep me logged in</label>
                </div>
                <Link to="/forgot-password" className="hl-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="hl-btn" disabled={loading}>
                {loading
                  ? <><span className="hl-spin"/>Logging in…</>
                  : <><i className="fas fa-arrow-right-to-bracket"/>Log in</>
                }
              </button>
            </form>

            <div className="hl-div">
              <div className="hl-div-line"/>
              <span className="hl-div-txt">New here?</span>
              <div className="hl-div-line"/>
            </div>

            <p className="hl-signup">
              No account yet?{' '}
              <Link to="/HireSignup">Create one — it's free</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default HireLogin;
