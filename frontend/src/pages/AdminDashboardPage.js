import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from "../api/axiosClient"; // ✅ cookie-based axios

import CraftsmenTable from '../components/CraftsmenTable';
import JobRequests from '../components/JobRequests';
import PaymentDashboard from '../components/AdminPaymentDashboard';
import RejectModal from '../components/RejectModal';

function isCraftsmanApproved(c) {
  return c?.is_approved === true;
}

export default function AdminDashboard() {
  const [pendingCraftsmen, setPendingCraftsmen] = useState([]);
  const [approvedCraftsmen, setApprovedCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingFilter, setPendingFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [activeSection, setActiveSection] = useState('pending');

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  const [selectedCraftsmen, setSelectedCraftsmen] = useState({});

  const checkCraftsmanApprovalCriteria = c => {
    const errs = [];
    if (!c.full_name?.trim()) errs.push('Full name missing.');
    if (!c.profile) errs.push('Profile image missing.');
    if (!c.profession?.trim()) errs.push('Profession missing.');
    if (!c.description?.trim()) errs.push('Description missing.');
    if (!c.primary_service?.trim()) errs.push('Primary service missing.');

    const hasServiceImage = c.services?.[0]?.image || c.service_images?.[0] || c.service_image;
    if (!hasServiceImage) errs.push('Service image missing.');
    return errs;
  };

  // ----------------------------
  // Fetch Craftsmen
  // ----------------------------
  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const res = await api.get('admin/craftsman/');
      const allCraftsmen = Array.isArray(res.data) ? res.data : [];
      setApprovedCraftsmen(allCraftsmen.filter(isCraftsmanApproved));
      setPendingCraftsmen(allCraftsmen.filter(c => !isCraftsmanApproved(c)));
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load craftsmen data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCraftsmen(); }, []);

  const getImageUrl = (path) => (path?.startsWith('http') ? path : `${path}`);

  const colorText = (text, color) => <span style={{ color }}>{text}</span>;

  // ----------------------------
  // Approve / Reject Craftsman
  // ----------------------------
  const handleAction = async (type, id, model, craftsman = null, reason = null) => {
    if (model === 'craftsman' && type === 'approve') {
      const errors = checkCraftsmanApprovalCriteria(craftsman);
      if (errors.length) { alert('Cannot approve:\n' + errors.join('\n')); return; }
    }
    try {
      await api.post(`admin/${model}/${id}/${type}/`, reason ? { reason } : {});
      await fetchCraftsmen();
      alert(type === 'approve' ? '✅ Craftsman approved successfully!' : '❌ Craftsman rejected successfully');
    } catch (err) {
      console.error(`${type} failed:`, err);
      alert(`Action failed: ${type}`);
    }
  };

  const openRejectModal = craftsman => {
    setRejectTarget({ id: craftsman.id, model: 'craftsman' });
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
    await handleAction('reject', rejectTarget.id, rejectTarget.model, null, rejectReason);
    setShowRejectModal(false);
  };

  // ----------------------------
  // Jobs
  // ----------------------------
  const fetchAllJobs = async () => {
    setJobsLoading(true);
    try {
      const { data } = await api.get(`/job-requests/`);
      setJobs(data);
    } catch (err) { console.error('Error fetching jobs:', err); }
    finally { setJobsLoading(false); }
  };

  const assignCraftsman = async jobId => {
    const craftsmanId = selectedCraftsmen[jobId];
    if (!craftsmanId) { alert('Please select a craftsman first.'); return; }
    try {
      await api.patch(`/job-requests/${jobId}/assign/`, { craftsman_id: craftsmanId });
      alert('✅ Craftsman assigned successfully!');
      fetchAllJobs();
    } catch (err) { console.error('Error assigning craftsman:', err); alert('❌ Failed to assign craftsman'); }
  };

  useEffect(() => { 
    if (activeSection === 'jobs' || activeSection === 'payments') fetchAllJobs(); 
  }, [activeSection]);

  const jobsReadyForPayment = jobs.filter(j => j.status === 'Completed');

  const processPayment = async jobId => {
    try {
      await api.post(`/job-requests/${jobId}/pay/`);
      alert('✅ Payment initiated via MPesa. Status updated to "Paid — Awaiting Confirmation".');
      fetchAllJobs();
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Failed to process payment');
    }
  };

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px' }}>
        <h4 className="mb-4">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeSection === 'pending' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('pending')}>Pending Craftsmen</button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeSection === 'approved' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('approved')}>Approved Craftsmen</button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeSection === 'jobs' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('jobs')}>Job Requests</button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeSection === 'payments' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setActiveSection('payments')}>
              Payments {jobsReadyForPayment.length > 0 && <span className="badge bg-danger ms-2">{jobsReadyForPayment.length}</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light">
        {loading && <div>Loading...</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && !error && (
          <>
            {activeSection === 'pending' && <CraftsmenTable
              list={pendingCraftsmen}
              filterValue={pendingFilter}
              setFilterValue={setPendingFilter}
              isPending
              getImageUrl={getImageUrl}
              colorText={colorText}
              checkCraftsmanApprovalCriteria={checkCraftsmanApprovalCriteria}
              isCraftsmanApproved={isCraftsmanApproved}
              handleAction={handleAction}
              openRejectModal={openRejectModal}
            />}
            {activeSection === 'approved' && <CraftsmenTable
              list={approvedCraftsmen}
              filterValue={approvedFilter}
              setFilterValue={setApprovedFilter}
              isPending={false}
              getImageUrl={getImageUrl}
              colorText={colorText}
              checkCraftsmanApprovalCriteria={checkCraftsmanApprovalCriteria}
              isCraftsmanApproved={isCraftsmanApproved}
              handleAction={handleAction}
              openRejectModal={openRejectModal}
            />}
            {activeSection === 'jobs' && <JobRequests
              jobs={jobs}
              jobsLoading={jobsLoading}
              approvedCraftsmen={approvedCraftsmen}
              selectedCraftsmen={selectedCraftsmen}
              setSelectedCraftsmen={setSelectedCraftsmen}
              assignCraftsman={assignCraftsman}
            />}
            {activeSection === 'payments' && <PaymentDashboard jobsReadyForPayment={jobsReadyForPayment} processPayment={processPayment} />}
          </>
        )}
      </div>

      <RejectModal
        show={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmReject={confirmReject}
        closeModal={() => setShowRejectModal(false)}
      />
    </div>
  );
}
