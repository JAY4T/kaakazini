// src/pages/ClientProfilePage.js
import React, { useEffect, useState } from "react";
import api from "../api/axiosClient"; // ✅ cookie-based axios instance

const ClientProfilePage = () => {
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch client profile
        const profileRes = await api.get("/client/me/"); // assuming you have a cookie-authenticated endpoint
        setClient(profileRes.data);

        // Fetch client's orders
        const ordersRes = await api.get("/job-requests/", {
          params: { client: profileRes.data.id },
        });
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load your profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="container py-4 text-center text-secondary">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4 text-center text-danger">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container py-4 text-center">
        <h2 className="text-danger">Not Logged In</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-primary mb-4">My Profile</h2>

      {/* Client Info */}
      <div className="card shadow-sm p-4 mb-4">
        <h5 className="fw-bold">{client.full_name || "Unnamed Client"}</h5>
        <p><strong>Email:</strong> {client.email || "N/A"}</p>
        <p><strong>Phone:</strong> {client.phone || client.phone_number || "N/A"}</p>
      </div>

      {/* Order History */}
      <div className="card shadow-sm p-4">
        <h5 className="fw-bold mb-3">My Orders</h5>
        {orders.length === 0 ? (
          <p className="text-muted">No orders yet.</p>
        ) : (
          <ul className="list-group">
            {orders.map((order) => (
              <li
                key={order.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {order.service} - {new Date(order.schedule).toLocaleDateString()}
                </span>
                <span className={`badge ${
                  order.status === "completed" ? "bg-success" :
                  order.status === "pending" ? "bg-warning text-dark" :
                  "bg-secondary"
                }`}>
                  {order.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientProfilePage;
