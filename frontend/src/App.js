import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PublicProfile from './pages/PublicProfile';
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import WoodworkingCategoryPage from './pages/WoodworkingCategoryPage'; // woodworking products
import MetalworkingCategoryPage from './pages/MetalworkingCategoryPage'; // metalworking products
import TextileCategoryPage from './pages/TextileCategoryPage'; // metalworking products
import 'bootstrap/dist/css/bootstrap.min.css';
import CraftsmenListPage from './pages/CraftsmenListPage';
import CraftsmanProfilePage from './pages/CraftsmanProfilePage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AdminDashboardPage from './pages/AdminDashboardPage'; 
import AdminLoginPage from './pages/AdminLoginPage';
import HireSignup from './pages/HireSignUpPage';
import HireCraftsmanPage from './pages/HireCraftsmanPage';
import TermsConditionPage from './pages/TermsConditionPage';
import HireLogin from './pages/HireLoginPage';
import ServicesPage from './pages/ServicesPage';
import ResetPasswordPage from "./pages/ResetPasswordPage";




function App() {
  const [cart, setCart] = useState({});

  const incrementQuantity = (productName) => {
    setCart((prev) => {
      const newCart = { ...prev, [productName]: (prev[productName] || 0) + 1 };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const decrementQuantity = (productName) => {
    setCart((prev) => {
      const newCart = { ...prev, [productName]: Math.max((prev[productName] || 0) - 1, 0) };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || {};
    setCart(storedCart);
  }, []);

  return (
    <Router>
      <Navbar cart={cart} />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              cart={cart}
              setCart={setCart}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
            />
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password" element={<ResetPasswordPage />} />


        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profiles/:username" element={<PublicProfile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category/woodworking" element={<WoodworkingCategoryPage />} />
        <Route path="/category/metalworking" element={<MetalworkingCategoryPage />} />
        <Route path="/category/textile" element={<TextileCategoryPage />} />
        <Route path="/" element={<CraftsmenListPage />} />
        <Route path="/craftsmen" element={<CraftsmenListPage />} />
        <Route path="/craftsman/:id" element={<CraftsmanProfilePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/HireSignup" element={<HireSignup />} />
        <Route path="/HireLogin" element={<HireLogin />} />
        <Route path="/terms" element={<TermsConditionPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/hire" element={<HireCraftsmanPage />} />
        <Route path="/services" element={<ServicesPage />} />
        </Routes>
    </Router>
  );
}

export default App;