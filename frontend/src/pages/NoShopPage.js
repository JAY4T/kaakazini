import React from "react";
import { Link } from "react-router-dom";

const NoShopPage = () => (
  <div className="container text-center py-5">
    {/* Cart Shop Avatar */}
    <div className="d-flex justify-content-center mb-3">
      <img
        src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" 
        alt="No Shop"
        style={{ width: "120px", height: "120px", borderRadius: "20px" }}
      />
    </div>

    {/* Message */}
    <h2 className="fw-bold text-primary">No Shop Available</h2>
    <p className="text-muted">
      This craftsman has not set up a shop yet.  
      You can still <strong>hire them directly for their services</strong>.
    </p>

    {/* Hire Now Button */}
    <div className="mt-3">
      <Link to="/HireSignUp" className="btn btn-primary fw-bold px-4">
        Hire Now
      </Link>
    </div>
  </div>
);

export default NoShopPage;
