import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/kazini.png'; // <-- import your logo

function Navbar({ cart }) {
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Menu open state

  // Calculate the total number of items in the cart
  const totalItems = Object.values(cart || {}).reduce((total, quantity) => total + quantity, 0);

  // Toggle menu
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Close menu when a link is clicked
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
  <div className="container">
    <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleLinkClick}>
      <img
        src={logo}
        alt="KaaKazini Logo"
        height="80"
        style={{ maxHeight: '80px', width: 'auto' }}
        className="d-inline-block align-text-top"
      />
    </Link>

    {/* Hamburger Button */}
    <button
      className="navbar-toggler border-0"
      type="button"
      onClick={toggleMenu}
      aria-label="Toggle navigation"
    >
      <span className="fs-3">{menuOpen ? '✖' : '☰'}</span>
    </button>

    {/* Navbar Links */}
    <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
      <ul className="navbar-nav ms-auto d-flex align-items-center">
        <li className="nav-item">
          <Link className="nav-link" to="/craftsmen" onClick={handleLinkClick}>
            Craftsmen
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/services" onClick={handleLinkClick}>
            Services
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin-login" onClick={handleLinkClick}>
            {/* Admin */}
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/login" onClick={handleLinkClick}>
            Login
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/signup"
            className="btn btn-green-solid ms-2 rounded-pill"
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