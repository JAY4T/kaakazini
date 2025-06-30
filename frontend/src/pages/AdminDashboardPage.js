import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8001';

const authAxios = axios.create({ baseURL: API_BASE_URL });

authAxios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function AdminDashboard() {
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [craftsmanFilter, setCraftsmanFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await authAxios.get('/api/admin/craftsman/');
      setCraftsmen(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  };

  const checkCraftsmanApprovalCriteria = (c) => {
  const errs = [];
  if (!c.full_name?.trim()) errs.push('Full name is missing.');
  if (!c.profile) errs.push('Profile image is missing.');
  if (!c.profession?.trim()) errs.push('Profession is missing.');
  if (!c.description?.trim()) errs.push('Description is missing.');
  if (!c.primary_service?.trim()) errs.push('Primary service is missing.');

  const hasServiceImage =
    (c.services?.[0]?.image || c.service_image); // checks both possible sources

  if (!hasServiceImage) errs.push('Service image is missing.');

  return errs;
};


  const handleAction = async (type, id, model, craftsman = null) => {
    if (model === 'craftsman' && type === 'approve') {
      const errors = checkCraftsmanApprovalCriteria(craftsman);
      if (errors.length) {
        alert('Cannot approve:\n' + errors.map((e, i) => `${i + 1}. ${e}`).join('\n'));
        return;
      }
    }
    try {
      await authAxios.post(`/api/admin/${model}/${id}/${type}/`);
      // await authAxios.post(`/api/admin/notify/${model}/${id}/${type === 'approve' ? 'approved' : 'rejected'}/`);
      fetchData();
    } catch (err) {
      console.error(`${type} failed:`, err);
      alert(`Action failed: ${type}`);
    }
  };

  const filteredCraftsmen = craftsmen.filter(c =>
    c.full_name.toLowerCase().includes(craftsmanFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center text-danger">
        <h4>{error}</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <p className="text-muted">Manage pending approvals for craftsmen</p>
      </div>

      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4>Pending Craftsmen</h4>
          <input
            type="text"
            className="form-control form-control-sm w-25"
            placeholder="Search craftsmen..."
            value={craftsmanFilter}
            onChange={e => setCraftsmanFilter(e.target.value)}
          />
        </div>

        <table className="table table-bordered table-hover bg-white">
          <thead className="table-primary">
            <tr>
              <th>Profile</th>
              <th>Full Name</th>
              <th>Profession</th>
              <th>Description</th>
              <th>Service Name</th>
              <th>Service Image</th>
              <th>Issues</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCraftsmen.length > 0 ? filteredCraftsmen.map(c => {
              const errors = checkCraftsmanApprovalCriteria(c);
              const mainService = c.services?.[0] || {
  name: c.primary_service,
  image: c.service_image,
};
              return (
                <React.Fragment key={c.id}>
                  <tr className="align-middle">
                    <td>
                      {c.profile ? (
                        <img src={getImageUrl(c.profile)} alt={c.full_name} className="img-thumbnail" style={{ width: '80px' }} />
                      ) : <span className="badge bg-warning text-dark">Missing image</span>}
                    </td>
                    <td>{c.full_name}</td>
                    <td>{c.profession || <span className="badge bg-info text-dark">No profession</span>}</td>
                    <td>{c.description || <span className="badge bg-warning text-dark">No description</span>}</td>
                    <td>{mainService?.name || <span className="text-muted">No service</span>}</td>
                    <td>
                      {mainService?.image ? (
                        <img src={getImageUrl(mainService.image)} alt={mainService.name} className="img-thumbnail" style={{ width: '100px', height: '70px', objectFit: 'cover' }} />
                      ) : <span className="text-muted">No image</span>}
                    </td>
                    <td>
                      {errors.length ? (
                        <ul className="mb-0 small">{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
                      ) : <span className="text-success">Approved</span>}
                    </td>
                    <td>
                     <button
  className="btn btn-success btn-sm me-2"
  disabled={errors.length > 0}
  onClick={() => handleAction('approve', c.id, 'craftsman', c)}
>
  ✅
</button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction('reject', c.id, 'craftsman')}
                      >❌</button>
                    </td>
                  </tr>

                  {c.services?.length > 1 && (
                    <tr>
                      <td colSpan="8" className="bg-light">
                        <div className="px-3 pt-2">
                          <strong>Additional Services:</strong>
                          <table className="table table-bordered table-sm mt-2">
                            <thead className="table-light">
                              <tr>
                                <th>Service Name</th>
                                <th>Service Image</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.services.slice(1).map(service => (
                                <tr key={service.id}>
                                  <td>{service.name}</td>
                                  <td>
                                    {service.image ? (
                                      <img
                                        src={getImageUrl(service.image)}
                                        alt={service.name}
                                        style={{ width: '100px', height: '70px', objectFit: 'cover' }}
                                        className="img-thumbnail"
                                      />
                                    ) : <span className="text-muted">No image</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">No pending craftsmen found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
