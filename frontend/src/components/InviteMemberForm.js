// components/InviteMemberForm.js
import React, { useState } from 'react';
import axios from 'axios';

// Set up base API URL from environment or default fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

// Create Axios instance with auth header from session storage
const authAxios = axios.create({ baseURL: API_BASE_URL });
authAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * InviteMemberForm component allows group admin to invite team members.
 */
const InviteMemberForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await authAxios.post('/invite-member/', formData);
      setMessage(response.data.message || 'Invitation sent successfully!');
      setFormData({ name: '', email: '', phone: '' }); // Reset form
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to send invitation.'
      );
    }
  };

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-body">
        <h5 className="mb-3">Invite Team Member</h5>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="form-control mb-2"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            className="form-control mb-2"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            className="form-control mb-2"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary w-100">
            Send Invite
          </button>
        </form>

        {/* Feedback Messages */}
        {message && <p className="text-success mt-3">{message}</p>}
        {error && <p className="text-danger mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default InviteMemberForm;
