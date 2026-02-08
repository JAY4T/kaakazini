import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

// ----- Simple auth guard -----
const RequireAdminAuth = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  // If no token → redirect to login
  if (!token) return <Navigate to="/kaakazini-admin/login" replace />;

  // Otherwise, render the protected page
  return children;
};

const KaakaziniAdminApp = () => {
  return (
    <Router>
      <Routes>
        {/* Base path → redirect to login */}
        <Route
          path="/kaakazini-admin"
          element={<Navigate to="/kaakazini-admin/login" replace />}
        />

        {/* Admin login (public) */}
        <Route path="/kaakazini-admin/login" element={<AdminLoginPage />} />

        {/* Admin dashboard (protected) */}
        <Route
          path="/kaakazini-admin/dashboard"
          element={
            <RequireAdminAuth>
              <AdminDashboardPage />
            </RequireAdminAuth>
          }
        />

        {/* Catch-all → safe redirect to login */}
        <Route
          path="*"
          element={<Navigate to="/kaakazini-admin/login" replace />}
        />
      </Routes>
    </Router>
  );
};

export default KaakaziniAdminApp;
