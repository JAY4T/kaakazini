import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

authAxios.interceptors.request.use((config) => {
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
      const response = await axios.get(`${API_BASE_URL}/public-craftsman/`, {
        params: {
          is_approved: true,
        },
      });

      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setCraftsmen(results);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to load craftsmen. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCraftsmen();
  }, []);

  // Filter craftsmen by search term
  const filteredCraftsmen = craftsmen.filter((c) =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container-fluid crafts-list">
        <h2 className="text-center my-4">Craftsmen</h2>
        <p className="text-center mb-3 text-muted">Explore our registered craftsmen</p>

        <div className="row">
          {/* Sidebar Filter */}
          <div className="col-md-3 mb-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-3">Search</h5>
              <div className="form-group">
                <label htmlFor="search">Search by Name</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="search"
                    className="form-control"
                    placeholder="Enter name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={fetchCraftsmen}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Craftsmen Display */}
          <div className="col-md-9">
            {loading ? (
              <p className="text-center">Loading craftsmen...</p>
            ) : error ? (
              <p className="text-center text-danger">{error}</p>
            ) : filteredCraftsmen.length === 0 ? (
              <p className="text-center">No craftsmen found.</p>
            ) : (
              <div className="row">
                {filteredCraftsmen.map((craftsman) => {
                  const craftsmanSlug = craftsman.slug || craftsman.id; // fallback if slug is missing
                  return (
                    <div className="col-md-4" key={craftsman.id}>
                      <div className="card shadow-sm mb-4">
                        <div className="card-body text-center">
                          <img
                            src={
                              craftsman.profile?.trim()
                                ? craftsman.profile
                                : 'https://via.placeholder.com/150'
                            }
                            alt={craftsman.full_name}
                            className="mb-3 rounded-circle"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
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
                          <Link to={`/craftsman/${craftsmanSlug}`} className="btn btn-primary">
                            View Portfolio
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-dark pt-5 pb-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3 mb-4">
              <h5 className="text-uppercase fw-bold">Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
                <li><Link to="/signup" className="text-dark text-decoration-none">Join as a Craftsman</Link></li>
                <li><Link to="/HireSignUp" className="text-dark text-decoration-none">Hire a Craftsman</Link></li>
                <li><a href="#services" className="text-dark text-decoration-none">Services</a></li>
                <li><a href="#how-it-works" className="text-dark text-decoration-none">How It Works</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase fw-bold">Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2 text-primary"></i> Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2 text-primary"></i>support@kaakazini.com</p>
            </div>
            <div className="col-md-5 mb-4">
              <h5 className="text-uppercase fw-bold">Find Us</h5>
              <div style={{ width: '100%', height: '350px', borderRadius: '10px', overflow: 'hidden' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kisumu Location Map"
                />
              </div>
            </div>
          </div>
          <hr className="border-secondary" />
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} <strong>KaaKazini</strong> - Empowering Craftsmen Everywhere.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default CraftsmenList;
