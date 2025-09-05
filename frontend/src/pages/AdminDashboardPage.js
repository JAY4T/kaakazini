import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

const authAxios = axios.create({ baseURL: API_BASE_URL });
authAxios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- helpers ----------
function truthyApproved(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'approved' || v === 'yes';
  }
  return false;
}
function isCraftsmanApproved(c) {
  return truthyApproved(c?.is_approved) || truthyApproved(c?.approved) || truthyApproved(c?.status) || truthyApproved(c?.state);
}

function AdminDashboard() {
  const [pendingCraftsmen, setPendingCraftsmen] = useState([]);
  const [approvedCraftsmen, setApprovedCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingFilter, setPendingFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [activeSection, setActiveSection] = useState('pending');

  // jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    fetchCraftsmen();
  }, []);

  const checkCraftsmanApprovalCriteria = (c) => {
    const errs = [];
    if (!c.full_name?.trim()) errs.push('Full name missing.');
    if (!c.profile) errs.push('Profile image missing.');
    if (!c.profession?.trim()) errs.push('Profession missing.');
    if (!c.description?.trim()) errs.push('Description missing.');
    if (!c.primary_service?.trim()) errs.push('Primary service missing.');
    const hasServiceImage = c.services?.[0]?.image || c.service_image;
    if (!hasServiceImage) errs.push('Service image missing.');
    return errs;
  };

  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const res = await authAxios.get('admin/craftsman/');
      const all = Array.isArray(res.data) ? res.data : [];
      const pending = all.filter(c => {
        const approved = isCraftsmanApproved(c);
        const hasErrors = checkCraftsmanApprovalCriteria(c).length > 0;
        return !approved || hasErrors;
      });
      const approved = all.filter(c => isCraftsmanApproved(c));
      setPendingCraftsmen(pending);
      setApprovedCraftsmen(approved);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  };

  const handleAction = async (type, id, model, craftsman = null, reason = null) => {
    if (model === 'craftsman' && type === 'approve') {
      const errors = checkCraftsmanApprovalCriteria(craftsman);
      if (errors.length) {
        alert('Cannot approve:\n' + errors.join('\n'));
        return;
      }
    }
    try {
      await authAxios.post(`admin/${model}/${id}/${type}/`, reason ? { reason } : {});
      fetchCraftsmen();
      if (type === 'reject') {
        alert('Craftsman rejected successfully ✅');
      }
    } catch (err) {
      console.error(`${type} failed:`, err);
      alert(`Action failed: ${type}`);
    }
  };

  const openRejectModal = (craftsman) => {
    setRejectTarget({ id: craftsman.id, model: 'craftsman' });
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    await handleAction('reject', rejectTarget.id, rejectTarget.model, null, rejectReason);
    setShowRejectModal(false);
  };

  const colorText = (text, color) => <span style={{ color }}>{text}</span>;

  const renderCraftsmenTable = (list, filterValue, setFilterValue, isPending = false) => {
    const q = (filterValue || '').toLowerCase();
    const filtered = list.filter(c => ((c.full_name || '').toLowerCase()).includes(q));
    return (
      <>
        <div className="d-flex justify-content-between mb-3">
          <h4>{isPending ? 'Pending Craftsmen' : 'Approved Craftsmen'}</h4>
          <input
            type="text"
            className="form-control form-control-sm w-25"
            placeholder="Search..."
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
          />
        </div>
        <table className="table table-bordered table-hover bg-white">
          <thead className="table-primary">
            <tr>
              <th>Profile</th>
              <th>Full Name</th>
              <th>Profession</th>
              <th>Description</th>
              <th>Service</th>
              <th>Service Image</th>
              <th>Status / Issues</th>
              {isPending && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(c => {
              const errors = checkCraftsmanApprovalCriteria(c);
              const mainService = c.services?.[0] || { name: c.primary_service, image: c.service_image };
              const approved = isCraftsmanApproved(c);
              return (
                <tr key={c.id} className="align-middle">
                  <td>{c.profile ? <img src={getImageUrl(c.profile)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover' }} className="rounded" /> : colorText('No image', 'red')}</td>
                  <td>{c.full_name || colorText('No name', 'orange')}</td>
                  <td>{c.profession || colorText('No profession', 'purple')}</td>
                  <td>{c.description || colorText('No description', 'brown')}</td>
                  <td>{mainService?.name || colorText('No service', 'blue')}</td>
                  <td>{mainService?.image ? <img src={getImageUrl(mainService.image)} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover' }} className="rounded" /> : colorText('No image', 'red')}</td>
                  <td>{errors.length ? colorText(errors.join(', '), 'red') : approved ? colorText('Approved', 'green') : colorText('Pending', 'gray')}</td>
                  {isPending && (
                    <td>
                      <button className="btn btn-success btn-sm me-2" disabled={errors.length > 0} onClick={() => handleAction('approve', c.id, 'craftsman', c)}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openRejectModal(c)}>Reject</button>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={isPending ? 8 : 7} className="text-center text-muted">
                  {isPending ? 'No pending craftsmen' : 'No approved craftsmen'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    );
  };

  // ------------------- JOB REQUESTS + REVIEWS -------------------
  const fetchAllJobs = async () => {
    setJobsLoading(true);
    try {
      const { data } = await authAxios.get(`/job-requests/`);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching all jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const approveReview = async (jobId) => {
    try {
      await authAxios.patch(`/job-requests/${jobId}/`, { review_approved: true });
      fetchAllJobs();
      alert('✅ Review approved');
    } catch (err) {
      console.error('Approve review failed:', err);
      alert('❌ Failed to approve review');
    }
  };

  const rejectReview = async (jobId) => {
    try {
      await authAxios.patch(`/job-requests/${jobId}/`, { review_approved: false });
      fetchAllJobs();
      alert('❌ Review rejected');
    } catch (err) {
      console.error('Reject review failed:', err);
      alert('❌ Failed to reject review');
    }
  };

  const renderJobRequests = () => (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4>All Service Requests</h4>
      {jobsLoading ? (
        <div className="text-center mt-4">Loading requests...</div>
      ) : (
        <table className="table table-striped table-hover mt-3">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.name}</td>
                <td>{job.service}</td>
                <td>{new Date(job.schedule).toLocaleString()}</td>
                <td><span className={`badge ${job.status === 'Completed' ? 'bg-success' : job.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>{job.status}</span></td>
                <td>{job.review || <span className="text-muted">No review</span>}</td>
                <td>{job.rating ? `${job.rating} ⭐` : <span className="text-muted">No rating</span>}</td>
                <td>
                  <button className="btn btn-sm btn-success me-2" onClick={() => approveReview(job.id)}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => rejectReview(job.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  useEffect(() => {
    if (activeSection === 'jobs') {
      fetchAllJobs();
    }
  }, [activeSection]);

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px' }}>
        <h4 className="mb-4">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><button className={`btn w-100 text-start ${activeSection === 'pending' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('pending')}>Pending Craftsmen</button></li>
          <li className="nav-item mb-2"><button className={`btn w-100 text-start ${activeSection === 'approved' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('approved')}>Approved Craftsmen</button></li>
          <li className="nav-item mb-2"><button className={`btn w-100 text-start ${activeSection === 'jobs' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('jobs')}>Job Requests & Reviews</button></li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-4 bg-light">
        {loading && <div>Loading...</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && !error && (
          <>
            {activeSection === 'pending' && renderCraftsmenTable(pendingCraftsmen, pendingFilter, setPendingFilter, true)}
            {activeSection === 'approved' && renderCraftsmenTable(approvedCraftsmen, approvedFilter, setApprovedFilter, false)}
            {activeSection === 'jobs' && renderJobRequests()}
          </>
        )}
      </div>

      {/* Reject Modal (craftsman only) */}
      {showRejectModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Craftsman</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <label>Reason for rejection:</label>
                <textarea className="form-control mt-2" rows="4" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmReject}>Confirm Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;
