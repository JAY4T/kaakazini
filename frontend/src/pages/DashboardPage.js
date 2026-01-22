import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api/axiosClient";

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
    skills: [],
    primary_service: "",
    account_type: "Individual",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [proofDocument, setProofDocument] = useState(null);
  const [proofDocumentFile, setProofDocumentFile] = useState(null);
  const [serviceImage, setServiceImage] = useState(null);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const professionOptions = ["Electrician", "Plumber", "Carpenter", "Welder", "Painter", "Mechanic", "WoodMaker"];
  const skillOptions = ["Wiring", "Pipe Fitting", "Roofing", "Furniture Making", "Auto Repair"];
  const serviceOptions = ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "Welding", "Tiling", "Interior Design", "Landscaping", "Masonry", "AC Repair", "Woodwork", "Auto Repair"];

  useEffect(() => {
    fetchCraftsmanData();
    fetchAssignedJobs();
  }, []);

  const fetchCraftsmanData = async () => {
    try {
      const res = await api.get("/craftsman/");

      const data = res.data;
      setCraftsman(data);
      setProfileData({
        description: data.description || "",
        profession: data.profession || "",
        location: data.location || "",
        company_name: data.company_name || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        primary_service: data.primary_service || "",
        account_type: data.account_type || "Individual",
      });
      setProfileImage(getFullImageUrl(data.profile));
      setServiceImage(getFullImageUrl(data.service_image));
      setProofDocument(getFullImageUrl(data.proof_document));
    } catch (err) {
      console.error("Error fetching craftsman data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedJobs = async () => {
    try {
      const res = await api.get("/job-requests/");
      setJobs(res.data || []);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

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

  const handleServiceImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setServiceImageFile(file);
    setServiceImage(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      Object.entries(profileData).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((item) => formData.append(`${k}[]`, item));
        else formData.append(k, v);
      });

      if (profileImageFile) formData.append("profile", profileImageFile);
      if (proofDocumentFile) formData.append("proof_document", proofDocumentFile);
      if (serviceImageFile) formData.append("service_image", serviceImageFile);

      const res = await api.patch("/craftsman/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCraftsman(res.data);
      setServiceImage(getFullImageUrl(res.data.service_image));
      alert("Profile Saved Successfully! Pending Approval");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border"></div></div>;

  return (
    <div className="d-flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow-1 p-4">
        {activeTab === "Profile" && (
          <ProfileTab
            craftsman={craftsman}
            profileData={profileData}
            setProfileData={setProfileData}
            profileImage={profileImage}
            handleProfileImageChange={handleProfileImageChange}
            handleProofDocumentChange={handleProofDocumentChange}
            proofDocument={proofDocument}
            professionOptions={professionOptions}
            skillOptions={skillOptions}
            serviceOptions={serviceOptions}
            serviceImage={serviceImage}
            handleServiceImageChange={handleServiceImageChange}
            saveProfile={saveProfile}
          />
        )}
        {activeTab === "Jobs" && (
          <JobsTab jobs={jobs} setJobs={setJobs} userRole="craftsman" />
        )}
        {activeTab === "Settings" && <div>Settings Coming Soon...</div>}
      </div>
    </div>
  );
}

export default DashboardPage;
