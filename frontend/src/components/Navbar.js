import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/kaz.svg';
import craftsmanImg from '../assets/craftsman.jpg';
import clientImg    from '../assets/client.jpg';
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

  const roleRef = useRef(null);
  useEffect(() => {
    if (user?.role) roleRef.current = user.role;
  }, [user]);

  const isHidden = HIDDEN_ON.some(r => pathname === r || pathname.startsWith(r + '/'));

  useEffect(() => {
    const nav = document.querySelector('.navbar');
    if (nav && !isHidden) {
      document.body.style.paddingTop = `${nav.offsetHeight}px`;
    } else {
      document.body.style.paddingTop = '0px';
    }
    return () => { document.body.style.paddingTop = ''; };
  }, [isHidden]);

  if (isHidden) return null;
  if (loading)  return null;

  const close = () => { setMenuOpen(false); setServicesOpen(false); };

  const handleLogout = async () => {
    const role = roleRef.current;
    await logout();
    close();
    if (role === 'craftsman') {
      navigate('/login');
    } else if (role === 'client') {
      navigate('/HireLogin');
    } else {
      navigate('/');
    }
  };

  const dashLink = !user ? '/'
    : user.role === 'craftsman' ? '/craftsman-dashboard'
    : user.role === 'client'    ? '/hire'
    : '/';

  const firstName = (user?.full_name || user?.name || 'User').split(' ')[0];

  if (user) {
    return (
      <>
        <style>{`
          @media (max-width: 991.98px) {
            .kk-auth-collapse {
              position: absolute; top: 100%; right: 0;
              width: fit-content; min-width: 220px; max-width: 80%;
              background-color: white; padding: 1rem; border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #eee;
              z-index: 1050;
            }
            .kk-auth-nav-list { align-items: flex-end !important; gap: 10px !important; }
          }
          .kk-auth-logout-btn {
            background-color: #dc3545; color: white; border: none;
            border-radius: 50px; padding: 7px 22px;
            font-weight: 600; font-size: 1rem; cursor: pointer;
            font-family: inherit; transition: background .15s;
          }
          .kk-auth-logout-btn:hover { background-color: #b91c1c; }
        `}</style>

        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top py-2">
          <div className="container position-relative">
            <Link className="navbar-brand d-flex align-items-center" to={dashLink} onClick={close}>
              <img src={logo} alt="KaaKazini Logo" style={{ height: '54px', width: 'auto' }} className="d-inline-block align-text-top"/>
              <span className="ms-2 fw-bold" style={{ fontSize: '1.15rem' }}>KAAKAZINI</span>
            </Link>
            <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuOpen(v => !v)}>
              <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
            </button>
            <div className={`collapse navbar-collapse kk-auth-collapse ${menuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav ms-auto d-flex align-items-center kk-auth-nav-list">
                <li className="nav-item">
                  <span className="nav-link" style={{ fontSize: '1.15rem' }}>Hi, {firstName}</span>
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

  return (
    <>
      <style>{`
        @media (max-width: 991.98px) {
          .navbar-collapse { position: absolute; top: 100%; right: 0; width: fit-content; min-width: 220px; max-width: 80%; background-color: white; padding: 1rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #eee; z-index: 1050; }
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
        @keyframes kk-slide-up {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .kk-join-modal {
          background: #fff; border-radius: 24px;
          width: 100%; max-width: 500px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,.3);
          font-family: inherit; animation: kk-slide-up .25s ease; position: relative;
        }
        .kk-join-close {
          position: absolute; top: 14px; right: 14px; z-index: 3;
          background: rgba(255,255,255,.92); border: 1px solid #e2e8f0;
          width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
          font-size: .85rem; color: #64748b;
          display: flex; align-items: center; justify-content: center; transition: all .15s;
        }
        .kk-join-close:hover { background: #f1f5f9; color: #1e293b; }

        .kk-modal-head { padding: 24px 24px 17px; }
        .kk-modal-head .eyebrow { font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #16a34a; margin: 0 0 7px; }
        .kk-modal-head h2 { font-size: 1.3rem; font-weight: 900; color: #0d0d0d; margin: 0 0 4px; letter-spacing: -.02em; }
        .kk-modal-head .sub { font-size: .82rem; color: #64748b; margin: 0; }

        .kk-join-cards { display: grid; grid-template-columns: 1fr 1fr; border-top: 1.5px solid #f1f5f9; }

        .kk-join-card { display: flex; flex-direction: column; overflow: hidden; }
        .kk-join-card.craftsman { border-right: 1.5px solid #f1f5f9; }
        .kk-join-card.craftsman:hover .kk-join-card-body { background: #fefce8; }
        .kk-join-card.client:hover .kk-join-card-body { background: #f0fdf4; }

        .kk-join-card-banner {
          position: relative; height: 150px; overflow: hidden; display: flex;
          align-items: center; justify-content: center;
        }
        .kk-join-card.craftsman .kk-join-card-banner { background: #1a1a2e; }
        .kk-join-card.client    .kk-join-card-banner { background: #0d2e18; }

        .kk-join-card-banner img {
          width: 100%; height: 100%; object-fit: cover; object-position: center top;
          display: block;
        }
        .kk-join-card-banner-label {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 28px 14px 10px;
          background: linear-gradient(to top, rgba(0,0,0,.65), transparent);
          font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
        }
        .kk-join-card.craftsman .kk-join-card-banner-label { color: #FFD700; }
        .kk-join-card.client    .kk-join-card-banner-label { color: #86efac; }

        .kk-join-card-body { padding: 15px 15px 17px; display: flex; flex-direction: column; flex: 1; transition: background .15s; }
        .kk-join-card-title { font-size: .9rem; font-weight: 800; color: #0d0d0d; margin: 0 0 5px; }
        .kk-join-card-desc { font-size: .72rem; color: #64748b; margin: 0 0 13px; line-height: 1.55; flex: 1; font-weight: 500; }
        .kk-join-card-links { display: flex; flex-direction: column; gap: 7px; }

        .kk-join-card-signup {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: .78rem; font-weight: 700; text-decoration: none;
        }
        .kk-join-card.craftsman .kk-join-card-signup { color: #ca8a04; }
        .kk-join-card.client    .kk-join-card-signup { color: #16a34a; }

        .kk-join-card-login { font-size: .69rem; color: #94a3b8; text-decoration: none; }
        .kk-join-card-login span { color: #0d0d0d; font-weight: 600; }
        .kk-join-card.craftsman .kk-join-card-login span { border-bottom: 1.5px solid #ffc107; }
        .kk-join-card.client    .kk-join-card-login span { border-bottom: 1.5px solid #16a34a; }

        .kk-join-login {
          text-align: center; font-size: .77rem; color: #94a3b8;
          padding: 12px 24px; border-top: 1px solid #f1f5f9; margin: 0;
        }
        .kk-join-login a { color: #0d0d0d; font-weight: 800; text-decoration: none; border-bottom: 2px solid #FFD700; padding-bottom: 1px; }
        .kk-join-login a:hover { color: #e6c200; }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top py-2">
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={close}>
            <img src={logo} alt="KaaKazini Logo" style={{ height: '54px', width: 'auto' }} className="d-inline-block align-text-top"/>
            <span className="ms-2 fw-bold" style={{ fontSize: '1.15rem' }}>KAAKAZINI</span>
          </Link>
          <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuOpen(v => !v)}>
            <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto d-flex align-items-center gap-1">
              <li className="nav-item">
                <Link className="nav-link" to="/craftsmen" onClick={close} style={{ fontSize: '1.15rem' }}>Craftsmen</Link>
              </li>
              <li className="nav-item dropdown" onClick={e => { e.stopPropagation(); setServicesOpen(v => !v); }} style={{ cursor: 'pointer' }}>
                <span className="nav-link d-flex align-items-center justify-content-end" style={{ fontSize: '1.15rem' }}>
                  Services
                  <span style={{ display:'inline-block', marginLeft:'5px', fontSize:'11px', transition:'transform 0.2s', transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </span>
                {servicesOpen && (
                  <ul className="dropdown-menu show border-0 shadow-sm">
                    <li><Link className="dropdown-item py-2" to="/services" onClick={close} style={{ fontSize: '1rem' }}>What We Offer</Link></li>
                    <li><Link className="dropdown-item py-2" to="/business" onClick={close} style={{ fontSize: '1rem' }}>Grow Your Business</Link></li>
                  </ul>
                )}
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={close} style={{ fontSize: '1.15rem' }}>Login</Link>
              </li>
              <li className="nav-item ms-lg-1">
                <button
                  className="btn btn-yellow-solid fw-semibold rounded-pill"
                  style={{ border:'none', cursor:'pointer', padding: '8px 24px', fontSize: '1rem' }}
                  onClick={() => { close(); setJoinModal(true); }}>
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

            <div className="kk-modal-head">
              <p className="eyebrow">KaaKazini</p>
              <h2>Join the platform</h2>
              <p className="sub">Who are you here as?</p>
            </div>

            <div className="kk-join-cards">

              <div className="kk-join-card craftsman">
                <div className="kk-join-card-banner">
                  <img src={craftsmanImg} alt="Craftsman"/>
                  <span className="kk-join-card-banner-label">Craftsman</span>
                </div>
                <div className="kk-join-card-body">
                  <p className="kk-join-card-title">I'm a Craftsman</p>
                  <p className="kk-join-card-desc">Create a profile, showcase your work, and receive job requests</p>
                  <div className="kk-join-card-links">
                    <Link to="/signup" className="kk-join-card-signup" onClick={() => setJoinModal(false)}>
                      Sign up
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                    <Link to="/login" className="kk-join-card-login" onClick={() => setJoinModal(false)}>
                      Already have an account? <span>Log in</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="kk-join-card client">
                <div className="kk-join-card-banner">
                  <img src={clientImg} alt="Client"/>
                  <span className="kk-join-card-banner-label">Client</span>
                </div>
                <div className="kk-join-card-body">
                  <p className="kk-join-card-title">I'm a Client</p>
                  <p className="kk-join-card-desc">Find and hire skilled craftsmen for your home or business</p>
                  <div className="kk-join-card-links">
                    <Link to="/HireSignUp" className="kk-join-card-signup" onClick={() => setJoinModal(false)}>
                      Sign up
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                    <Link to="/HireLogin" className="kk-join-card-login" onClick={() => setJoinModal(false)}>
                      Already have an account? <span>Log in</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            <p className="kk-join-login">
              Craftsman login? <Link to="/login" onClick={() => setJoinModal(false)}>Log in here</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
