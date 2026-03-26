import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cl-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Outfit', sans-serif;
  background: #0d0d0d;
}

/* ─── LEFT PANEL ─── */
.cl-left {
  background: #0d0d0d;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 56px 60px;
  overflow: hidden;
  border-right: 1px solid rgba(255,215,0,.08);
}

.cl-left::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.07) 0%, transparent 65%);
  pointer-events: none;
}

.cl-left::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 65%);
  pointer-events: none;
}

.cl-grid-lines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,215,0,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,215,0,.03) 1px, transparent 1px);
  background-size: 44px 44px;
}

.cl-eyebrow {
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

.cl-dot { width: 5px; height: 5px; border-radius: 50%; background: #FFD700; }

.cl-headline {
  position: relative; z-index: 1;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900; color: #fff;
  line-height: 1.1; margin-bottom: 18px;
  letter-spacing: -.03em;
}

.cl-headline em {
  font-style: italic;
  color: #FFD700;
  font-weight: 800;
}

.cl-desc {
  position: relative; z-index: 1;
  font-size: .86rem; color: rgba(255,255,255,.45);
  line-height: 1.85; max-width: 360px; margin-bottom: 48px;
  font-weight: 400;
}

.cl-perks {
  position: relative; z-index: 1;
  list-style: none;
  display: flex; flex-direction: column; gap: 13px;
}

.cl-perk {
  display: flex; align-items: center; gap: 11px;
  font-size: .8rem; color: rgba(255,255,255,.65); font-weight: 500;
}

.cl-tick {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,215,0,.1);
  border: 1.5px solid rgba(255,215,0,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: .5rem; color: #FFD700;
}

/* ─── RIGHT PANEL ─── */
.cl-right {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 68px;
}

.cl-box { width: 100%; max-width: 420px; }

.cl-brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 44px;
}

.cl-brand-mark {
  width: 36px; height: 36px; border-radius: 9px;
  background: #0d0d0d;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}

.cl-brand-mark i { color: #FFD700; font-size: .88rem; }
.cl-brand-name { font-size: 1.1rem; font-weight: 800; color: #0d0d0d; letter-spacing: -.01em; }

.cl-title {
  font-size: 2rem; font-weight: 900; color: #0d0d0d;
  margin-bottom: 5px; letter-spacing: -.03em;
}

.cl-sub {
  font-size: .84rem; color: #64748b;
  margin-bottom: 32px; font-weight: 500;
}

.cl-err {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 11px 14px;
  margin-bottom: 20px;
  font-size: .8rem; color: #b91c1c;
  display: flex; align-items: center; gap: 8px;
  font-weight: 600;
}

.cl-field { margin-bottom: 18px; }

.cl-lbl {
  display: block;
  font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: #475569; margin-bottom: 7px;
}

.cl-inp {
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

.cl-inp:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 4px rgba(255,215,0,.12);
}

.cl-inp:disabled { background: #f8fafc; cursor: not-allowed; }

.cl-pw-wrap { position: relative; }

.cl-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #94a3b8;
  cursor: pointer; font-size: .84rem; padding: 4px;
  transition: color .15s; line-height: 1;
}

.cl-eye:hover { color: #0d0d0d; }

.cl-row {
  display: flex; justify-content: flex-end;
  align-items: center; margin-bottom: 24px;
}

.cl-forgot {
  font-size: .8rem; font-weight: 700;
  color: #0d0d0d; text-decoration: none;
  transition: color .15s;
}

.cl-forgot:hover { color: #e6c200; }

.cl-btn {
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

.cl-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(255,215,0,.45);
  filter: brightness(1.05);
}

.cl-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

@keyframes cl-spin { to { transform: rotate(360deg); } }

.cl-spin {
  display: inline-block; width: 14px; height: 14px;
  border: 2.5px solid rgba(0,0,0,.2);
  border-top-color: #0d0d0d;
  border-radius: 50%;
  animation: cl-spin .7s linear infinite;
}

.cl-div {
  display: flex; align-items: center; gap: 12px;
  margin: 26px 0;
}

.cl-div-line { flex: 1; height: 1px; background: #e2e8f0; }

.cl-div-txt {
  font-size: .68rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .08em;
}

.cl-google-wrap { margin-bottom: 1.5rem; }

.cl-signup {
  text-align: center; font-size: .83rem; color: #64748b;
}

.cl-signup a {
  color: #0d0d0d; font-weight: 800; text-decoration: none;
  border-bottom: 2px solid #FFD700;
  padding-bottom: 1px;
  transition: color .15s;
}

.cl-signup a:hover { color: #e6c200; }

@media (max-width: 780px) {
  .cl-root { grid-template-columns: 1fr; }
  .cl-left { display: none; }
  .cl-right { padding: 44px 24px; background: #fff; }
}
`;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      await api.post("/login/", { email, password });
      await login();
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
    <>
      <style>{CSS}</style>
      <div className="cl-root">

        {/* ── LEFT PANEL ── */}
        <div className="cl-left">
          <div className="cl-grid-lines"/>
          {/* <span className="cl-eyebrow"><span className="cl-dot"/>KaaKazini</span> */}
          <h1 className="cl-headline">
            Build your craft.<br/>Grow your<br/><em>business.</em>
          </h1>
          <p className="cl-desc">
            Kenya's verified marketplace connecting skilled craftsmen
            with clients who need quality work done right.
          </p>
          <ul className="cl-perks">
            {[
              'Get assigned jobs directly to your dashboard',
              'Send professional quotes to clients',
              'Track job progress from start to payment',
              'Build your reputation with verified reviews',
            ].map((t, i) => (
              <li className="cl-perk" key={i}>
                <span className="cl-tick"><i className="fas fa-check"/></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="cl-right">
          <div className="cl-box">

            <div className="cl-brand">
              {/* <span className="cl-brand-mark"><i className="fas fa-hard-hat"/></span> */}
              {/* <span className="cl-brand-name">KaaKazini</span> */}
            </div>

            <h2 className="cl-title">Welcome back</h2>
            <p className="cl-sub">Log in to your craftsman dashboard</p>

            {error && (
              <div className="cl-err">
                <i className="fas fa-exclamation-circle"/>{error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="cl-field">
                <label className="cl-lbl" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" className="cl-inp"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={loading} autoComplete="email"
                />
              </div>

              <div className="cl-field">
                <label className="cl-lbl" htmlFor="password">Password</label>
                <div className="cl-pw-wrap">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    className="cl-inp"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required disabled={loading}
                    style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button" className="cl-eye"
                    onClick={() => setShowPassword(!showPassword)} tabIndex="-1"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}/>
                  </button>
                </div>
              </div>

              <div className="cl-row">
                <Link to="/forgot-password" className="cl-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="cl-btn" disabled={loading}>
                {loading
                  ? <><span className="cl-spin"/>Logging in…</>
                  : <><i className="fas fa-arrow-right-to-bracket"/>Log in</>
                }
              </button>
            </form>

            <div className="cl-div">
              <div className="cl-div-line"/>
              <span className="cl-div-txt">Or continue with</span>
              <div className="cl-div-line"/>
            </div>

            <div className="cl-google-wrap" ref={googleButtonRef}/>

            <p className="cl-signup">
              Don't have an account?{' '}
              <Link to="/signup">Sign up free</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
