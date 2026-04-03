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
  const [errorMsg, setErrorMsg]             = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('All');

  if (jobsLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width:'3rem', height:'3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading job requests...</p>
      </div>
    );
  }

  const assignCraftsman = async (jobId) => {
    const craftsmanId = selectedCraftsmen[jobId];
    if (!craftsmanId) { setErrorMsg('Please select a craftsman before assigning.'); return; }
    setAssigningJobId(jobId); setErrorMsg('');
    try {
      await api.post(`/job-requests/${jobId}/assign/`, { craftsman: craftsmanId });
      if (onSuccessAssign) onSuccessAssign(jobId, craftsmanId);
      setErrorMsg('');
    } catch (err) {
      let msg = `Failed to assign craftsman for Job #${jobId}. `;
      if (err.response) {
        const s = err.response.status;
        const d = err.response.data?.message || err.response.data?.error || '';
        if (s === 400) msg += d || 'Invalid request data.';
        else if (s === 401) msg += 'Unauthorized. Please log in again.';
        else if (s === 403) msg += 'You do not have permission to assign craftsmen.';
        else if (s === 404) msg += 'Job or craftsman not found.';
        else if (s === 405) msg += 'Method not allowed.';
        else if (s >= 500)  msg += 'Server error. Please try again later.';
        else msg += d || 'Please try again.';
      } else if (err.request) { msg += 'Network error. Check your connection.'; }
      else { msg += err.message || 'Please try again.'; }
      setErrorMsg(msg);
    } finally { setAssigningJobId(null); }
  };

  const sortedJobs   = [...jobs].sort((a, b) => b.id - a.id);
  const filteredJobs = sortedJobs.filter(job => {
    const mq = job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               job.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               job.id?.toString().includes(searchTerm);
    const ms = statusFilter === 'All' || job.status === statusFilter;
    return mq && ms;
  });

  const stats = {
    total:     jobs.length,
    pending:   jobs.filter(j => j.status === 'Pending').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    cancelled: jobs.filter(j => j.status === 'Cancelled').length,
  };

  const getBadge = (status) => {
    switch (status) {
      case 'Completed':  return 'bg-success';
      case 'Cancelled':  return 'bg-danger';
      case 'In Progress':return 'bg-info';
      default:           return 'bg-warning';
    }
  };

  return (
    <div className="container-fluid px-0">
      <style>{`
        .job-stats-card { transition:all .3s ease; cursor:pointer; border:2px solid transparent; }
        .job-stats-card:hover { transform:translateY(-5px); border-color:#22c55e; box-shadow:0 8px 20px rgba(34,197,94,.15); }
        .job-stats-card.active { border-color:#22c55e; background:linear-gradient(135deg,#f0fdf9,#fff); }
        .job-table-row { transition:all .2s ease; }
        .job-table-row:hover { background-color:rgba(34,197,94,.04) !important; box-shadow:0 2px 8px rgba(0,0,0,.06); }
        .job-card { border-left:4px solid #22c55e; transition:all .3s ease; }
        .job-card:hover { box-shadow:0 4px 12px rgba(34,197,94,.2); transform:translateX(5px); }
        .assign-btn-group { gap:.5rem; }
      `}</style>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-4" style={{ background:'linear-gradient(135deg,#fbbf24,#22c55e)' }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <h3 className="mb-1 fw-bold text-white d-flex align-items-center">
                <FaBriefcase className="me-3" size={32}/> Job Requests Management
              </h3>
              <p className="mb-0 text-white opacity-75">Manage and assign service requests to craftsmen</p>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <div className="badge bg-white text-dark px-4 py-3" style={{ fontSize:'1.1rem', fontWeight:600 }}>
                <FaBriefcase className="me-2"/>{filteredJobs.length} Request{filteredJobs.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { lbl:'Total Jobs', val:stats.total,     color:'#22c55e', ic:<FaBriefcase size={24} style={{ color:'#22c55e' }}/>, bg:'rgba(34,197,94,.1)',  key:'All' },
          { lbl:'Pending',    val:stats.pending,   color:'#fbbf24', ic:<FaClock size={24} style={{ color:'#fbbf24' }}/>,     bg:'rgba(251,191,36,.1)', key:'Pending' },
          { lbl:'Completed',  val:stats.completed, color:'#22c55e', ic:<FaCheckCircle size={24} className="text-success"/>,  bg:'rgba(34,197,94,.1)',  key:'Completed' },
          { lbl:'Cancelled',  val:stats.cancelled, color:'#dc3545', ic:<FaTimesCircle size={24} className="text-danger"/>,   bg:'rgba(220,53,69,.1)',  key:'Cancelled' },
        ].map(s => (
          <div className="col-6 col-lg-3" key={s.key}>
            <div className={`card job-stats-card border-0 shadow-sm h-100 ${statusFilter === s.key ? 'active' : ''}`} onClick={() => setStatusFilter(s.key)}>
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{s.lbl}</p>
                    <h3 className="mb-0 fw-bold" style={{ color:s.color }}>{s.val}</h3>
                  </div>
                  <div className="rounded-circle p-3" style={{ backgroundColor:s.bg }}>{s.ic}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ borderColor:'#22c55e' }}><FaSearch className="text-success"/></span>
                <input type="text" className="form-control" placeholder="Search by job ID, client name, or service..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ borderColor:'#22c55e' }}/>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ borderColor:'#fbbf24' }}><FaFilter style={{ color:'#fbbf24' }}/></span>
                <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ borderColor:'#fbbf24' }}>
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

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <FaTimesCircle className="me-2"/><strong>Error:</strong> {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg('')}/>
        </div>
      )}

      {/* Desktop Table */}
      <div className="card border-0 shadow-sm d-none d-lg-block">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead style={{ background:'linear-gradient(135deg,#fbbf24,#22c55e)', position:'sticky', top:0, zIndex:10 }}>
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
                {filteredJobs.length > 0 ? filteredJobs.map(job => {
                  const svc = approvedCraftsmen.filter(c => c.primary_service === job.service);
                  return (
                    <tr key={job.id} className="job-table-row border-bottom">
                      <td className="ps-4">
                        <span className="badge" style={{ backgroundColor:'#fbbf24', color:'#fff', fontSize:'.9rem', padding:'.5rem .75rem' }}>#{job.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-2" style={{ width:40, height:40, borderColor:'#22c55e' }}>
                            <FaUser className="text-success" size={16}/>
                          </div>
                          <div className="fw-bold text-dark">{job.name}</div>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border px-3 py-2"><FaBriefcase className="me-1" size={12}/>{job.service}</span></td>
                      <td><span className="text-success fw-bold"><FaMoneyBillWave className="me-1"/>{job.budget ? `KSh ${job.budget.toLocaleString()}` : '—'}</span></td>
                      <td>
                        <div className="small text-muted">
                          <FaCalendarAlt className="me-1"/>
                          {new Date(job.schedule).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                          <br/><span className="ms-3">{new Date(job.schedule).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${getBadge(job.status)}`}>{job.status}</span></td>
                      <td className="pe-4">
                        <div className="d-flex assign-btn-group align-items-center">
                          <select className="form-select form-select-sm" value={selectedCraftsmen[job.id] || ''}
                            onChange={e => setSelectedCraftsmen(prev => ({ ...prev, [job.id]: e.target.value }))}
                            disabled={assigningJobId === job.id} style={{ minWidth:180, borderColor:'#22c55e' }}>
                            <option value="">Select craftsman</option>
                            {svc.length > 0 ? svc.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>) : <option disabled>No approved craftsmen</option>}
                          </select>
                          <button className="btn btn-sm text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', minWidth:90 }}
                            onClick={() => assignCraftsman(job.id)} disabled={assigningJobId === job.id || svc.length === 0}>
                            {assigningJobId === job.id ? <><span className="spinner-border spinner-border-sm me-2" role="status"/>Assigning…</> : <><FaUserTie className="me-1"/> Assign</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="text-center py-5"><FaBriefcase className="text-muted mb-3" size={48}/><p className="text-muted mb-0">No job requests found</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="d-lg-none">
        {filteredJobs.length > 0 ? filteredJobs.map(job => {
          const svc = approvedCraftsmen.filter(c => c.primary_service === job.service);
          return (
            <div key={job.id} className="card job-card border-0 shadow-sm mb-3">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="badge" style={{ backgroundColor:'#fbbf24', color:'#fff', fontSize:'.9rem', padding:'.5rem .75rem' }}>Job #{job.id}</span>
                  <span className={`badge ${getBadge(job.status)}`}>{job.status}</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3" style={{ width:50, height:50, borderColor:'#22c55e' }}>
                    <FaUser className="text-success" size={20}/>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{job.name}</div>
                    <div className="small text-muted"><FaBriefcase className="me-1" size={10}/>{job.service}</div>
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small text-muted">Budget</div>
                    <div className="fw-bold text-success"><FaMoneyBillWave className="me-1" size={12}/>{job.budget ? `KSh ${job.budget.toLocaleString()}` : '—'}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Schedule</div>
                    <div className="small"><FaCalendarAlt className="me-1" size={10}/>{new Date(job.schedule).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</div>
                  </div>
                </div>
                <div className="border-top pt-3">
                  <label className="form-label small fw-bold text-muted mb-2"><FaUserTie className="me-1"/> Assign Craftsman</label>
                  <div className="d-flex flex-column gap-2">
                    <select className="form-select form-select-sm" value={selectedCraftsmen[job.id] || ''}
                      onChange={e => setSelectedCraftsmen(prev => ({ ...prev, [job.id]: e.target.value }))}
                      disabled={assigningJobId === job.id} style={{ borderColor:'#22c55e' }}>
                      <option value="">Select craftsman</option>
                      {svc.length > 0 ? svc.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>) : <option disabled>No approved craftsmen</option>}
                    </select>
                    <button className="btn btn-sm text-white w-100" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}
                      onClick={() => assignCraftsman(job.id)} disabled={assigningJobId === job.id || svc.length === 0}>
                      {assigningJobId === job.id ? <><span className="spinner-border spinner-border-sm me-2" role="status"/>Assigning…</> : <><FaUserTie className="me-2"/> Assign Craftsman</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
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
