import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

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
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }

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
        alert('Error fetching profile data. Please try again.');
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

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!craftsman || Object.keys(craftsman).length === 0)
    return <p className="text-center text-danger mt-5">Error loading craftsman data. Please try again.</p>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hello, {craftsman.full_name || 'Craftsman'}</h2>
        <button className="btn btn-danger" onClick={() => {
          sessionStorage.clear();
          window.location.href = '/login';
        }}>
          Logout
        </button>
      </div>

      <div className="card p-3 mb-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={profileImage || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="rounded-circle me-3"
            width="100"
            height="100"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100'; }}
          />
          {isEditingProfile && (
            <label className="btn btn-outline-primary btn-sm me-2">
              Change Profile Photo
              <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
            </label>
          )}
        </div>

        <textarea
          className="form-control mb-2"
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isEditingProfile}
        />

        {!isEditingProfile ? (
          <button className="btn btn-primary mt-3" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        ) : (
          <>
            <button className="btn btn-success mt-3 me-2" onClick={saveProfile}>Save</button>
            <button
              className="btn btn-secondary mt-3"
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
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
