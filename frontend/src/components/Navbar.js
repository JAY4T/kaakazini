import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/kazini.png'; // <-- import your logo

function Navbar({ cart }) {
  // Calculate the total number of items in the cart
  const totalItems = Object.values(cart || {}).reduce((total, quantity) => total + quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="KaaKazini Logo"
            height="80"
            style={{ maxHeight: '80px', width: 'auto' }}
            className="d-inline-block align-text-top"
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item">
            <Link className="nav-link" to="/craftsmen">Craftsmen</Link>
           </li>
           <li className="nav-item">
           <Link className="nav-link" to="/services">Services</Link>
           </li>
            <li className="nav-item">
               <Link className="nav-link" to="/admin-login">Admin</Link> 
            </li>

            <li className="nav-item">
              {/* <Link className="nav-link" to="/plans & Pricing ">Plans & Pricing</Link> */}
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary ms-2" to="/signup">Join Now</Link>
            </li>

            
            {/* <li className="nav-item ms-3">
              <Link className="nav-link fs-3" to="/cart">
                🛒 {totalItems > 0 && <span className="badge bg-danger">{totalItems}</span>}
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
