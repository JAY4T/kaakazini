import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Button, Badge, Row, Col, Card } from "react-bootstrap";
import axios from "axios";

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
  serviceImage,
  handleServiceImageChange,
  saveProfile,
  locationOptions = ["South B", "Westlands", "Karen", "Embakasi", "Nakuru", "Eldoret"],
  backendUrl = "http://localhost:5000",
}) {
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [newStaff, setNewStaff] = useState("");
  const [staffList, setStaffList] = useState(Array.isArray(profileData.staff) ? profileData.staff : []);

  const [localProfessionOptions, setLocalProfessionOptions] = useState(professionOptions);
  const [localSkillOptions, setLocalSkillOptions] = useState(skillOptions);
  const [localServiceOptions, setLocalServiceOptions] = useState(serviceOptions);
  const [localLocationOptions, setLocalLocationOptions] = useState(locationOptions);

  useEffect(() => {
    if (!profileData.accountType) setProfileData({ ...profileData, accountType: "individual" });
  }, []);

  useEffect(() => {
    const newErrors = {};
    const requiredFields = ["description", "profession", "skills", "location", "primary_service"];
    if (profileData.accountType === "company") requiredFields.push("company_name");
    requiredFields.forEach((field) => {
      const value = profileData[field];
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === "")) {
        newErrors[field] = "This field is required";
      }
    });
    if (!serviceImage) newErrors.serviceImage = "This field is required";
    setErrors(newErrors);
  }, [profileData, serviceImage]);

  const handleInputChange = (field, value) => {
    setProfileData((p) => ({ ...p, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const isInvalid = (field) => touched[field] && errors[field];

  const handleSave = () => {
    const allTouched = {};
    Object.keys(errors).forEach((field) => (allTouched[field] = true));
    setTouched(allTouched);
    if (Object.keys(errors).length === 0) saveProfile({ ...profileData, staff: staffList });
  };

  const inviteStaff = () => {
    const trimmed = newStaff.trim();
    if (trimmed && !staffList.includes(trimmed)) {
      setStaffList([...staffList, trimmed]);
      setNewStaff("");
    }
  };

  const formatOptions = (arr) => arr.map((opt) => ({ value: opt, label: opt }));
  const safeProfession = profileData.profession ? { value: profileData.profession, label: profileData.profession } : null;
  const safePrimaryService = profileData.primary_service ? { value: profileData.primary_service, label: profileData.primary_service } : null;
  const safeLocation = profileData.location ? { value: profileData.location, label: profileData.location } : null;
  const safeSkills = Array.isArray(profileData.skills) ? profileData.skills.map((skill) => ({ value: skill, label: skill })) : [];

  const syncNewOption = async (type, value, setLocal, localOptions) => {
    if (!value || localOptions.includes(value)) return;
    try {
      await axios.post(`${backendUrl}/api/options`, { type, value });
      setLocal([...localOptions, value]);
    } catch (err) {
      console.error(`Error saving ${type}:`, err);
    }
  };

  // Gradient header style
  const cardHeaderStyle = {
    background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "6px",
    marginBottom: "15px",
    fontWeight: "600",
    fontSize: "1.1rem",
  };

  const cardHoverStyle = {
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const cardHoverEffect = {
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    transform: "translateY(-3px)",
  };

  return (
    <Card className="p-4 shadow-sm border-0" style={{ backgroundColor: "#f9fafd" }}>
      {craftsman?.full_name && (
        <div style={cardHeaderStyle}>Welcome, {craftsman.full_name}!</div>
      )}

      {/* Account Type */}
      <Card
        className="mb-4 p-3 shadow-sm border-0"
        style={cardHoverStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverEffect)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)", transform: "none" })}
      >
        <label className="form-label fw-bold">Account Type *</label>
        <div className="d-flex gap-4">
          {["individual", "company"].map((type) => (
            <label key={type} className="form-check form-check-inline">
              <input
                type="radio"
                name="accountType"
                value={type}
                checked={profileData.accountType === type}
                onChange={(e) => handleInputChange("accountType", e.target.value)}
                className="form-check-input"
              />
              <span className="form-check-label text-capitalize">{type}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Profile & Proof */}
      <Row className="mb-4">
        <Col md={4} className="text-center">
          <Card
            className="p-3 shadow-sm border-0"
            style={cardHoverStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverEffect)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)", transform: "none" })}
          >
            <img
              src={profileImage || "https://via.placeholder.com/120"}
              alt="Profile"
              className="rounded-circle mb-3 border"
              width="120"
              height="120"
            />
            <label className="btn btn-outline-primary btn-sm">
              Change Profile Photo
              <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
            </label>
          </Card>
        </Col>
        <Col md={8}>
          <Card
            className="p-3 shadow-sm border-0"
            style={cardHoverStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverEffect)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)", transform: "none" })}
          >
            <label className="form-label">Proof Document (Optional)</label>
            <input type="file" className="form-control mb-2" accept=".pdf,image/*" onChange={handleProofDocumentChange} />
            {proofDocument && <Badge bg="success">Uploaded: {proofDocument}</Badge>}
          </Card>
        </Col>
      </Row>

      {/* Description */}
      <Card className="mb-4 p-3 shadow-sm border-0" style={cardHoverStyle}>
        <label className="form-label">Description *</label>
        <textarea
          className={`form-control ${isInvalid("description") ? "border-danger" : ""}`}
          rows="3"
          placeholder="Describe your service"
          value={profileData.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
        />
        {isInvalid("description") && <small className="text-danger">{errors.description}</small>}
      </Card>

      {/* Profession & Skills */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm border-0 mb-3 mb-md-0" style={cardHoverStyle}>
            <label className="form-label">Profession *</label>
            <CreatableSelect
              options={formatOptions(localProfessionOptions)}
              value={safeProfession}
              onChange={(option) => {
                handleInputChange("profession", option?.value);
                syncNewOption("profession", option?.value, setLocalProfessionOptions, localProfessionOptions);
              }}
              placeholder="Select or type your profession"
              isClearable
            />
            {isInvalid("profession") && <small className="text-danger">{errors.profession}</small>}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 shadow-sm border-0" style={cardHoverStyle}>
            <label className="form-label">Skills *</label>
            <CreatableSelect
              options={formatOptions(localSkillOptions)}
              value={safeSkills}
              onChange={(options) => {
                const values = options ? options.map((opt) => opt.value) : [];
                handleInputChange("skills", values);
                options?.forEach((opt) => syncNewOption("skill", opt.value, setLocalSkillOptions, localSkillOptions));
              }}
              placeholder="Select or type your skills"
              isMulti
              isClearable
            />
            {isInvalid("skills") && <small className="text-danger">{errors.skills}</small>}
          </Card>
        </Col>
      </Row>

      {/* Company Name */}
      {profileData.accountType === "company" && (
        <Card className="mb-4 p-3 shadow-sm border-0" style={cardHoverStyle}>
          <label className="form-label">Company Name *</label>
          <input
            className={`form-control ${isInvalid("company_name") ? "border-danger" : ""}`}
            placeholder="Company Name"
            value={profileData.company_name || ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
          />
          {isInvalid("company_name") && <small className="text-danger">{errors.company_name}</small>}
        </Card>
      )}

      {/* Location & Primary Service */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm border-0 mb-3 mb-md-0" style={cardHoverStyle}>
            <label className="form-label">Location *</label>
            <CreatableSelect
              options={formatOptions(localLocationOptions)}
              value={safeLocation}
              onChange={(option) => {
                handleInputChange("location", option?.value);
                syncNewOption("location", option?.value, setLocalLocationOptions, localLocationOptions);
              }}
              placeholder="Select or type your location"
              isClearable
            />
            {isInvalid("location") && <small className="text-danger">{errors.location}</small>}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 shadow-sm border-0" style={cardHoverStyle}>
            <label className="form-label">Primary Service *</label>
            <CreatableSelect
              options={formatOptions(localServiceOptions)}
              value={safePrimaryService}
              onChange={(option) => {
                handleInputChange("primary_service", option?.value);
                syncNewOption("service", option?.value, setLocalServiceOptions, localServiceOptions);
              }}
              placeholder="Select or type your service"
              isClearable
            />
            {isInvalid("primary_service") && <small className="text-danger">{errors.primary_service}</small>}
          </Card>
        </Col>
      </Row>

      {/* Service Image */}
      <Card className="mb-4 p-3 shadow-sm border-0 text-center" style={cardHoverStyle}>
        <label className="form-label fw-bold">Service Image *</label>
        {serviceImage && (
          <img src={serviceImage} alt="Service" className="img-thumbnail mb-2" width="200" height="150" />
        )}
        <input
          type="file"
          className={`form-control ${isInvalid("serviceImage") ? "border-danger" : ""}`}
          accept="image/*"
          onChange={(e) => {
            handleServiceImageChange(e);
            setTouched((t) => ({ ...t, serviceImage: true }));
          }}
        />
        {isInvalid("serviceImage") && <small className="text-danger">{errors.serviceImage}</small>}
      </Card>

      {/* Invite Staff */}
      {profileData.accountType === "company" && (
        <Card className="mb-4 p-3 shadow-sm border-0" style={cardHoverStyle}>
          <label className="form-label">Invite Staff</label>
          <div className="d-flex mb-2 gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Staff Name or Email"
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
            />
            <Button variant="primary" onClick={inviteStaff}>
              Invite
            </Button>
          </div>
          {staffList.length > 0 && (
            <ul className="list-group">
              {staffList.map((staff, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center" style={{ transition: "0.3s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor="#f1f7ff"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor="#fff"}>
                  {staff}
                  <Badge bg="secondary">Staff</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Save & Status */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="success" onClick={handleSave}>Save Profile</Button>
        {craftsman?.status && (
          <Badge bg={craftsman.status === "approved" ? "success" : "warning"}>
            {craftsman.status.charAt(0).toUpperCase() + craftsman.status.slice(1)}
          </Badge>
        )}
      </div>
    </Card>
  );
}

export default ProfileTab;
