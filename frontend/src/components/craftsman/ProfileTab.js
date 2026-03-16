import React, { useState, useRef } from "react";
import { Col, Row, Collapse, ProgressBar } from "react-bootstrap";
import { getFullImageUrl } from "../../utils/getFullImageUrl";
import {
  FaUser, FaBuilding, FaMapMarkerAlt, FaTools, FaBriefcase,
  FaCamera, FaFileAlt, FaCheckCircle, FaExclamationCircle,
  FaSave, FaImage, FaIdCard, FaAlignLeft, FaHardHat,
  FaExclamationTriangle, FaPlus, FaTrash, FaMoneyBillWave, FaStar,
  FaImages,
} from "react-icons/fa";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFileName = (fileOrUrl) => {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === "string" && fileOrUrl.startsWith("blob:")) return "New file selected";
  if (typeof fileOrUrl !== "string" || !fileOrUrl.includes("/")) return fileOrUrl;
  return decodeURIComponent(fileOrUrl.split("/").pop().split("?")[0]) || "document";
};

const calcCompletion = (profileData, profileImage, portfolioImages) => {
  const isCompany = profileData.account_type === "Company";
  const checks = [
    !!profileData.description,
    !!profileData.profession,
    Array.isArray(profileData.skills) ? profileData.skills.length > 0 : !!profileData.skills,
    !!profileData.location,
    Array.isArray(profileData.services) && profileData.services.length > 0,
    !!profileImage,
    Array.isArray(portfolioImages) && portfolioImages.length > 0,
    isCompany ? !!profileData.company_name : true,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const buildFormData = ({ profileData, profileImage, proofDocument, portfolioImages = [], portfolioRemoveIds = [] }) => {
  const fd = new FormData();
  const scalars = ["description", "profession", "location", "company_name", "account_type", "experience_level", "primary_service", "video"];
  scalars.forEach((field) => {
    if (profileData[field] !== undefined && profileData[field] !== null)
      fd.append(field, profileData[field]);
  });
  if (Array.isArray(profileData.skills))
    fd.append("skills", JSON.stringify(profileData.skills));
  if (Array.isArray(profileData.services)) {
    const payload = profileData.services.map((svc) => ({ name: svc.name, rate: svc.rate ?? null, unit: svc.unit ?? "fixed" }));
    fd.append("services", JSON.stringify(payload));
  }
  if (profileImage instanceof File) fd.append("profile", profileImage);
  if (proofDocument instanceof File) fd.append("proof_document", proofDocument);
  portfolioImages.forEach((img) => { if (img.file instanceof File) fd.append("portfolio_images", img.file); });
  if (portfolioRemoveIds.length > 0) fd.append("portfolio_remove_ids", JSON.stringify(portfolioRemoveIds));
  return fd;
};

// ─── ValidationBanner ────────────────────────────────────────────────────────
const ValidationBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div style={{
      background: "#fef2f2", border: "2px solid #fca5a5", color: "#991b1b",
      borderRadius: 10, padding: ".875rem 1.25rem", marginBottom: "1.25rem",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      fontWeight: 600, fontSize: ".875rem",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FaExclamationTriangle /> {message}
      </span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: "1.1rem", padding: 0 }}>×</button>
    </div>
  );
};

// ─── StatusBanner ─────────────────────────────────────────────────────────────
const StatusBanner = ({ status }) => {
  const map = {
    pending:  { bg: "#fef3c7", color: "#92400e", border: "#fbbf24", msg: "Your profile is under review. We will notify you once it is approved." },
    approved: { bg: "#d1fae5", color: "#065f46", border: "#22c55e", msg: "Profile approved. You are now visible to clients." },
    rejected: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", msg: "Profile was rejected. Update the details below and save again." },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div style={{
      background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.border}`,
      borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem",
      fontWeight: 600, fontSize: ".875rem",
    }}>
      {cfg.msg}
    </div>
  );
};

// ─── AccountTypeInfo ──────────────────────────────────────────────────────────
const AccountTypeInfo = ({ accountType }) => {
  const info = {
    Individual: {
      points: ["You work alone on assigned jobs", "Clients book you directly", "No team management needed"],
    },
    Company: {
      points: ["Enter your business name below", "Invite helpers and foremen from the Team Members tab", "Quotes will show your company name"],
    },
  }[accountType];
  if (!info) return null;
  return (
    <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: ".875rem 1rem", marginTop: ".5rem" }}>
      {/* <div style={{ fontWeight: 700, fontSize: ".78rem", color: "#15803d", marginBottom: 5 }}>What this means:</div> */}
      <ul style={{ margin: 0, padding: "0 0 0 1.1rem", color: "#374151", fontSize: ".85rem" }}>
        {info.points.map((p, i) => <li key={i} style={{ marginBottom: 2 }}>{p}</li>)}
      </ul>
    </div>
  );
};

// ─── TextInputWithDatalist ────────────────────────────────────────────────────
export const TextInputWithDatalist = ({ label, name, value, onChange, options = [], required, isArray = false, icon, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && (!value || (isArray && value?.length === 0));

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (isArray) {
      if (!(value || []).includes(inputValue.trim()))
        onChange({ target: { name, value: [...(value || []), inputValue.trim()] } });
    } else {
      onChange({ target: { name, value: inputValue } });
    }
    setInputValue("");
  };

  const handleRemove = (item) => {
    if (isArray) onChange({ target: { name, value: (value || []).filter((v) => v !== item) } });
  };

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        {icon && <span className="pf-icon">{icon}</span>}
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {isArray ? (
        <>
          <div className="d-flex gap-2 mb-2">
            <input
              list={options.length ? `${name}-opts` : undefined}
              className={`pf-input flex-grow-1 ${hasError ? "pf-err" : ""}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              onBlur={() => setTouched(true)}
              placeholder={placeholder || "Type and press Enter or click Add"}
            />
            <button className="pf-add-btn" type="button" onClick={handleAdd}>Add</button>
          </div>
          <div className="d-flex flex-wrap gap-1 mt-1">
            {(value || []).map((item) => (
              <span key={item} className="skill-chip" onClick={() => handleRemove(item)} title="Click to remove">
                {item} <span style={{ opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        </>
      ) : (
        <input
          list={options.length ? `${name}-opts` : undefined}
          className={`pf-input ${hasError ? "pf-err" : ""}`}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
      )}
      {options.length > 0 && (
        <datalist id={`${name}-opts`}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      )}
      {hasError && <small className="pf-error-msg"><FaExclamationCircle className="me-1" />{label} is required</small>}
    </div>
  );
};

// ─── FileInput ────────────────────────────────────────────────────────────────
export const FileInput = ({ label, file, onChange, accept = "image/*", required, hint }) => {
  const [touched, setTouched] = useState(false);
  const ref = useRef();
  const hasError = touched && required && !file;
  const previewUrl = file ? (file instanceof File ? URL.createObjectURL(file) : getFullImageUrl(file)) : null;

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {hint && <small style={{ color: "#6b7280", display: "block", marginBottom: 6 }}>{hint}</small>}
      <div className={`file-zone ${hasError ? "fz-error" : ""} ${file ? "fz-filled" : ""}`} onClick={() => ref.current?.click()}>
        {previewUrl && accept.includes("image") ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img src={previewUrl} alt={label} style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
            <div className="fz-overlay"><FaCamera size={18} /><span>Change Photo</span></div>
          </div>
        ) : (
          <div className="fz-placeholder">
            <FaImage size={26} style={{ opacity: 0.3, marginBottom: 6 }} />
            <span className="fz-text">Click to upload</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" style={{ display: "none" }} accept={accept} onChange={(e) => { setTouched(true); onChange(e); }} />
      {file && (
        <div className="fname-tag">
          <FaCheckCircle style={{ color: "#22c55e" }} /> {getFileName(file instanceof File ? file.name : file)}
        </div>
      )}
      {hasError && <small className="pf-error-msg"><FaExclamationCircle className="me-1" />Required</small>}
    </div>
  );
};

// ─── ProofDocumentInput ───────────────────────────────────────────────────────
const ProofDocumentInput = ({ proofDocument, onChange }) => {
  const ref = useRef();
  const displayName = proofDocument ? (proofDocument instanceof File ? proofDocument.name : getFileName(proofDocument)) : null;

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaFileAlt /></span>
        Proof Document
        <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: ".78rem", marginLeft: 4 }}>(optional)</span>
      </label>
      <small style={{ color: "#6b7280", display: "block", marginBottom: 6 }}>Upload your certificate, ID or trade licence. This helps speed up approval.</small>
      <div className={`file-zone ${proofDocument ? "fz-filled" : ""}`} onClick={() => ref.current?.click()}>
        <div className="fz-placeholder">
          <FaFileAlt size={22} style={{ opacity: 0.3, marginBottom: 6 }} />
          <span className="fz-text">{displayName || "Click to upload"}</span>
        </div>
      </div>
      <input ref={ref} type="file" style={{ display: "none" }} accept=".pdf,image/*" onChange={onChange} />
      {proofDocument && (
        <div className="fname-tag"><FaCheckCircle style={{ color: "#22c55e" }} /> {displayName}</div>
      )}
    </div>
  );
};

// ─── RadioGroup ───────────────────────────────────────────────────────────────
export const RadioGroup = ({ label, name, options = [], value, onChange, required }) => (
  <div className="pf-field mb-3">
    <label className="pf-label">
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    <div className="d-flex gap-3 flex-wrap mt-1">
      {options.map((opt) => (
        <label key={opt} className={`atc ${value === opt ? "atc-on" : ""}`}>
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={onChange} style={{ display: "none" }} />
          <span style={{ fontSize: "1.2rem" }}>
            {opt === "Individual"
              ? <FaUser color={value === opt ? "#22c55e" : "#9ca3af"} />
              : <FaBuilding color={value === opt ? "#22c55e" : "#9ca3af"} />}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: ".9375rem" }}>{opt}</div>
            <div style={{ fontSize: ".72rem", color: "#6b7280" }}>
              {opt === "Individual" ? "Solo craftsman" : "Business / crew"}
            </div>
          </div>
          {value === opt && <FaCheckCircle style={{ color: "#22c55e", marginLeft: "auto" }} />}
        </label>
      ))}
    </div>
  </div>
);

// ─── ServicesEditor ───────────────────────────────────────────────────────────
//
// This section lets you list every service you offer.
//
// How it works:
//   1. Type a service name in the first box (e.g. "Electrical Wiring").
//      You can pick from the suggestions or type your own.
//   2. Optionally type a rate — the amount you charge for that service.
//      Leave it blank if your price depends on the job.
//   3. Choose how the rate is measured:
//        Fixed    — one price for the whole job
//        Per hour — you charge by the hour
//        Per day  — you charge by the day
//        Per m²   — you charge by square metre (e.g. painting, tiling)
//   4. Click Add. The service appears in the list above the form.
//   5. The FIRST service in the list becomes your Primary Service —
//      this is the one shown to clients on your public profile.
//   6. Click the trash icon on any service to remove it.
//
const ServicesEditor = ({ services = [], onChange, serviceOptions = [], required }) => {
  const [newService, setNewService] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newUnit, setNewUnit] = useState("fixed");
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && services.length === 0;

  const handleAdd = () => {
    if (!newService.trim()) return;
    onChange([...services, { id: Date.now(), name: newService.trim(), rate: newRate ? parseFloat(newRate) : null, unit: newUnit }]);
    setNewService("");
    setNewRate("");
  };

  const handleRemove = (id) => onChange(services.filter((s) => s.id !== id));

  const unitLabels = { fixed: "fixed", hour: "/hr", day: "/day", sqm: "/m²" };

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaBriefcase /></span>
        Services Offered{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>

      {/* Plain explanation shown directly on the page */}
      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: ".875rem 1rem", marginBottom: "1rem", fontSize: ".85rem", color: "#374151", lineHeight: 1.7 }}>
        <p style={{ margin: "0 0 6px" }}>
          List every service you offer. For each one, you can set a rate so clients know your pricing before they contact you.
        </p>
        <p style={{ margin: "0 0 6px" }}>
          The <strong>first service</strong> you add will appear as your primary service on your public profile.
          You can add as many services as you want — click the trash icon to remove any.
        </p>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Leave the rate blank if your price varies per job — you can always send a quote to the client later.
        </p>
      </div>

      {/* Current services list */}
      {services.length > 0 && (
        <div className="services-list mb-3">
          {services.map((svc, i) => (
            <div key={svc.id ?? i} className="service-row">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                {i === 0 && (
                  <span style={{ background: "#16a34a", color: "#fff", fontSize: ".65rem", fontWeight: 800, padding: "2px 8px", borderRadius: "50px", whiteSpace: "nowrap" }}>
                    PRIMARY
                  </span>
                )}
                <span style={{ fontWeight: 700, fontSize: ".9375rem", color: "#1f2937" }}>{svc.name}</span>
              </div>
              {svc.rate ? (
                <span className="rate-badge">
                  <FaMoneyBillWave size={11} /> KSh {Number(svc.rate).toLocaleString()} {unitLabels[svc.unit] || svc.unit}
                </span>
              ) : (
                <span style={{ fontSize: ".75rem", color: "#9ca3af" }}>No rate set</span>
              )}
              <button className="svc-remove-btn" type="button" onClick={() => handleRemove(svc.id ?? i)} title="Remove service">
                <FaTrash size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new service */}
      <div className="add-service-box">
        <div style={{ fontWeight: 600, fontSize: ".8rem", color: "#6b7280", marginBottom: 8 }}>
          {services.length === 0 ? "Add your first service" : "Add another service"}
        </div>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
            <label style={{ fontSize: ".75rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 3 }}>Service name</label>
            <input
              list="svc-opts"
              className="pf-input"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Electrical Wiring"
            />
            <datalist id="svc-opts">
              {serviceOptions.map((o) => <option key={o} value={o} />)}
            </datalist>
          </Col>
          <Col xs={6} md={3}>
            <label style={{ fontSize: ".75rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 3 }}>Rate in KSh (optional)</label>
            <input type="number" className="pf-input" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="e.g. 1500" min="0" />
          </Col>
          <Col xs={6} md={2}>
            <label style={{ fontSize: ".75rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 3 }}>Measured by</label>
            <select className="pf-input" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
              <option value="fixed">Fixed total</option>
              <option value="hour">Per hour</option>
              <option value="day">Per day</option>
              <option value="sqm">Per m²</option>
            </select>
          </Col>
          <Col xs={12} md={2}>
            <button className="pf-add-btn w-100" type="button" onClick={handleAdd}>
              <FaPlus size={11} /> Add
            </button>
          </Col>
        </Row>
      </div>

      {hasError && <small className="pf-error-msg mt-2"><FaExclamationCircle className="me-1" />At least one service is required</small>}
    </div>
  );
};

// ─── PortfolioGallery ─────────────────────────────────────────────────────────
const PortfolioGallery = ({ images = [], onAdd, onRemove, required }) => {
  const ref = useRef();
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && images.length === 0;

  const handleFiles = (e) => {
    setTouched(true);
    Array.from(e.target.files).forEach((file) => {
      onAdd({ id: Date.now() + Math.random(), file, preview: URL.createObjectURL(file) });
    });
    e.target.value = "";
  };

  const getImgSrc = (img) => img.preview || getFullImageUrl(img.url) || "";

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaImages /></span>
        Work Photos{required && <span style={{ color: "#ef4444" }}> *</span>}
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "#9ca3af", fontWeight: 500 }}>
          {images.length} / 8
        </span>
      </label>
      <small style={{ color: "#6b7280", display: "block", marginBottom: "0.75rem" }}>
        Upload photos of work you have completed. The first photo will be used as your cover photo.
      </small>
      <div className="portfolio-grid">
        {images.map((img, i) => (
          <div key={img.id ?? i} className="portfolio-thumb">
            <img src={getImgSrc(img)} alt={`Work ${i + 1}`} className="portfolio-img" />
            {i === 0 && <div className="portfolio-cover-badge">Cover</div>}
            <button className="portfolio-remove" type="button" onClick={() => onRemove(img.id ?? i)} title="Remove">×</button>
          </div>
        ))}
        {images.length < 8 && (
          <div className={`portfolio-add-slot ${hasError ? "fz-error" : ""}`} onClick={() => { setTouched(true); ref.current?.click(); }}>
            <FaCamera size={20} style={{ opacity: 0.3, marginBottom: 4 }} />
            <span style={{ fontSize: ".75rem", fontWeight: 600, color: "#9ca3af" }}>
              {images.length === 0 ? "Add Photos" : "Add More"}
            </span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" style={{ display: "none" }} accept="image/*" multiple onChange={handleFiles} />
      {hasError && <small className="pf-error-msg mt-1"><FaExclamationCircle className="me-1" />At least one work photo is required</small>}
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = ({ icon, title, children }) => (
  <div className="pf-section">
    <div className="pf-section-title">{icon} {title}</div>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  ProfileTab
// ══════════════════════════════════════════════════════════════════════════════
function ProfileTab({
  craftsman, profileData, setProfileData,
  profileImage, handleProfileImageChange,
  handleProofDocumentChange, proofDocument,
  professionOptions = [], skillOptions = [], serviceOptions = [],
  portfolioImages = [], onPortfolioAdd, onPortfolioRemove,
  portfolioRemoveIds = [], saveProfile, saving = false, addToast,
}) {
  const [validationError, setValidationError] = useState("");

  const locations = [
    "Nairobi CBD", "Westlands", "Karen", "South B", "Embakasi", "Kasarani",
    "Kileleshwa", "Lavington", "Parklands", "Ruaka", "Nakuru", "Eldoret",
    "Kisumu", "Mombasa", "Thika", "Machakos",
  ];

  const isCompany  = profileData.account_type === "Company";
  const completion = calcCompletion(profileData, profileImage, portfolioImages);

  const handleInputChange   = (e) => { const { name, value } = e.target; setProfileData((prev) => ({ ...prev, [name]: value })); };
  const handleServicesChange = (newServices) => setProfileData((prev) => ({ ...prev, services: newServices }));

  const handleSave = () => {
    setValidationError("");
    const requiredFields = ["description", "profession", "location"];
    if (isCompany) requiredFields.push("company_name");
    const missing = requiredFields.filter((f) => !profileData[f]?.trim?.());
    const skillsOk = Array.isArray(profileData.skills) ? profileData.skills.length > 0 : !!profileData.skills;
    if (!skillsOk) missing.push("skills");
    if (missing.length) {
      const msg = `Please fill in: ${missing.join(", ")}`;
      setValidationError(msg); addToast?.(msg, "warning", "Missing Fields");
      window.scrollTo({ top: 0, behavior: "smooth" }); return;
    }
    if (!profileData.services?.length) { const msg = "Please add at least one service."; setValidationError(msg); addToast?.(msg, "warning", "No Service Added"); return; }
    if (!profileImage)                  { const msg = "Please upload a profile photo.";  setValidationError(msg); addToast?.(msg, "warning", "Missing Photo");    return; }
    if (!portfolioImages?.length)       { const msg = "Please add at least one work photo."; setValidationError(msg); addToast?.(msg, "warning", "No Work Photos"); return; }
    saveProfile(buildFormData({ profileData, profileImage, proofDocument, portfolioImages, portfolioRemoveIds }));
  };

  return (
    <>
      <style>{`
        .pf-section { background: white; border-radius: 14px; border: 2px solid #f3f4f6; padding: 1.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden; }
        .pf-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #fbbf24, #22c55e); }
        .pf-section-title { font-size: .72rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 6px; }
        .pf-field  { width: 100%; }
        .pf-label  { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: .875rem; color: #374151; margin-bottom: .5rem; }
        .pf-icon   { color: #22c55e; font-size: .9rem; }
        .pf-input  { width: 100%; padding: .75rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: .9375rem; background: white; transition: border-color .2s, box-shadow .2s; display: block; }
        .pf-input:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.1); }
        .pf-err { border-color: #ef4444 !important; }
        .pf-error-msg { color: #ef4444; font-size: .78rem; margin-top: 4px; display: flex; align-items: center; }
        .pf-add-btn { padding: .75rem 1.25rem; background: #1f2937; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: .875rem; cursor: pointer; white-space: nowrap; transition: background .2s; display: inline-flex; align-items: center; gap: 6px; }
        .pf-add-btn:hover { background: #374151; }
        .skill-chip { display: inline-flex; align-items: center; gap: 4px; background: #f0fdf4; border: 1.5px solid #86efac; color: #15803d; padding: 5px 12px; border-radius: 50px; font-size: .8rem; font-weight: 700; cursor: pointer; transition: all .2s; }
        .skill-chip:hover { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
        .services-list { display: flex; flex-direction: column; gap: .5rem; }
        .service-row { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: .75rem 1rem; display: flex; align-items: center; gap: .75rem; transition: border-color .2s; }
        .service-row:hover { border-color: #86efac; }
        .rate-badge { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1.5px solid #86efac; color: #15803d; padding: 3px 10px; border-radius: 50px; font-size: .75rem; font-weight: 700; white-space: nowrap; }
        .svc-remove-btn { background: #fef2f2; border: 1.5px solid #fca5a5; color: #ef4444; border-radius: 8px; padding: 4px 8px; cursor: pointer; font-size: .8rem; flex-shrink: 0; transition: all .2s; display: inline-flex; align-items: center; }
        .svc-remove-btn:hover { background: #fee2e2; }
        .add-service-box { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 1rem; transition: border-color .2s; }
        .add-service-box:focus-within { border-color: #22c55e; border-style: solid; background: #f0fdf4; }
        .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: .75rem; margin-bottom: .5rem; }
        .portfolio-thumb { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 1; border: 2px solid #86efac; }
        .portfolio-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .portfolio-cover-badge { position: absolute; top: 6px; left: 6px; background: #16a34a; color: white; font-size: .65rem; font-weight: 800; padding: 2px 7px; border-radius: 50px; }
        .portfolio-remove { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,.55); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: .9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
        .portfolio-remove:hover { background: rgba(239,68,68,.8); }
        .portfolio-add-slot { aspect-ratio: 1; border: 2px dashed #d1d5db; border-radius: 12px; background: #f9fafb; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: all .2s; }
        .portfolio-add-slot:hover { border-color: #22c55e; background: #f0fdf4; }
        .atc { display: flex; align-items: center; gap: 12px; padding: 1rem 1.5rem; border: 2px solid #e5e7eb; border-radius: 14px; cursor: pointer; transition: all .2s; background: white; user-select: none; flex: 1; min-width: 160px; }
        .atc:hover { border-color: #d1d5db; }
        .atc-on { border-color: #22c55e !important; background: #f0fdf4 !important; }
        .file-zone { border: 2px dashed #d1d5db; border-radius: 14px; background: #f9fafb; cursor: pointer; transition: all .25s; overflow: hidden; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        .file-zone:hover { border-color: #22c55e; background: #f0fdf4; }
        .fz-filled  { border-style: solid; border-color: #86efac; }
        .fz-error   { border-color: #ef4444 !important; background: #fef2f2; }
        .fz-placeholder { text-align: center; padding: 1.5rem; color: #9ca3af; }
        .fz-text    { display: block; font-weight: 600; font-size: .875rem; margin-top: 4px; }
        .fz-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: white; font-weight: 700; font-size: .875rem; opacity: 0; transition: opacity .2s; }
        .file-zone:hover .fz-overlay { opacity: 1; }
        .fname-tag { margin-top: 6px; font-size: .78rem; color: #374151; display: flex; align-items: center; gap: 5px; font-weight: 600; background: #f0fdf4; padding: 4px 10px; border-radius: 8px; width: fit-content; }
        .completion-bar { background: #f0fdf4; border: 2px solid #86efac; border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
        .completion-bar .progress { height: 10px; border-radius: 10px; background: #dcfce7; }
        .completion-bar .progress-bar { border-radius: 10px; background: linear-gradient(90deg, #fbbf24, #22c55e); }
        .save-btn { background: linear-gradient(135deg, #fbbf24, #22c55e); border: none; border-radius: 14px; color: #1f2937; font-weight: 800; font-size: 1rem; padding: .875rem 2.5rem; display: inline-flex; align-items: center; gap: 8px; transition: all .3s; cursor: pointer; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,197,94,.3); }
        .save-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }
      `}</style>

      {craftsman?.status && <StatusBanner status={craftsman.status} />}
      <ValidationBanner message={validationError} onDismiss={() => setValidationError("")} />

      {/* Profile completion */}
      <div className="completion-bar">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontWeight: 700, fontSize: ".875rem", color: "#15803d" }}>Profile Completion</span>
          <span style={{ fontWeight: 800, color: "#16a34a" }}>{completion}%</span>
        </div>
        <ProgressBar now={completion} className="progress" />
        <small className="text-muted d-block mt-1">
          {completion < 100 ? "Fill in all sections below to start receiving jobs" : "Profile complete"}
        </small>
      </div>

      {/* 1. Account Type */}
      <Section icon={<FaIdCard />} title="Account Type">
        <RadioGroup label="How do you work?" name="account_type" options={["Individual", "Company"]} value={profileData.account_type} onChange={handleInputChange} required />
        <AccountTypeInfo accountType={profileData.account_type} />
      </Section>

      {/* 2. Profile Photo & Documents */}
      <Section icon={<FaCamera />} title="Profile Photo & Documents">
        <Row>
          <Col md={6}>
            <FileInput label="Profile Photo" file={profileImage} onChange={handleProfileImageChange} accept="image/*" required hint="A clear photo of your face. Clients will see this." />
          </Col>
          <Col md={6}>
            <ProofDocumentInput proofDocument={proofDocument} onChange={handleProofDocumentChange} />
          </Col>
        </Row>
      </Section>

      {/* 3. Work Photos */}
      <Section icon={<FaImages />} title="Work Photos">
        <PortfolioGallery images={portfolioImages} onAdd={onPortfolioAdd} onRemove={onPortfolioRemove} required />
      </Section>

      {/* 4. Services & Rates */}
      <Section icon={<FaBriefcase />} title="Services & Rates">
        <ServicesEditor services={profileData.services || []} onChange={handleServicesChange} serviceOptions={serviceOptions} required />
      </Section>

      {/* 5. Professional Details */}
      <Section icon={<FaHardHat />} title="Professional Details">
        <TextInputWithDatalist label="Bio / Description" name="description" value={profileData.description} onChange={handleInputChange} icon={<FaAlignLeft />} placeholder="Brief description of your work and experience" required />
        <Row>
          <Col md={6}>
            <TextInputWithDatalist label="Profession / Trade" name="profession" value={profileData.profession} onChange={handleInputChange} options={professionOptions} icon={<FaHardHat />} required />
          </Col>
          <Col md={6}>
            <TextInputWithDatalist label="Years of Experience" name="experience_level" value={profileData.experience_level} onChange={handleInputChange} options={["1-2 years", "3-5 years", "5-10 years", "10+ years"]} icon={<FaStar />} placeholder="Select or type" />
          </Col>
        </Row>
        <TextInputWithDatalist label="Skills" name="skills" value={profileData.skills} onChange={handleInputChange} options={skillOptions} icon={<FaTools />} placeholder="Type a skill and press Enter" required isArray />
      </Section>

      {/* 6. Company Details — only shown when Company is selected */}
      <Collapse in={isCompany}>
        <div>
          <Section icon={<FaBuilding />} title="Company Details">
            <TextInputWithDatalist label="Registered Company / Business Name" name="company_name" value={profileData.company_name} onChange={handleInputChange} icon={<FaBuilding />} placeholder="e.g. Bright Sparks Electrical Ltd" required={isCompany} />
            <small style={{ color: "#15803d", display: "block", marginTop: 6 }}>
              After saving, go to the Team Members tab to invite helpers and foremen.
            </small>
          </Section>
        </div>
      </Collapse>

      {/* 7. Service Area */}
      <Section icon={<FaMapMarkerAlt />} title="Service Area">
        <TextInputWithDatalist label="Your Area / Town" name="location" value={profileData.location} onChange={handleInputChange} options={locations} icon={<FaMapMarkerAlt />} placeholder="e.g. Westlands, Nairobi" required />
        <small className="text-muted">Jobs near this location will be matched to you first.</small>
      </Section>

      {/* Save */}
      <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mb-4">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm" role="status" /> Saving...</>
            : <><FaSave /> Save Profile</>}
        </button>
        {completion === 100 && !saving && (
          <span style={{ fontSize: ".8rem", color: "#15803d", fontWeight: 600 }}>
            <FaCheckCircle className="me-1" /> Profile complete
          </span>
        )}
      </div>
    </>
  );
}

export default ProfileTab;
