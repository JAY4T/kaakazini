import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../api/axiosClient";

import DashboardSidebar from "../../components/craftsman/DashboardSidebar";
import DashboardTab     from "../../components/craftsman/DashboardTab";
import AnalyticsTab     from "../../components/craftsman/AnalyticsTab";
import ProfileTab       from "../../components/craftsman/ProfileTab";
import JobsTab          from "../../components/craftsman/JobsTab";
import MembersTab       from "../../components/craftsman/MembersTab";
import SettingsTab      from "../../components/craftsman/SettingsTab";

import { getFullImageUrl } from "../../utils/getFullImageUrl";

// ─── Toast system ─────────────────────────────────────────────────────────────
const TOAST_ICONS  = { success:"✅", error:"❌", warning:"⚠️", info:"ℹ️" };
const TOAST_STYLES = {
  success: { bg:"#f0fdf4", border:"#86efac", color:"#15803d", bar:"#22c55e" },
  error:   { bg:"#fef2f2", border:"#fca5a5", color:"#991b1b", bar:"#ef4444" },
  warning: { bg:"#fffbeb", border:"#fde68a", color:"#92400e", bar:"#f59e0b" },
  info:    { bg:"#f0fdf4", border:"#86efac", color:"#15803d", bar:"#22c55e" },
};

function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        .toast-container { position:fixed; top:1.5rem; right:1.5rem; z-index:9999; display:flex; flex-direction:column; gap:.75rem; max-width:380px; width:calc(100vw - 3rem); pointer-events:none; }
        .toast-item { pointer-events:all; border-radius:14px; padding:1rem 1.25rem; display:flex; align-items:flex-start; gap:10px; box-shadow:0 8px 32px rgba(0,0,0,.12); border:2px solid; position:relative; overflow:hidden; animation:toastIn .35s cubic-bezier(.34,1.56,.64,1) forwards; font-family:'Outfit',sans-serif; }
        .toast-item.removing { animation:toastOut .25s ease-in forwards; }
        @keyframes toastIn  { from{opacity:0;transform:translateX(60px) scale(.92)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes toastOut { from{opacity:1;transform:translateX(0) scale(1);max-height:200px} to{opacity:0;transform:translateX(60px) scale(.9);max-height:0;padding:0;margin:0} }
        .toast-icon  { font-size:1.25rem; flex-shrink:0; line-height:1.3; }
        .toast-body  { flex-grow:1; }
        .toast-title { font-weight:800; font-size:.9rem; margin-bottom:2px; }
        .toast-msg   { font-size:.85rem; font-weight:500; opacity:.9; line-height:1.4; }
        .toast-close { background:none; border:none; cursor:pointer; font-size:1.1rem; line-height:1; padding:0; flex-shrink:0; opacity:.6; transition:opacity .2s; margin-top:-2px; }
        .toast-close:hover { opacity:1; }
        .toast-bar   { position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 14px 14px; animation:toastBar var(--duration,4s) linear forwards; }
        @keyframes toastBar { from{width:100%} to{width:0%} }
        @media (max-width:480px) { .toast-container { top:1rem; right:1rem; left:1rem; width:auto; } }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => {
          const s = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          return (
            <div key={t.id} className={`toast-item ${t.removing ? "removing" : ""}`}
              style={{background:s.bg, borderColor:s.border, color:s.color, "--duration":`${t.duration/1000}s`}}>
              <span className="toast-icon">{TOAST_ICONS[t.type]}</span>
              <div className="toast-body">
                {t.title && <div className="toast-title">{t.title}</div>}
                <div className="toast-msg">{t.message}</div>
              </div>
              <button className="toast-close" onClick={() => removeToast(t.id)} style={{color:s.color}}>×</button>
              <div className="toast-bar" style={{background:s.bar}}/>
            </div>
          );
        })}
      </div>
    </>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? {...t, removing:true} : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  }, []);
  const addToast = useCallback((message, type="info", title="", duration=4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, {id, message, type, title, duration, removing:false}]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);
  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [craftsman,   setCraftsman]   = useState({});
  const [profileData, setProfileData] = useState({
    description: "", profession: "", experience_level: "",
    location: "", company_name: "", skills: [], services: [],
    account_type: "Individual",
  });

  const [profileImage,  setProfileImage]  = useState(null);
  const [proofDocument, setProofDocument] = useState(null);
  const [portfolioImages,      setPortfolioImages]      = useState([]);
  const [portfolioIdsToRemove, setPortfolioIdsToRemove] = useState([]);

  const [jobs,      setJobs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const accountType = profileData.account_type || craftsman.account_type || "Individual";

  const professionOptions = ["Electrician","Plumber","Carpenter","Welder","Painter","Mechanic","WoodMaker","Mason","Tiler","Roofer","AC Technician","Landscaper"];
  const skillOptions      = ["Wiring","Pipe Fitting","Roofing","Furniture Making","Auto Repair","Welding","Tiling","Plastering","Painting"];
  const serviceOptions    = ["Plumbing","Electrical","Carpentry","Painting","Roofing","Welding","Tiling","Interior Design","Landscaping","Masonry","AC Repair","Woodwork","Auto Repair","Tarmacking","Fencing","Borehole Drilling"];

  useEffect(() => { fetchCraftsmanData(); fetchAssignedJobs(); }, []);

  const fetchCraftsmanData = async () => {
    try {
      const { data } = await api.get("/craftsman/");
      setCraftsman(data);
      setProfileData({
        description:      data.description      || "",
        profession:       data.profession        || "",
        experience_level: data.experience_level  || "",
        location:         data.location          || "",
        company_name:     data.company_name      || "",
        account_type:     data.account_type      || "Individual",
        skills: Array.isArray(data.skills) ? data.skills : [],
        services: Array.isArray(data.services)
          ? data.services.map(s => ({ id:s.id, name:s.name, rate:s.rate ? parseFloat(s.rate) : null, unit:s.unit||"fixed" }))
          : [],
      });
      setProfileImage(data.profile_url   ? getFullImageUrl(data.profile_url)        : null);
      setProofDocument(data.proof_document_url ? getFullImageUrl(data.proof_document_url) : null);
      if (Array.isArray(data.gallery_images)) {
        setPortfolioImages(data.gallery_images.map(img => ({ id:img.id, url:img.image_url, preview:getFullImageUrl(img.image_url), isExisting:true })));
      }
    } catch (err) {
      addToast("Failed to load your profile. Please refresh.", "error", "Load Error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedJobs = async () => {
    try {
      const { data } = await api.get("/job-requests/");
      setJobs(data || []);
    } catch (err) {}
  };

  const handleProfileImageChange  = (e) => { const f = e.target.files[0]; if (f) setProfileImage(f); };
  const handleProofDocumentChange = (e) => { const f = e.target.files[0]; if (f) setProofDocument(f); };
  const handlePortfolioAdd        = (imgObj) => setPortfolioImages(prev => [...prev, imgObj]);
  const handlePortfolioRemove     = (id) => {
    const img = portfolioImages.find(i => (i.id ?? i) === id);
    setPortfolioImages(prev => prev.filter(i => (i.id ?? i) !== id));
    if (img?.isExisting && typeof img.id === "number") setPortfolioIdsToRemove(prev => [...prev, img.id]);
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const saveProfile = async (formData) => {
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.patch("/craftsman/", formData);
      setCraftsman(data);
      setProfileImage(data.profile_url ? getFullImageUrl(data.profile_url) : null);
      setProofDocument(data.proof_document_url ? getFullImageUrl(data.proof_document_url) : null);
      if (Array.isArray(data.gallery_images)) {
        setPortfolioImages(data.gallery_images.map(img => ({ id:img.id, url:img.image_url, preview:getFullImageUrl(img.image_url), isExisting:true })));
      }
      setProfileData(prev => ({
        ...prev,
        skills: Array.isArray(data.skills) ? data.skills : prev.skills,
        services: Array.isArray(data.services) ? data.services.map(s => ({ id:s.id, name:s.name, rate:s.rate ? parseFloat(s.rate) : null, unit:s.unit||"fixed" })) : prev.services,
        experience_level: data.experience_level || prev.experience_level,
      }));
      setPortfolioIdsToRemove([]);
      addToast("Profile saved!", "success", "Profile Saved!", 5000);
    } catch (err) {
      const msg = err.response?.data?.detail || Object.values(err.response?.data || {})[0] || "Something went wrong. Please try again.";
      addToast(typeof msg === "string" ? msg : JSON.stringify(msg), "error", "Save Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#fbbf24,#22c55e)"}}>
      <div style={{textAlign:"center"}}>
        <div className="spinner-border text-light" role="status" style={{width:"4rem",height:"4rem"}}/>
        <p className="mt-3 text-light fw-bold">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .dashboard-container { min-height:100vh; background:white; display:flex; font-family:'Outfit',sans-serif; }
        .main-content { flex-grow:1; padding:2.5rem; background:#f8fafc; min-height:100vh; }
        .content-card {
          background:white; border-radius:20px;
          box-shadow:0 10px 40px rgba(0,0,0,.06);
          padding:2.5rem; margin-bottom:2rem;
          border:2px solid rgba(251,191,36,.1);
          position:relative; overflow:hidden;
        }
        .content-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#fbbf24,#22c55e); }
        .content-card.dark { background:transparent; box-shadow:none; padding:0; border:none; }
        .content-card.dark::before { display:none; }
        @media (max-width:768px) {
          .main-content  { padding:1rem; }
          .content-card  { padding:1.25rem; border-radius:14px; }
        }
      `}</style>

      <ToastContainer toasts={toasts} removeToast={removeToast}/>

      <div className="dashboard-container">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          accountType={accountType}
        />

        <div className="main-content">

          {activeTab === "Dashboard" && (
            <div className="content-card">
              <DashboardTab craftsman={craftsman} jobs={jobs}/>
            </div>
          )}

          {activeTab === "Analytics" && (
            <div className="content-card dark">
              <AnalyticsTab craftsman={craftsman} jobs={jobs}/>
            </div>
          )}

          {activeTab === "Profile" && (
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
                portfolioImages={portfolioImages}
                onPortfolioAdd={handlePortfolioAdd}
                onPortfolioRemove={handlePortfolioRemove}
                portfolioRemoveIds={portfolioIdsToRemove}
                saveProfile={saveProfile}
                saving={saving}
                addToast={addToast}
              />
            </div>
          )}

          {activeTab === "Jobs" && (
            <div className="content-card">
              <JobsTab jobs={jobs} setJobs={setJobs} userRole="craftsman" addToast={addToast}/>
            </div>
          )}

          {activeTab === "Members" && accountType === "Company" && (
            <div className="content-card">
              <MembersTab craftsman={craftsman} addToast={addToast}/>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="content-card">
              <SettingsTab craftsman={craftsman} addToast={addToast}/>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default DashboardPage;
