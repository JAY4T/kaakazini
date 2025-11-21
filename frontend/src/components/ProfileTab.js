import React from "react";
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
  professionOptions = [],
  skillOptions = [],
  serviceOptions = [],
  serviceImage,
  handleServiceImageChange,
  saveProfile,
  validateProfile,
}) {
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // EDITABLE: remove status check to allow editing
  const isEditable = true; // change to craftsman?.status === "approved" if you want to keep restriction

  return (
    <div className="card p-4 shadow-sm border-0">
      {/* Welcome */}
      {craftsman?.full_name && <h5 className="mb-3">Welcome, {craftsman.full_name}!</h5>}

      {/* Profile Image */}
      <div className="mb-4">
        <img
          src={profileImage || "https://via.placeholder.com/120"}
          alt="Profile"
          width="120"
          height="120"
          className="rounded-circle border d-block mb-2"
        />
        <label className={`btn btn-outline-primary btn-sm ${!isEditable ? "disabled" : ""}`}>
          Change Profile Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleProfileImageChange}
            disabled={!isEditable}
          />
        </label>
      </div>

      {/* Proof Document */}
      <div className="mb-3">
        <label className="form-label">Proof Document</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf,image/*"
          onChange={handleProofDocumentChange}
          disabled={!isEditable}
        />
        {proofDocument && <small className="text-success">Uploaded: {proofDocument}</small>}
      </div>

      {/* Description */}
      <textarea
        className="form-control mb-3"
        name="description"
        rows="2"
        placeholder="Describe your service"
        value={profileData.description || ""}
        onChange={handleInputChange}
        disabled={!isEditable}
      />

      {/* Profession & Skills */}
      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            name="profession"
            value={profileData.profession || ""}
            onChange={handleInputChange}
            disabled={!isEditable}
          >
            <option value="">Select Profession</option>
            {professionOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            name="skills"
            value={profileData.skills || ""}
            onChange={handleInputChange}
            disabled={!isEditable}
          >
            <option value="">Select Skill</option>
            {skillOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Company Name */}
      <input
        className="form-control mb-3"
        name="company_name"
        placeholder="Company Name"
        value={profileData.company_name || ""}
        onChange={handleInputChange}
        disabled={!isEditable}
      />

      {/* Location */}
      <select
        className="form-select mb-3"
        name="location"
        value={profileData.location || ""}
        onChange={handleInputChange}
        disabled={!isEditable}
      >
        <option value="">Select Location</option>
        {["South B", "Westlands", "Karen", "Embakasi", "Nakuru", "Eldoret"].map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      {/* Primary Service */}
      <select
        className="form-select mb-3"
        name="primary_service"
        value={profileData.primary_service || ""}
        onChange={handleInputChange}
        disabled={!isEditable}
      >
        <option value="">Select Service</option>
        {serviceOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Service Image */}
      <div className="mb-4">
        <label className="form-label fw-bold">Service Image</label>
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
          className="form-control"
          accept="image/*"
          onChange={handleServiceImageChange}
          disabled={!isEditable}
        />
      </div>

      {/* Save Button */}
      <button
        className="btn btn-success mb-2"
        onClick={saveProfile}
        disabled={!isEditable || !!validateProfile?.()}
      >
        Save Profile
      </button>

      {/* Status */}
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
