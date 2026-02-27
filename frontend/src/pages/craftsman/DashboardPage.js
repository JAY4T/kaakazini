import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../api/axiosClient"; 

import DashboardSidebar from "../../components/craftsman/DashboardSidebar";
import ProfileTab from "../../components/craftsman/ProfileTab";
import JobsTab from "../../components/craftsman/JobsTab";

import { getFullImageUrl } from "../../utils/getFullImageUrl";

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

  const professionOptions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Welder",
    "Painter",
    "Mechanic",
    "WoodMaker",
  ];

  const skillOptions = [
    "Wiring",
    "Pipe Fitting",
    "Roofing",
    "Furniture Making",
    "Auto Repair",
  ];

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

      setProfileImage(getFullImageUrl(data.profile_url));
      setServiceImage(getFullImageUrl(data.service_image_url));
      setProofDocument(getFullImageUrl(data.proof_document_url));
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
    setProofDocument(URL.createObjectURL(file));
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
        if (Array.isArray(v)) {
          v.forEach((item) => formData.append(`${k}[]`, item));
        } else {
          formData.append(k, v);
        }
      });

      if (profileImageFile) formData.append("profile", profileImageFile);
      if (proofDocumentFile) formData.append("proof_document", proofDocumentFile);
      if (serviceImageFile) formData.append("service_image", serviceImageFile);

      const res = await api.patch("/craftsman/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

       setCraftsman(res.data);
      setProfileImage(getFullImageUrl(res.data.profile_url));           
      setServiceImage(getFullImageUrl(res.data.service_image_url));
      setProofDocument(getFullImageUrl(res.data.proof_document_url));   
      alert("Profile Saved Successfully! Pending Approval");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fbbf24 0%, #22c55e 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-light" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-light fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        /* Global Styles */
        .dashboard-container {
          min-height: 100vh;
          background: white;
          display: flex;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .main-content {
          flex-grow: 1;
          padding: 2.5rem;
          background: transparent;
          min-height: 100vh;
        }

        /* Tab Header - Yellow/Green Gradient */
        .tab-header {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          color: #1f2937;
          padding: 2.5rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          box-shadow: 0 20px 50px rgba(251, 191, 36, 0.25);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.4);
        }

        .tab-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -20px) rotate(5deg); }
        }

        .tab-header h2 {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
        }

        .tab-header p {
          margin: 0.75rem 0 0 0;
          opacity: 0.85;
          font-size: 1.05rem;
          position: relative;
          z-index: 1;
          font-weight: 500;
        }

        /* Content Card */
        .content-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          padding: 2.5rem;
          margin-bottom: 2rem;
          border: 2px solid rgba(251, 191, 36, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .content-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
        }

        .content-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
          border-color: rgba(34, 197, 94, 0.3);
        }

        /* Settings Placeholder */
        .settings-placeholder {
          text-align: center;
          padding: 5rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          border: 2px solid rgba(251, 191, 36, 0.15);
          position: relative;
          overflow: hidden;
        }

        .settings-placeholder::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fbbf24 0%, #22c55e 100%);
        }

        .settings-placeholder svg {
          width: 140px;
          height: 140px;
          margin-bottom: 2rem;
          opacity: 0.2;
          color: #fbbf24;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }

        .settings-placeholder h3 {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          margin-bottom: 0.75rem;
          font-size: 1.75rem;
          letter-spacing: -0.5px;
        }

        .settings-placeholder p {
          color: #6b7280;
          font-size: 1.05rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 1.25rem;
          }

          .tab-header {
            padding: 2rem;
            border-radius: 16px;
          }

          .tab-header h2 {
            font-size: 1.75rem;
          }

          .content-card {
            padding: 1.75rem;
            border-radius: 16px;
          }

          .settings-placeholder {
            padding: 3rem 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .main-content {
            padding: 1rem;
          }

          .tab-header {
            padding: 1.5rem;
            border-radius: 12px;
          }

          .tab-header h2 {
            font-size: 1.5rem;
          }

          .tab-header p {
            font-size: 0.95rem;
          }

          .content-card {
            padding: 1.25rem;
            border-radius: 12px;
          }

          .settings-placeholder svg {
            width: 100px;
            height: 100px;
          }

          .settings-placeholder h3 {
            font-size: 1.5rem;
          }
        }

        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 0.6rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          margin-top: 1rem;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .status-pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
        }

        .status-approved {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
        }

        .status-rejected {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
        }

        /* Animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .content-card,
        .settings-placeholder {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-header {
          animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="dashboard-container">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="main-content">
          {activeTab === "Profile" && (
            <>
              <div className="tab-header">
                <h2>👤 My Profile</h2>
                <p>Manage your professional information and showcase your skills</p>
                {craftsman.status && (
                  <span className={`status-badge status-${craftsman.status}`}>
                    {craftsman.status}
                  </span>
                )}
              </div>
              
              <div className="content-card">
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
              </div>
            </>
          )}

          {activeTab === "Jobs" && (
            <>
              <div className="tab-header">
                <h2>💼 My Jobs</h2>
                <p>View and manage your assigned job requests</p>
              </div>
              
              <div className="content-card">
                <JobsTab jobs={jobs} setJobs={setJobs} userRole="craftsman" />
              </div>
            </>
          )}

          {activeTab === "Settings" && (
            <>
              <div className="tab-header">
                <h2>⚙️ Settings</h2>
                <p>Configure your account preferences and privacy settings</p>
              </div>
              
              <div className="settings-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3>Settings Coming Soon</h3>
                <p>We're working on bringing you powerful settings to customize your experience.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
