import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient"; // your axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // wait until we fetch

  // Fetch logged-in user on mount using cookies
  const fetchUser = async () => {
    try {
      const res = await api.get("/me/"); 
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    // After successful login, fetch user from backend
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
