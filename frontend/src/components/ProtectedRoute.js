import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-5">Checking authentication...</div>;
  }

  if (!user) {
    // ✅ Send to the correct login page based on which route is being protected
    // Craftsman routes → craftsman login (/login)
    // Client routes    → client login (/HireLogin)
    // Unknown          → client login as default
    const loginPath = role === 'craftsman' ? '/login' : '/HireLogin';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // User is logged in but wrong role — send to their own dashboard
    if (user.role === 'craftsman') return <Navigate to="/craftsman-dashboard" replace />;
    if (user.role === 'client')    return <Navigate to="/hire" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;