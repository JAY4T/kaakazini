import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://staging.kaakazini.com/api";

const HireCraftsmanPage = () => {
  const [activeTab, setActiveTab] = useState("makeRequest");
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState({});
  const [payments, setPayments] = useState([]); // <-- New payments state

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
    budget: "", // Budget in KSh
  });

  useEffect(() => {
    const storedClient = sessionStorage.getItem("client");
    const token = sessionStorage.getItem("access_token");

    if (storedClient && token) {
      const parsedClient = JSON.parse(storedClient);
      setClient(parsedClient);
      setIndividualForm((prev) => ({
        ...prev,
        name: parsedClient.full_name || "",
        phone: parsedClient.phone || parsedClient.phone_number || "",
      }));

      fetchJobs(parsedClient.id, token);
      fetchPayments(parsedClient.id, token); // fetch payment data
    } else {
      setClient(null);
    }
  }, []);

  const fetchJobs = async (clientId, token) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/job-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const clientJobs = data.filter(
        (j) => j.client === clientId || j.client?.id === clientId
      );
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

  const fetchPayments = async (clientId, token) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/payments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter payments by client
      const clientPayments = data.filter(
        (p) => p.client === clientId || p.client?.id === clientId
      );
      setPayments(clientPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
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
      const token = sessionStorage.getItem("access_token");
      await axios.post(`${BASE_URL}/job-requests/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Request submitted!");
      fetchJobs(client.id, token);
      setIndividualForm({
        name: client.full_name || "",
        phone: client.phone || client.phone_number || "",
        service: "",
        schedule: "",
        address: "",
        location: "",
        description: "",
        isUrgent: false,
        media: null,
        budget: "",
      });

      setActiveTab("myRequests");
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      alert("❌ Failed to submit request.");
    }
  };

  const updateJob = async (jobId, update) => {
    try {
      const token = sessionStorage.getItem("access_token");
      await axios.patch(`${BASE_URL}/job-requests/${jobId}/`, update, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs(client.id, token);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const submitReview = async (jobId, craftsmanId) => {
    const token = sessionStorage.getItem("access_token");
    const reviewData = reviews[jobId] || {};
    const rating = parseInt(reviewData.rating) || 0;
    const reviewText = reviewData.review?.trim() || "";

    if (!rating || reviewText === "") {
      return alert("Please add both rating and review before submitting.");
    }
    if (!craftsmanId) return alert("Craftsman ID missing for this job.");

    try {
      await axios.post(
        `${BASE_URL}/reviews/`,
        {
          job: jobId,
          craftsman: craftsmanId,
          reviewer: client.full_name || client.username,
          rating,
          comment: reviewText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Review submitted successfully!");
      setReviews((prev) => ({ ...prev, [jobId]: { rating: 0, review: "" } }));
    } catch (err) {
      console.error("Review submission error:", err.response?.data || err.message);
      alert("❌ Failed to submit review.");
    }
  };

  const handlePayment = async (jobId, amount) => {
    const token = sessionStorage.getItem("access_token");
    try {
      await axios.post(
        `${BASE_URL}/payments/`,
        { client: client.id, job: jobId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Payment successful!");
      fetchPayments(client.id, token);
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
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 bg-dark text-white vh-100 p-3">
          <h4>Kaakazini Client Dashboard</h4>
          <p className="mt-3">
            Hi, <strong>{client.full_name}</strong> 👋
          </p>
          <ul className="nav flex-column mt-4">
            {["profile", "makeRequest", "myRequests", "reviews", "payments"].map((tab) => (
              <li className="nav-item mb-2" key={tab}>
                <button
                  className={`btn w-100 ${
                    activeTab === tab ? "btn-success" : "btn-outline-light"
                  }`}
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
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mt-4">
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
            <div className="card p-4">
              <p>
                <strong>Name:</strong> {client.full_name}
              </p>
              <p>
                <strong>Phone:</strong> {client.phone_number || client.phone}
              </p>
              <p>
                <strong>Email:</strong> {client.email}
              </p>
            </div>
          )}

          {/* Make Request */}
          {activeTab === "makeRequest" && (
            <div className="card shadow p-4">
              <form onSubmit={handleIndividualSubmit} encType="multipart/form-data">
                <div className="row mb-3">
                  <div className="col">
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
                  <div className="col">
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

                <div className="row mb-3">
                  <div className="col">
                    <input
                      type="datetime-local"
                      id="schedule"
                      value={individualForm.schedule}
                      onChange={handleIndividualChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col">
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

                <button type="submit" className="btn btn-success">
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {/* My Requests */}
          {activeTab === "myRequests" && (
            <div className="card p-4">
              <h4>Your Requests</h4>
              {jobs.length === 0 ? (
                <p className="text-muted">No service requests submitted yet.</p>
              ) : (
                <table className="table table-striped table-hover mt-3">
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
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => updateJob(job.id, { status: "Completed" })}
                          >
                            Mark as Completed
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
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="card p-4">
              <h4>Completed Jobs — Leave a Review</h4>
              {jobs.filter((j) => j.status === "Completed").length === 0 ? (
                <p className="text-muted">No completed jobs yet.</p>
              ) : (
                jobs
                  .filter((j) => j.status === "Completed")
                  .map((job) => (
                    <div key={job.id} className="border rounded p-3 mb-3">
                      <h5>
                        {job.service} — {new Date(job.schedule).toLocaleDateString()}
                      </h5>
                      <p>
                        <strong>Description:</strong> {job.description}
                      </p>
                      <p>
                        <strong>Budget:</strong> {job.budget ? `KSh ${job.budget}` : "—"}
                      </p>
                      <div className="mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              cursor: "pointer",
                              color: reviews[job.id]?.rating >= star ? "gold" : "lightgray",
                              fontSize: "1.8rem",
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

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="card p-4">
              <h4>Payments</h4>
              {jobs.length === 0 ? (
                <p className="text-muted">No service requests to pay for yet.</p>
              ) : (
                <table className="table table-striped table-hover mt-3">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Total Paid (KSh)</th>
                      <th>Company Fee</th>
                      <th>Net to Craftsman</th>
                      <th>Craftsman Confirmation</th>
                      <th>Pay Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const companyFee = job.budget ? Math.round(job.budget * 0.1) : 0; // 10% fee
                      const net = job.budget ? job.budget - companyFee : 0;
                      const paymentDone = payments.find((p) => p.job === job.id);
                      return (
                        <tr key={job.id}>
                          <td>{job.service}</td>
                          <td>{job.budget ? `KSh ${job.budget}` : "—"}</td>
                          <td>{`KSh ${companyFee}`}</td>
                          <td>{`KSh ${net}`}</td>
                          <td>
                            {paymentDone
                              ? paymentDone.confirmed
                                ? "Confirmed"
                                : "Pending"
                              : "Not Paid"}
                          </td>
                          <td>
                            {!paymentDone && job.status !== "Cancelled" && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handlePayment(job.id, job.budget)}
                              >
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HireCraftsmanPage;
