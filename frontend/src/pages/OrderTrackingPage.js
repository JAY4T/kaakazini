// src/pages/OrderTrackingPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: "", comment: "" });

  const fetchOrders = async () => {
    const token = sessionStorage.getItem("access_token");
    const client = JSON.parse(sessionStorage.getItem("client") || "{}");

    if (!token || !client?.id) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/job-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { client: client.id },
      });
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const token = sessionStorage.getItem("access_token");
    try {
      await axios.patch(
        `${BASE_URL}/job-requests/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleReviewSubmit = async (id) => {
    const token = sessionStorage.getItem("access_token");
    try {
      await axios.post(
        `${BASE_URL}/reviews/`,
        { job_request: id, ...reviewData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Review submitted!");
      setReviewData({ rating: "", comment: "" });
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary fw-bold">My Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">You have no job requests yet.</p>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h5 className="fw-bold">{order.service}</h5>
                <p className="text-muted">
                  Status:{" "}
                  <span className="badge bg-info text-dark">
                    {order.status}
                  </span>
                </p>
                <p>{order.description}</p>
                <p className="small text-muted">
                  Scheduled: {new Date(order.schedule).toLocaleString()}
                </p>

                {/* Progress tracker */}
                <div className="progress mb-3">
                  <div
                    className={`progress-bar ${
                      order.status === "Completed"
                        ? "bg-success"
                        : order.status === "In Progress"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                    role="progressbar"
                    style={{
                      width:
                        order.status === "Requested"
                          ? "20%"
                          : order.status === "Quoted"
                          ? "40%"
                          : order.status === "Accepted"
                          ? "60%"
                          : order.status === "In Progress"
                          ? "80%"
                          : "100%",
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  {order.status === "Requested" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleStatusChange(order.id, "Cancelled")}
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === "In Progress" && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleStatusChange(order.id, "Completed")}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {order.status === "Completed" && (
                  <div className="mt-3">
                    <h6>Leave a Review</h6>
                    <select
                      className="form-select mb-2"
                      value={reviewData.rating}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, rating: e.target.value })
                      }
                    >
                      <option value="">Select Rating</option>
                      <option value="5">⭐⭐⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="1">⭐</option>
                    </select>
                    <textarea
                      className="form-control mb-2"
                      rows="2"
                      placeholder="Write a comment"
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, comment: e.target.value })
                      }
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleReviewSubmit(order.id)}
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
