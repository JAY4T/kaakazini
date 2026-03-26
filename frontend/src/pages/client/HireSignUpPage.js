import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.hs-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Outfit', sans-serif;
  background: #0d0d0d;
}

/* ─── LEFT PANEL ─── */
.hs-left {
  background: #0d0d0d;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 56px 60px;
  overflow: hidden;
  border-right: 1px solid rgba(255,215,0,.08);
}

.hs-left::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.07) 0%, transparent 65%);
  pointer-events: none;
}

.hs-left::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 65%);
  pointer-events: none;
}

.hs-grid-lines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,215,0,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,215,0,.03) 1px, transparent 1px);
  background-size: 44px 44px;
}

.hs-eyebrow {
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

.hs-dot { width: 5px; height: 5px; border-radius: 50%; background: #FFD700; }

.hs-headline {
  position: relative; z-index: 1;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900; color: #fff;
  line-height: 1.1; margin-bottom: 18px;
  letter-spacing: -.03em;
}

.hs-headline em { font-style: italic; color: #FFD700; font-weight: 800; }

.hs-desc {
  position: relative; z-index: 1;
  font-size: .86rem; color: rgba(255,255,255,.45);
  line-height: 1.85; max-width: 360px; margin-bottom: 48px;
  font-weight: 400;
}

.hs-perks {
  position: relative; z-index: 1;
  list-style: none;
  display: flex; flex-direction: column; gap: 13px;
}

.hs-perk {
  display: flex; align-items: center; gap: 11px;
  font-size: .8rem; color: rgba(255,255,255,.65); font-weight: 500;
}

.hs-tick {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,215,0,.1);
  border: 1.5px solid rgba(255,215,0,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: .5rem; color: #FFD700;
}

/* ─── RIGHT PANEL ─── */
.hs-right {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 68px;
  overflow-y: auto;
}

.hs-box { width: 100%; max-width: 420px; }

.hs-brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 36px;
}

.hs-brand-mark {
  width: 36px; height: 36px; border-radius: 9px;
  background: #0d0d0d;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}

.hs-brand-mark i { color: #FFD700; font-size: .88rem; }
.hs-brand-name { font-size: 1.1rem; font-weight: 800; color: #0d0d0d; letter-spacing: -.01em; }

.hs-title {
  font-size: 2rem; font-weight: 900; color: #0d0d0d;
  margin-bottom: 5px; letter-spacing: -.03em;
}

.hs-sub { font-size: .84rem; color: #64748b; margin-bottom: 28px; font-weight: 500; }

.hs-api-err {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 11px 14px;
  margin-bottom: 18px;
  font-size: .8rem; color: #b91c1c;
  display: flex; align-items: center; gap: 8px;
  font-weight: 600;
}

/* Form */
.hs-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.hs-f  { margin-bottom: 14px; }

.hs-lbl {
  display: block;
  font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: #475569; margin-bottom: 7px;
}

.hs-inp {
  width: 100%; padding: 12px 14px;
  font-size: .9rem; font-weight: 500;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #1e293b;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

.hs-inp:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 4px rgba(255,215,0,.12);
}

.hs-inp.err { border-color: #b91c1c; }
.hs-inp:disabled { opacity: .55; cursor: not-allowed; }

.hs-err-txt { font-size: .72rem; color: #b91c1c; margin-top: 4px; font-weight: 700; }
.hs-hint    { font-size: .7rem; color: #94a3b8; margin-top: 4px; font-weight: 500; }

.hs-pw-wrap { position: relative; }

.hs-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #94a3b8;
  cursor: pointer; font-size: .84rem; padding: 4px;
  transition: color .15s; line-height: 1;
}

.hs-eye:hover { color: #0d0d0d; }

.hs-btn {
  width: 100%; padding: 14px;
  font-size: .92rem; font-weight: 800;
  background: linear-gradient(135deg, #FFD700, #e6c200);
  color: #0d0d0d;
  border: none; border-radius: 12px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
  margin-top: 8px;
  box-shadow: 0 6px 22px rgba(255,215,0,.35);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  letter-spacing: -.01em;
}

.hs-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(255,215,0,.45);
  filter: brightness(1.05);
}

.hs-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

@keyframes hs-spin { to { transform: rotate(360deg); } }

.hs-spin {
  display: inline-block; width: 14px; height: 14px;
  border: 2.5px solid rgba(0,0,0,.2);
  border-top-color: #0d0d0d;
  border-radius: 50%;
  animation: hs-spin .7s linear infinite;
}

.hs-login-row {
  text-align: center;
  font-size: .83rem; color: #64748b;
  margin-top: 22px;
}

.hs-login-row a {
  color: #0d0d0d; font-weight: 800;
  text-decoration: none;
  border-bottom: 2px solid #FFD700;
  padding-bottom: 1px;
  transition: color .15s;
}

.hs-login-row a:hover { color: #e6c200; }

/* Success overlay */
@keyframes hs-fade { from { opacity:0 } to { opacity:1 } }
@keyframes hs-up   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
@keyframes hs-bar  { to { width:100% } }

.hs-ok-bg {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  animation: hs-fade .25s ease;
}

.hs-ok-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 38px;
  max-width: 400px; width: 90%;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,.22);
  animation: hs-up .38s cubic-bezier(.34,1.4,.64,1);
  border: 2px solid rgba(255,215,0,.2);
  position: relative; overflow: hidden;
}

.hs-ok-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, #0d0d0d, #FFD700);
  border-radius: 20px 20px 0 0;
}

.hs-ok-icon {
  width: 68px; height: 68px; border-radius: 50%;
  background: #fef9c3;
  border: 2.5px solid #FFD700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
}

.hs-ok-icon i { font-size: 1.8rem; color: #0d0d0d; }

.hs-ok-title {
  font-size: 1.6rem; font-weight: 900; color: #0d0d0d;
  margin-bottom: 10px; letter-spacing: -.02em;
}

.hs-ok-sub {
  font-size: .85rem; color: #64748b;
  line-height: 1.75; margin-bottom: 22px;
}

.hs-ok-bar  { height: 4px; border-radius: 4px; background: #e2e8f0; overflow: hidden; }
.hs-ok-fill { height: 100%; width: 0; background: #FFD700; animation: hs-bar 3s linear forwards; }

@media (max-width: 780px) {
  .hs-root  { grid-template-columns: 1fr; }
  .hs-left  { display: none; }
  .hs-right { padding: 44px 24px; background: #fff; }
  .hs-g2    { grid-template-columns: 1fr; }
}
`;

const HireSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '',
    password: '', confirmPassword: ''
  });
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                             e.fullName        = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email           = 'Enter a valid email';
    if (!/^2547\d{8}$/.test(form.phoneNumber))            e.phoneNumber     = 'Format: 2547XXXXXXXX';
    if (form.password.length < 8)                          e.password        = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword)            e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'phoneNumber' ? value.replace(/\D/g, '') : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiErr('');
    try {
      setLoading(true);
      const res = await api.post('/client-signup/', {
        full_name:    form.fullName,
        email:        form.email,
        phone_number: form.phoneNumber,
        password:     form.password,
        subscription: 'free',
        role:         'client',
      });
      if (res.status !== 201) throw new Error(res.data?.detail || 'Signup failed');
      setDone(true);
      setTimeout(() => navigate('/HireLogin'), 3200);
    } catch (err) {
      setApiErr(err.response?.data?.detail || err.message || 'Signup failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="hs-root">

        {/* ── LEFT PANEL ── */}
        <div className="hs-left">
          <div className="hs-grid-lines"/>
          {/* <span className="hs-eyebrow"><span className="hs-dot"/>KaaKazini</span> */}
          <h1 className="hs-headline">
            Hire skilled<br/>craftsmen.<br/><em>Get it done right.</em>
          </h1>
          <p className="hs-desc">
            Kenya's verified marketplace for craftsmen and artisans.
            Browse portfolios, read reviews, hire directly.
          </p>
          <ul className="hs-perks">
            {[
              'Every craftsman is manually verified',
              'Real portfolios & honest reviews',
              'Direct hire — no commission for clients',
              'Track your job from request to completion',
            ].map((t, i) => (
              <li className="hs-perk" key={i}>
                <span className="hs-tick"><i className="fas fa-check"/></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="hs-right">
          <div className="hs-box">

            

            <h2 className="hs-title">Create your account</h2>
            <p className="hs-sub">Join thousands of clients hiring skilled craftsmen across Kenya</p>

            {apiErr && (
              <div className="hs-api-err">
                <i className="fas fa-exclamation-circle"/>{apiErr}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              <div className="hs-f">
                <label className="hs-lbl" htmlFor="fullName">Full name</label>
                <input
                  id="fullName" name="fullName" type="text"
                  className={`hs-inp ${errors.fullName ? 'err' : ''}`}
                  placeholder="clientname"
                  value={form.fullName} onChange={handleChange}
                  disabled={loading} autoComplete="name"
                />
                {errors.fullName && <div className="hs-err-txt">{errors.fullName}</div>}
              </div>

              <div className="hs-g2">
                <div className="hs-f">
                  <label className="hs-lbl" htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    className={`hs-inp ${errors.email ? 'err' : ''}`}
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    disabled={loading} autoComplete="email"
                  />
                  {errors.email && <div className="hs-err-txt">{errors.email}</div>}
                </div>
                <div className="hs-f">
                  <label className="hs-lbl" htmlFor="phoneNumber">Phone</label>
                  <input
                    id="phoneNumber" name="phoneNumber" type="tel"
                    className={`hs-inp ${errors.phoneNumber ? 'err' : ''}`}
                    placeholder="2547XXXXXXXX"
                    value={form.phoneNumber} onChange={handleChange}
                    disabled={loading} autoComplete="tel"
                  />
                  {errors.phoneNumber
                    ? <div className="hs-err-txt">{errors.phoneNumber}</div>
                    : <div className="hs-hint">Kenyan format: 2547…</div>}
                </div>
              </div>

              <div className="hs-g2">
                <div className="hs-f">
                  <label className="hs-lbl" htmlFor="password">Password</label>
                  <div className="hs-pw-wrap">
                    <input
                      id="password" name="password"
                      type={showPw ? 'text' : 'password'}
                      className={`hs-inp ${errors.password ? 'err' : ''}`}
                      placeholder="Min 8 chars"
                      value={form.password} onChange={handleChange}
                      disabled={loading} style={{ paddingRight: 42 }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="hs-eye" onClick={() => setShowPw(!showPw)} tabIndex="-1">
                      <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}/>
                    </button>
                  </div>
                  {errors.password && <div className="hs-err-txt">{errors.password}</div>}
                </div>
                <div className="hs-f">
                  <label className="hs-lbl" htmlFor="confirmPassword">Confirm</label>
                  <div className="hs-pw-wrap">
                    <input
                      id="confirmPassword" name="confirmPassword"
                      type={showCpw ? 'text' : 'password'}
                      className={`hs-inp ${errors.confirmPassword ? 'err' : ''}`}
                      placeholder="Repeat password"
                      value={form.confirmPassword} onChange={handleChange}
                      disabled={loading} style={{ paddingRight: 42 }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="hs-eye" onClick={() => setShowCpw(!showCpw)} tabIndex="-1">
                      <i className={`fas ${showCpw ? 'fa-eye-slash' : 'fa-eye'}`}/>
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="hs-err-txt">{errors.confirmPassword}</div>}
                </div>
              </div>

              <button type="submit" className="hs-btn" disabled={loading}>
                {loading
                  ? <><span className="hs-spin"/>Creating account…</>
                  : <><i className="fas fa-user-plus"/>Create account — free</>
                }
              </button>
            </form>

            <div className="hs-login-row">
              Already have an account? <Link to="/HireLogin">Log in</Link>
            </div>

          </div>
        </div>
      </div>

      {/* Success overlay */}
      {done && (
        <div className="hs-ok-bg">
          <div className="hs-ok-card">
            <div className="hs-ok-icon"><i className="fas fa-check"/></div>
            <h3 className="hs-ok-title">You're in!</h3>
            <p className="hs-ok-sub">
              Welcome to KaaKazini. Check your email to verify your account.
              Redirecting to login…
            </p>
            <div className="hs-ok-bar"><div className="hs-ok-fill"/></div>
          </div>
        </div>
      )}
    </>
  );
};

export default HireSignup;
