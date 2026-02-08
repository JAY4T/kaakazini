import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../../api/axiosClient"; 

function CraftsmenList() {
  const [craftsmen, setCraftsmen] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCraftsmen = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/public-craftsman/', {
        params: { is_approved: true },
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

  const filteredCraftsmen = craftsmen.filter((c) =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container-fluid crafts-list">
        <h2 className="text-center my-4" style={{ color: '#198754' }}>
          Find & Hire Skilled Craftsmen
        </h2>
        <p className="text-center mb-4 text-muted fs-5">
          Browse through our verified artisans and craftsmen. View their portfolios, check their skills and reviews, and hire the right professional for your project. Your next project deserves the best hands!
        </p>

        <div className="row">
          {/* SEARCH BAR */}
          <div className="col-12 mb-5">
            <div className="d-flex justify-content-center">
              <div
                className="d-flex shadow-sm"
                style={{
                  width: '100%',
                  maxWidth: '900px',
                  borderRadius: '50px',
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <input
                  type="text"
                  className="form-control form-control-lg border-0 px-4"
                  placeholder="Search craftsmen by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="btn btn-success px-4"
                  onClick={fetchCraftsmen}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          {/* CRAFTSMEN GRID */}
          <div className="col-12">
            {loading ? (
              <p className="text-center">Loading craftsmen...</p>
            ) : error ? (
              <p className="text-center text-danger">{error}</p>
            ) : filteredCraftsmen.length === 0 ? (
              <p className="text-center">No craftsmen found.</p>
            ) : (
              <div className="row g-4">
                {filteredCraftsmen.map((craftsman) => {
                  const craftsmanSlug = craftsman.slug || craftsman.id;
                  return (
                    <div className="col-sm-6 col-md-4 col-lg-3" key={craftsman.id}>
                      <div
                        className="card h-100 shadow-sm"
                        style={{ borderRadius: '14px', overflow: 'hidden', transition: '0.3s' }}
                      >
                        {/* IMAGE */}
                        <div style={{ height: '220px', overflow: 'hidden' }}>
                          <img
                            src={craftsman.profile?.trim() || 'https://picsum.photos/400/400?random=1'}
                            alt={craftsman.full_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://picsum.photos/400/400?random=2';
                            }}
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="card-body text-center">
                          <h5 className="fw-bold mb-1">{craftsman.full_name}</h5>
                          <p className="text-success fw-semibold mb-1">{craftsman.profession}</p>

                          {craftsman.location && (
                            <p className="small text-muted mb-2">
                              <i className="fas fa-map-marker-alt me-1"></i>{craftsman.location}
                            </p>
                          )}

                          {craftsman.services && craftsman.services.length > 0 && (
                            <p className="text-muted small mb-2">
                              {craftsman.services.slice(0, 2).map((s) => s.name).join(', ')}
                              {craftsman.services.length > 2 && '...'}
                            </p>
                          )}

                          <Link
                            to={`/craftsman/${craftsmanSlug}`}
                            className="btn btn-success btn-sm w-100 mt-2"
                          >
                            View Portfolio & Hire
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

      {/* FOOTER */}
      <footer className="footer text-light pt-5 pb-4 mt-5">
        <div className="container">
          <div className="row">
            {/* Quick Links */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
                <li className="mb-2"><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
                <li className="mb-2"><a href="#services" className="text-light text-decoration-none">Services</a></li>
                <li className="mb-2"><a href="#how-it-works" className="text-light text-decoration-none">How It Works</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2"></i> Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2"></i> support@kaakazini.com</p>
              <div className="mt-4 social-icons">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <a href="#" className="me-3 text-light"><i className="fab fa-facebook-f fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-twitter fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-instagram fa-lg"></i></a>
                <a href="#" className="me-3 text-light"><i className="fab fa-linkedin-in fa-lg"></i></a>
              </div>
            </div>

            {/* Map */}
            <div className="col-lg-5 col-md-12 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Find Us</h5>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kisumu Location Map"
                />
              </div>
            </div>
          </div>

          <hr className="border-secondary mt-0" />

          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
            <p className="mb-md-0 text-center">© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
            <div className="mt-2 mt-md-0 text-center">
              <a href="#top" className="text-light text-decoration-none">Back to top <i className="fas fa-arrow-up ms-2"></i></a>
            </div>
          </div>
        </div>

        <style>{`
          .footer {
            background-color: #222222ff;
          }
          .social-icons a {
            font-size: 1.5rem;
            transition: transform 0.3s ease-in-out;
          }
          .social-icons a:hover {
            transform: scale(1.1);
            color: #0d6efd !important;
          }
          .map-container {
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </footer>
    </>
  );
}

export default CraftsmenList;
