import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import api, { API_BASE_URL } from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // renamed: matches ProtectedRoute

  const fetchUser = async () => {
    try {
      const res = await api.get("/me/");
      setUser(res.data);
    } catch (err) {
      // Interceptor already attempted a refresh before this catch runs.
      // If we're here, both access token and refresh token are expired.
      setUser(null);
    } finally {
      setLoading(false); // only fires after refresh attempt is complete
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.post("/logout/");
    } catch (err) {
      console.error("Logout failed", err);
    }
    setUser(null);
  };

  // Expose 'loading' (not 'loadingUser') to match ProtectedRoute
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);