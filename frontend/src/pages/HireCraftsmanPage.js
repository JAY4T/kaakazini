import React, { useState, useEffect } from "react";
import api from "../api/axiosClient"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const HireCraftsmanPage = () => {
  const [activeTab, setActiveTab] = useState("makeRequest");
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState({});
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

  // Fetch client info and jobs
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

  const submitReview = async (jobId, craftsmanId) => {
    const reviewData = reviews[jobId] || {};
    const rating = parseInt(reviewData.rating) || 0;
    const reviewText = reviewData.review?.trim() || "";
    if (!rating || reviewText === "") return alert("Please add both rating and review.");
    if (!craftsmanId) return alert("Craftsman ID missing for this job.");
    try {
      await api.post("/reviews/", {
        job: jobId,
        craftsman: craftsmanId,
        reviewer: client.full_name || client.username,
        rating,
        comment: reviewText,
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
      fetchJobs(client.id); // refresh jobs to show paid status
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
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Sidebar */}
        <nav className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark text-white vh-100 d-flex flex-column">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white">
            <h4 className="fs-5 d-none d-sm-block">Kaakazini Dashboard</h4>
            <p className="mt-2 mb-0 d-none d-sm-block">
              Hi, <strong>{client.full_name}</strong> 👋
            </p>
            <ul className="nav nav-pills flex-column mt-4 w-100">
              {["profile", "makeRequest", "myRequests", "reviews", "payments"].map((tab) => (
                <li className="nav-item mb-2 w-100" key={tab}>
                  <button
                    className={`btn w-100 text-start ${activeTab === tab ? "btn-success" : "btn-outline-light"}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "profile"
                      ? "My Profile"
                      : tab === "makeRequest"
                      ? "Make Request"
                      : tab === "myRequests"
                      ? "My Requests"
                      : tab === "reviews"
                      ? "My Reviews"
                      : "Payments"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col py-3 px-3 px-md-4">
          <h2 className="mb-4 text-capitalize">
            {activeTab === "profile"
              ? "Profile"
              : activeTab === "makeRequest"
              ? "New Request"
              : activeTab === "myRequests"
              ? "Your Requests"
              : activeTab === "reviews"
              ? "My Reviews"
              : "Payments"}
          </h2>

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="card p-4 mb-4 shadow-sm">
              <p><strong>Name:</strong> {client.full_name}</p>
              <p><strong>Phone:</strong> {client.phone_number || client.phone}</p>
              <p><strong>Email:</strong> {client.email}</p>
            </div>
          )}

          {/* Make Request */}
          {activeTab === "makeRequest" && (
            <div className="card shadow-sm p-4 mb-4">
              <form onSubmit={handleIndividualSubmit} encType="multipart/form-data">
                {/* Name & Phone */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      id="name"
                      value={individualForm.name}
                      onChange={handleIndividualChange}
                      className="form-control"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="tel"
                      id="phone"
                      value={individualForm.phone}
                      onChange={handleIndividualChange}
                      className="form-control"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>

                {/* Service */}
                <div className="mb-3">
                  <select
                    id="service"
                    value={individualForm.service}
                    onChange={handleIndividualChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Service --</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Masonry">Masonry</option>
                    <option value="Tiling">Tiling</option>
                    <option value="Roofing">Roofing</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="mb-3">
                  <input
                    type="number"
                    id="budget"
                    value={individualForm.budget}
                    onChange={handleIndividualChange}
                    className="form-control"
                    placeholder="Budget (KSh)"
                    min="0"
                    required
                  />
                </div>

                {/* Schedule & Address */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <input
                      type="datetime-local"
                      id="schedule"
                      value={individualForm.schedule}
                      onChange={handleIndividualChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      id="address"
                      value={individualForm.address}
                      onChange={handleIndividualChange}
                      className="form-control"
                      placeholder="Address"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <select
                    id="location"
                    value={individualForm.location}
                    onChange={handleIndividualChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Location --</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="eldoret">Eldoret</option>
                    <option value="nakuru">Nakuru</option>
                    <option value="thika">Thika</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <textarea
                    id="description"
                    value={individualForm.description}
                    onChange={handleIndividualChange}
                    className="form-control"
                    rows="3"
                    placeholder="Job Description"
                    required
                  />
                </div>

                {/* Urgent & Media */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isUrgent"
                    checked={individualForm.isUrgent}
                    onChange={handleIndividualChange}
                  />
                  <label className="form-check-label" htmlFor="isUrgent">
                    Mark as urgent
                  </label>
                </div>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    id="media"
                    accept="image/*"
                    onChange={handleIndividualChange}
                  />
                </div>

                <button type="submit" className="btn btn-success w-100">
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {/* My Requests */}
          {activeTab === "myRequests" && (
            <div className="card p-3 mb-4 shadow-sm overflow-auto">
              <h4>Your Requests</h4>
              {jobs.length === 0 ? (
                <p className="text-muted">No service requests submitted yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Budget (KSh)</th>
                        <th>Schedule</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.service}</td>
                          <td>{job.budget ? `KSh ${job.budget}` : "—"}</td>
                          <td>{new Date(job.schedule).toLocaleString()}</td>
                          <td>
                            <span
                              className={`badge ${
                                job.status === "Completed"
                                  ? "bg-success"
                                  : job.status === "Cancelled"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="d-flex gap-1 flex-wrap">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateJob(job.id, { status: "Completed" })}
                            >
                              Complete
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updateJob(job.id, { status: "Cancelled" })}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="card p-3 mb-4 shadow-sm">
              <h4>Completed Jobs — Leave a Review</h4>
              {jobs.filter((j) => j.status === "Completed").length === 0 ? (
                <p className="text-muted">No completed jobs yet.</p>
              ) : (
                jobs
                  .filter((j) => j.status === "Completed")
                  .map((job) => (
                    <div key={job.id} className="border rounded p-3 mb-3 shadow-sm">
                      <h5>
                        {job.service} — {new Date(job.schedule).toLocaleDateString()}
                      </h5>
                      <p><strong>Description:</strong> {job.description}</p>
                      <p><strong>Budget:</strong> {job.budget ? `KSh ${job.budget}` : "—"}</p>
                      <div className="mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              cursor: "pointer",
                              color: reviews[job.id]?.rating >= star ? "gold" : "lightgray",
                              fontSize: "1.5rem",
                            }}
                            onClick={() =>
                              setReviews((prev) => ({
                                ...prev,
                                [job.id]: { ...prev[job.id], rating: star },
                              }))
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea
                        rows="2"
                        className="form-control mb-2"
                        placeholder="Write your review..."
                        value={reviews[job.id]?.review || ""}
                        onChange={(e) =>
                          setReviews((prev) => ({
                            ...prev,
                            [job.id]: { ...prev[job.id], review: e.target.value },
                          }))
                        }
                      />
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => submitReview(job.id, job.craftsman?.id)}
                      >
                        Submit Review
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="card p-3 mb-4 shadow-sm overflow-auto">
              <h4>Payments</h4>
              {jobs.length === 0 ? (
                <p className="text-muted">No service requests to pay for yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Total (KSh)</th>
                        <th>Company Fee</th>
                        <th>Net to Craftsman</th>
                        <th>Payment Status</th>
                        <th>Pay Now</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => {
                        const companyFee = job.budget ? Math.round(job.budget * 0.1) : 0;
                        const net = job.budget ? job.budget - companyFee : 0;
                        const paid = job.status === "Paid";
                        return (
                          <tr key={job.id}>
                            <td>{job.service}</td>
                            <td>{job.budget ? `KSh ${job.budget}` : "—"}</td>
                            <td>{`KSh ${companyFee}`}</td>
                            <td>{`KSh ${net}`}</td>
                            <td>{paid ? "✅ Paid" : "❌ Pending"}</td>
                            <td>
                              {!paid && job.status === "Completed" ? (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handlePayment(job.id)}
                                >
                                  Pay
                                </button>
                              ) : (
                                "—"
                              )}
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
        </main>
      </div>
    </div>
  );
};

export default HireCraftsmanPage;
