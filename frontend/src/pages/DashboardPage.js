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
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [proofDocument, setProofDocument] = useState(null); // ✅ Craftsman proof
  const [proofDocumentFile, setProofDocumentFile] = useState(null);

  const [serviceImages, setServiceImages] = useState([]);
  const [serviceVideos, setServiceVideos] = useState([]);
  const [serviceImageFiles, setServiceImageFiles] = useState([]);
  const [serviceVideoFiles, setServiceVideoFiles] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const professionOptions = ["Electrician", "Plumber", "Carpenter", "Welder", "Painter", "Mechanic", "WoodMaker"];
  const skillOptions = ["Wiring", "Pipe Fitting", "Roofing", "Furniture Making", "Auto Repair"];
  const serviceOptions = [
    "Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "Welding",
    "Tiling", "Interior Design", "Landscaping", "Masonry", "AC Repair", "Woodwork", "Auto Repair",
  ];

  useEffect(() => {
    fetchCraftsmanData();
    fetchAssignedJobs();
  }, []);

  const fetchCraftsmanData = async () => {
  try {
    const res = await authAxios.get("/craftsman/"); // use the private detail endpoint
    const data = res.data; // this is the single craftsman object
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
    setServiceImages(data.service_images?.map(getFullImageUrl) || []);
    setServiceVideos(data.service_videos?.map(getFullImageUrl) || []);
    setProofDocument(getFullImageUrl(data.proof_document));
  } catch (err) {
    console.error("Error fetching craftsman data", err);
  } finally {
    setLoading(false);
  }
};


  const fetchAssignedJobs = async () => {
    try {
      const res = await authAxios.get("/job-requests/");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

  // === HANDLERS ===
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleProofDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofDocumentFile(file);
      setProofDocument(file.name);
    }
  };

  const handleServiceImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setServiceImageFiles((prev) => [...prev, ...files]);
    setServiceImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleServiceVideosChange = (e) => {
    const files = Array.from(e.target.files);
    setServiceVideoFiles((prev) => [...prev, ...files]);
    setServiceVideos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleRemoveServiceImage = (i) => {
    setServiceImages(serviceImages.filter((_, idx) => idx !== i));
    setServiceImageFiles(serviceImageFiles.filter((_, idx) => idx !== i));
  };

  const handleRemoveServiceVideo = (i) => {
    setServiceVideos(serviceVideos.filter((_, idx) => idx !== i));
    setServiceVideoFiles(serviceVideoFiles.filter((_, idx) => idx !== i));
  };

  const handleEditServiceImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImgURL = URL.createObjectURL(file);
      const updatedImages = [...serviceImages];
      const updatedFiles = [...serviceImageFiles];
      updatedImages[index] = newImgURL;
      updatedFiles[index] = file;
      setServiceImages(updatedImages);
      setServiceImageFiles(updatedFiles);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ VALIDATION
  const validateProfile = () => {
    const required = [
      "description", "profession", "location",
      "company_name", "skills", "primary_service",
    ];
    for (let key of required) {
      if (!profileData[key].trim()) return `${key.replace("_", " ")} is required`;
    }
    if (!profileImageFile && !profileImage) return "Profile photo is required";
    if (serviceImages.length === 0) return "At least one service image is required";
    return null;
  };

  const saveProfile = async () => {
    const error = validateProfile();
    if (error) return alert(`⚠️ ${error}`);

    try {
      const formData = new FormData();
      Object.entries(profileData).forEach(([k, v]) => formData.append(k, v));
      if (profileImageFile) formData.append("profile", profileImageFile);
      if (proofDocumentFile) formData.append("proof_document", proofDocumentFile);
      serviceImageFiles.forEach((img) => formData.append("service_images", img));
      serviceVideoFiles.forEach((vid) => formData.append("service_videos", vid));

      const res = await authAxios.patch("/craftsman/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCraftsman(res.data);
      alert("✅ Profile submitted successfully! Pending verification.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save profile. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  // === JOB HANDLERS ===
  const handleAcceptJob = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Accepted" });
    fetchAssignedJobs();
  };

  const handleRejectJob = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Rejected" });
    fetchAssignedJobs();
  };

  const handleMarkCompleted = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Completed" });
    fetchAssignedJobs();
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: 250 }}>
        <h4 className="text-center mb-4">Craftsman Dashboard</h4>
        {["Profile", "Jobs", "Settings"].map((tab) => (
          <button
            key={tab}
            className={`btn w-100 mb-2 ${activeTab === tab ? "btn-primary" : "btn-outline-light"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>Logout</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h2 className="fw-bold mb-4">Welcome, {craftsman.full_name || "Craftsman"}</h2>

        {/* PROFILE TAB */}
        {activeTab === "Profile" && (
          <div className="card p-4 shadow-sm border-0">
            {/* Profile Photo */}
            <div className="d-flex align-items-center mb-4">
              <img
                src={profileImage || "https://via.placeholder.com/100"}
                alt="Profile"
                className="rounded-circle border me-3"
                width="100"
                height="100"
              />
              <label className="btn btn-outline-primary btn-sm">
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
              </label>
            </div>

            {/* Proof Document (Optional) */}
<div className="mb-3">
  <label className="form-label fw-bold">
    Craftsman Proof Document (e.g., certificate){" "}
    <span className="text-muted fw-normal">(optional)</span>
  </label>
  <input
    type="file"
    accept=".pdf,image/*"
    className="form-control"
    onChange={handleProofDocumentChange}
  />
  {proofDocument && (
    <small className="text-success">
      Uploaded: {proofDocumentFile ? proofDocumentFile.name : proofDocument.split("/").pop()}
    </small>
  )}
</div>

            {/* Professional Summary */}
<textarea
  className="form-control mb-3"
  rows="2"
  name="description"
  placeholder="Add a short professional summary about your company or craftsmanship"
  value={profileData.description}
  onChange={handleInputChange}
/>


            {/* Select Fields */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <select name="profession" className="form-select" value={profileData.profession} onChange={handleInputChange}>
                  <option value="">Select Profession</option>
                  {professionOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <select name="skills" className="form-select" value={profileData.skills} onChange={handleInputChange}>
                  <option value="">Select Skill</option>
                  {skillOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <input
              className="form-control mb-3"
              name="company_name"
              placeholder="Company Name"
              value={profileData.company_name}
              onChange={handleInputChange}
            />

            <select name="location" className="form-select mb-3" value={profileData.location} onChange={handleInputChange}>
              <option value="">Select Location</option>
              {["South B", "Westlands", "Karen", "Embakasi", "Nakuru", "Eldoret"].map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>

            <select name="primary_service" className="form-select mb-3" value={profileData.primary_service} onChange={handleInputChange}>
              <option value="">Select Service</option>
              {serviceOptions.map((s) => <option key={s}>{s}</option>)}
            </select>

            {/* Service Images */}
<div className="mb-3">
  <div className="d-flex flex-wrap gap-3">
    {serviceImages.map((img, i) => (
      <div key={i} className="position-relative">
        <img src={img} className="img-thumbnail" width="120" height="100" alt="" />
        <button
          className="btn btn-sm btn-light position-absolute top-0 end-0 m-1"
          onClick={() => handleRemoveServiceImage(i)}
        >
          <i className="bi bi-x-lg text-danger"></i>
        </button>
        <label htmlFor={`edit-${i}`} className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-1">
          <i className="bi bi-pencil-fill text-primary"></i>
          <input
            id={`edit-${i}`}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => handleEditServiceImage(e, i)}
          />
        </label>
      </div>
    ))}

    {/* Plus Button with Label */}
    <label
      htmlFor="serviceImages"
      className="border rounded d-flex flex-column justify-content-center align-items-center"
      style={{ width: 150, height: 120, background: "#f8f9fa", cursor: "pointer" }}
    >
      <i className="bi bi-plus-lg fs-3 text-secondary"></i>
      <span className="small text-muted">Upload service image</span>
      <input
        id="serviceImages"
        type="file"
        hidden
        multiple
        accept="image/*"
        onChange={handleServiceImagesChange}
      />
    </label>
  </div>
</div>

            {/* Service Videos */}
            <div className="mb-3">
              <h6>Service Videos <span className="text-muted small">(optional)</span></h6>
              <div className="d-flex flex-wrap gap-3">
                {serviceVideos.map((vid, i) => (
                  <div key={i} className="position-relative">
                    <video src={vid} width="180" height="120" controls></video>
                    <button
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-1"
                      onClick={() => handleRemoveServiceVideo(i)}
                    >
                      <i className="bi bi-x-lg text-danger"></i>
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="serviceVideos"
                  className="border rounded d-flex flex-column justify-content-center align-items-center"
                  style={{ width: 150, height: 120, background: "#f8f9fa", cursor: "pointer" }}
                >
                  <i className="bi bi-plus-lg fs-3 text-secondary"></i>
                  <span className="small text-muted">Upload service video</span>
                  <input
                    id="serviceVideos"
                    type="file"
                    hidden
                    multiple
                    accept="video/*"
                    onChange={handleServiceVideosChange}
                  />
                </label>
              </div>
            </div>

            <p className="text-muted">
              <strong>Status:</strong>{" "}
              <span className={`badge ${craftsman.status === "Approved" ? "bg-success" : "bg-warning text-dark"}`}>
                {craftsman.status || "Pending Approval"}
              </span>
            </p>

            <button
              className="btn btn-success mt-3"
              onClick={saveProfile}
              disabled={!!validateProfile()}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* JOBS TAB */}
{activeTab === "Jobs" && (
  <div className="card p-4 shadow-sm border-0">
    <h4 className="mb-3 fw-bold">Assigned Jobs</h4>

    {jobs.length === 0 ? (
      <p className="text-muted">No assigned jobs yet.</p>
    ) : (
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Service</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {jobs.map((job, i) => {
    const status = job.status?.toLowerCase() || ""; // normalize status
    return (
      <tr key={job.id}>
        <td>{i + 1}</td>
        <td>{job.client?.full_name || "N/A"}</td>
        <td>{job.service || "N/A"}</td>
        <td>{job.location || "N/A"}</td>
        <td>
          <span
            className={`badge ${
              status === "accepted"
                ? "bg-success"
                : status === "rejected"
                ? "bg-danger"
                : status === "completed"
                ? "bg-secondary"
                : "bg-warning text-dark"
            }`}
          >
            {job.status || "Pending"}
          </span>
        </td>
       <td>
  {["pending", "assigned"].includes(status) && (
    <>
      <button
        className="btn btn-sm btn-success me-2"
        onClick={() => handleAcceptJob(job.id)}
      >
        Accept
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleRejectJob(job.id)}
      >
        Reject
      </button>
    </>
  )}

  {status === "accepted" && (
    <>
      <button
        className="btn btn-sm btn-primary me-2"
        onClick={() => handleMarkCompleted(job.id)}
      >
        Mark Completed
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => navigate(`/upload-proof/${job.id}`)}
      >
        Upload Proof
      </button>
    </>
  )}

  {status === "completed" && (
    <span className="text-muted small">Done</span>
  )}

  {status === "rejected" && (
    <span className="text-danger small">Rejected</span>
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
</div>
    </div>
  );
}

export default DashboardPage;
