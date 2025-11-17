import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function ProfileTab({
  craftsman,
  profileData,
  setProfileData,
  profileImage,
  handleProfileImageChange,
  handleProofDocumentChange,
  proofDocument,
  proofDocumentFile,
  professionOptions,
  skillOptions,
  serviceOptions,
  serviceImages,
  serviceVideos,
  handleRemoveServiceImage,
  handleEditServiceImage,
  handleServiceImagesChange,
  handleRemoveServiceVideo,
  handleServiceVideosChange,
  saveProfile,
  validateProfile,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-4 shadow-sm border-0">
      {/* Profile Image */}
      <div className="d-flex align-items-center mb-4">
        <img
          src={profileImage || craftsman.profile || "https://via.placeholder.com/100"}
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

      {/* Proof Document */}
      <div className="mb-3">
        <label className="form-label fw-bold">
          Craftsman Proof Document <span className="text-muted fw-normal">(optional)</span>
        </label>
        <input type="file" accept=".pdf,image/*" className="form-control" onChange={handleProofDocumentChange} />
        {proofDocument && (
          <small className="text-success">
            Uploaded: {proofDocumentFile ? proofDocumentFile.name : proofDocument.split("/").pop()}
          </small>
        )}
      </div>

      {/* Description */}
      <textarea
        className="form-control mb-3"
        rows="2"
        name="description"
        placeholder="Add a short professional summary"
        value={profileData.description}
        onChange={handleInputChange}
      />

      {/* Profession / Skill */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <select name="profession" className="form-select" value={profileData.profession} onChange={handleInputChange}>
            <option value="">Select Profession</option>
            {professionOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <select name="skills" className="form-select" value={profileData.skills} onChange={handleInputChange}>
            <option value="">Select Skill</option>
            {skillOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Company / Location / Service */}
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

      <select
        name="primary_service"
        className="form-select mb-3"
        value={profileData.primary_service}
        onChange={handleInputChange}
      >
        <option value="">Select Service</option>
        {serviceOptions.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* Service Images */}
      <div className="mb-3">
        <label className="fw-bold mb-2">Service Images</label>
        <div className="d-flex flex-wrap gap-3">
          {serviceImages.concat(craftsman.service_images || []).map((img, i) => (
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
                <input id={`edit-${i}`} type="file" hidden accept="image/*" onChange={(e) => handleEditServiceImage(e, i)} />
              </label>
            </div>
          ))}

          <label
            htmlFor="serviceImages"
            className="border rounded d-flex flex-column justify-content-center align-items-center"
            style={{ width: 150, height: 120, background: "#f8f9fa", cursor: "pointer" }}
          >
            <i className="bi bi-plus-lg fs-3 text-secondary"></i>
            <span className="small text-muted">Upload service image</span>
            <input id="serviceImages" type="file" hidden multiple accept="image/*" onChange={handleServiceImagesChange} />
          </label>
        </div>
      </div>

      {/* Service Videos */}
      <div className="mb-3">
        <label className="fw-bold mb-2">Service Videos</label>
        <div className="d-flex flex-wrap gap-3">
          {serviceVideos.concat(craftsman.service_videos || []).map((vid, i) => (
            <div key={i} className="position-relative">
              <video src={vid} width="180" height="120" controls />
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
            <input id="serviceVideos" type="file" hidden multiple accept="video/*" onChange={handleServiceVideosChange} />
          </label>
        </div>
      </div>

      <p className="text-muted">
        <strong>Status:</strong>{" "}
        <span className={`badge ${craftsman.status === "Approved" ? "bg-success" : "bg-warning text-dark"}`}>
          {craftsman.status || "Pending Approval"}
        </span>
      </p>

      <button className="btn btn-success mt-3" onClick={saveProfile} disabled={!!validateProfile()}>
        Save Changes
      </button>
    </div>
  );
}

export default ProfileTab;
