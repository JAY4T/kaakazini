import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Axios instance
const authAxios = axios.create({
  baseURL: 'http://127.0.0.1:8001',
});

authAxios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function CraftsmenList() {
  const [craftsmen, setCraftsmen] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCraftsmen = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.get('http://127.0.0.1:8001/api/public-craftsman/', {
      params: {
        is_approved: true,
        search: searchTerm,
      },
    });

    const data = response.data;
    setCraftsmen(Array.isArray(data) ? data : data.results || []);
  } catch (err) {
    console.error('Fetch Error:', err);
    setError('Failed to load craftsmen. Please try again.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCraftsmen();
  }, [searchTerm]);

  return (
    <div className="container-fluid">
      <h2 className="text-center my-4">Craftsmen</h2>
      <p className="text-center mb-3 text-muted">Explore our registered craftsmen</p>

      <div className="row">
        {/* Sidebar Filter */}
        <div className="col-md-3 mb-4">
          <div className="card p-3 shadow-sm">
            <h5 className="mb-3">Search</h5>
            <div className="form-group mb-3">
              <label htmlFor="search">Search by Name</label>
              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Enter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Craftsmen Display */}
        <div className="col-md-9">
          {loading ? (
            <p className="text-center">Loading craftsmen...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : craftsmen.length === 0 ? (
            <p className="text-center">No craftsmen found.</p>
          ) : (
            <div className="row">
              {craftsmen.map((craftsman) => (
                <div className="col-md-4" key={craftsman.id}>
                  <div className="card shadow-sm mb-4">
                    <div className="card-body text-center">
                      <img
                        src={craftsman.profile?.trim() ? craftsman.profile : 'https://via.placeholder.com/150'}
                        alt={craftsman.full_name}
                        className="mb-3 rounded-circle"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                      <h5 className="card-title">{craftsman.full_name}</h5>
                      <p className="card-text">{craftsman.profession}</p>
                      {craftsman.location && (
                        <p className="card-text">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(craftsman.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {craftsman.location}
                          </a>
                        </p>
                      )}
                      <Link to={`/craftsman/${craftsman.id}`} className="btn btn-primary">


                        View portfolio
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CraftsmenList;
