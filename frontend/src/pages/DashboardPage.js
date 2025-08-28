import React, { useState, useEffect } from 'react';
import InviteMemberForm from '../components/InviteMemberForm';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const authAxios = axios.create({ baseURL: API_BASE_URL });

authAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getFullImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

const InviteTeam = () => {
  const inviteLink = 'https://kaakazini.com/invite/team';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-body">
        <h5 className="mb-3">Invite Team Members</h5>
        <p className="text-muted">Share this link with your team members so they can join your workspace:</p>
        <div className="input-group">
          <input type="text" className="form-control" value={inviteLink} readOnly />
          <button className="btn btn-success" onClick={copyToClipboard}>Copy Link</button>
        </div>
      </div>
    </div>
  );
};

function DashboardPage() {
  const [craftsman, setCraftsman] = useState({});
  const [description, setDescription] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [serviceImage, setServiceImage] = useState(null);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const serviceOptions = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Roofing',
    'Welding', 'Tiling', 'Interior Design', 'Landscaping', 'Masonry',
    'AC Repair', 'Woodwork', 'Auto Repair',
  ];

  useEffect(() => {
    async function fetchCraftsman() {
      try {
        const res = await authAxios.get('/craftsman/');
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        setCraftsman(data);
        setDescription(data.description || '');
        setProfession(data.profession || '');
        setLocation(data.location || '');
        setCompanyName(data.company_name || '');
        setSkills(data.skills || '');
        setSelectedService(data.primary_service || '');
        setProfileImage(getFullImageUrl(data.profile));
        setServiceImage(getFullImageUrl(data.service_image));
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Error fetching profile data');
      } finally {
        setLoading(false);
      }
    }

    fetchCraftsman();
  }, []);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleServiceImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setServiceImageFile(file);
    setServiceImage(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    // Validation
    if (!description.trim()) return alert("Description cannot be blank.");
    if (!profession.trim()) return alert("Profession is required.");
    if (!skills.trim()) return alert("Skill is required.");
    if (!companyName.trim()) return alert("Company name is required.");
    if (!location.trim()) return alert("Location is required.");
    if (!selectedService.trim()) return alert("Service selection is required.");

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('profession', profession);
      formData.append('location', location);
      formData.append('company_name', companyName);
      formData.append('skills', skills);
      formData.append('primary_service', selectedService);
      if (profileImageFile) formData.append('profile', profileImageFile);
      if (serviceImageFile) formData.append('service_image', serviceImageFile);

      const res = await authAxios.patch('/craftsman/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data;
      setCraftsman(updated);
      setDescription(updated.description || '');
      setProfession(updated.profession || '');
      setLocation(updated.location || '');
      setCompanyName(updated.company_name || '');
      setSkills(updated.skills || '');
      setSelectedService(updated.primary_service || '');
      setProfileImage(getFullImageUrl(updated.profile));
      setServiceImage(getFullImageUrl(updated.service_image));

      setProfileImageFile(null);
      setServiceImageFile(null);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(
        error?.response?.data?.detail ||
        JSON.stringify(error?.response?.data) ||
        'Failed to update craftsman profile.'
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!craftsman || Object.keys(craftsman).length === 0)
    return <p>Error loading craftsman data. Please try again.</p>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          Welcome, {craftsman.full_name || 'Craftsman'} — your team is now onboard!
        </h2>
        <button className="btn btn-outline-danger" onClick={() => {
          sessionStorage.clear();
          window.location.reload();
        }}>
          Logout
        </button>
      </div>

      <div className="card p-4 shadow-sm border-0 mb-5">
        <div className="d-flex align-items-center mb-4">
          <img
            src={profileImage || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="rounded-circle me-3 border"
            width="100"
            height="100"
            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
          />
          {isEditingProfile && (
            <label className="btn btn-outline-primary btn-sm">
              Upload company photo
              <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
            </label>
          )}
        </div>

        <textarea
          className="form-control mb-3"
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isEditingProfile}
          placeholder="Short bio about your company craftsmanship, expertise, and what you offer."
        />

        <div className="row">
          <div className="col-md-6 mb-3">
            <select className="form-select" value={profession} onChange={(e) => setProfession(e.target.value)} disabled={!isEditingProfile}>
              <option value="">Select Company Profession</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Welder">Welder</option>
              <option value="Painter">Painter</option>
              <option value="Mechanic">Mechanic</option>
              <option value="WoodMaker">WoodMaker</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <select className="form-select" value={skills} onChange={(e) => setSkills(e.target.value)} disabled={!isEditingProfile}>
              <option value="">Select Skill</option>
              <option value="Wiring">Wiring</option>
              <option value="Pipe Fitting">Pipe Fitting</option>
              <option value="Roofing">Roofing</option>
              <option value="Furniture Making">Furniture Making</option>
              <option value="Auto Repair">Auto Repair</option>
            </select>
          </div>
        </div>

        <input className="form-control mb-3" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditingProfile} />

        <label className="form-label">Location</label>
        <select className="form-select mb-3" value={location} onChange={(e) => setLocation(e.target.value)} disabled={!isEditingProfile}>
          <option value="">Select Specific Location</option>
          <optgroup label="Nairobi">
            <option value="Nairobi,South B">South B</option>
            <option value="Nairobi,South C">South C</option>
            <option value="Nairobi,Westlands">Westlands</option>
            <option value="Nairobi,Karen">Karen</option>
            <option value="Nairobi,Roysambu">Roysambu</option>
            <option value="Nairobi,Ruaka">Ruaka</option>
            <option value="Nairobi,Kibera">Kibera</option>
            <option value="Nairobi,Langata">Langata</option>
            <option value="Nairobi,Embakasi">Embakasi</option>
          </optgroup>
          <optgroup label="Mombasa">
            <option value="Mombasa,Nyali">Nyali</option>
            <option value="Mombasa,Likoni">Likoni</option>
            <option value="Mombasa,Changamwe">Changamwe</option>
            <option value="Mombasa,Kisauni">Kisauni</option>
          </optgroup>
          <optgroup label="Kisumu">
            <option value="Kisumu,Milimani">Milimani</option>
            <option value="Kisumu,Manyatta">Manyatta</option>
            <option value="Kisumu,Nyalenda">Nyalenda</option>
          </optgroup>
          <optgroup label="Others">
            <option value="Nakuru">Nakuru</option>
            <option value="Eldoret">Eldoret</option>
            <option value="Thika">Thika</option>
            <option value="Machakos">Machakos</option>
            <option value="Nyeri">Nyeri</option>
          </optgroup>
        </select>

        <select className="form-select mb-3" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} disabled={!isEditingProfile}>
          <option value="">Select Service</option>
          {serviceOptions.map((service, idx) => (
            <option key={idx} value={service}>{service}</option>
          ))}
        </select>

        {serviceImage && (
          <img
            src={serviceImage}
            alt="Service"
            className="img-thumbnail mb-2"
            style={{ width: '150px', height: '100px', objectFit: 'cover' }}
          />
        )}

        {isEditingProfile && (
          <label className="btn btn-outline-secondary btn-sm mb-3">
            Upload Service Image
            <input type="file" hidden accept="image/*" onChange={handleServiceImageChange} />
          </label>
        )}

        <p className="text-muted"><strong>Status:</strong> {craftsman.status || 'N/A'}</p>

        {!isEditingProfile ? (
          <button className="btn btn-primary mt-3" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        ) : (
          <div className="mt-3">
            <button className="btn btn-success me-2" onClick={saveProfile}>Save</button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setIsEditingProfile(false);
                setDescription(craftsman.description || '');
                setProfession(craftsman.profession || '');
                setSkills(craftsman.skills || '');
                setCompanyName(craftsman.company_name || '');
                setLocation(craftsman.location || '');
                setSelectedService(craftsman.primary_service || '');
                setProfileImage(getFullImageUrl(craftsman.profile));
                setServiceImage(getFullImageUrl(craftsman.service_image));
                setProfileImageFile(null);
                setServiceImageFile(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
<div className="dashboard-section">
  {/* Other dashboard content here */}
  <InviteMemberForm />
</div>
    </div>
  );
}

export default DashboardPage;