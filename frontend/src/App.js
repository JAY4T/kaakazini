import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/craftsman/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/craftsman/LoginPage';
import DashboardPage from './pages/craftsman/DashboardPage';
import PublicProfile from './pages/PublicProfile';
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import WoodworkingCategoryPage from './pages/WoodworkingCategoryPage';
import MetalworkingCategoryPage from './pages/MetalworkingCategoryPage';
import TextileCategoryPage from './pages/TextileCategoryPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import CraftsmenListPage from './pages/craftsman/CraftsmenListPage';
import CraftsmanProfilePage from './pages/craftsman/CraftsmanProfilePage';
import HireSignUp from './pages/client/HireSignUpPage';
import HireCraftsmanPage from './pages/client/HireCraftsmanPage';
import TermsConditionPage from './pages/TermsConditionPage';
import HireLogin from './pages/client/HireLoginPage';
import ServicesPage from './pages/ServicesPage';
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NoShopPage from "./pages/NoShopPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import Onboarding from "./pages/craftsman/Onboarding";

// Redirects logged-in users away from landing page to their dashboard
function RootRoute({ cart, setCart, incrementQuantity, decrementQuantity }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'craftsman') return <Navigate to="/craftsman-dashboard" replace />;
    if (user.role === 'client')    return <Navigate to="/hire" replace />;
    if (user.role === 'admin')     return <Navigate to="/admin-dashboard" replace />;
  }
  return (
    <LandingPage
      cart={cart} setCart={setCart}
      incrementQuantity={incrementQuantity}
      decrementQuantity={decrementQuantity}
    />
  );
}

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
        {/* ROOT */}
        <Route path="/" element={
          <RootRoute cart={cart} setCart={setCart}
            incrementQuantity={incrementQuantity}
            decrementQuantity={decrementQuantity}
          />
        }/>

        {/* PUBLIC */}
        <Route path="/signup"                    element={<SignupPage />} />
        <Route path="/login"                     element={<LoginPage />} />
        <Route path="/forgot-password"           element={<ForgotPasswordPage />} />
        <Route path="/reset-password"            element={<ResetPasswordPage />} />
        <Route path="/profiles/:username"        element={<PublicProfile />} />
        <Route path="/cart"                      element={<CartPage />} />
        <Route path="/category/woodworking"      element={<WoodworkingCategoryPage />} />
        <Route path="/category/metalworking"     element={<MetalworkingCategoryPage />} />
        <Route path="/category/textile"          element={<TextileCategoryPage />} />
        <Route path="/craftsmen"                 element={<CraftsmenListPage />} />
        <Route path="/craftsman/:slug"           element={<CraftsmanProfilePage />} />
        <Route path="/craftsmen/:slug"           element={<CraftsmanProfilePage />} />
        <Route path="/HireSignUp"                element={<HireSignUp />} />
        <Route path="/HireLogin"                 element={<HireLogin />} />
        <Route path="/terms"                     element={<TermsConditionPage />} />
        <Route path="/services"                  element={<ServicesPage />} />
        <Route path="/no-shop"                   element={<NoShopPage />} />
        <Route path="/orders"                    element={<OrderTrackingPage />} />
        <Route path="/onboarding"                element={<Onboarding />} />

        {/* CLIENT PROTECTED */}
        <Route path="/hire"    element={<ProtectedRoute role="client"><HireCraftsmanPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="client"><ClientProfilePage /></ProtectedRoute>} />

        {/* CRAFTSMAN PROTECTED */}
        <Route path="/craftsman-dashboard" element={<ProtectedRoute role="craftsman"><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard"           element={<ProtectedRoute role="craftsman"><DashboardPage /></ProtectedRoute>} />
        <Route path="/craftsman/profile"   element={<ProtectedRoute role="craftsman"><CraftsmanProfilePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;