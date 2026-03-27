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
    
    const loginPath = role === 'craftsman' ? '/login' : '/HireLogin';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role) {
    

    const effectiveRole = user.active_role || user.role;
    const hasAccess = user.role === role || effectiveRole === role;

    if (!hasAccess) {
      // Redirect to wherever they actually belong right now
      if (effectiveRole === 'craftsman') return <Navigate to="/craftsman-dashboard" replace />;
      if (effectiveRole === 'client')    return <Navigate to="/hire" replace />;
      if (user.role === 'craftsman')     return <Navigate to="/craftsman-dashboard" replace />;
      if (user.role === 'client')        return <Navigate to="/hire" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
