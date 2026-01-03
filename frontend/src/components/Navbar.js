import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import logo from '../assets/kazini.png';
import logo from '../assets/kaz.svg';


function Navbar({ cart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // NEW: for arrow toggle

  const totalItems = Object.values(cart || {}).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleServices = () => setServicesOpen(!servicesOpen); // NEW

  const handleLinkClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleLinkClick}>
          <img
            src={logo}
            alt="KaaKazini Logo"
            height="80"
            style={{ maxHeight: '80px', width: 'auto' }}
            className="d-inline-block align-text-top"
          /> 
           <span className="ms-2 fw-bold">
              KAAKAZINI
           </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="fs-3">{menuOpen ? '✖' : '☰'}</span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">

            {/* Craftsmen */}
            <li className="nav-item">
              <Link className="nav-link fs-5" to="/craftsmen" onClick={handleLinkClick}>
                Craftsmen
              </Link>
            </li>

            {/* SERVICES DROPDOWN WITH FUNDIS-STYLE ARROW */}
            <li
              className="nav-item dropdown"
              onClick={toggleServices}
              style={{ cursor: "pointer" }}
            >
              <span
                className="nav-link fs-5 d-flex align-items-center"
                style={{ whiteSpace: "nowrap" }}
              >
                Services
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: "6px",
                    fontSize: "12px",
                    transition: "transform 0.2s",
                    transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </span>

              {servicesOpen && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    minWidth: "160px",
                    padding: "0",
                    fontSize: "0.9rem",
                  }}
                >
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/services"
                      onClick={handleLinkClick}
                      style={{
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      What We Offer
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/business"
                      onClick={handleLinkClick}
                      style={{
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Grow Your Business
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Admin login */}
            <li className="nav-item">
              <Link className="nav-link fs-5" to="/admin-login" onClick={handleLinkClick}></Link>
            </li>

            {/* Login */}
            <li className="nav-item">
              <Link className="nav-link fs-5" to="/login" onClick={handleLinkClick}>
                Login
              </Link>
            </li>

            {/* Join Now */}
            <li className="nav-item">
              <Link
                to="/signup"
                className="btn fs-5 btn-yellow-solid ms-2 rounded-pill"
              >
                Join Now
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
