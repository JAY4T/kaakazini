import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Button } from "react-bootstrap";

function ProfileTab({
  craftsman,
  profileData,
  setProfileData,
  profileImage,
  handleProfileImageChange,
  handleProofDocumentChange,
  proofDocument,
  professionOptions,
  skillOptions,
  serviceOptions,
  serviceImage,
  handleServiceImageChange,
  saveProfile,
}) {
  const [touched, setTouched] = useState({}); // Track touched fields
  const [errors, setErrors] = useState({});   // Track validation errors

  const requiredFields = [
    "description",
    "profession",
    "skills",
    "company_name",
    "location",
    "primary_service",
    "serviceImage"
  ];

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if ((field === "serviceImage" && !serviceImage) || (!profileData[field] && field !== "serviceImage")) {
        newErrors[field] = "This field is required";
      }
    });
    setErrors(newErrors);
  }, [profileData, serviceImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const isInvalid = (field) => touched[field] && errors[field];

  const handleSave = () => {
    // Mark all fields as touched
    const allTouched = {};
    requiredFields.forEach((field) => allTouched[field] = true);
    setTouched(allTouched);

    // Save only if no errors
    if (Object.keys(errors).length === 0) {
      saveProfile();
    }
  };

  return (
    <div className="card p-4 shadow-sm border-0">

      {/* Welcome Message */}
      {craftsman?.full_name && (
        <h5 className="mb-3">Welcome, {craftsman.full_name}!</h5>
      )}

      {/* Profile Image */}
      <div className="mb-4">
        <img
          src={profileImage || "https://via.placeholder.com/120"}
          alt="Profile"
          width="120"
          height="120"
          className="rounded-circle border d-block mb-2"
        />
        <label className="btn btn-outline-primary btn-sm">
          Change Profile Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleProfileImageChange}
          />
        </label>
      </div>

      {/* Proof Document (Optional) */}
      <div className="mb-3">
        <label className="form-label">Proof Document (Optional)</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf,image/*"
          onChange={handleProofDocumentChange}
        />
        {proofDocument && <small className="text-success">Uploaded: {proofDocument}</small>}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description *</label>
        <textarea
          className={`form-control ${isInvalid("description") ? "border-danger" : ""}`}
          name="description"
          rows="2"
          placeholder="Describe your service"
          value={profileData.description}
          onChange={handleInputChange}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
        />
        {isInvalid("description") && <small className="text-danger">{errors.description}</small>}
      </div>

      {/* Profession / Skill */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Profession *</label>
          <select
            className={`form-select ${isInvalid("profession") ? "border-danger" : ""}`}
            name="profession"
            value={profileData.profession}
            onChange={handleInputChange}
            onBlur={() => setTouched((t) => ({ ...t, profession: true }))}
          >
            <option value="">Select Profession</option>
            {professionOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          {isInvalid("profession") && <small className="text-danger">{errors.profession}</small>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Skill *</label>
          <select
            className={`form-select ${isInvalid("skills") ? "border-danger" : ""}`}
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            onBlur={() => setTouched((t) => ({ ...t, skills: true }))}
          >
            <option value="">Select Skill</option>
            {skillOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          {isInvalid("skills") && <small className="text-danger">{errors.skills}</small>}
        </div>
      </div>

      {/* Company Name */}
      <div className="mb-3">
        <label className="form-label">Company Name *</label>
        <input
          className={`form-control ${isInvalid("company_name") ? "border-danger" : ""}`}
          name="company_name"
          placeholder="Company Name"
          value={profileData.company_name}
          onChange={handleInputChange}
          onBlur={() => setTouched((t) => ({ ...t, company_name: true }))}
        />
        {isInvalid("company_name") && <small className="text-danger">{errors.company_name}</small>}
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">Location *</label>
        <select
          className={`form-select ${isInvalid("location") ? "border-danger" : ""}`}
          name="location"
          value={profileData.location}
          onChange={handleInputChange}
          onBlur={() => setTouched((t) => ({ ...t, location: true }))}
        >
          <option value="">Select Location</option>
          {["South B", "Westlands", "Karen", "Embakasi", "Nakuru", "Eldoret"].map((loc) => (
            <option key={loc}>{loc}</option>
          ))}
        </select>
        {isInvalid("location") && <small className="text-danger">{errors.location}</small>}
      </div>

      {/* Primary Service */}
      <div className="mb-3">
        <label className="form-label">Primary Service *</label>
        <select
          className={`form-select ${isInvalid("primary_service") ? "border-danger" : ""}`}
          name="primary_service"
          value={profileData.primary_service}
          onChange={handleInputChange}
          onBlur={() => setTouched((t) => ({ ...t, primary_service: true }))}
        >
          <option value="">Select Service</option>
          {serviceOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        {isInvalid("primary_service") && <small className="text-danger">{errors.primary_service}</small>}
      </div>

      {/* Service Image */}
      <div className="mb-4">
        <label className="form-label fw-bold">Service Image *</label>
        {serviceImage && (
          <img
            src={serviceImage}
            alt="Service"
            className="img-thumbnail mb-2"
            width="200"
            height="150"
          />
        )}
        <input
          type="file"
          className={`form-control ${isInvalid("serviceImage") ? "border-danger" : ""}`}
          accept="image/*"
          onChange={(e) => {
            handleServiceImageChange(e);
            setTouched((t) => ({ ...t, serviceImage: true }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, serviceImage: true }))}
        />
        {isInvalid("serviceImage") && <small className="text-danger">{errors.serviceImage}</small>}
      </div>

      {/* Save Button */}
      <button
        className="btn btn-success mb-2"
        onClick={handleSave}
        disabled={Object.keys(errors).length > 0}
      >
        Save Profile
      </button>

      {/* Status Button */}
      {craftsman?.status && (
        <Button
          size="sm"
          variant={craftsman.status === "approved" ? "success" : "warning"}
        >
          {craftsman.status.charAt(0).toUpperCase() + craftsman.status.slice(1)}
        </Button>
      )}
    </div>
  );
}

export default ProfileTab;
