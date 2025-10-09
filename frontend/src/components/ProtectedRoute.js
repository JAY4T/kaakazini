// ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("access_token"); // 👈 match HireLogin.js
  const location = useLocation();

  if (!token) {
    // redirect to login page, keep track of where user was going
    return <Navigate to="/HireLogin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
