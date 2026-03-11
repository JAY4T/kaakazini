import React, { useState, useRef } from "react";
import { Col, Row, Collapse, ProgressBar } from "react-bootstrap";
import { getFullImageUrl } from "../../utils/getFullImageUrl";
import {
  FaUser, FaBuilding, FaMapMarkerAlt, FaTools, FaBriefcase,
  FaCamera, FaFileAlt, FaCheckCircle, FaExclamationCircle,
  FaSave, FaImage, FaIdCard, FaAlignLeft, FaHardHat, FaInfoCircle,
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

// ─── buildFormData ─────────────────────────────────────────────────────────────
// Builds the multipart/form-data payload to PATCH the Django backend.
// Call this right before sending — it reads the latest state values.
const buildFormData = ({
  profileData,
  profileImage,
  proofDocument,
  portfolioImages = [],
  portfolioRemoveIds = [],
}) => {
  const fd = new FormData();

  // 1. Scalar text fields — only append if they have a value
  const scalars = [
    "description", "profession", "location", "company_name",
    "account_type", "experience_level", "primary_service", "video",
  ];
  scalars.forEach((field) => {
    if (profileData[field] !== undefined && profileData[field] !== null) {
      fd.append(field, profileData[field]);
    }
  });

  // 2. Skills — frontend keeps as array; backend stores as CSV.
  //    Send as JSON string so a single FormData key carries the full list.
  if (Array.isArray(profileData.skills)) {
    fd.append("skills", JSON.stringify(profileData.skills));
  }

  // 3. Services — full replace strategy.
  //    Strip the ephemeral frontend `id` field; backend doesn't need it.
  if (Array.isArray(profileData.services)) {
    const payload = profileData.services.map((svc) => ({
      name: svc.name,
      rate: svc.rate ?? null,
      unit: svc.unit ?? "fixed",
    }));
    fd.append("services", JSON.stringify(payload));
  }

  // 4. Profile photo — only send when the user picked a new File.
  //    If profileImage is already an https:// URL, we skip it so the
  //    backend leaves the existing file alone.
  if (profileImage instanceof File) {
    fd.append("profile", profileImage);
  }

  // 5. Proof document — same logic as profile photo.
  if (proofDocument instanceof File) {
    fd.append("proof_document", proofDocument);
  }

  // 6. Portfolio: new uploads (items with a .file property are new).
  portfolioImages.forEach((img) => {
    if (img.file instanceof File) {
      fd.append("portfolio_images", img.file);
    }
  });

  // 7. Portfolio: IDs the user removed (backend deletes these GalleryImage rows).
  if (portfolioRemoveIds.length > 0) {
    fd.append("portfolio_remove_ids", JSON.stringify(portfolioRemoveIds));
  }

  return fd;
};

// ─── ValidationBanner ────────────────────────────────────────────────────────
const ValidationBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div style={{
      background: "#fef2f2", border: "2px solid #fca5a5", color: "#991b1b",
      borderRadius: 12, padding: ".875rem 1.25rem", marginBottom: "1.25rem",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      fontWeight: 600, fontSize: ".875rem",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FaExclamationTriangle /> {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: "1.1rem", lineHeight: 1, padding: 0 }}
      >×</button>
    </div>
  );
};

// ─── StatusBanner ─────────────────────────────────────────────────────────────
const StatusBanner = ({ status }) => {
  const map = {
    pending:  { bg: "#fef3c7", color: "#92400e", border: "#fbbf24", icon: "⏳", msg: "Your profile is pending admin approval. We'll notify you once reviewed." },
    approved: { bg: "#d1fae5", color: "#065f46", border: "#22c55e", icon: "✅", msg: "Profile approved! You are now visible to clients and can receive jobs." },
    rejected: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", icon: "❌", msg: "Profile rejected. Please update the details below and save again." },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div style={{
      background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.border}`,
      borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem",
      fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.5,
    }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{cfg.icon}</span>
      <span>{cfg.msg}</span>
    </div>
  );
};

// ─── AccountTypeInfo ──────────────────────────────────────────────────────────
const AccountTypeInfo = ({ accountType }) => {
  const info = {
    Individual: {
      color: "#22c55e", bg: "#f0fdf4", border: "#86efac",
      points: ["You work alone on assigned jobs", "Clients book you directly", "Quote and invoice clients yourself", "No team management needed"],
    },
    Company: {
      color: "#16a34a", bg: "#f0fdf4", border: "#86efac",
      points: ["Register your business name below", "Invite helpers and foremen via Team Members tab", "Quotes show your company name", "Handle multiple jobs with your crew"],
    },
  }[accountType];
  if (!info) return null;
  return (
    <div style={{ background: info.bg, border: `2px solid ${info.border}`, borderRadius: 12, padding: "1rem 1.25rem", marginTop: ".75rem" }}>
      <div style={{ fontWeight: 700, fontSize: ".78rem", color: info.color, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        <FaInfoCircle /> What this means for you:
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 1.25rem", color: "#374151", fontSize: ".875rem" }}>
        {info.points.map((p, i) => <li key={i} style={{ marginBottom: 3 }}>{p}</li>)}
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
              placeholder={placeholder || "Type and press Enter or click Add…"}
            />
            <button className="pf-add-btn" type="button" onClick={handleAdd}>+ Add</button>
          </div>
          <div className="d-flex flex-wrap gap-1 mt-1">
            {(value || []).map((item) => (
              <span key={item} className="skill-chip" onClick={() => handleRemove(item)} title="Click to remove">
                {item} <span style={{ opacity: 0.7 }}>×</span>
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
          placeholder={placeholder || `Select or type ${label.toLowerCase()}`}
        />
      )}
      {options.length > 0 && (
        <datalist id={`${name}-opts`}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      )}
      {hasError && (
        <small className="pf-error-msg"><FaExclamationCircle className="me-1" />{label} is required</small>
      )}
    </div>
  );
};

// ─── FileInput ────────────────────────────────────────────────────────────────
export const FileInput = ({ label, file, onChange, accept = "image/*", required, hint }) => {
  const [touched, setTouched] = useState(false);
  const ref = useRef();
  const hasError = touched && required && !file;

  // Show a preview: if file is a File object use createObjectURL, else treat as URL string
  const previewUrl = file
    ? (file instanceof File ? URL.createObjectURL(file) : getFullImageUrl(file))
    : null;

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <div
        className={`file-zone ${hasError ? "fz-error" : ""} ${file ? "fz-filled" : ""}`}
        onClick={() => ref.current?.click()}
      >
        {previewUrl && accept.includes("image") ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img
              src={previewUrl}
              alt={label}
              style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }}
            />
            <div className="fz-overlay"><FaCamera size={18} /><span>Change Photo</span></div>
          </div>
        ) : (
          <div className="fz-placeholder">
            <FaImage size={26} style={{ opacity: 0.3, marginBottom: 6 }} />
            <span className="fz-text">Click to upload</span>
            {hint && <small style={{ color: "#9ca3af" }}>{hint}</small>}
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        style={{ display: "none" }}
        accept={accept}
        onChange={(e) => { setTouched(true); onChange(e); }}
      />
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
  const displayName = proofDocument
    ? (proofDocument instanceof File ? proofDocument.name : getFileName(proofDocument))
    : null;

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaFileAlt /></span>
        Proof Document{" "}
        <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: ".78rem" }}>(optional)</span>
      </label>
      <div
        className={`file-zone ${proofDocument ? "fz-filled" : ""}`}
        onClick={() => ref.current?.click()}
      >
        <div className="fz-placeholder">
          <FaFileAlt size={22} style={{ opacity: 0.3, marginBottom: 6 }} />
          <span className="fz-text">{displayName || "Click to upload"}</span>
          <small style={{ color: "#9ca3af" }}>Certificate, ID or trade licence</small>
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        style={{ display: "none" }}
        accept=".pdf,image/*"
        onChange={onChange}
      />
      {proofDocument && (
        <div className="fname-tag">
          <FaCheckCircle style={{ color: "#22c55e" }} /> {displayName}
        </div>
      )}
      <small className="text-muted d-block mt-1">Boosts client trust and speeds up approval</small>
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
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={onChange}
            style={{ display: "none" }}
          />
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
const ServicesEditor = ({ services = [], onChange, serviceOptions = [], required }) => {
  const [newService, setNewService] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newUnit, setNewUnit] = useState("fixed");
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && services.length === 0;

  const handleAdd = () => {
    if (!newService.trim()) return;
    const entry = {
      id: Date.now(),          // ephemeral — stripped before sending to API
      name: newService.trim(),
      rate: newRate ? parseFloat(newRate) : null,
      unit: newUnit,
    };
    onChange([...services, entry]);
    setNewService("");
    setNewRate("");
  };

  const handleRemove = (id) => onChange(services.filter((s) => s.id !== id));

  const unitLabels = { fixed: "fixed price", hour: "per hour", day: "per day", sqm: "per m²" };

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaBriefcase /></span>
        Services Offered{required && <span style={{ color: "#ef4444" }}> *</span>}
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "#9ca3af", fontWeight: 500 }}>
          Add all services you provide
        </span>
      </label>

      {/* Existing services */}
      {services.length > 0 && (
        <div className="services-list mb-3">
          {services.map((svc, i) => (
            <div key={svc.id ?? i} className="service-row">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                {i === 0 && (
                  <span style={{
                    background: "linear-gradient(135deg,#fbbf24,#22c55e)", color: "#1f2937",
                    fontSize: ".65rem", fontWeight: 800, padding: "2px 8px",
                    borderRadius: "50px", whiteSpace: "nowrap",
                  }}>
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
                <span style={{ fontSize: ".75rem", color: "#9ca3af" }}>Rate not set</span>
              )}
              <button
                className="svc-remove-btn"
                type="button"
                onClick={() => handleRemove(svc.id ?? i)}
                title="Remove"
              >
                <FaTrash size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new service row */}
      <div className="add-service-box">
        <div style={{ fontWeight: 700, fontSize: ".78rem", color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {services.length === 0 ? "Add your first service" : "+ Add another service"}
        </div>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
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
            <input
              type="number"
              className="pf-input"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Rate (KSh) optional"
              min="0"
            />
          </Col>
          <Col xs={6} md={2}>
            <select className="pf-input" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
              <option value="fixed">Fixed</option>
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
        {services.length === 0 && (
          <small style={{ color: "#9ca3af", marginTop: 4, display: "block" }}>
            💡 The first service you add will be your primary service shown to clients
          </small>
        )}
      </div>

      {hasError && (
        <small className="pf-error-msg mt-2">
          <FaExclamationCircle className="me-1" />At least one service is required
        </small>
      )}
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

  // Resolve the correct display URL for each image:
  // - Newly picked: use the blob preview
  // - Already on server: use getFullImageUrl on the url field
  const getImgSrc = (img) => img.preview || getFullImageUrl(img.url) || "";

  return (
    <div className="pf-field mb-4">
      <label className="pf-label">
        <span className="pf-icon"><FaImages /></span>
        Work Portfolio / Gallery{required && <span style={{ color: "#ef4444" }}> *</span>}
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "#9ca3af", fontWeight: 500 }}>
          {images.length}/8 photos
        </span>
      </label>
      <p style={{ fontSize: ".8rem", color: "#6b7280", marginBottom: "0.75rem", marginTop: "-0.25rem" }}>
        Upload photos of your completed work. More photos = more client trust. At least 1 required.
      </p>

      <div className="portfolio-grid">
        {images.map((img, i) => (
          <div key={img.id ?? i} className="portfolio-thumb">
            <img src={getImgSrc(img)} alt={`Work ${i + 1}`} className="portfolio-img" />
            {i === 0 && (
              <div className="portfolio-cover-badge"><FaStar size={9} /> Cover</div>
            )}
            <button
              className="portfolio-remove"
              type="button"
              onClick={() => onRemove(img.id ?? i)}
              title="Remove"
            >×</button>
          </div>
        ))}

        {images.length < 8 && (
          <div
            className={`portfolio-add-slot ${hasError ? "fz-error" : ""}`}
            onClick={() => { setTouched(true); ref.current?.click(); }}
          >
            <FaCamera size={20} style={{ opacity: 0.3, marginBottom: 4 }} />
            <span style={{ fontSize: ".75rem", fontWeight: 600, color: "#9ca3af" }}>
              {images.length === 0 ? "Add Photos" : "Add More"}
            </span>
          </div>
        )}
      </div>

      <input ref={ref} type="file" style={{ display: "none" }} accept="image/*" multiple onChange={handleFiles} />

      {images.length > 0 && (
        <small style={{ color: "#6b7280", fontSize: ".75rem" }}>
          💡 First photo is shown as your cover photo to clients.
        </small>
      )}
      {hasError && (
        <small className="pf-error-msg mt-1">
          <FaExclamationCircle className="me-1" />At least one work photo is required
        </small>
      )}
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon, title, children, accentColor }) => (
  <div className="pf-section" style={accentColor ? { "--sa": accentColor } : {}}>
    <div className="pf-section-title">{icon} {title}</div>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  ProfileTab
//
//  Props:
//    craftsman              — craftsman object from API (has .status, .slug, etc.)
//    profileData            — flat state object with all craftsman fields
//    setProfileData         — setState setter for profileData
//    profileImage           — File (newly chosen) | string URL (existing) | null
//    handleProfileImageChange(e) — onChange handler for the profile <input type="file">
//    proofDocument          — File | string URL | null
//    handleProofDocumentChange(e)
//    professionOptions      — string[]
//    skillOptions           — string[]
//    serviceOptions         — string[]
//    portfolioImages        — array of { id, file?, preview?, url? }
//    onPortfolioAdd(imgObj) — called when user picks a new portfolio photo
//    onPortfolioRemove(id)  — called when user clicks × on a portfolio photo
//    saveProfile(formData)  — receives the ready FormData; responsible for
//                             calling fetch/axios and showing a toast on success
//    saving                 — boolean; true while the API call is in-flight
//    addToast(msg, type, title) — optional toast helper
//
//  The parent must also track portfolioRemoveIds (IDs of server-side gallery
//  images the user has removed) and pass them through saveProfile or store
//  them in a ref. See usage example below the component.
// ══════════════════════════════════════════════════════════════════════════════
function ProfileTab({
  craftsman,
  profileData,
  setProfileData,
  profileImage,
  handleProfileImageChange,
  handleProofDocumentChange,
  proofDocument,
  professionOptions = [],
  skillOptions = [],
  serviceOptions = [],
  portfolioImages = [],
  onPortfolioAdd,
  onPortfolioRemove,
  portfolioRemoveIds = [],   // ← NEW: parent tracks which server IDs were removed
  saveProfile,               // saveProfile(formData: FormData) → Promise
  saving = false,
  addToast,
}) {
  const [validationError, setValidationError] = useState("");

  const locations = [
    "Nairobi CBD", "Westlands", "Karen", "South B", "Embakasi",
    "Kasarani", "Kileleshwa", "Lavington", "Parklands", "Ruaka",
    "Nakuru", "Eldoret", "Kisumu", "Mombasa", "Thika", "Machakos",
  ];

  const isCompany  = profileData.account_type === "Company";
  const completion = calcCompletion(profileData, profileImage, portfolioImages);

  // Generic handler for all flat profileData fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicesChange = (newServices) => {
    setProfileData((prev) => ({ ...prev, services: newServices }));
  };

  // ── Validate then build FormData and hand off to parent ──────────────────
  const handleSave = () => {
    setValidationError("");

    // Required scalar fields
    const requiredFields = ["description", "profession", "location"];
    if (isCompany) requiredFields.push("company_name");

    const missing = requiredFields.filter((f) => !profileData[f]?.trim?.());

    // Skills (array must have at least one entry)
    const skillsOk = Array.isArray(profileData.skills)
      ? profileData.skills.length > 0
      : !!profileData.skills;
    if (!skillsOk) missing.push("skills");

    if (missing.length) {
      const msg = `Please fill in: ${missing.join(", ")}`;
      setValidationError(msg);
      addToast?.(msg, "warning", "Missing Fields");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!profileData.services?.length) {
      const msg = "Please add at least one service.";
      setValidationError(msg);
      addToast?.(msg, "warning", "No Service Added");
      return;
    }

    if (!profileImage) {
      const msg = "Please upload a profile photo.";
      setValidationError(msg);
      addToast?.(msg, "warning", "Missing Photo");
      return;
    }

    if (!portfolioImages?.length) {
      const msg = "Please add at least one work photo to your portfolio.";
      setValidationError(msg);
      addToast?.(msg, "warning", "No Work Photos");
      return;
    }

    // Build multipart payload
    const formData = buildFormData({
      profileData,
      profileImage,
      proofDocument,
      portfolioImages,
      portfolioRemoveIds,
    });

    // Hand off to parent — parent does the fetch + toast on success
    saveProfile(formData);
  };

  return (
    <>
      {/* ── Scoped styles ──────────────────────────────────────────────────── */}
      <style>{`
        .pf-section {
          background: white; border-radius: 16px; border: 2px solid #f3f4f6;
          padding: 1.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden;
        }
        .pf-section::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--sa, linear-gradient(90deg, #fbbf24, #22c55e));
        }
        .pf-section-title {
          font-size: .72rem; font-weight: 800; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 1.25rem; display: flex; align-items: center; gap: 6px;
        }
        .pf-field  { width: 100%; }
        .pf-label  { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: .875rem; color: #374151; margin-bottom: .5rem; }
        .pf-icon   { color: #22c55e; font-size: .9rem; }
        .pf-input  {
          width: 100%; padding: .75rem 1rem; border: 2px solid #e5e7eb;
          border-radius: 10px; font-size: .9375rem; background: white;
          transition: border-color .2s, box-shadow .2s; display: block;
        }
        .pf-input:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.1); }
        .pf-err         { border-color: #ef4444 !important; }
        .pf-error-msg   { color: #ef4444; font-size: .78rem; margin-top: 4px; display: flex; align-items: center; }

        .pf-add-btn {
          padding: .75rem 1.25rem; background: #1f2937; color: white;
          border: none; border-radius: 10px; font-weight: 700; font-size: .875rem;
          cursor: pointer; white-space: nowrap; transition: background .2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .pf-add-btn:hover { background: #374151; }

        .skill-chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 1.5px solid #86efac; color: #15803d;
          padding: 5px 12px; border-radius: 50px;
          font-size: .8rem; font-weight: 700; cursor: pointer; transition: all .2s;
        }
        .skill-chip:hover { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }

        /* Services */
        .services-list { display: flex; flex-direction: column; gap: .5rem; }
        .service-row {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border: 2px solid #e5e7eb; border-radius: 12px;
          padding: .75rem 1rem; display: flex; align-items: center; gap: .75rem;
          transition: border-color .2s;
        }
        .service-row:hover { border-color: #86efac; }
        .rate-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 1.5px solid #86efac; color: #15803d;
          padding: 3px 10px; border-radius: 50px;
          font-size: .75rem; font-weight: 700; white-space: nowrap;
        }
        .svc-remove-btn {
          background: #fef2f2; border: 1.5px solid #fca5a5; color: #ef4444;
          border-radius: 8px; padding: 4px 8px; cursor: pointer;
          font-size: .8rem; flex-shrink: 0; transition: all .2s;
          display: inline-flex; align-items: center;
        }
        .svc-remove-btn:hover { background: #fee2e2; }
        .add-service-box {
          background: #f9fafb; border: 2px dashed #d1d5db;
          border-radius: 12px; padding: 1rem; transition: border-color .2s;
        }
        .add-service-box:focus-within { border-color: #22c55e; border-style: solid; background: #f0fdf4; }

        /* Portfolio */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: .75rem; margin-bottom: .5rem;
        }
        .portfolio-thumb {
          position: relative; border-radius: 12px; overflow: hidden;
          aspect-ratio: 1; border: 2px solid #86efac;
        }
        .portfolio-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .portfolio-cover-badge {
          position: absolute; top: 6px; left: 6px;
          background: linear-gradient(135deg, #fbbf24, #22c55e);
          color: #1f2937; font-size: .65rem; font-weight: 800;
          padding: 2px 7px; border-radius: 50px;
          display: flex; align-items: center; gap: 3px;
        }
        .portfolio-remove {
          position: absolute; top: 5px; right: 5px;
          background: rgba(0,0,0,.55); color: white;
          border: none; border-radius: 50%; width: 22px; height: 22px;
          font-size: .9rem; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .portfolio-remove:hover { background: rgba(239,68,68,.8); }
        .portfolio-add-slot {
          aspect-ratio: 1; border: 2px dashed #d1d5db; border-radius: 12px;
          background: #f9fafb; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; transition: all .2s;
        }
        .portfolio-add-slot:hover { border-color: #22c55e; background: #f0fdf4; }

        /* Account type cards */
        .atc {
          display: flex; align-items: center; gap: 12px; padding: 1rem 1.5rem;
          border: 2px solid #e5e7eb; border-radius: 14px; cursor: pointer;
          transition: all .2s; background: white; user-select: none; flex: 1; min-width: 160px;
        }
        .atc:hover { border-color: #d1d5db; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
        .atc-on    { border-color: #22c55e !important; background: #f0fdf4 !important; box-shadow: 0 4px 16px rgba(34,197,94,.15) !important; }

        /* File zones */
        .file-zone {
          border: 2px dashed #d1d5db; border-radius: 14px; background: #f9fafb;
          cursor: pointer; transition: all .25s; overflow: hidden;
          min-height: 120px; display: flex; align-items: center; justify-content: center;
        }
        .file-zone:hover { border-color: #22c55e; background: #f0fdf4; }
        .fz-filled  { border-style: solid; border-color: #86efac; }
        .fz-error   { border-color: #ef4444 !important; background: #fef2f2; }
        .fz-placeholder { text-align: center; padding: 1.5rem; color: #9ca3af; }
        .fz-text    { display: block; font-weight: 600; font-size: .875rem; margin-top: 4px; }
        .fz-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,.45);
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 5px; color: white;
          font-weight: 700; font-size: .875rem; opacity: 0; transition: opacity .2s;
        }
        .file-zone:hover .fz-overlay { opacity: 1; }
        .fname-tag {
          margin-top: 6px; font-size: .78rem; color: #374151;
          display: flex; align-items: center; gap: 5px; font-weight: 600;
          background: #f0fdf4; padding: 4px 10px; border-radius: 8px; width: fit-content;
        }

        /* Completion bar */
        .completion-bar {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #86efac; border-radius: 14px;
          padding: 1rem 1.25rem; margin-bottom: 1.5rem;
        }
        .completion-bar .progress     { height: 10px; border-radius: 10px; background: rgba(255,255,255,.6); }
        .completion-bar .progress-bar { border-radius: 10px; background: linear-gradient(90deg, #fbbf24, #22c55e); }

        /* Save button */
        .save-btn {
          background: linear-gradient(135deg, #fbbf24, #22c55e);
          border: none; border-radius: 14px; color: #1f2937; font-weight: 800;
          font-size: 1rem; padding: .875rem 2.5rem;
          display: inline-flex; align-items: center; gap: 8px;
          transition: all .3s; cursor: pointer;
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,197,94,.3); }
        .save-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }

        .upgrade-nudge {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #86efac; border-radius: 12px;
          padding: .875rem 1.25rem; font-size: .875rem; color: #15803d;
          display: flex; align-items: center; gap: 10px; margin-top: .75rem;
        }
      `}</style>

      {craftsman?.status && <StatusBanner status={craftsman.status} />}
      <ValidationBanner message={validationError} onDismiss={() => setValidationError("")} />

      {/* ── Profile completion bar ─────────────────────────────────────────── */}
      <div className="completion-bar">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontWeight: 700, fontSize: ".875rem", color: "#15803d" }}>Profile Completion</span>
          <span style={{ fontWeight: 800, color: "#16a34a" }}>{completion}%</span>
        </div>
        <ProgressBar now={completion} className="progress" />
        {completion < 100
          ? <small className="text-muted d-block mt-1">Complete your profile to start receiving jobs</small>
          : <small style={{ color: "#15803d", fontWeight: 600 }} className="d-block mt-1">✅ Profile complete — you're ready!</small>
        }
      </div>

      {/* ── 1: Account Type ───────────────────────────────────────────────── */}
      <Section icon={<FaIdCard />} title="Account Type">
        <RadioGroup
          label="How do you work?"
          name="account_type"
          options={["Individual", "Company"]}
          value={profileData.account_type}
          onChange={handleInputChange}
          required
        />
        <AccountTypeInfo accountType={profileData.account_type} />
        {profileData.account_type === "Individual" && (
          <div className="upgrade-nudge">
            <FaBuilding style={{ flexShrink: 0, color: "#16a34a" }} />
            <span>
              <strong>Have a crew?</strong> Switch to <strong>Company</strong> to invite helpers and manage your team.
            </span>
          </div>
        )}
      </Section>

      {/* ── 2: Profile Photo & Documents ──────────────────────────────────── */}
      <Section icon={<FaCamera />} title="Profile Photo & Documents">
        <Row>
          <Col md={6}>
            <FileInput
              label="Profile Photo"
              file={profileImage}
              onChange={handleProfileImageChange}
              accept="image/*"
              required
              hint="Clear face photo — clients will see this"
            />
          </Col>
          <Col md={6}>
            <ProofDocumentInput proofDocument={proofDocument} onChange={handleProofDocumentChange} />
          </Col>
        </Row>
      </Section>

      {/* ── 3: Work Portfolio ─────────────────────────────────────────────── */}
      <Section icon={<FaImages />} title="Work Portfolio">
        <PortfolioGallery
          images={portfolioImages}
          onAdd={onPortfolioAdd}
          onRemove={onPortfolioRemove}
          required
        />
      </Section>

      {/* ── 4: Services & Rates ───────────────────────────────────────────── */}
      <Section icon={<FaBriefcase />} title="Services & Rates">
        <ServicesEditor
          services={profileData.services || []}
          onChange={handleServicesChange}
          serviceOptions={serviceOptions}
          required
        />
        <small className="text-muted">
          💡 Setting rates helps clients know your pricing upfront and reduces back-and-forth
        </small>
      </Section>

      {/* ── 5: Professional Details ───────────────────────────────────────── */}
      <Section icon={<FaHardHat />} title="Professional Details">
        <TextInputWithDatalist
          label="Bio / Description"
          name="description"
          value={profileData.description}
          onChange={handleInputChange}
          icon={<FaAlignLeft />}
          placeholder="e.g. Certified electrician with 8 years experience in residential wiring…"
          required
        />
        <Row>
          <Col md={6}>
            <TextInputWithDatalist
              label="Profession / Trade"
              name="profession"
              value={profileData.profession}
              onChange={handleInputChange}
              options={professionOptions}
              icon={<FaHardHat />}
              required
            />
          </Col>
          <Col md={6}>
            <TextInputWithDatalist
              label="Experience Level"
              name="experience_level"
              value={profileData.experience_level}
              onChange={handleInputChange}
              options={["1-2 years", "3-5 years", "5-10 years", "10+ years"]}
              icon={<FaStar />}
              placeholder="Select years of experience"
            />
          </Col>
        </Row>
        <TextInputWithDatalist
          label="Skills"
          name="skills"
          value={profileData.skills}
          onChange={handleInputChange}
          options={skillOptions}
          icon={<FaTools />}
          placeholder="e.g. Wiring — type and press Enter or Add"
          required
          isArray
        />
      </Section>

      {/* ── 6: Company Details (only when Company selected) ───────────────── */}
      <Collapse in={isCompany}>
        <div>
          <Section icon={<FaBuilding />} title="Company Details">
            <TextInputWithDatalist
              label="Registered Company / Business Name"
              name="company_name"
              value={profileData.company_name}
              onChange={handleInputChange}
              icon={<FaBuilding />}
              placeholder="e.g. Bright Sparks Electrical Ltd"
              required={isCompany}
            />
            <div style={{
              background: "#f0fdf4", border: "2px solid #86efac",
              borderRadius: 10, padding: ".875rem", fontSize: ".8rem", color: "#15803d",
            }}>
              💡 <strong>After saving</strong>, go to the <strong>Team Members</strong> tab to invite your helpers and foremen.
            </div>
          </Section>
        </div>
      </Collapse>

      {/* ── 7: Service Area ───────────────────────────────────────────────── */}
      <Section icon={<FaMapMarkerAlt />} title="Service Area">
        <TextInputWithDatalist
          label="Your Area / Town"
          name="location"
          value={profileData.location}
          onChange={handleInputChange}
          options={locations}
          icon={<FaMapMarkerAlt />}
          placeholder="e.g. Westlands, Nairobi"
          required
        />
        <small className="text-muted">Jobs near this location will be prioritised for you</small>
      </Section>

      {/* ── Save button ───────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mb-4">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm" role="status" /> Saving…</>
            : <><FaSave /> Save Profile</>
          }
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


