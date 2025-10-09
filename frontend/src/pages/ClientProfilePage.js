// src/pages/ClientProfilePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const ClientProfilePage = () => {
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load client from sessionStorage
    const storedClient = sessionStorage.getItem("client");
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    }

    // Fetch client's past orders
    const token = sessionStorage.getItem("access_token");
    if (token && storedClient) {
      const parsed = JSON.parse(storedClient);
      axios
        .get(`${BASE_URL}/job-requests/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { client: parsed.id },
        })
        .then((res) => setOrders(res.data))
        .catch((err) => console.error("Error fetching orders:", err));
    }
  }, []);

  if (!client) {
    return (
      <div className="container py-4">
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
              <li key={order.id} className="list-group-item d-flex justify-content-between">
                <span>
                  {order.service} - {new Date(order.schedule).toLocaleDateString()}
                </span>
                <span className="badge bg-info text-dark">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientProfilePage;
