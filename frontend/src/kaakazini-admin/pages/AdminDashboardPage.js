import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaBell, FaUserCircle, FaHome, FaClipboardList, FaDollarSign, FaCheckCircle, 
  FaUsers, FaChartLine, FaFileAlt, FaLifeRing, FaCog, FaQuestionCircle, 
  FaEdit, FaToggleOn, FaToggleOff, FaSignOutAlt, FaChevronDown 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import api from "../../api/axiosClient";
import '../../AdminDashboard.css';

import CraftsmenTable from '../components/CraftsmenTable';
import JobRequests from '../components/JobRequests';
import PaymentDashboard from '../components/AdminPaymentDashboard';
import RejectModal from '../components/RejectModal';
import { getFullImageUrl } from "../../utils/getFullImageUrl";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [pendingCraftsmen, setPendingCraftsmen] = useState([]);
  const [approvedCraftsmen, setApprovedCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingFilter, setPendingFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [activeSection, setActiveSection] = useState('craftsmen');
  const [craftsmenSubsection, setCraftsmenSubsection] = useState('pending');

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  const [selectedCraftsmen, setSelectedCraftsmen] = useState({});
  const [editingCraftsman, setEditingCraftsman] = useState(null);
  const [editForm, setEditForm] = useState({});

  // New state for profile and UI
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Handle responsive sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth < 992) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function isCraftsmanApproved(c) { return c?.is_approved === true; }

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

  const fetchAdminProfile = async () => {
    try {
      const res = await api.get('admin/profile/');
      if (res.data) {
        setAdminName(res.data.full_name || res.data.name || 'Admin User');
        setAdminEmail(res.data.email || 'admin@kaakazini.com');
      }
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
      setAdminName('Admin User');
      setAdminEmail('admin@kaakazini.com');
    }
  };

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

  useEffect(() => { 
    fetchCraftsmen();
    fetchAdminProfile();
  }, []);

  const getImageUrlSafe = (path) => getFullImageUrl(path);
  const colorText = (text, color) => <span style={{ color }}>{text}</span>;

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

  const toggleActiveStatus = async (craftsman) => {
    try {
      await api.patch(`admin/craftsman/${craftsman.id}/toggle-active/`);
      alert(`✅ Craftsman is now ${craftsman.is_active ? 'Inactive' : 'Active'}`);
      fetchCraftsmen();
    } catch (err) {
      console.error('Toggle active failed:', err);
      alert('❌ Failed to update status');
    }
  };

  const openEditModal = (craftsman) => {
    setEditingCraftsman(craftsman);
    setEditForm({
      full_name: craftsman.full_name || '',
      profession: craftsman.profession || '',
      description: craftsman.description || '',
      primary_service: craftsman.primary_service || '',
    });
  };

  const saveEdit = async () => {
    if (!editingCraftsman) return;
    try {
      await api.patch(`admin/craftsman/${editingCraftsman.id}/`, editForm);
      alert('✅ Craftsman details updated!');
      setEditingCraftsman(null);
      fetchCraftsmen();
    } catch (err) {
      console.error('Edit failed:', err);
      alert('❌ Failed to save changes');
    }
  };

  const fetchAllJobs = async () => {
    setJobsLoading(true);
    try {
      const { data } = await api.get(`/job-requests/`);
      setJobs(data);
    } catch (err) { console.error('Error fetching jobs:', err); }
    finally { setJobsLoading(false); }
  };

  useEffect(() => { if (['jobs','payments'].includes(activeSection)) fetchAllJobs(); }, [activeSection]);

  const jobsReadyForPayment = jobs.filter(j => j.status === 'Completed');

  const processPayment = async jobId => {
    try {
      await api.post(`/job-requests/${jobId}/pay/`);
      alert('✅ Payment initiated via MPesa.');
      fetchAllJobs();
    } catch (err) { console.error('Payment error:', err); alert('❌ Failed to process payment'); }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();
      navigate('/admin/login');
    }
  };

  // Stats for dashboard
  const stats = [
    { 
      label: 'Pending Approvals', 
      value: pendingCraftsmen.length, 
      icon: FaClipboardList, 
      color: 'warning',
      bgColor: '#fff3cd'
    },
    { 
      label: 'Active Craftsmen', 
      value: approvedCraftsmen.filter(c => c.is_active).length, 
      icon: FaCheckCircle, 
      color: 'success',
      bgColor: '#d1e7dd'
    },
    { 
      label: 'Total Jobs', 
      value: jobs.length, 
      icon: FaClipboardList, 
      color: 'info',
      bgColor: '#cff4fc'
    },
    { 
      label: 'Pending Payments', 
      value: jobsReadyForPayment.length, 
      icon: FaDollarSign, 
      color: 'danger',
      bgColor: '#f8d7da'
    }
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <div 
        className="bg-dark text-white d-flex flex-column shadow-lg position-relative"
        style={{ 
          width: sidebarCollapsed ? '80px' : '260px',
          transition: 'width 0.3s ease'
        }}
      >
        {/* Logo Section */}
        <div className="p-3 border-bottom text-center" style={{ backgroundColor: '#1a1a2e' }}>
          <h4 className="mb-1 fw-bold text-primary">
            {!sidebarCollapsed && 'Kaakazini'}
            {sidebarCollapsed && 'K'}
          </h4>
          {!sidebarCollapsed && <small className="text-muted">Admin Panel</small>}
        </div>

        {/* Navigation */}
        <ul className="nav flex-column mt-3 flex-grow-1" style={{ overflowY: 'auto' }}>
          {/* Dashboard */}
          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='dashboard' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('dashboard')}
              style={{ 
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <FaHome className={sidebarCollapsed ? '' : 'me-2'} size={18}/>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
          </li>

          {/* Craftsmen Section */}
          <li className="nav-item mb-2">
            {!sidebarCollapsed && (
              <div className="fw-bold ps-3 text-white-50 mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                CRAFTSMEN
              </div>
            )}
            <ul className="nav flex-column px-2">
              <li className="nav-item mb-2">
                <button 
                  className={`btn w-100 text-start d-flex align-items-center justify-content-between ${
                    activeSection==='craftsmen' && craftsmenSubsection==='pending' ? 'btn-primary shadow-sm' : 'btn-outline-light'
                  }`} 
                  onClick={()=>{ setActiveSection('craftsmen'); setCraftsmenSubsection('pending'); }}
                  style={{ borderRadius: '8px' }}
                >
                  <div className="d-flex align-items-center">
                    <FaClipboardList className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
                    {!sidebarCollapsed && <span>Pending</span>}
                  </div>
                  {pendingCraftsmen.length > 0 && (
                    <span className="badge bg-danger rounded-pill">{pendingCraftsmen.length}</span>
                  )}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`btn w-100 text-start d-flex align-items-center ${
                    activeSection==='craftsmen' && craftsmenSubsection==='approved' ? 'btn-primary shadow-sm' : 'btn-outline-light'
                  }`} 
                  onClick={()=>{ setActiveSection('craftsmen'); setCraftsmenSubsection('approved'); }}
                  style={{ borderRadius: '8px' }}
                >
                  <FaCheckCircle className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
                  {!sidebarCollapsed && <span>Active</span>}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`btn w-100 text-start d-flex align-items-center ${
                    activeSection==='craftsmen' && craftsmenSubsection==='inactive' ? 'btn-primary shadow-sm' : 'btn-outline-light'
                  }`} 
                  onClick={()=>{ setActiveSection('craftsmen'); setCraftsmenSubsection('inactive'); }}
                  style={{ borderRadius: '8px' }}
                >
                  <FaToggleOff className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
                  {!sidebarCollapsed && <span>Inactive</span>}
                </button>
              </li>
            </ul>
          </li>

          {/* Other Navigation Items */}
          {!sidebarCollapsed && (
            <li className="nav-item mb-2">
              <div className="fw-bold ps-3 text-white-50 mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                MANAGEMENT
              </div>
            </li>
          )}
          
          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='jobs' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('jobs')}
              style={{ borderRadius: '8px' }}
            >
              <FaClipboardList className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
              {!sidebarCollapsed && <span>Jobs</span>}
            </button>
          </li>

          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center justify-content-between ${
                activeSection==='payments' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('payments')}
              style={{ borderRadius: '8px' }}
            >
              <div className="d-flex align-items-center">
                <FaDollarSign className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
                {!sidebarCollapsed && <span>Payments</span>}
              </div>
              {jobsReadyForPayment.length > 0 && (
                <span className="badge bg-danger rounded-pill">{jobsReadyForPayment.length}</span>
              )}
            </button>
          </li>

          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='reports' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('reports')}
              style={{ borderRadius: '8px' }}
            >
              <FaFileAlt className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
              {!sidebarCollapsed && <span>Reports</span>}
            </button>
          </li>

          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='analytics' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('analytics')}
              style={{ borderRadius: '8px' }}
            >
              <FaChartLine className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>
          </li>

          {!sidebarCollapsed && (
            <li className="nav-item mb-2 mt-3">
              <div className="fw-bold ps-3 text-white-50 mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                SYSTEM
              </div>
            </li>
          )}

          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='support' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('support')}
              style={{ borderRadius: '8px' }}
            >
              <FaLifeRing className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
              {!sidebarCollapsed && <span>Support</span>}
            </button>
          </li>

          <li className="nav-item mb-2 px-2">
            <button 
              className={`btn w-100 text-start d-flex align-items-center ${
                activeSection==='settings' ? 'btn-primary shadow-sm' : 'btn-outline-light'
              }`} 
              onClick={()=>setActiveSection('settings')}
              style={{ borderRadius: '8px' }}
            >
              <FaCog className={sidebarCollapsed ? '' : 'me-2'} size={16}/>
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </li>
        </ul>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="mt-auto p-3 border-top" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="ms-2 flex-grow-1">
                <div className="fw-bold small">{adminName}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{adminEmail}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navigation Bar - Compact */}
        <nav className="navbar navbar-expand navbar-light bg-white shadow-sm px-3 py-1" style={{ minHeight: '50px' }}>
          <div className="container-fluid">
            {/* Welcome Message */}
            <div className="d-flex align-items-center">
              <h6 className="mb-0 fw-bold">
                <span className="text-muted d-none d-lg-inline" style={{ fontSize: '0.9rem' }}>Welcome back, </span>
                <span className="text-primary">{adminName || 'Admin'}</span>
              </h6>
            </div>

            {/* Right side icons and profile */}
            <div className="d-flex align-items-center ms-auto gap-2">
              {/* Notifications */}
              <div className="position-relative" style={{ cursor: 'pointer' }}>
                <div className="p-2 rounded-circle bg-light d-flex align-items-center justify-content-center hover-lift"
                     style={{ width: '36px', height: '36px' }}>
                  <FaBell size={16} className="text-secondary"/>
                </div>
                {jobsReadyForPayment.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                    {jobsReadyForPayment.length}
                  </span>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="position-relative">
                <div 
                  className="d-flex align-items-center p-1 px-2 rounded bg-light hover-lift" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '32px', height: '32px', fontSize: '14px', color: 'white' }}>
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <div className="me-1 d-none d-lg-block">
                    <div className="fw-bold" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{adminName}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Administrator</div>
                  </div>
                  <FaChevronDown size={10} className="text-muted ms-1"/>
                </div>

                {/* Dropdown Menu - Compact */}
                {showProfileDropdown && (
                  <>
                    <div 
                      className="position-fixed top-0 start-0 w-100 h-100" 
                      style={{ zIndex: 999 }}
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <div 
                      className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg" 
                      style={{ minWidth: '220px', zIndex: 1000 }}
                    >
                      <div className="p-2 border-bottom bg-light">
                        <div className="fw-bold small">{adminName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{adminEmail}</div>
                      </div>
                      <div className="p-1">
                        <button 
                          className="btn btn-sm btn-light w-100 text-start d-flex align-items-center mb-1"
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setActiveSection('settings');
                          }}
                        >
                          <FaCog className="me-2 text-secondary" size={14}/> Settings
                        </button>
                        <button 
                          className="btn btn-sm btn-light w-100 text-start d-flex align-items-center"
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setActiveSection('help');
                          }}
                        >
                          <FaQuestionCircle className="me-2 text-secondary" size={14}/> Help
                        </button>
                      </div>
                      <div className="border-top p-1">
                        <button 
                          className="btn btn-sm btn-danger w-100 d-flex align-items-center justify-content-center"
                          style={{ fontSize: '0.85rem' }}
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-2" size={14}/> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-grow-1 p-2 p-md-3 p-lg-4" style={{ backgroundColor: '#f8f9fa', overflowY: 'auto' }}>
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading data...</p>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger shadow-sm" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Dashboard Section */}
              {activeSection === 'dashboard' && (
                <div>
                  <div className="mb-3 mb-md-4">
                    <h3 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Dashboard Overview</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Quick stats and insights</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="row g-2 g-md-3 g-lg-4 mb-3 mb-md-4">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="col-6 col-lg-3">
                        <div 
                          className="card border-0 shadow-sm h-100" 
                          style={{ 
                            backgroundColor: stat.bgColor,
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>{stat.label}</p>
                                <h2 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{stat.value}</h2>
                              </div>
                              <div 
                                className="bg-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <stat.icon className={`text-${stat.color}`} size={20}/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div className="row g-2 g-md-3 g-lg-4">
                    <div className="col-12 col-lg-8">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-3 p-md-4">
                          <h5 className="card-title fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Recent Activity</h5>
                          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Activity feed coming soon...</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-3 p-md-4">
                          <h5 className="card-title fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Quick Actions</h5>
                          <div className="d-grid gap-2">
                            <button 
                              className="btn btn-outline-primary text-start d-flex align-items-center"
                              style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                              onClick={() => {
                                setActiveSection('craftsmen');
                                setCraftsmenSubsection('pending');
                              }}
                            >
                              <FaClipboardList className="me-2" size={16}/>
                              <span>Review Pending ({pendingCraftsmen.length})</span>
                            </button>
                            <button 
                              className="btn btn-outline-success text-start d-flex align-items-center"
                              style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                              onClick={() => setActiveSection('payments')}
                            >
                              <FaDollarSign className="me-2" size={16}/>
                              <span>Process Payments ({jobsReadyForPayment.length})</span>
                            </button>
                            <button 
                              className="btn btn-outline-info text-start d-flex align-items-center"
                              style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                              onClick={() => setActiveSection('jobs')}
                            >
                              <FaClipboardList className="me-2" size={16}/>
                              <span>Manage Jobs</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Craftsmen Section */}
              {activeSection === 'craftsmen' && (
                <div>
                  <div className="mb-3 mb-md-4">
                    <h3 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                      {craftsmenSubsection === 'pending' && 'Pending Craftsmen'}
                      {craftsmenSubsection === 'approved' && 'Active Craftsmen'}
                      {craftsmenSubsection === 'inactive' && 'Inactive Craftsmen'}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                      {craftsmenSubsection === 'pending' && 'Review and approve craftsmen applications'}
                      {craftsmenSubsection === 'approved' && 'Manage active craftsmen'}
                      {craftsmenSubsection === 'inactive' && 'View inactive craftsmen'}
                    </p>
                  </div>
                  <CraftsmenTable
                    list={
                      craftsmenSubsection==='pending' ? pendingCraftsmen :
                      craftsmenSubsection==='approved' ? approvedCraftsmen :
                      approvedCraftsmen.filter(c => !c.is_active)
                    }
                    filterValue={craftsmenSubsection==='pending'? pendingFilter : approvedFilter}
                    setFilterValue={craftsmenSubsection==='pending'? setPendingFilter : setApprovedFilter}
                    isPending={craftsmenSubsection==='pending'}
                    getImageUrl={getImageUrlSafe}
                    colorText={colorText}
                    checkCraftsmanApprovalCriteria={checkCraftsmanApprovalCriteria}
                    isCraftsmanApproved={isCraftsmanApproved}
                    handleAction={handleAction}
                    openRejectModal={openRejectModal}
                    toggleActiveStatus={toggleActiveStatus}
                    openEditModal={openEditModal}
                  />
                </div>
              )}

              {/* Jobs Section */}
              {activeSection === 'jobs' && (
                <div>
                  <div className="mb-3 mb-md-4">
                    <h3 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>Job Management</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>View and manage all job requests</p>
                  </div>
                  <JobRequests
                    jobs={jobs}
                    jobsLoading={jobsLoading}
                    approvedCraftsmen={approvedCraftsmen}
                    selectedCraftsmen={selectedCraftsmen}
                    setSelectedCraftsmen={setSelectedCraftsmen}
                    onSuccessAssign={fetchAllJobs}
                  />
                </div>
              )}

              {/* Payments Section */}
              {activeSection === 'payments' && (
                <div>
                  <div className="mb-3 mb-md-4">
                    <h3 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>Payment Management</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Process payments for completed jobs</p>
                  </div>
                  <PaymentDashboard 
                    jobsReadyForPayment={jobsReadyForPayment} 
                    processPayment={processPayment}
                  />
                </div>
              )}

              {/* Other Sections Placeholder */}
              {['reports', 'analytics', 'support', 'settings', 'help'].includes(activeSection) && (
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <h4 className="fw-bold text-capitalize mb-3">{activeSection}</h4>
                    <p className="text-muted">This section is under development</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCraftsman && (
        <>
          <div 
            className="modal-backdrop show" 
            onClick={() => setEditingCraftsman(null)}
          />
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-primary text-white border-0">
                  <h5 className="modal-title fw-bold">
                    <FaEdit className="me-2"/>
                    Edit Craftsman
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setEditingCraftsman(null)}
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Full Name</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter full name" 
                      value={editForm.full_name} 
                      onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Profession</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter profession" 
                      value={editForm.profession} 
                      onChange={e => setEditForm({...editForm, profession: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Enter description" 
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Primary Service</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter primary service" 
                      value={editForm.primary_service} 
                      onChange={e => setEditForm({...editForm, primary_service: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setEditingCraftsman(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={saveEdit}
                  >
                    <FaCheckCircle className="me-2"/>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
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
