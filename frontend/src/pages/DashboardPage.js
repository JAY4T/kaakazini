import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const authAxios = axios.create({ baseURL: API_BASE_URL });
authAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getFullImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [craftsman, setCraftsman] = useState({});
  const [profileData, setProfileData] = useState({
    description: "",
    profession: "",
    location: "",
    company_name: "",
    skills: "",
    primary_service: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [serviceImage, setServiceImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const professionOptions = ["Electrician", "Plumber", "Carpenter", "Welder", "Painter", "Mechanic", "WoodMaker"];
  const skillOptions = ["Wiring", "Pipe Fitting", "Roofing", "Furniture Making", "Auto Repair"];
  const serviceOptions = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Roofing",
    "Welding",
    "Tiling",
    "Interior Design",
    "Landscaping",
    "Masonry",
    "AC Repair",
    "Woodwork",
    "Auto Repair",
  ];

  const fetchCraftsmanData = async () => {
    try {
      const res = await authAxios.get("/craftsman/");
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setCraftsman(data);
      setProfileData({
        description: data.description || "",
        profession: data.profession || "",
        location: data.location || "",
        company_name: data.company_name || "",
        skills: data.skills || "",
        primary_service: data.primary_service || "",
      });
      setProfileImage(getFullImageUrl(data.profile));
      setServiceImage(getFullImageUrl(data.service_image));
    } catch (err) {
      console.error("Error fetching craftsman data", err);
      alert("Error fetching craftsman data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedJobs = async () => {
    try {
      const res = await authAxios.get("/job-requests/");
      const data = Array.isArray(res.data) ? res.data : [];
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

  useEffect(() => {
    fetchCraftsmanData();
    fetchAssignedJobs();
  }, []);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "profile") {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    } else {
      setServiceImageFile(file);
      setServiceImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfile = () => {
    const requiredFields = ["description", "profession", "location", "company_name", "skills", "primary_service"];
    for (let field of requiredFields) {
      if (!profileData[field].trim()) return `${field.replace("_", " ")} is required`;
    }
    return null;
  };

  const saveProfile = async () => {
    const errorMsg = validateProfile();
    if (errorMsg) return alert(errorMsg);

    try {
      const formData = new FormData();
      Object.entries(profileData).forEach(([k, v]) => formData.append(k, v));
      if (profileImageFile) formData.append("profile", profileImageFile);
      if (serviceImageFile) formData.append("service_image", serviceImageFile);

      const res = await authAxios.patch("/craftsman/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCraftsman(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  /*** NEW FUNCTIONALITY FOR JOBS ***/

  const handleAcceptJob = async (jobId) => {
    try {
      await authAxios.patch(`/job-requests/${jobId}/`, { status: "Accepted" });
      fetchAssignedJobs();
    } catch (err) {
      console.error("Error accepting job", err);
      alert("Failed to accept job");
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await authAxios.patch(`/job-requests/${jobId}/`, { status: "Rejected" });
      fetchAssignedJobs();
    } catch (err) {
      console.error("Error rejecting job", err);
      alert("Failed to reject job");
    }
  };

  const handleSubmitQuote = async (jobId, quoteAmount) => {
    try {
      if (!quoteAmount || isNaN(quoteAmount)) return alert("Enter a valid quote amount");
      await authAxios.patch(`/job-requests/${jobId}/`, { quote: quoteAmount, status: "Quoted" });
      fetchAssignedJobs();
      alert("Quote submitted successfully!");
    } catch (err) {
      console.error("Error submitting quote", err);
      alert("Failed to submit quote");
    }
  };

  const handleMarkCompleted = async (jobId) => {
    try {
      await authAxios.patch(`/job-requests/${jobId}/`, { status: "Completed" });
      fetchAssignedJobs();
      alert("Job marked as completed!");
    } catch (err) {
      console.error("Error completing job", err);
      alert("Failed to mark job as completed");
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="text-center mb-4">Craftsman Dashboard</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${activeTab === "Profile" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveTab("Profile")}
            >
              Profile
            </button>
          </li>
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${activeTab === "Jobs" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveTab("Jobs")}
            >
              Jobs
            </button>
          </li>
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${activeTab === "Settings" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveTab("Settings")}
            >
              Settings
            </button>
          </li>
          <li className="nav-item mt-3">
            <button className="btn btn-danger w-100 text-start" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h2 className="fw-bold text-dark mb-4">Welcome, {craftsman.full_name || "Craftsman"}</h2>

        {activeTab === "Profile" && (
          <div className="card p-4 shadow-sm border-0 mb-5">
            <div className="d-flex align-items-center mb-4">
              <img
                src={profileImage || "https://via.placeholder.com/100"}
                alt="Profile"
                className="rounded-circle me-3 border"
                width="100"
                height="100"
              />
              <label className="btn btn-outline-primary btn-sm">
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e, "profile")} />
              </label>
            </div>

            <textarea
              className="form-control mb-3"
              rows="2"
              name="description"
              value={profileData.description}
              onChange={handleInputChange}
              placeholder="Short bio..."
            />

            <div className="row">
              <div className="col-md-6 mb-3">
                <select className="form-select" name="profession" value={profileData.profession} onChange={handleInputChange}>
                  <option value="">Select Profession</option>
                  {professionOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <select className="form-select" name="skills" value={profileData.skills} onChange={handleInputChange}>
                  <option value="">Select Skill</option>
                  {skillOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              className="form-control mb-3"
              placeholder="Company Name"
              name="company_name"
              value={profileData.company_name}
              onChange={handleInputChange}
            />

            <select className="form-select mb-3" name="location" value={profileData.location} onChange={handleInputChange}>
              <option value="">Select Location</option>
              <option value="Nairobi,South B">South B</option>
              <option value="Nairobi,Westlands">Westlands</option>
              <option value="Nairobi,Karen">Karen</option>
              <option value="Nairobi,Embakasi">Embakasi</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Eldoret">Eldoret</option>
            </select>

            <select className="form-select mb-3" name="primary_service" value={profileData.primary_service} onChange={handleInputChange}>
              <option value="">Select Service</option>
              {serviceOptions.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {serviceImage && (
              <img src={serviceImage} alt="Service" className="img-thumbnail mb-2" style={{ width: 150, height: 100, objectFit: "cover" }} />
            )}
            <label className="btn btn-outline-secondary btn-sm mb-3">
              Upload Service Image
              <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e, "service")} />
            </label>

            <p className="text-muted">
              <strong>Status:</strong> {craftsman.status || "N/A"}
            </p>
            <button className="btn btn-success mt-3" onClick={saveProfile}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "Jobs" && (
          <div>
            <h4 className="mb-3">Assigned Jobs</h4>
            {jobs.length === 0 ? (
              <p className="text-muted">No jobs assigned yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Job</th>
                      <th>Description</th>
                      <th>Quote</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>{job.service || "Unnamed Job"}</td>
                        <td>{job.description || "No description"}</td>
                        <td>
                          {job.status === "Quoted" ? `$${job.quote}` : job.status === "Completed" ? `$${job.quote}` : (
                            <input
                              type="number"
                              placeholder="Enter quote"
                              className="form-control form-control-sm"
                              onBlur={(e) => handleSubmitQuote(job.id, e.target.value)}
                            />
                          )}
                        </td>
                        <td>{job.status || "Pending"}</td>
                        <td>
                          {job.status === "Pending" && (
                            <>
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleAcceptJob(job.id)}>
                                Accept
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleRejectJob(job.id)}>
                                Reject
                              </button>
                            </>
                          )}
                          {job.status === "Accepted" && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleMarkCompleted(job.id)}>
                              Mark Completed
                            </button>
                          )}
                          {job.status === "Quoted" && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleMarkCompleted(job.id)}>
                              Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="card shadow-sm border-0 p-4">
            <h5>Settings</h5>
            <p className="text-muted">Manage account settings here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
