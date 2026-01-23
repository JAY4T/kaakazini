import React, { useState } from 'react';
import api from '../api/axiosClient'; // ✅ cookie-based axios instance

export default function JobRequests({
  jobs,
  jobsLoading,
  approvedCraftsmen,
  selectedCraftsmen,
  setSelectedCraftsmen,
  onSuccessAssign // callback after successful assignment
}) {
  const [assigningJobId, setAssigningJobId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (jobsLoading) return <div className="text-center mt-4">Loading requests...</div>;

  const assignCraftsman = async (jobId) => {
    const craftsmanId = selectedCraftsmen[jobId];
    if (!craftsmanId) {
      setErrorMsg('Please select a craftsman before assigning.');
      return;
    }

    setAssigningJobId(jobId);
    setErrorMsg('');

    try {
      // API call to assign craftsman
      await api.post(`/job-requests/${jobId}/assign-craftsman/`, {
        craftsman: craftsmanId
      });

      if (onSuccessAssign) onSuccessAssign(jobId, craftsmanId);
    } catch (err) {
      console.error('Assignment error:', err);
      setErrorMsg('Failed to assign craftsman. Try again.');
    } finally {
      setAssigningJobId(null);
    }
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4>All Service Requests</h4>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <table className="table table-striped table-hover mt-3">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Budget (KSh)</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Assign Craftsman</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const serviceCraftsmen = approvedCraftsmen.filter(
              (c) => c.primary_service === job.service
            );

            return (
              <tr key={job.id}>
                <td>{job.name}</td>
                <td>{job.service}</td>
                <td>{job.budget ? `KSh ${job.budget}` : '—'}</td>
                <td>{new Date(job.schedule).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      job.status === 'Completed'
                        ? 'bg-success'
                        : job.status === 'Cancelled'
                        ? 'bg-danger'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex">
                    <select
                      className="form-select form-select-sm me-2"
                      value={selectedCraftsmen[job.id] || ''}
                      onChange={(e) =>
                        setSelectedCraftsmen((prev) => ({
                          ...prev,
                          [job.id]: e.target.value
                        }))
                      }
                      disabled={assigningJobId === job.id}
                    >
                      <option value="">Select craftsman</option>
                      {serviceCraftsmen.length > 0 ? (
                        serviceCraftsmen.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name} ({c.primary_service})
                          </option>
                        ))
                      ) : (
                        <option disabled>No approved craftsmen</option>
                      )}
                    </select>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => assignCraftsman(job.id)}
                      disabled={assigningJobId === job.id || serviceCraftsmen.length === 0}
                    >
                      {assigningJobId === job.id ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
