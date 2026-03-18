import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axiosClient";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cs-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Outfit', sans-serif;
  background: #0d0d0d;
}

.cs-left {
  background: #0d0d0d;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 44px;
  overflow: hidden;
  border-right: 1px solid rgba(255,215,0,.08);
}

.cs-left::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.07) 0%, transparent 65%);
  pointer-events: none;
}

.cs-left::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.04) 0%, transparent 65%);
  pointer-events: none;
}

.cs-grid-lines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,215,0,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,215,0,.03) 1px, transparent 1px);
  background-size: 44px 44px;
}

.cs-logo {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 36px;
}

.cs-logo-mark {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(255,215,0,.1);
  border: 1.5px solid rgba(255,215,0,.25);
  display: flex; align-items: center; justify-content: center;
}

.cs-logo-mark i { color: #FFD700; font-size: .9rem; }
.cs-logo-name { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -.01em; }

.cs-eyebrow {
  position: relative; z-index: 1;
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,215,0,.1);
  border: 1px solid rgba(255,215,0,.25);
  border-radius: 4px;
  padding: 5px 14px;
  margin-bottom: 20px;
  font-size: .64rem; font-weight: 700; color: #FFD700;
  letter-spacing: .12em; text-transform: uppercase;
  width: fit-content;
}

.cs-dot { width: 5px; height: 5px; border-radius: 50%; background: #FFD700; }

.cs-headline {
  position: relative; z-index: 1;
  font-size: clamp(1.8rem, 2.8vw, 2.6rem);
  font-weight: 900; color: #fff;
  line-height: 1.1; margin-bottom: 16px;
  letter-spacing: -.03em;
}

.cs-headline em { font-style: italic; color: #FFD700; font-weight: 800; }

.cs-desc {
  position: relative; z-index: 1;
  font-size: .86rem; color: rgba(255,255,255,.45);
  line-height: 1.85; max-width: 360px; margin-bottom: 36px;
  font-weight: 400;
}

.cs-perks {
  position: relative; z-index: 1;
  list-style: none;
  display: flex; flex-direction: column; gap: 12px;
}

.cs-perk {
  display: flex; align-items: center; gap: 11px;
  font-size: .8rem; color: rgba(255,255,255,.65); font-weight: 500;
}

.cs-tick {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,215,0,.1);
  border: 1.5px solid rgba(255,215,0,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: .5rem; color: #FFD700;
}

.cs-right {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 68px;
  overflow-y: auto;
}

.cs-box { width: 100%; max-width: 420px; }

.cs-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }

.cs-brand-mark {
  width: 36px; height: 36px; border-radius: 9px;
  background: #0d0d0d;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}

.cs-brand-mark i { color: #FFD700; font-size: .88rem; }
.cs-brand-name { font-size: 1.1rem; font-weight: 800; color: #0d0d0d; letter-spacing: -.01em; }

.cs-title { font-size: 2rem; font-weight: 900; color: #0d0d0d; margin-bottom: 5px; letter-spacing: -.03em; }
.cs-sub   { font-size: .84rem; color: #64748b; margin-bottom: 24px; font-weight: 500; }

.cs-err {
  background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px;
  padding: 11px 14px; margin-bottom: 18px;
  font-size: .8rem; color: #b91c1c;
  display: flex; align-items: center; gap: 8px; font-weight: 600;
}

.cs-info {
  background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px;
  padding: 11px 14px; margin-bottom: 18px;
  font-size: .8rem; color: #1e40af;
  display: flex; align-items: center; gap: 8px; font-weight: 600;
}

.cs-success {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  background: #f0fdf4; border: 2px solid #86efac; color: #16a34a;
  padding: 14px 22px; border-radius: 12px;
  font-size: .88rem; font-weight: 600;
  z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,.15);
  min-width: 320px; text-align: center;
  animation: cs-slidedown .4s ease-out;
}

@keyframes cs-slidedown {
  from { opacity:0; transform: translate(-50%, -16px); }
  to   { opacity:1; transform: translate(-50%, 0); }
}

.cs-field { margin-bottom: 15px; }

.cs-lbl {
  display: block;
  font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: #475569; margin-bottom: 7px;
}

.cs-inp {
  width: 100%; padding: 13px 15px;
  font-size: .9rem; font-weight: 500;
  border: 2px solid #e2e8f0; border-radius: 12px;
  background: #fff; color: #1e293b;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

.cs-inp:focus { border-color: #FFD700; box-shadow: 0 0 0 4px rgba(255,215,0,.12); }
.cs-inp:disabled { background: #f8fafc; cursor: not-allowed; }

.cs-pw-wrap { position: relative; }

.cs-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #94a3b8;
  cursor: pointer; font-size: .84rem; padding: 4px;
  transition: color .15s; line-height: 1;
}

.cs-eye:hover { color: #0d0d0d; }
.cs-hint    { font-size: .72rem; color: #94a3b8; margin-top: 5px; font-weight: 500; }
.cs-err-txt { font-size: .72rem; color: #dc2626; margin-top: 5px; font-weight: 600; }

.cs-btn {
  width: 100%; padding: 14px;
  font-size: .92rem; font-weight: 800;
  background: linear-gradient(135deg, #FFD700, #e6c200);
  color: #0d0d0d; border: none; border-radius: 12px;
  cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all .2s;
  box-shadow: 0 6px 22px rgba(255,215,0,.35);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  letter-spacing: -.01em; margin-top: 8px;
}

.cs-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(255,215,0,.45); filter: brightness(1.05); }
.cs-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

@keyframes cs-spin { to { transform: rotate(360deg); } }

.cs-spin {
  display: inline-block; width: 14px; height: 14px;
  border: 2.5px solid rgba(0,0,0,.2); border-top-color: #0d0d0d;
  border-radius: 50%; animation: cs-spin .7s linear infinite;
}

.cs-div { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
.cs-div-line { flex: 1; height: 1px; background: #e2e8f0; }
.cs-div-txt  { font-size: .68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; }

.cs-google-wrap { margin-bottom: 18px; }

.cs-login { text-align: center; font-size: .83rem; color: #64748b; }
.cs-login a { color: #0d0d0d; font-weight: 800; text-decoration: none; border-bottom: 2px solid #FFD700; padding-bottom: 1px; transition: color .15s; }
.cs-login a:hover { color: #e6c200; }

@media (max-width: 780px) {
  .cs-root  { grid-template-columns: 1fr; }
  .cs-left  { display: none; }
  .cs-right { padding: 44px 24px; background: #fff; }
}
`;

const Signup = () => {
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordStrong = (pw) => pw.length >= 8;
  const isPhoneNumberValid = (number) => /^2547\d{8}$/.test(number);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (!isPasswordStrong(password)) { setPasswordError('Password should be at least 8 characters long'); return; }
    setPasswordError('');
    if (!isPhoneNumberValid(phoneNumber)) { setPhoneError('Enter a valid Kenyan phone number (e.g., 2547XXXXXXXX)'); return; }
    setPhoneError('');
    setApiError(null);

    const userData = { full_name: fullName, email, password, subscription: 'free', phone_number: phoneNumber };
    try {
      setLoading(true);
      const res = await api.post('/signup/', userData);
      if (res.status !== 201) throw new Error(res.data.detail || 'Signup failed');
      setSuccessMessage('Welcome! A confirmation email has been sent to your inbox. Redirecting to login...');
      setTimeout(() => { setSuccessMessage(''); navigate('/login'); }, 3000);
    } catch (error) {
      setApiError(error.response?.data?.detail || error.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const handleGoogleResponse = async (response) => {
    const token = response?.credential;
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.post('/google-login/', { token, role: "craftsman" });
      const userData = res.data.user;
      if (!userData.full_name || !userData.phone_number) {
        navigate('/onboarding', { state: { fullName: userData.full_name || '', phoneNumber: userData.phone_number || '' } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err.message);
      setApiError('Google signup failed.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: '551247510793-ria1stm1obcn36nkkl2is4tknoqaj2sv.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', width: '100%', text: 'signup_with',
      });
    }
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {successMessage && <div className="cs-success">{successMessage}</div>}

      <div className="cs-root">

        {/* ── LEFT PANEL ── */}
        <div className="cs-left">
          <div className="cs-grid-lines"/>

          

          

          <h1 className="cs-headline">
            Your craft.<br/>Your income.<br/><em>Your platform.</em>
          </h1>

          <p className="cs-desc">
            Join Kenya's verified craftsman marketplace. Create your profile,
            showcase your work, and start receiving jobs today.
          </p>

          <ul className="cs-perks">
            {[
              'Free to join — no upfront fees',
              'Receive job requests directly in your dashboard',
              'Build a verified portfolio clients trust',
              'Get paid securely via M-Pesa',
            ].map((t, i) => (
              <li className="cs-perk" key={i}>
                <span className="cs-tick"><i className="fas fa-check"/></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="cs-right">
          <div className="cs-box">

           

            <h2 className="cs-title">Create account</h2>
            <p className="cs-sub">Join as a craftsman and start earning</p>

            {apiError && (
              <div className="cs-err">
                <i className="fas fa-exclamation-circle"/>{apiError}
              </div>
            )}
            {loading && !successMessage && (
              <div className="cs-info">
                <i className="fas fa-circle-notch fa-spin"/>Processing registration…
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="cs-field">
                <label className="cs-lbl" htmlFor="fullName">Company or Group Name</label>
                <input id="fullName" type="text" className="cs-inp"
                  placeholder="Enter your company name"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  required autoComplete="organization" disabled={loading}
                />
              </div>

              <div className="cs-field">
                <label className="cs-lbl" htmlFor="email">Email address</label>
                <input id="email" type="email" className="cs-inp"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" disabled={loading}
                />
              </div>

              <div className="cs-field">
                <label className="cs-lbl" htmlFor="phone">Phone number</label>
                <input id="phone" type="tel" className="cs-inp"
                  placeholder="2547XXXXXXXX"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  required autoComplete="tel" disabled={loading}
                />
                {phoneError
                  ? <p className="cs-err-txt">{phoneError}</p>
                  : <p className="cs-hint">Kenyan number in format 2547XXXXXXXX</p>
                }
              </div>

              <div className="cs-field">
                <label className="cs-lbl" htmlFor="password">Password</label>
                <div className="cs-pw-wrap">
                  <input id="password" type={showPassword ? 'text' : 'password'}
                    className="cs-inp" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="new-password" disabled={loading}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="cs-eye"
                    onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}/>
                  </button>
                </div>
                <p className="cs-hint">At least 8 characters</p>
              </div>

              <div className="cs-field">
                <label className="cs-lbl" htmlFor="confirmPassword">Confirm password</label>
                <div className="cs-pw-wrap">
                  <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                    className="cs-inp" placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required autoComplete="new-password" disabled={loading}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="cs-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}/>
                  </button>
                </div>
                {passwordError && <p className="cs-err-txt">{passwordError}</p>}
              </div>

              <button type="submit" className="cs-btn" disabled={loading}>
                {loading
                  ? <><span className="cs-spin"/>Creating account…</>
                  : <><i className="fas fa-user-plus"/>Sign up</>
                }
              </button>
            </form>

            <div className="cs-div">
              <div className="cs-div-line"/>
              <span className="cs-div-txt">Or continue with</span>
              <div className="cs-div-line"/>
            </div>

            <div className="cs-google-wrap" ref={googleButtonRef}/>

            <p className="cs-login">
              Already have an account?{' '}
              <Link to="/login">Log in</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
