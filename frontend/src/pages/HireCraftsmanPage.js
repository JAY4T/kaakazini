import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const HireCraftsmanPage = () => {
  const [activeTab, setActiveTab] = useState('makeRequest');
  const [showModal, setShowModal] = useState(false);
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [individualForm, setIndividualForm] = useState({
    name: '',
    phone: '',
    service: '',
    schedule: '',
    address: '',
    location: '',
    description: '',
    isUrgent: false,
    media: null,
  });

  useEffect(() => {
    const storedClient = sessionStorage.getItem('client');
    const token = sessionStorage.getItem('access_token');

    if (storedClient && token) {
      try {
        const parsedClient = JSON.parse(storedClient);
        setClient(parsedClient);
        setIndividualForm((prev) => ({
          ...prev,
          name: parsedClient.full_name || '',
          phone: parsedClient.phone || parsedClient.phone_number || '',
        }));

        fetchJobs(parsedClient.id, token);
      } catch (e) {
        console.error('Error parsing stored client:', e);
        setClient(null);
      }
    } else {
      console.warn('Missing client info or token');
      setClient(null);
    }
  }, []);

  const fetchJobs = async (clientId, token) => {
    try {
      const { data } = await axios.get(`${BASE_URL}job-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientJobs = data.filter((j) => j.client === clientId);
      setJobs(clientJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleIndividualChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setIndividualForm((prev) => ({ ...prev, [id]: checked }));
    } else if (type === 'file') {
      setIndividualForm((prev) => ({ ...prev, [id]: files[0] }));
    } else {
      setIndividualForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!client || !client.id) return alert('Client ID missing.');

    const formData = new FormData();
    formData.append('client', client.id);
    Object.entries(individualForm).forEach(([key, val]) => {
      if (val !== null && val !== '') {
        formData.append(key, key === 'schedule' ? new Date(val).toISOString() : val);
      }
    });

    try {
      const token = sessionStorage.getItem('access_token');
      await axios.post(`${BASE_URL}/job-requests/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchJobs(client.id, token);
      alert('✅ Request submitted!');
      setShowModal(true);
      setIndividualForm({
        name: client.full_name || '',
        phone: client.phone || client.phone_number || '',
        service: '',
        schedule: '',
        address: '',
        location: '',
        description: '',
        isUrgent: false,
        media: null,
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('❌ Failed to submit request.');
    }
  };

  const updateJob = async (jobId, update) => {
    try {
      const token = sessionStorage.getItem('access_token');
      await axios.patch(`${BASE_URL}job-requests/${jobId}/`, update, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs(client.id, token);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (!client) return <div className="text-center mt-5">Client not logged in. Please login to access your dashboard.</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-3 col-lg-2 bg-dark text-white vh-100 p-3">
          <h4>Kaakazini Client Dashboard</h4>
          <p className="mt-3">Hi, <strong>{client.full_name}</strong> 👋</p>
          <ul className="nav flex-column mt-4">
            <li className="nav-item mb-2">
              <button className={`btn w-100 ${activeTab === 'profile' ? 'btn-success' : 'btn-outline-light'}`} onClick={() => setActiveTab('profile')}>My Profile</button>
            </li>
            <li className="nav-item mb-2">
              <button className={`btn w-100 ${activeTab === 'makeRequest' ? 'btn-success' : 'btn-outline-light'}`} onClick={() => setActiveTab('makeRequest')}>Make Request</button>
            </li>
            <li className="nav-item mb-2">
              <button className={`btn w-100 ${activeTab === 'myRequests' ? 'btn-success' : 'btn-outline-light'}`} onClick={() => setActiveTab('myRequests')}>My Requests</button>
            </li>
          </ul>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mt-4">
          <h2 className="mb-4">{activeTab === 'profile' ? 'Profile' : activeTab === 'makeRequest' ? 'New Request' : 'Your Requests'}</h2>

          {activeTab === 'profile' && (
            <div className="card p-4">
              <p><strong>Name:</strong> {client.full_name}</p>
              <p><strong>Phone:</strong> {client.phone_number || client.phone}</p>
              <p><strong>Email:</strong> {client.email}</p>
            </div>
          )}

          {activeTab === 'makeRequest' && (
            <div className="card shadow p-4">
              <form onSubmit={handleIndividualSubmit} encType="multipart/form-data">
                <div className="row mb-3">
                  <div className="col">
                    <input type="text" id="name" value={individualForm.name} onChange={handleIndividualChange} className="form-control" placeholder="Your Name" required />
                  </div>
                  <div className="col">
                    <input type="tel" id="phone" value={individualForm.phone} onChange={handleIndividualChange} className="form-control" placeholder="Phone Number" required />
                  </div>
                </div>
                <div className="mb-3">
                  <select id="service" value={individualForm.service} onChange={handleIndividualChange} className="form-select" required>
                    <option value="">-- Select Service --</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Masonry">Masonry</option>
                    <option value="Tiling">Tiling</option>
                    <option value="Roofing">Roofing</option>
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <input type="datetime-local" id="schedule" value={individualForm.schedule} onChange={handleIndividualChange} className="form-control" required />
                  </div>
                  <div className="col">
                    <input type="text" id="address" value={individualForm.address} onChange={handleIndividualChange} className="form-control" placeholder="Address" required />
                  </div>
                </div>
                <div className="mb-3">
                  <select id="location" value={individualForm.location} onChange={handleIndividualChange} className="form-select" required>
                    <option value="">-- Select Location --</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="eldoret">Eldoret</option>
                    <option value="nakuru">Nakuru</option>
                    <option value="thika">Thika</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea id="description" value={individualForm.description} onChange={handleIndividualChange} className="form-control" rows="3" placeholder="Job Description" required />
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="isUrgent" checked={individualForm.isUrgent} onChange={handleIndividualChange} />
                  <label className="form-check-label" htmlFor="isUrgent">Mark as urgent</label>
                </div>
                <div className="mb-3">
                  <input type="file" className="form-control" id="media" accept="image/*" onChange={handleIndividualChange} />
                </div>
                <button type="submit" className="btn btn-success">Submit Request</button>
              </form>
            </div>
          )}

          {activeTab === 'myRequests' && (
            <div className="card p-4">
              <h4>Your Requests</h4>
              {jobs.length === 0 ? (
                <p className="text-muted">No service requests submitted yet.</p>
              ) : (
                <table className="table table-striped table-hover mt-3">
                  <thead>
                    <tr>
                      <th>Requested By</th>
                      <th>Service</th>
                      <th>Schedule</th>
                      <th>Status</th>
                      <th>Actions</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id}>
                        <td>{job.name}</td>
                        <td>{job.service}</td>
                        <td>{new Date(job.schedule).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${job.status === 'Completed' ? 'bg-success' : job.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>{job.status}</span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success me-2" onClick={() => updateJob(job.id, { status: 'Completed' })}>Mark as Completed</button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateJob(job.id, { status: 'Cancelled' })}>Cancel</button>
                        </td>
                        <td>
                          {job.status === 'Completed' ? (
                            <textarea rows="2" placeholder="Leave a comment or review" className="form-control" defaultValue={job.review} onBlur={(e) => updateJob(job.id, { review: e.target.value })} />
                          ) : (
                            <span className="text-muted">Complete job to review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HireCraftsmanPage;
