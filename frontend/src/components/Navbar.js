import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/kaz.svg';
import { useAuth } from "../context/AuthContext";

const HIDDEN_ON = [
  '/profile',
  '/craftsman/profile',
  '/admin-dashboard',
];

function Navbar() {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [joinModal,    setJoinModal]    = useState(false);
  const { user, logout, loading }       = useAuth();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  // ✅ Keep a ref that always holds the latest role
  // This is never cleared by logout() so it's always safe to read
  const roleRef = useRef(null);
  useEffect(() => {
    if (user?.role) roleRef.current = user.role;
  }, [user]);

  const isHidden = HIDDEN_ON.some(r => pathname === r || pathname.startsWith(r + '/'));

  useEffect(() => {
    document.body.style.paddingTop = isHidden ? '0px' : '80px';
    return () => { document.body.style.paddingTop = ''; };
  }, [isHidden]);

  if (isHidden) return null;
  if (loading)  return null;

  const close = () => { setMenuOpen(false); setServicesOpen(false); };

  const handleLogout = async () => {
    // ✅ Read from ref — guaranteed not to be cleared by logout()
    const role = roleRef.current;
    await logout();
    close();
    if (role === 'craftsman') {
      navigate('/login');       // → craftsman login
    } else if (role === 'client') {
      navigate('/HireLogin');   // → client login
    } else {
      navigate('/');
    }
  };

  const dashLink = !user ? '/'
    : user.role === 'craftsman' ? '/craftsman-dashboard'
    : user.role === 'client'    ? '/hire'
    : '/';

  const firstName = (user?.full_name || user?.name || 'User').split(' ')[0];

  // ── LOGGED-IN: white navbar — Logo | Hi {Name} | Logout only ─────────────
  if (user) {
    return (
      <>
        <style>{`
          @media (max-width: 991.98px) {
            .kk-auth-collapse {
              position: absolute; top: 100%; right: 0;
              width: fit-content; min-width: 200px; max-width: 80%;
              background-color: white; padding: 1rem; border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #eee;
              z-index: 1050;
            }
            .kk-auth-nav-list { align-items: flex-end !important; gap: 10px !important; }
          }
          .kk-auth-logout-btn {
            background-color: #dc3545; color: white; border: none;
            border-radius: 50px; padding: 6px 18px;
            font-weight: 600; font-size: .9rem; cursor: pointer;
            font-family: inherit; transition: background .15s;
          }
          .kk-auth-logout-btn:hover { background-color: #b91c1c; }
        `}</style>

        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
          <div className="container position-relative">
            <Link className="navbar-brand d-flex align-items-center" to={dashLink} onClick={close}>
              <img src={logo} alt="KaaKazini Logo" style={{ height: '80px', width: 'auto' }} className="d-inline-block align-text-top"/>
              <span className="ms-2 fw-bold">KAAKAZINI</span>
            </Link>
            <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuOpen(v => !v)}>
              <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
            </button>
            <div className={`collapse navbar-collapse kk-auth-collapse ${menuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav ms-auto d-flex align-items-center kk-auth-nav-list">
                <li className="nav-item">
                  <span className="nav-link fs-5 fw-semibold">Hi, {firstName}</span>
                </li>
                <li className="nav-item">
                  <button className="kk-auth-logout-btn ms-lg-2" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // ── GUEST: white navbar — Logo | Craftsmen | Services | Login | Join Now ──
  return (
    <>
      <style>{`
        @media (max-width: 991.98px) {
          .navbar-collapse { position: absolute; top: 100%; right: 0; width: fit-content; min-width: 200px; max-width: 80%; background-color: white; padding: 1rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #eee; z-index: 1050; }
          .navbar-nav { align-items: text-center !important; gap: 10px !important; }
          .nav-link { padding: 8px 0 !important; text-align: right; width: 100%; }
          .dropdown-menu.show { position: static; float: none; border: none; background: #f9f9f9; padding-right: 10px; margin-top: 5px; text-align: right; }
        }
        @media (min-width: 992px) { .nav-item.dropdown:hover .dropdown-menu { display: block; } }
        .btn-yellow-solid { background-color: #ffc107; border: none; color: black; }
        .kk-join-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.6);
          z-index: 2000; display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: kk-fade-in .2s ease;
        }
        @keyframes kk-fade-in { from { opacity:0; } to { opacity:1; } }
        .kk-join-modal {
          background: #fff; border-radius: 24px; padding: 36px 32px 32px;
          width: 100%; max-width: 460px;
          box-shadow: 0 32px 80px rgba(0,0,0,.25);
          font-family: inherit; animation: kk-slide-up .25s ease; position: relative;
        }
        @keyframes kk-slide-up {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .kk-join-close {
          position: absolute; top: 16px; right: 18px;
          background: #f1f5f9; border: none; width: 32px; height: 32px;
          border-radius: 50%; cursor: pointer; font-size: .9rem; color: #64748b;
          display: flex; align-items: center; justify-content: center; transition: all .15s;
        }
        .kk-join-close:hover { background: #e2e8f0; color: #1e293b; }
        .kk-join-modal h2 { font-size: 1.4rem; font-weight: 900; color: #0d0d0d; margin-bottom: 6px; letter-spacing: -.03em; }
        .kk-join-modal > p { font-size: .84rem; color: #64748b; margin-bottom: 28px; font-weight: 500; }
        .kk-join-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
        .kk-join-card {
          border: 2px solid #e2e8f0; border-radius: 16px; padding: 22px 18px;
          cursor: pointer; transition: all .18s; text-decoration: none;
          display: flex; flex-direction: column; align-items: center; gap: 12px; background: #fff;
        }
        .kk-join-card:hover { border-color: #FFD700; box-shadow: 0 8px 28px rgba(255,215,0,.18); transform: translateY(-3px); }
        .kk-join-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
        .kk-join-card-title { font-size: .95rem; font-weight: 800; color: #0d0d0d; text-align: center; }
        .kk-join-card-desc { font-size: .72rem; color: #64748b; text-align: center; line-height: 1.5; font-weight: 500; }
        .kk-join-card.craftsman .kk-join-icon { background: linear-gradient(135deg, #0d0d0d, #1a1a2e); }
        .kk-join-card.client:hover { border-color: #22c55e; box-shadow: 0 8px 28px rgba(34,197,94,.15); }
        .kk-join-card.client .kk-join-icon { background: linear-gradient(135deg, #15803d, #16a34a); }
        .kk-join-login { text-align: center; font-size: .82rem; color: #94a3b8; }
        .kk-join-login a { color: #0d0d0d; font-weight: 800; text-decoration: none; border-bottom: 2px solid #FFD700; padding-bottom: 1px; }
        .kk-join-login a:hover { color: #e6c200; }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={close}>
            <img src={logo} alt="KaaKazini Logo" style={{ height: '80px', width: 'auto' }} className="d-inline-block align-text-top"/>
            <span className="ms-2 fw-bold">KAAKAZINI</span>
          </Link>
          <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuOpen(v => !v)}>
            <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto d-flex align-items-center">
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/craftsmen" onClick={close}>Craftsmen</Link>
              </li>
              <li className="nav-item dropdown" onClick={e => { e.stopPropagation(); setServicesOpen(v => !v); }} style={{ cursor: 'pointer' }}>
                <span className="nav-link fs-5 d-flex align-items-center justify-content-end">
                  Services
                  <span style={{ display:'inline-block', marginRight:'8px', fontSize:'12px', transition:'transform 0.2s', transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </span>
                {servicesOpen && (
                  <ul className="dropdown-menu show border-0">
                    <li><Link className="dropdown-item py-2" to="/services" onClick={close}>What We Offer</Link></li>
                    <li><Link className="dropdown-item py-2" to="/business" onClick={close}>Grow Your Business</Link></li>
                  </ul>
                )}
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/login" onClick={close}>Login</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-yellow-solid fw-semibold px-4 py-2 rounded-pill ms-lg-2"
                  onClick={() => { close(); setJoinModal(true); }} style={{ border:'none', cursor:'pointer' }}>
                  Join Now
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {joinModal && (
        <div className="kk-join-overlay" onClick={() => setJoinModal(false)}>
          <div className="kk-join-modal" onClick={e => e.stopPropagation()}>
            <button className="kk-join-close" onClick={() => setJoinModal(false)}>✕</button>
            <h2>Join KaaKazini</h2>
            <p>Choose how you want to use the platform</p>
            <div className="kk-join-cards">
              <Link to="/signup" className="kk-join-card craftsman" onClick={() => setJoinModal(false)}>
                <span className="kk-join-icon">🔨</span>
                <span className="kk-join-card-title">I'm a Craftsman</span>
                <span className="kk-join-card-desc">Create a profile, showcase your work, and receive job requests</span>
              </Link>
              <Link to="/HireSignUp" className="kk-join-card client" onClick={() => setJoinModal(false)}>
                <span className="kk-join-icon">🏠</span>
                <span className="kk-join-card-title">I'm a Client</span>
                <span className="kk-join-card-desc">Find and hire skilled craftsmen for your home or business</span>
              </Link>
            </div>
            <p className="kk-join-login">
              Already have an account? <Link to="/login" onClick={() => setJoinModal(false)}>Log in</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;