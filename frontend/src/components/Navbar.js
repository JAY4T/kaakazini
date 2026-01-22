import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/kaz.svg';
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { user, logout, loadingUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (menuOpen) setServicesOpen(false); 
  };

  const toggleServices = (e) => {
    e.stopPropagation();
    setServicesOpen(!servicesOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    handleLinkClick();
    navigate("/");
  };

  if (loadingUser) return null; // wait until user is loaded

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
        .btn-logout { background-color: #dc3545; color: white; border: none; }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleLinkClick}>
            <img src={logo} alt="KaaKazini Logo" style={{ height: '80px', width: 'auto' }} className="d-inline-block align-text-top" />
            <span className="ms-2 fw-bold">KAAKAZINI</span>
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" onClick={toggleMenu}>
            <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
          </button>

          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto d-flex align-items-center">
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/craftsmen" onClick={handleLinkClick}>Craftsmen</Link>
              </li>

              <li className="nav-item dropdown" onClick={toggleServices} style={{ cursor: "pointer" }}>
                <span className="nav-link fs-5 d-flex align-items-center justify-content-end">
                  Services
                  <span style={{ display: "inline-block", marginRight: "8px", fontSize: "12px", transition: "transform 0.2s", transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </span>
                {servicesOpen && (
                  <ul className="dropdown-menu show border-0">
                    <li><Link className="dropdown-item py-2" to="/services" onClick={handleLinkClick}>What We Offer</Link></li>
                    <li><Link className="dropdown-item py-2" to="/business" onClick={handleLinkClick}>Grow Your Business</Link></li>
                  </ul>
                )}
              </li>

              {!user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/login" onClick={handleLinkClick}>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="btn btn-yellow-solid fw-semibold px-4 py-2 rounded-pill ms-lg-2" onClick={handleLinkClick}>Join Now</Link>
                  </li>
                </>
              )}

              {user && (
                <>
                  <li className="nav-item">
                    <span className="nav-link fs-5">Hi, {user.full_name || user.name || "User"}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-logout rounded-pill ms-lg-2 px-3 py-1" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
