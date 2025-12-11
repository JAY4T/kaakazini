import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Badge, Form, Collapse } from "react-bootstrap";

// ----------------- Reusable Inputs -----------------
export const TextInputWithDatalist = ({ label, name, value, onChange, options = [], required, isArray = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (required && (!value || (isArray && value.length === 0))) setError("This field is required");
    else setError("");
  }, [value, required, isArray]);

  const handleAddItem = () => {
    if (!inputValue.trim()) return;
    if (isArray) {
      if (!value.includes(inputValue.trim())) onChange({ target: { name, value: [...value, inputValue.trim()] } });
    } else {
      onChange({ target: { name, value: inputValue } });
    }
    setInputValue("");
  };

  const handleRemoveItem = (item) => {
    if (isArray) {
      onChange({ target: { name, value: value.filter((v) => v !== item) } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <Card className="mb-4 p-3 shadow-sm border-0">
      <label className="form-label">{label} {required && "*"}</label>
      {isArray ? (
        <>
          <div className="d-flex mb-2">
            <input
              list={options.length ? `${name}-options` : undefined}
              className={`form-control me-2 ${error ? "border-danger" : ""}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Add ${label.toLowerCase()}`}
            />
            <Button variant="secondary" onClick={handleAddItem}>Add</Button>
          </div>
          <div>
            {value.map((item) => (
              <Badge
                key={item}
                bg="primary"
                className="me-1 mb-1"
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveItem(item)}
              >
                {item} ×
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <>
          <input
            list={options.length ? `${name}-options` : undefined}
            className={`form-control ${error ? "border-danger" : ""}`}
            name={name}
            value={value || ""}
            onChange={(e) => onChange(e)}
            placeholder={`Select or type ${label.toLowerCase()}`}
          />
        </>
      )}
      {options.length > 0 && (
        <datalist id={`${name}-options`}>
          {options.map((opt) => <option key={opt} value={opt} />)}
        </datalist>
      )}
      {error && <small className="text-danger">{error}</small>}
    </Card>
  );
};

export const FileInput = ({ label, file, onChange, accept = "image/*", required }) => {
  const [error, setError] = useState("");
  useEffect(() => {
    if (required && !file) setError("This field is required");
    else setError("");
  }, [file, required]);

  return (
    <Card className="mb-4 p-3 shadow-sm border-0 text-center">
      <label className="form-label fw-bold">{label} {required && "*"}</label>
      {file && (accept.includes("image") && <img src={file} alt={label} className="img-thumbnail mb-2" style={{ maxWidth: "200px", maxHeight: "150px" }} />)}
      <input
        type="file"
        className={`form-control ${error ? "border-danger" : ""}`}
        accept={accept}
        onChange={(e) => onChange(e)}
      />
      {error && <small className="text-danger">{error}</small>}
    </Card>
  );
};

export const RadioGroup = ({ label, name, options = [], value, onChange, required }) => {
  const [error, setError] = useState("");
  useEffect(() => {
    if (required && !value) setError("This field is required");
    else setError("");
  }, [value, required]);

  return (
    <Card className="mb-4 p-3 shadow-sm border-0">
      <label className="form-label d-block">{label} {required && "*"}</label>
      {options.map((opt) => (
        <Form.Check
          inline
          key={opt}
          label={opt}
          name={name}
          type="radio"
          value={opt}
          checked={value === opt}
          onChange={(e) => onChange(e)}
        />
      ))}
      {error && <small className="text-danger d-block">{error}</small>}
    </Card>
  );
};

// ----------------- Main ProfileTab -----------------
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
}) {
  const locations = ["South B", "Westlands", "Karen", "Embakasi", "Nakuru", "Eldoret", "Kisumu"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const requiredFields = ["description", "profession", "skills", "location", "primary_service"];
    if (profileData.account_type === "Company") requiredFields.push("company_name");

    const missingFields = requiredFields.filter(
      (field) => !profileData[field] || (Array.isArray(profileData[field]) && profileData[field].length === 0)
    );

    if (missingFields.length === 0) saveProfile();
    else alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
  };

  const cardHeaderStyle = {
    background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "6px",
    marginBottom: "15px",
    fontWeight: "600",
    fontSize: "1.1rem",
  };

  return (
    <Card className="p-4 shadow-sm border-0" style={{ backgroundColor: "#f9fafd" }}>
      {craftsman?.full_name && <div style={cardHeaderStyle}>Welcome, {craftsman.full_name}!</div>}

      <RadioGroup
        label="Account Type"
        name="account_type"
        options={["Individual", "Company"]}
        value={profileData.account_type}
        onChange={handleInputChange}
        required
      />

      <Row className="mb-4">
        <Col md={4} className="text-center">
          <FileInput
            label="Profile Image"
            file={profileImage}
            onChange={handleProfileImageChange}
            accept="image/*"
            required
          />
        </Col>

        <Col md={8}>
          <Card className="p-3 shadow-sm border-0">
            <label className="form-label">Proof Document (Optional)</label>
            <input
              type="file"
              className="form-control mb-2"
              accept=".pdf,image/*"
              onChange={handleProofDocumentChange}
            />
            {proofDocument && <Badge bg="success">Uploaded: {proofDocument}</Badge>}
          </Card>
        </Col>
      </Row>

      <TextInputWithDatalist
        label="Description"
        name="description"
        value={profileData.description}
        onChange={handleInputChange}
        required
      />
      <Row>
        <Col md={6}>
          <TextInputWithDatalist
            label="Profession"
            name="profession"
            value={profileData.profession}
            onChange={handleInputChange}
            options={professionOptions}
            required
          />
        </Col>
        <Col md={6}>
          <TextInputWithDatalist
            label="Skills"
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            options={skillOptions}
            required
            isArray
          />
        </Col>
      </Row>

      <Collapse in={profileData.account_type === "Company"}>
        <div>
          <TextInputWithDatalist
            label="Company Name"
            name="company_name"
            value={profileData.company_name}
            onChange={handleInputChange}
            required={profileData.account_type === "Company"}
          />
        </div>
      </Collapse>

      <Row>
        <Col md={6}>
          <TextInputWithDatalist
            label="Location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
            options={locations}
            required
          />
        </Col>
        <Col md={6}>
          <TextInputWithDatalist
            label="Primary Service"
            name="primary_service"
            value={profileData.primary_service}
            onChange={handleInputChange}
            options={serviceOptions}
            required
          />
        </Col>
      </Row>

      <FileInput
        label="Service Image"
        file={serviceImage}
        onChange={handleServiceImageChange}
        accept="image/*"
        required
      />

      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="success" onClick={handleSave}>Save Profile</Button>
        {craftsman?.status && (
          <Badge bg={craftsman.status === "approved" ? "success" : "warning"} className="py-2 px-3">
            {craftsman.status.charAt(0).toUpperCase() + craftsman.status.slice(1)}
          </Badge>
        )}
      </div>
    </Card>
  );
}

export default ProfileTab;
