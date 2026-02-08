import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import KaakaziniAdminApp from "./kaakazini-admin/api/KaakaziniAdminApp"; // <-- correct
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

const isAdminPath = window.location.pathname.startsWith("/kaakazini-admin");

root.render(
  <React.StrictMode>
    {isAdminPath ? (
      <KaakaziniAdminApp />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>
);

reportWebVitals();
