import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient"; 

const ClientProfilePage = () => {
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch client profile using /me/ endpoint
        const profileRes = await api.get("/me/");
        
        // Check if user is a client
        if (profileRes.data.role !== "client") {
          setError("Access denied. Client account required.");
          setTimeout(() => navigate("/HireLogin"), 2000);
          return;
        }

        setClient(profileRes.data);

        // Fetch client's orders/job requests
        const ordersRes = await api.get("/job-requests/");
        
        // Filter orders for this client
        const clientOrders = ordersRes.data.filter((order) => {
          if (typeof order.client === "number") return order.client === profileRes.data.id;
          if (typeof order.client === "object" && order.client?.id) return order.client.id === profileRes.data.id;
          if (order.client_id) return order.client_id === profileRes.data.id;
          return false;
        });
        
        setOrders(clientOrders);
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load your profile. Please log in again.");
        setTimeout(() => navigate("/HireLogin"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <style>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          
          .loading-content {
            text-align: center;
          }
          
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e5e7eb;
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1.5rem;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .loading-text {
            font-size: 1.125rem;
            font-weight: 600;
            color: #6b7280;
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          
          .error-card {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .error-icon {
            width: 80px;
            height: 80px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          
          .error-icon svg {
            width: 40px;
            height: 40px;
            color: #dc2626;
          }
          
          .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 1rem;
            font-family: 'Outfit', sans-serif;
          }
          
          .error-message {
            color: #6b7280;
            margin-bottom: 1.5rem;
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="error-title">Error</h2>
            <p className="error-message">{error}</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Redirecting to login...</p>
          </div>
        </div>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <style>{`
          .not-logged-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          
          .not-logged-card {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .not-logged-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          
          .not-logged-icon svg {
            width: 40px;
            height: 40px;
            color: white;
          }
          
          .not-logged-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1rem;
            font-family: 'Outfit', sans-serif;
          }
          
          .not-logged-message {
            color: #6b7280;
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
        <div className="not-logged-container">
          <div className="not-logged-card">
            <div className="not-logged-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="not-logged-title">Not Logged In</h2>
            <p className="not-logged-message">Please log in to view your profile.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .profile-page-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 3rem 1rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .profile-page-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title-profile {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 2rem;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #f3f4f6;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-avatar svg {
          width: 50px;
          height: 50px;
          color: white;
        }

        .profile-info-header {
          flex: 1;
        }

        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .profile-role {
          display: inline-block;
          padding: 0.375rem 1rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: start;
          gap: 1rem;
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-icon svg {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 600;
        }

        .orders-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #9ca3af;
        }

        .empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 1rem;
          margin: 0;
        }

        .order-item {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .order-item:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .order-info {
          flex: 1;
        }

        .order-service {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .order-date {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-default {
          background: #e5e7eb;
          color: #374151;
        }

        @media (max-width: 768px) {
          .profile-page-container {
            padding: 2rem 1rem;
          }

          .page-title-profile {
            font-size: 1.5rem;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
          }

          .profile-avatar svg {
            width: 40px;
            height: 40px;
          }

          .profile-name {
            font-size: 1.5rem;
          }

          .order-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-badge {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="profile-page-container">
        <div className="profile-page-content">
          <h1 className="page-title-profile">My Profile</h1>

          {/* Client Info Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="profile-info-header">
                <h2 className="profile-name">{client.full_name || "Unnamed Client"}</h2>
                <span className="profile-role">Client Account</span>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{client.email || "N/A"}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">{client.phone || client.phone_number || "N/A"}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Total Orders</div>
                  <div className="detail-value">{orders.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="orders-section">
            <h3 className="section-title">Order History</h3>
            {orders.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>No orders yet. Start hiring craftsmen to see your order history here!</p>
              </div>
            ) : (
              <div>
                {orders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-service">{order.service}</div>
                      <div className="order-date">
                        Scheduled: {new Date(order.schedule).toLocaleDateString()} at{" "}
                        {new Date(order.schedule).toLocaleTimeString()}
                      </div>
                      {order.budget && (
                        <div className="order-date">Budget: KSh {order.budget.toLocaleString()}</div>
                      )}
                    </div>
                    <span
                      className={`status-badge ${
                        order.status === "Completed" || order.status === "completed"
                          ? "status-completed"
                          : order.status === "Pending" || order.status === "pending"
                          ? "status-pending"
                          : order.status === "Cancelled" || order.status === "cancelled"
                          ? "status-cancelled"
                          : "status-default"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientProfilePage;
