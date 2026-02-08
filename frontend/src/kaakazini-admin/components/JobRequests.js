import React, { useState } from 'react';
import { FaBriefcase, FaUser, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../../api/axiosClient'; 

export default function JobRequests({
  jobs,
  jobsLoading,
  approvedCraftsmen,
  selectedCraftsmen,
  setSelectedCraftsmen,
  onSuccessAssign
}) {
  const [assigningJobId, setAssigningJobId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  if (jobsLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading job requests...</p>
      </div>
    );
  }

  const assignCraftsman = async (jobId) => {
    const craftsmanId = selectedCraftsmen[jobId];
    if (!craftsmanId) {
      setErrorMsg('Please select a craftsman before assigning.');
      return;
    }

    setAssigningJobId(jobId);
    setErrorMsg('');

    try {
      await api.post(`/job-requests/${jobId}/assign/`, {
        craftsman: craftsmanId
      });

      if (onSuccessAssign) onSuccessAssign(jobId, craftsmanId);
      setErrorMsg('');
    } catch (err) {
      console.error('Assignment error:', err);
      
      let errorMessage = `Failed to assign craftsman for Job #${jobId}. `;
      
      if (err.response) {
        const statusCode = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error || '';
        
        if (statusCode === 400) {
          errorMessage += serverMessage || 'Invalid request data.';
        } else if (statusCode === 401) {
          errorMessage += 'Unauthorized. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage += 'You do not have permission to assign craftsmen.';
        } else if (statusCode === 404) {
          errorMessage += 'Job or craftsman not found.';
        } else if (statusCode === 405) {
          errorMessage += 'Method not allowed. Please check the API endpoint configuration.';
        } else if (statusCode >= 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += serverMessage || 'Please try again.';
        }
      } else if (err.request) {
        errorMessage += 'Network error. Check your connection.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setAssigningJobId(null);
    }
  };

  // Sort and filter jobs
  const sortedJobs = [...jobs].sort((a, b) => b.id - a.id);
  
  const filteredJobs = sortedJobs.filter(job => {
    const matchesSearch = 
      job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status statistics
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'Pending').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    cancelled: jobs.filter(j => j.status === 'Cancelled').length
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      case 'In Progress': return 'bg-info';
      default: return 'bg-warning';
    }
  };

  return (
    <div className="container-fluid px-0">
      <style>{`
        .job-stats-card {
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .job-stats-card:hover {
          transform: translateY(-5px);
          border-color: #22c55e;
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.15);
        }

        .job-stats-card.active {
          border-color: #22c55e;
          background: linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%);
        }

        .job-table-row {
          transition: all 0.2s ease;
        }

        .job-table-row:hover {
          background-color: rgba(34, 197, 94, 0.04) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transform: scale(1.002);
        }

        .assign-btn-group {
          gap: 0.5rem;
        }

        .form-select:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.15);
        }

        .search-input:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 0.2rem rgba(251, 191, 36, 0.15);
        }

        .job-card {
          border-left: 4px solid #22c55e;
          transition: all 0.3s ease;
        }

        .job-card:hover {
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
          transform: translateX(5px);
        }

        @media (max-width: 768px) {
          .job-stats-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="card border-0 shadow-sm mb-4" style={{ 
        background: 'linear-gradient(135deg, #fbbf24 0%, #22c55e 100%)'
      }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <h3 className="mb-1 fw-bold text-white d-flex align-items-center">
                <FaBriefcase className="me-3" size={32}/>
                Job Requests Management
              </h3>
              <p className="mb-0 text-white opacity-75">Manage and assign service requests to craftsmen</p>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <div className="badge bg-white text-dark px-4 py-3" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                <FaBriefcase className="me-2"/>
                {filteredJobs.length} Request{filteredJobs.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div 
            className={`card job-stats-card border-0 shadow-sm h-100 ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted mb-1 small">Total Jobs</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#22c55e' }}>{stats.total}</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <FaBriefcase size={24} style={{ color: '#22c55e' }}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div 
            className={`card job-stats-card border-0 shadow-sm h-100 ${statusFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted mb-1 small">Pending</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#fbbf24' }}>{stats.pending}</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <FaClock size={24} style={{ color: '#fbbf24' }}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div 
            className={`card job-stats-card border-0 shadow-sm h-100 ${statusFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Completed')}
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted mb-1 small">Completed</p>
                  <h3 className="mb-0 fw-bold text-success">{stats.completed}</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <FaCheckCircle size={24} className="text-success"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div 
            className={`card job-stats-card border-0 shadow-sm h-100 ${statusFilter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Cancelled')}
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted mb-1 small">Cancelled</p>
                  <h3 className="mb-0 fw-bold text-danger">{stats.cancelled}</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                  <FaTimesCircle size={24} className="text-danger"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ borderColor: '#22c55e' }}>
                  <FaSearch className="text-success"/>
                </span>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by job ID, client name, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderColor: '#22c55e' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ borderColor: '#fbbf24' }}>
                  <FaFilter style={{ color: '#fbbf24' }}/>
                </span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ borderColor: '#fbbf24' }}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <FaTimesCircle className="me-2"/>
          <strong>Error:</strong> {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="card border-0 shadow-sm d-none d-lg-block">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #22c55e 100%)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <tr>
                  <th className="text-dark fw-bold border-0 py-3 ps-4">Job ID</th>
                  <th className="text-dark fw-bold border-0 py-3">Client</th>
                  <th className="text-dark fw-bold border-0 py-3">Service</th>
                  <th className="text-dark fw-bold border-0 py-3">Budget</th>
                  <th className="text-dark fw-bold border-0 py-3">Schedule</th>
                  <th className="text-dark fw-bold border-0 py-3">Status</th>
                  <th className="text-dark fw-bold border-0 py-3 pe-4">Assign Craftsman</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const serviceCraftsmen = approvedCraftsmen.filter(
                      (c) => c.primary_service === job.service
                    );

                    return (
                      <tr key={job.id} className="job-table-row border-bottom">
                        <td className="ps-4">
                          <span className="badge" style={{ 
                            backgroundColor: '#fbbf24', 
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            padding: '0.5rem 0.75rem'
                          }}>
                            #{job.id}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '40px', height: '40px', borderColor: '#22c55e' }}>
                              <FaUser className="text-success" size={16}/>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{job.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-3 py-2">
                            <FaBriefcase className="me-1" size={12}/>
                            {job.service}
                          </span>
                        </td>
                        <td>
                          <span className="text-success fw-bold">
                            <FaMoneyBillWave className="me-1"/>
                            {job.budget ? `KSh ${job.budget.toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="small text-muted">
                            <FaCalendarAlt className="me-1"/>
                            {new Date(job.schedule).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            <br/>
                            <span className="ms-3">{new Date(job.schedule).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex assign-btn-group align-items-center">
                            <select
                              className="form-select form-select-sm"
                              value={selectedCraftsmen[job.id] || ''}
                              onChange={(e) =>
                                setSelectedCraftsmen((prev) => ({
                                  ...prev,
                                  [job.id]: e.target.value
                                }))
                              }
                              disabled={assigningJobId === job.id}
                              style={{ minWidth: '180px', borderColor: '#22c55e' }}
                            >
                              <option value="">Select craftsman</option>
                              {serviceCraftsmen.length > 0 ? (
                                serviceCraftsmen.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.full_name}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No approved craftsmen</option>
                              )}
                            </select>

                            <button
                              className="btn btn-sm text-white"
                              style={{ 
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                minWidth: '90px'
                              }}
                              onClick={() => assignCraftsman(job.id)}
                              disabled={assigningJobId === job.id || serviceCraftsmen.length === 0}
                            >
                              {assigningJobId === job.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <FaUserTie className="me-1"/> Assign
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <FaBriefcase className="text-muted mb-3" size={48}/>
                      <p className="text-muted mb-0">No job requests found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-lg-none">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const serviceCraftsmen = approvedCraftsmen.filter(
              (c) => c.primary_service === job.service
            );

            return (
              <div key={job.id} className="card job-card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge" style={{ 
                      backgroundColor: '#fbbf24', 
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      padding: '0.5rem 0.75rem'
                    }}>
                      Job #{job.id}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '50px', height: '50px', borderColor: '#22c55e' }}>
                      <FaUser className="text-success" size={20}/>
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{job.name}</div>
                      <div className="small text-muted">
                        <FaBriefcase className="me-1" size={10}/>
                        {job.service}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="small text-muted">Budget</div>
                      <div className="fw-bold text-success">
                        <FaMoneyBillWave className="me-1" size={12}/>
                        {job.budget ? `KSh ${job.budget.toLocaleString()}` : '—'}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="small text-muted">Schedule</div>
                      <div className="small">
                        <FaCalendarAlt className="me-1" size={10}/>
                        {new Date(job.schedule).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="border-top pt-3">
                    <label className="form-label small fw-bold text-muted mb-2">
                      <FaUserTie className="me-1"/> Assign Craftsman
                    </label>
                    <div className="d-flex flex-column gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={selectedCraftsmen[job.id] || ''}
                        onChange={(e) =>
                          setSelectedCraftsmen((prev) => ({
                            ...prev,
                            [job.id]: e.target.value
                          }))
                        }
                        disabled={assigningJobId === job.id}
                        style={{ borderColor: '#22c55e' }}
                      >
                        <option value="">Select craftsman</option>
                        {serviceCraftsmen.length > 0 ? (
                          serviceCraftsmen.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.full_name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No approved craftsmen</option>
                        )}
                      </select>

                      <button
                        className="btn btn-sm text-white w-100"
                        style={{ 
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        }}
                        onClick={() => assignCraftsman(job.id)}
                        disabled={assigningJobId === job.id || serviceCraftsmen.length === 0}
                      >
                        {assigningJobId === job.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <FaUserTie className="me-2"/> Assign Craftsman
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaBriefcase className="text-muted mb-3" size={48}/>
              <p className="text-muted mb-0">No job requests found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
