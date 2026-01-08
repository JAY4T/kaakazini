import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/kaz.svg';

function Navbar({ cart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (menuOpen) setServicesOpen(false); // Close sub-menu if closing main menu
  };

  const toggleServices = (e) => {
    e.stopPropagation();
    setServicesOpen(!servicesOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <>
      <style>{`
        /* Mobile Specific Layout */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            /* Positioning the menu to the right */
            position: absolute;
            top: 100%;
            right: 0;
            
            /* Width based on content */
            width: fit-content;
            min-width: 200px;
            max-width: 80%;
            
            /* Styling */
            background-color: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid #eee;
            z-index: 1050;
          }

          .navbar-nav {
            align-items: text-center !important; /* Align text to the right */
            gap: 10px !important;
          }

          .nav-link {
            padding: 8px 0 !important;
            text-align: right;
            width: 100%;
          }

          .dropdown-menu.show {
            position: static;
            float: none;
            border: none;
            background: #f9f9f9;
            padding-right: 10px;
            margin-top: 5px;
            text-align: right;
          }
        }

        /* Hover effect for desktop Services */
        @media (min-width: 992px) {
          .nav-item.dropdown:hover .dropdown-menu {
            display: block;
          }
        }

        .btn-yellow-solid {
          background-color: #ffc107;
          border: none;
          color: black;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container position-relative">
          
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleLinkClick}>
            <img
              src={logo}
              alt="KaaKazini Logo"
              style={{ height: '80px', width: 'auto' }} 
              className="d-inline-block align-text-top"
            /> 
            <span className="ms-2 fw-bold">KAAKAZINI</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="fs-3">{menuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Collapsible Menu */}
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto d-flex align-items-center">

              <li className="nav-item">
                <Link className="nav-link fs-5" to="/craftsmen" onClick={handleLinkClick}>
                  Craftsmen
                </Link>
              </li>

              {/* SERVICES DROPDOWN */}
              <li className="nav-item dropdown" onClick={toggleServices} style={{ cursor: "pointer" }}>
                <span className="nav-link fs-5 d-flex align-items-center justify-content-end">
                  Services
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: "8px",
                      fontSize: "12px",
                      transition: "transform 0.2s",
                      transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </span>

                {servicesOpen && (
                  <ul className="dropdown-menu show border-0">
                    <li>
                      <Link className="dropdown-item py-2" to="/services" onClick={handleLinkClick}>
                        What We Offer
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/business" onClick={handleLinkClick}>
                        Grow Your Business
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <Link className="nav-link fs-5" to="/login" onClick={handleLinkClick}>
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/signup"
                  className="btn btn-yellow-solid fw-semibold px-4 py-2 rounded-pill ms-lg-2"
                  onClick={handleLinkClick}
                >
                  Join Now
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;