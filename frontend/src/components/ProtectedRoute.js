// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner or text while auth status is being checked
  if (loading) {
    return <div className="text-center mt-5">Checking authentication...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/HireLogin" state={{ from: location }} replace />;
  }

  // User logged in but role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/" replace />; // redirect to homepage or "unauthorized" page
  }

  // Authorized
  return children;
};

export default ProtectedRoute;
