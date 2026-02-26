import React, { useState, useEffect } from "react";
import api from "../../api/axiosClient"; 

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const HireCraftsmanPage = () => {
  const [activeTab, setActiveTab] = useState("makeRequest");
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedQuoteJob, setSelectedQuoteJob] = useState(null);

  const [individualForm, setIndividualForm] = useState({
    name: "",
    phone: "",
    service: "",
    schedule: "",
    address: "",
    location: "",
    description: "",
    isUrgent: false,
    media: null,
    budget: "",
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await api.get("/me/");
        setClient(res.data);
        setIndividualForm((prev) => ({
          ...prev,
          name: res.data.full_name || "",
          phone: res.data.phone || res.data.phone_number || "",
        }));
        fetchJobs(res.data.id);
      } catch (err) {
        console.error("Client not logged in", err);
        setClient(null);
      }
    };
    fetchClientData();
  }, []);

  const fetchJobs = async (clientId) => {
    try {
      const { data } = await api.get("/job-requests/");
      const clientJobs = data.filter((j) => {
        if (!j.client) return false;
        if (typeof j.client === "number") return j.client === clientId;
        if (typeof j.client === "object" && j.client.id) return j.client.id === clientId;
        if (j.client_id) return j.client_id === clientId;
        return false;
      });
      setJobs(clientJobs);

      const initialReviews = {};
      clientJobs.forEach((job) => {
        initialReviews[job.id] = { rating: job.rating || 0, review: job.review || "" };
      });
      setReviews(initialReviews);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const handleIndividualChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setIndividualForm((prev) => ({ ...prev, [id]: checked }));
    } else if (type === "file") {
      setIndividualForm((prev) => ({ ...prev, [id]: files[0] }));
    } else {
      setIndividualForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!client || !client.id) return alert("Client ID missing.");
    const formData = new FormData();
    formData.append("client", client.id);
    Object.entries(individualForm).forEach(([key, val]) => {
      if (val !== null && val !== "") {
        formData.append(key, key === "schedule" ? new Date(val).toISOString() : val);
      }
    });
    try {
      await api.post("/job-requests/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("✅ Request submitted!");
      fetchJobs(client.id);
      setIndividualForm((prev) => ({
        ...prev,
        service: "",
        schedule: "",
        address: "",
        location: "",
        description: "",
        isUrgent: false,
        media: null,
        budget: "",
      }));
      setActiveTab("myRequests");
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      alert("❌ Failed to submit request.");
    }
  };

  const updateJob = async (jobId, update) => {
    try {
      await api.patch(`/job-requests/${jobId}/`, update);
      fetchJobs(client.id);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleQuoteDecision = async (jobId, decision) => {
    try {
      await api.post(`/job-requests/${jobId}/quote-decision/`, {
        decision: decision
      });
      alert(`✅ Quote ${decision}d successfully!`);
      fetchJobs(client.id);
    } catch (err) {
      console.error(`Error ${decision}ing quote:`, err.response?.data || err.message);
      alert(`❌ Failed to ${decision} quote.`);
    }
  };

  const submitReview = async (jobId) => {
  const reviewData = reviews[jobId] || {};
  const rating = parseInt(reviewData.rating) || 0;
  const reviewText = reviewData.review?.trim() || "";

  if (!rating || reviewText === "") {
    return alert("Please add both rating and review.");
  }

  const job = jobs.find((j) => j.id === jobId);
  if (!job) return alert("Job not found.");
  if (!job.location || !job.craftsman?.id) {
    return alert("Cannot submit review: missing location or craftsman.");
  }

  try {
    await api.post("/reviews/", {
      rating,
      comment: reviewText,
      location: job.location,
      craftsman: job.craftsman.id,
    });

    alert("✅ Review submitted successfully!");
    setReviews((prev) => ({ ...prev, [jobId]: { rating: 0, review: "" } }));

  } catch (err) {
    console.error("Review submission error:", err.response?.data || err.message);
    alert("❌ Failed to submit review.");
  }
};


  const handlePayment = async (jobId) => {
    try {
      await api.post(`/job-requests/${jobId}/pay/`);
      alert("✅ Payment successful!");
      fetchJobs(client.id);
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      alert("❌ Payment failed.");
    }
  };

  if (!client)
    return (
      <div className="text-center mt-5">
        Client not logged in. Please login to access your dashboard.
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .dashboard-container { min-height: 100vh; background: #f8fafc; position: relative; }

        /* ── Sidebar ── */
        .dashboard-sidebar {
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          min-height: 100vh; position: fixed; left: 0; top: 0;
          width: 280px; padding: 2rem 0;
          box-shadow: 4px 0 20px rgba(0,0,0,0.1);
          z-index: 1000; transition: transform 0.3s ease;
        }
        .sidebar-header { padding: 0 1.5rem; margin-bottom: 2rem; }
        .sidebar-logo {
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 0.5rem;
        }
        .sidebar-user { color: #e5e7eb; font-size: 0.875rem; font-weight: 500; }
        .sidebar-user strong { color: white; font-weight: 700; }
        .sidebar-nav { padding: 0 1rem; }
        .nav-item-custom { margin-bottom: 0.5rem; }
        .nav-btn {
          width: 100%; padding: 0.875rem 1.25rem; border-radius: 12px;
          border: none; background: transparent; color: #9ca3af;
          font-weight: 600; font-size: 0.9375rem; text-align: left;
          transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-btn.active {
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          color: white; box-shadow: 0 4px 15px rgba(34,197,94,0.3);
        }
        .nav-icon { width: 20px; height: 20px; }

        /* ── Mobile toggle ── */
        .sidebar-toggle {
          position: fixed; top: 1rem; left: 1rem; z-index: 1100;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border: none; width: 48px; height: 48px; border-radius: 12px;
          color: white; display: none; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(34,197,94,0.3);
        }
        .sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); z-index: 999;
        }

        /* ── Main content ── */
        .dashboard-main { margin-left: 280px; padding: 2rem; min-height: 100vh; }
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 2rem; font-weight: 800; color: #1f2937; margin: 0; }

        /* ── Cards ── */
        .content-card {
          background: white; border-radius: 16px; padding: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;
        }
        .card-title { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin-bottom: 1.5rem; }

        /* ── Form ── */
        .form-label-custom { font-weight: 600; font-size: 0.875rem; color: #374151; margin-bottom: 0.5rem; }
        .form-control-custom {
          border: 2px solid #e5e7eb; border-radius: 12px;
          padding: 0.75rem 1rem; font-size: 0.9375rem; transition: all 0.3s ease;
        }
        .form-control-custom:focus {
          outline: none; border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
        }
        .form-select-custom {
          border: 2px solid #e5e7eb; border-radius: 12px;
          padding: 0.75rem 1rem; font-size: 0.9375rem; transition: all 0.3s ease;
        }
        .form-select-custom:focus {
          outline: none; border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
        }

        /* ── Buttons ── */
        .btn-primary-custom {
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          color: white; border: none; padding: 0.875rem 1.5rem;
          border-radius: 12px; font-weight: 700; font-size: 1rem;
          transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(34,197,94,0.3);
          cursor: pointer;
        }
        .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(34,197,94,0.4); }
        .btn-success-custom {
          background: #22c55e; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 8px;
          font-weight: 600; font-size: 0.875rem; transition: all 0.2s ease; cursor: pointer;
          white-space: nowrap;
        }
        .btn-success-custom:hover { background: #16a34a; transform: translateY(-1px); }
        .btn-danger-custom {
          background: #ef4444; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 8px;
          font-weight: 600; font-size: 0.875rem; transition: all 0.2s ease; cursor: pointer;
          white-space: nowrap;
        }
        .btn-danger-custom:hover { background: #dc2626; transform: translateY(-1px); }

        /* ── View Document button ── */
        .btn-view-doc {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: #f0fdf4; color: #16a34a; border: 1.5px solid #86efac;
          padding: 0.4rem 0.875rem; border-radius: 8px; font-weight: 700;
          font-size: 0.8rem; text-decoration: none;
          transition: all 0.18s ease; cursor: pointer; white-space: nowrap;
          font-family: inherit;
        }
        .btn-view-doc:hover {
          background: #dcfce7; border-color: #22c55e; color: #15803d;
          transform: translateY(-1px); text-decoration: none;
        }
        .btn-view-doc-disabled {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: #f9fafb; color: #9ca3af; border: 1.5px solid #e5e7eb;
          padding: 0.4rem 0.875rem; border-radius: 8px;
          font-weight: 600; font-size: 0.8rem; cursor: not-allowed; white-space: nowrap;
        }

        /* ── Quote details expand card ── */
        .btn-view-quote-detail {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: #f0fdf4; color: #16a34a; border: 1.5px solid #86efac;
          padding: 0.4rem 0.875rem; border-radius: 8px; font-weight: 700;
          font-size: 0.8rem; cursor: pointer; white-space: nowrap;
          font-family: inherit; transition: all 0.18s ease;
        }
        .btn-view-quote-detail:hover { background: #dcfce7; border-color: #22c55e; color: #15803d; }

        .quote-detail-popup {
          margin-top: 0.5rem;
          background: #f0fdf4; border: 1.5px solid #86efac;
          border-radius: 10px; padding: 0.75rem 1rem;
          font-size: 0.8rem; min-width: 200px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

        .qd-title { font-weight: 800; color: #15803d; margin-bottom: 0.5rem; font-size: 0.82rem; }
        .qd-row {
          display: flex; justify-content: space-between; padding: 0.22rem 0;
          border-bottom: 1px solid #d1fae5; font-size: 0.76rem; color: #374151; gap: 1rem;
        }
        .qd-row:last-child { border-bottom: none; }
        .qd-label { color: #6b7280; }
        .qd-val   { font-weight: 700; color: #1f2937; text-align: right; }
        .qd-total {
          margin-top: 0.5rem; padding-top: 0.4rem; border-top: 2px solid #86efac;
          display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem;
        }
        .qd-total-val { color: #16a34a; }

        /* ── Table (desktop) ── */
        .table-custom { background: white; border-radius: 12px; overflow: hidden; }
        .table-custom thead { background: #f9fafb; }
        .table-custom th {
          font-weight: 700; font-size: 0.875rem; color: #374151;
          text-transform: uppercase; letter-spacing: 0.5px; padding: 1rem; border: none;
        }
        .table-custom td {
          padding: 1rem; vertical-align: middle;
          border-top: 1px solid #f3f4f6; font-size: 0.9375rem;
        }
        .table-custom tbody tr:hover { background: #f9fafb; }

        /* ── Badges ── */
        .badge-custom { padding: 0.375rem 0.875rem; border-radius: 20px; font-weight: 600; font-size: 0.8125rem; white-space: nowrap; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger  { background: #fee2e2; color: #991b1b; }

        /* ── Stars ── */
        .star-rating { display: inline-flex; gap: 0.25rem; }
        .star { cursor: pointer; font-size: 1.75rem; transition: all 0.2s; user-select: none; }
        .star:hover { transform: scale(1.1); }
        .star.filled { color: #fbbf24; }
        .star.empty  { color: #d1d5db; }

        /* ── Profile ── */
        .profile-info { display: grid; gap: 1.25rem; }
        .profile-item { display: flex; align-items: start; gap: 1rem; }
        .profile-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #22c55e 0%, #fbbf24 100%);
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .profile-icon svg { width: 20px; height: 20px; color: white; }
        .profile-content { flex: 1; }
        .profile-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.25rem; }
        .profile-value { font-size: 1rem; color: #1f2937; font-weight: 600; }

        /* ── Empty state ── */
        .empty-state { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
        .empty-state svg { width: 64px; height: 64px; margin-bottom: 1rem; opacity: 0.5; }

        /* ═══════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ═══════════════════════════════════ */

        /* Tablet & below — hide desktop sidebar, show toggle */
        @media (max-width: 992px) {
          .dashboard-sidebar { transform: translateX(-100%); }
          .dashboard-sidebar.open { transform: translateX(0); }
          .sidebar-toggle { display: flex; }
          .sidebar-overlay.open { display: block; }
          .dashboard-main { margin-left: 0; padding: 5rem 1rem 2rem; }
        }

        /* Mobile — table becomes card stack */
        @media (max-width: 768px) {
          .page-title { font-size: 1.4rem; }
          .content-card { padding: 1.25rem; }

          /* Hide table header on mobile */
          .table-custom thead { display: none; }

          /* Each row becomes a card */
          .table-custom, .table-custom tbody, .table-custom tr { display: block; }
          .table-custom tbody tr {
            background: white;
            border-radius: 14px;
            border: 1.5px solid #e5e7eb;
            padding: 1rem;
            margin-bottom: 0.875rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .table-custom tbody tr:hover { background: white; }

          /* Each cell = labelled row */
          .table-custom td {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.45rem 0;
            border-top: 1px solid #f3f4f6;
            font-size: 0.875rem;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .table-custom td:first-child { border-top: none; padding-top: 0; }
          .table-custom td:last-child  { padding-bottom: 0; }

          /* data-label pseudo element */
          .table-custom td::before {
            content: attr(data-label);
            font-weight: 700;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #9ca3af;
            flex-shrink: 0;
            min-width: 76px;
            padding-top: 0.15rem;
          }

          /* Right-align cell values */
          .table-custom td > span,
          .table-custom td > strong,
          .table-custom td > a { margin-left: auto; }

          /* Action buttons stay horizontal on mobile */
          .table-custom td .d-flex {
            flex-direction: row;
            align-items: center;
            gap: 0.5rem;
            margin-left: auto;
            flex-wrap: nowrap;
          }

          .btn-success-custom,
          .btn-danger-custom {
            font-size: 0.75rem !important;
            padding: 0.4rem 0.7rem !important;
            white-space: nowrap;
          }

          .quote-detail-popup { min-width: unset; width: 100%; }
        }

        @media (max-width: 480px) {
          .dashboard-main { padding: 4.5rem 0.75rem 1.5rem; }
          .content-card { padding: 1rem; border-radius: 12px; }
          .page-title { font-size: 1.2rem; }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Mobile Toggle */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">Kaakazini</div>
            <p className="sidebar-user">Hi, <strong>{client.full_name}</strong> 👋</p>
          </div>
          <div className="sidebar-nav">
            {[
              { id: "profile",     label: "My Profile",  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { id: "makeRequest", label: "Make Request", icon: "M12 4v16m8-8H4" },
              { id: "myRequests",  label: "My Requests",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { id: "reviews",     label: "My Reviews",   icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
              { id: "payments",    label: "Payments",     icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }
            ].map((tab) => (
              <div className="nav-item-custom" key={tab.id}>
                <button
                  className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {tab.label}
                </button>
              </div>
            ))}
          </div>
        </nav>

        {/* Main */}
        <main className="dashboard-main">
          <div className="page-header">
            <h1 className="page-title">
              {activeTab === "profile"     && "My Profile"}
              {activeTab === "makeRequest" && "New Request"}
              {activeTab === "myRequests"  && "My Requests"}
              {activeTab === "reviews"     && "My Reviews"}
              {activeTab === "payments"    && "Payments"}
            </h1>
          </div>

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="content-card">
              <h2 className="card-title">Profile Information</h2>
              <div className="profile-info">
                {[
                  { label: "Full Name",     value: client.full_name,                     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                  { label: "Phone Number",  value: client.phone_number || client.phone,  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                  { label: "Email Address", value: client.email,                          icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                ].map(({ label, value, icon }) => (
                  <div className="profile-item" key={label}>
                    <div className="profile-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="profile-content">
                      <div className="profile-label">{label}</div>
                      <div className="profile-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Make Request ── */}
          {activeTab === "makeRequest" && (
            <div className="content-card">
              <h2 className="card-title">Submit New Service Request</h2>
              <form onSubmit={handleIndividualSubmit} encType="multipart/form-data">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Your Name</label>
                    <input type="text" id="name" value={individualForm.name} onChange={handleIndividualChange}
                      className="form-control form-control-custom" placeholder="Enter your name" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Phone Number</label>
                    <input type="tel" id="phone" value={individualForm.phone} onChange={handleIndividualChange}
                      className="form-control form-control-custom" placeholder="Phone number" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Service Type</label>
                  <select id="service" value={individualForm.service} onChange={handleIndividualChange}
                    className="form-select form-select-custom" required>
                    <option value="">-- Select Service --</option>
                    {["Plumbing","Electrical","Carpentry","Painting","Masonry","Tiling","Roofing"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Budget (KSh)</label>
                  <input type="number" id="budget" value={individualForm.budget} onChange={handleIndividualChange}
                    className="form-control form-control-custom" placeholder="Enter your budget" min="0" required />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Schedule Date & Time</label>
                    <input type="datetime-local" id="schedule" value={individualForm.schedule} onChange={handleIndividualChange}
                      className="form-control form-control-custom" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Address</label>
                    <input type="text" id="address" value={individualForm.address} onChange={handleIndividualChange}
                      className="form-control form-control-custom" placeholder="Your address" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Location</label>
                  <select id="location" value={individualForm.location} onChange={handleIndividualChange}
                    className="form-select form-select-custom" required>
                    <option value="">-- Select Location --</option>
                    {["nairobi","mombasa","kisumu","eldoret","nakuru","thika"].map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Job Description</label>
                  <textarea id="description" value={individualForm.description} onChange={handleIndividualChange}
                    className="form-control form-control-custom" rows="4" placeholder="Describe the work you need done..." required />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="isUrgent"
                      checked={individualForm.isUrgent} onChange={handleIndividualChange} style={{ accentColor:'#22c55e' }} />
                    <label className="form-check-label" htmlFor="isUrgent"><strong>Mark as urgent</strong></label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label-custom">Upload Image (Optional)</label>
                  <input type="file" className="form-control form-control-custom" id="media"
                    accept="image/*" onChange={handleIndividualChange} />
                </div>
                <button type="submit" className="btn-primary-custom w-100" style={{ width:'100%' }}>
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {/* ── My Requests ── */}
          {activeTab === "myRequests" && (
            <div className="content-card">
              <h2 className="card-title">Your Service Requests</h2>
              {jobs.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>No service requests submitted yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-custom">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Budget</th>
                        <th>Schedule</th>
                        <th>Status</th>
                        <th>Quote</th>
                        <th>Proof Images</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => {
                        const hasQuote = !!(job.quote_file_url || job.quote_details);
                        const quoteSubmitted = job.status === "Quote Submitted";
                        const quoteApproved  = job.status === "Quote Approved";

                        return (
                          <tr key={job.id}>
                            <td data-label="Service"><strong>{job.service}</strong></td>
                            <td data-label="Budget">{job.budget ? `KSh ${job.budget.toLocaleString()}` : "—"}</td>
                            <td data-label="Schedule">{new Date(job.schedule).toLocaleString()}</td>

                            <td data-label="Status">
                              <span className={`badge-custom ${
                                job.status === "Completed" || job.status === "Quote Approved"
                                  ? "badge-success"
                                  : job.status === "Cancelled"
                                  ? "badge-danger"
                                  : "badge-warning"
                              }`}>
                                {job.status === "Quote Submitted" ? "Quote Received"
                                  : job.status === "Completed"      ? "Work Completed"
                                  : job.status}
                              </span>
                            </td>

                            <td data-label="Quote">
                              {job.quote_file_url ? (
                                <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                                  <a href={job.quote_file_url} target="_blank" rel="noopener noreferrer"
                                    style={{ color:'#16a34a', fontWeight:'600', wordBreak:'break-all', textDecoration:'underline', fontSize:'0.8rem' }}>
                                    {job.quote_file_url.split('/').pop()}
                                  </a>
                                  {job.quote_file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                                    <img
                                      src={job.quote_file_url}
                                      alt="Quote preview"
                                      style={{ width:'60px', height:'60px', objectFit:'cover', borderRadius:'8px', border:'2px solid #e5e7eb', cursor:'pointer' }}
                                      onClick={() => window.open(job.quote_file_url, '_blank')}
                                    />
                                  )}
                                </div>
                              ) : job.quote_details ? (
                                <button className="btn-view-quote-detail" data-bs-toggle="modal" data-bs-target="#quoteModal"
                                  onClick={() => setSelectedQuoteJob(job)}>📋 View Quote</button>
                              ) : <span style={{ color:'#9ca3af', fontSize:'0.85rem' }}>—</span>}
                            </td>

                            <td data-label="Proof Images">
                              {job.proof_images && job.proof_images.length > 0 ? (
                                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                                  {job.proof_images.map((proofImg, idx) => (
                                    <img 
                                      key={proofImg.id || idx} 
                                      src={proofImg.image} 
                                      alt={`Proof ${idx+1}`}
                                      style={{ 
                                        width:'60px', 
                                        height:'60px', 
                                        objectFit:'cover', 
                                        borderRadius:'8px', 
                                        border:'2px solid #e5e7eb', 
                                        cursor:'pointer' 
                                      }}
                                      onClick={() => window.open(proofImg.image, '_blank')}
                                      onError={(e) => {
                                        console.error("Failed to load image:", proofImg.image);
                                        e.target.style.border = '2px solid #ef4444';
                                        e.target.style.opacity = '0.5';
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color:'#9ca3af', fontSize:'0.85rem' }}>
                                  {job.status === "Completed" ? "No proof images" : "—"}
                                </span>
                              )}
                            </td>

                            <td data-label="Actions">
                              <div className="d-flex gap-2" style={{ flexWrap: 'nowrap' }}>
                                {quoteSubmitted && hasQuote && (
                                  <>
                                    <button className="btn btn-success-custom"
                                      onClick={() => { if(window.confirm("Approve this quote?")) handleQuoteDecision(job.id, "approve"); }}>
                                      Approve Quote
                                    </button>
                                    <button className="btn btn-danger-custom"
                                      onClick={() => { if(window.confirm("Reject this quote?")) handleQuoteDecision(job.id, "reject"); }}>
                                      Reject Quote
                                    </button>
                                  </>
                                )}
                                {!quoteSubmitted && (
                                  <>
                                    <button className="btn btn-success-custom"
                                      onClick={() => updateJob(job.id, { status:"Completed" })}>Complete</button>
                                    <button className="btn btn-danger-custom"
                                      onClick={() => updateJob(job.id, { status:"Cancelled" })}>Cancel</button>
                                  </>
                                )}
                                {quoteApproved && (
                                  <span style={{ color:'#22c55e', fontSize:'0.875rem', fontWeight:'600' }}>
                                    ✅ Quote Approved
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {activeTab === "reviews" && (
            <div className="content-card">
              <h2 className="card-title">Leave Reviews for Completed Jobs</h2>
              {jobs.filter((j) => j.status === "Completed").length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>No completed jobs to review yet.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {jobs.filter((j) => j.status === "Completed").map((job) => (
                    <div key={job.id} className="col-12">
                      <div className="content-card" style={{ marginBottom:0 }}>
                        <h5 style={{ fontSize:'1.125rem', fontWeight:'700', marginBottom:'1rem' }}>
                          {job.service} — {new Date(job.schedule).toLocaleDateString()}
                        </h5>
                        <p style={{ marginBottom:'0.75rem' }}><strong>Description:</strong> {job.description}</p>
                        <p style={{ marginBottom:'1rem' }}><strong>Budget:</strong> {job.budget ? `KSh ${job.budget.toLocaleString()}` : "—"}</p>
                        <div className="star-rating" style={{ marginBottom:'1rem' }}>
                          {[1,2,3,4,5].map((star) => (
                            <span key={star}
                              className={`star ${reviews[job.id]?.rating >= star ? 'filled' : 'empty'}`}
                              onClick={() => setReviews((prev) => ({ ...prev, [job.id]: { ...prev[job.id], rating:star } }))}>
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea rows="3" className="form-control form-control-custom mb-3"
                          placeholder="Write your review..."
                          value={reviews[job.id]?.review || ""}
                          onChange={(e) => setReviews((prev) => ({ ...prev, [job.id]: { ...prev[job.id], review:e.target.value } }))} />
                        <button className="btn btn-primary-custom"
                          onClick={() => submitReview(job.id)}>
                          Submit Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Payments ── */}
          {activeTab === "payments" && (
            <div className="content-card">
              <h2 className="card-title">Payment History</h2>
              {jobs.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>No payment records available.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-custom">
                    <thead>
                      <tr>
                        <th>Service</th><th>Total Amount</th><th>Company Fee</th>
                        <th>Craftsman Net</th><th>Status</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => {
                        const companyFee = job.budget ? Math.round(job.budget * 0.1) : 0;
                        const net  = job.budget ? job.budget - companyFee : 0;
                        const paid = job.status === "Paid";
                        return (
                          <tr key={job.id}>
                            <td data-label="Service"><strong>{job.service}</strong></td>
                            <td data-label="Total">{job.budget ? `KSh ${job.budget.toLocaleString()}` : "—"}</td>
                            <td data-label="Fee">{`KSh ${companyFee.toLocaleString()}`}</td>
                            <td data-label="Craftsman">{`KSh ${net.toLocaleString()}`}</td>
                            <td data-label="Status">
                              <span className={`badge-custom ${paid ? 'badge-success' : 'badge-warning'}`}>
                                {paid ? "✅ Paid" : "⏳ Pending"}
                              </span>
                            </td>
                            <td data-label="Action">
                              {!paid && job.status === "Completed" ? (
                                <button className="btn btn-primary-custom"
                                  style={{ padding:'0.5rem 1rem', fontSize:'0.875rem' }}
                                  onClick={() => handlePayment(job.id)}>
                                  Pay Now
                                </button>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= QUOTE MODAL ================= */}
          <div
            className="modal fade"
            id="quoteModal"
            tabIndex="-1"
            aria-labelledby="quoteModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content" style={{ borderRadius:'16px' }}>
                
                <div className="modal-header">
                  <h5 className="modal-title" id="quoteModalLabel">
                    📋 Quote Summary
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>

                <div className="modal-body">
                  {selectedQuoteJob?.quote_details ? (
                    <>
                      {selectedQuoteJob.quote_details.plumberName && (
                        <p><strong>From:</strong> {selectedQuoteJob.quote_details.plumberName}</p>
                      )}

                      {selectedQuoteJob.quote_details.workType && (
                        <p><strong>Work Type:</strong> {selectedQuoteJob.quote_details.workType}</p>
                      )}

                      {selectedQuoteJob.quote_details.duration && (
                        <p><strong>Duration:</strong> {selectedQuoteJob.quote_details.duration}</p>
                      )}

                      {selectedQuoteJob.quote_details.paymentTerms && (
                        <p><strong>Payment Terms:</strong> {selectedQuoteJob.quote_details.paymentTerms}</p>
                      )}

                      <hr />

                      {Array.isArray(selectedQuoteJob.quote_details.items) &&
                        selectedQuoteJob.quote_details.items.map((item, i) => (
                          <div key={i} className="d-flex justify-content-between mb-2">
                            <span>{item.desc || `Item ${i + 1}`}</span>
                            <strong>
                              KSh {(item.qty * item.price).toLocaleString()}
                            </strong>
                          </div>
                        ))}

                      {selectedQuoteJob.quote_details.total && (
                        <>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <strong>Total</strong>
                            <strong style={{ color:'#16a34a' }}>
                              KSh {Number(selectedQuoteJob.quote_details.total).toLocaleString()}
                            </strong>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p>No quote details available.</p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default HireCraftsmanPage;