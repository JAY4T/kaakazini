import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { authAxios } from "../api/axiosClient";
import { getFullImageUrl } from "../utils/helpers";
import DashboardSidebar from "../components/DashboardSidebar";
import ProfileTab from "../components/ProfileTab";
import JobsTab from "../components/JobsTab";

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
  const [proofDocument, setProofDocument] = useState(null);
  const [proofDocumentFile, setProofDocumentFile] = useState(null);

  const [serviceImages, setServiceImages] = useState([]);
  const [serviceImageFiles, setServiceImageFiles] = useState([]);
  const [serviceVideos, setServiceVideos] = useState([]);
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

  // === Fetch Craftsman Profile ===
  useEffect(() => {
    fetchCraftsmanData();
    fetchAssignedJobs();
  }, []);

  const fetchCraftsmanData = async () => {
    try {
      const res = await authAxios.get("/craftsman/");
      const data = res.data;
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

  // === Fetch Jobs & Normalize Status ===
  const fetchAssignedJobs = async () => {
    try {
      const res = await authAxios.get("/job-requests/");
      let jobsData = Array.isArray(res.data) ? res.data : [];

      jobsData = jobsData.map((job) => {
        let status = job.status?.toLowerCase() || "pending";

        if (["pending", "new"].includes(status)) status = "Pending";
        if (["accepted", "accept"].includes(status)) status = "Accepted";
        if (["in_progress", "in progress", "started"].includes(status)) status = "In Progress";
        if (["completed", "done"].includes(status)) status = "Completed";
        if (["approved", "approved_by_client"].includes(status)) status = "Approved";
        if (["paid", "payment_done"].includes(status)) status = "Paid";
        if (["rejected", "declined"].includes(status)) status = "Rejected";

        return { ...job, status };
      });

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

  // === Profile Handlers ===
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleProofDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofDocumentFile(file);
    setProofDocument(file.name);
  };

  const handleServiceImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setServiceImageFiles((prev) => [...prev, ...files]);
    setServiceImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleServiceVideosChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

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
    if (!file) return;

    const updatedImages = [...serviceImages];
    const updatedFiles = [...serviceImageFiles];

    updatedImages[index] = URL.createObjectURL(file);
    updatedFiles[index] = file;

    setServiceImages(updatedImages);
    setServiceImageFiles(updatedFiles);
  };

  const validateProfile = () => {
    const required = ["description", "profession", "location", "company_name", "skills", "primary_service"];
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

      // Add new service images/videos while keeping old ones
      serviceImageFiles.forEach((img) => formData.append("service_images", img));
      serviceVideoFiles.forEach((vid) => formData.append("service_videos", vid));

      const res = await authAxios.patch("/craftsman/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCraftsman(res.data);
      setServiceImages(res.data.service_images?.map(getFullImageUrl) || []);
      setServiceVideos(res.data.service_videos?.map(getFullImageUrl) || []);
      setServiceImageFiles([]);
      setServiceVideoFiles([]);
      alert("✅ Profile submitted successfully! Pending verification.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save profile. Please try again.");
    }
  };

  // === Job Handlers ===
  const handleAcceptJob = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Accepted" });
    fetchAssignedJobs();
  };

  const handleRejectJob = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Rejected" });
    fetchAssignedJobs();
  };

  const handleStartJob = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "In Progress" });
    fetchAssignedJobs();
  };

  const handleUploadProof = async (id, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("proof_files", file));

    await authAxios.patch(`/job-requests/${id}/upload-proof/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    fetchAssignedJobs();
    alert("✅ Proof uploaded successfully");
  };

  const handleMarkCompleted = async (id) => {
    await authAxios.patch(`/job-requests/${id}/`, { status: "Completed" });
    fetchAssignedJobs();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h2 className="fw-bold mb-4">Welcome, {craftsman.full_name || "Craftsman"}</h2>

        {activeTab === "Profile" && (
          <ProfileTab
            craftsman={craftsman}
            profileData={profileData}
            setProfileData={setProfileData}
            profileImage={profileImage}
            handleProfileImageChange={handleProfileImageChange}
            handleProofDocumentChange={handleProofDocumentChange}
            proofDocument={proofDocument}
            proofDocumentFile={proofDocumentFile}
            professionOptions={professionOptions}
            skillOptions={skillOptions}
            serviceOptions={serviceOptions}
            serviceImages={serviceImages}
            handleRemoveServiceImage={handleRemoveServiceImage}
            handleEditServiceImage={handleEditServiceImage}
            handleServiceImagesChange={handleServiceImagesChange}
            serviceVideos={serviceVideos}
            handleRemoveServiceVideo={handleRemoveServiceVideo}
            handleServiceVideosChange={handleServiceVideosChange}
            saveProfile={saveProfile}
            validateProfile={validateProfile}
          />
        )}

        {activeTab === "Jobs" && (
          <JobsTab
            jobs={jobs}
            handleAcceptJob={handleAcceptJob}
            handleRejectJob={handleRejectJob}
            handleStartJob={handleStartJob}
            handleUploadProof={handleUploadProof}
            handleMarkCompleted={handleMarkCompleted}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
