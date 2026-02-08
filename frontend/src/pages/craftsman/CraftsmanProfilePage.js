import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from "../../api/axiosClient"; 

import { getFullImageUrl } from "../../utils/getFullImageUrl";

function CraftsmanProfile() {
  const { slug } = useParams();
  const [craftsman, setCraftsman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!slug || slug === 'undefined' || slug === 'null') {
      setNotFound(true);
      setLoading(false);
      setErrorMsg('Invalid craftsman slug.');
      return;
    }

    const fetchCraftsman = async () => {
      setLoading(true);
      setNotFound(false);
      setErrorMsg('');
      try {
        const response = await api.get(`/public-craftsman/${slug}/`);
        if (response.status === 200 && response.data) {
          setCraftsman(response.data);
        } else {
          setNotFound(true);
          setErrorMsg('No data returned from API.');
        }
      } catch (error) {
        console.error('Error fetching craftsman data:', error);
        setErrorMsg(
          error.response?.status === 404
            ? 'Craftsman not found on the server.'
            : 'Failed to fetch craftsman data.'
        );
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCraftsman();
  }, [slug]);

  if (loading)
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f3f2ef'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary fw-semibold">Loading profile...</p>
        </div>
      </div>
    );

  if (notFound || !craftsman)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f2ef' }}>
        <div className="text-center p-5">
          <h2 className="text-danger fs-4 fw-bold">Craftsman Not Found</h2>
          <p className="text-muted mt-2">{errorMsg || 'Please check the URL or select another craftsman.'}</p>
          <Link to="/" className="btn btn-warning mt-3">Go Home</Link>
        </div>
      </div>
    );

  // Get full URLs for images
  const profileImage = getFullImageUrl(craftsman.profile);
  const proofDocument = getFullImageUrl(craftsman.proof_document);
  const primaryService = craftsman.primary_service || null;
  const services = primaryService
    ? [{ name: primaryService, service_image_url: craftsman.service_image }] 
      .concat(craftsman.services || [])
    : craftsman.services || [];

  const avgRating =
    craftsman.reviews && craftsman.reviews.length > 0
      ? (craftsman.reviews.reduce((sum, r) => sum + r.rating, 0) / craftsman.reviews.length).toFixed(1)
      : null;

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/craftsman/${slug}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      alert('Profile link copied to clipboard!');
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .profile-container {
          background: #f3f2ef;
          min-height: 100vh;
          padding: 2rem 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .profile-cover {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          height: 200px;
          border-radius: 8px 8px 0 0;
          position: relative;
        }

        .profile-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08);
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .profile-header-section {
          padding: 0 1.5rem 1.5rem;
          position: relative;
          margin-top: -80px;
        }

        .profile-avatar {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          object-fit: cover;
          background: white;
        }

        .profile-name {
          font-size: 1.75rem;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          margin: 1rem 0 0.25rem;
        }

        .profile-headline {
          font-size: 1rem;
          color: rgba(0,0,0,0.6);
          margin-bottom: 0.5rem;
        }

        .profile-location {
          font-size: 0.875rem;
          color: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .profile-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0,0,0,0.08);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(0,0,0,0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-primary-custom {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          color: #1f2937;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 24px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }

        .btn-primary-custom:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
        }

        .btn-secondary-custom {
          background: white;
          color: #6b7280;
          border: 1px solid #6b7280;
          padding: 0.625rem 1.5rem;
          border-radius: 24px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary-custom:hover {
          background: #f9fafb;
          border-color: #374151;
          color: #374151;
        }

        .section-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08);
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          margin-bottom: 1rem;
        }

        .section-content {
          font-size: 0.9375rem;
          color: rgba(0,0,0,0.8);
          line-height: 1.6;
        }

        .gallery-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding: 0.5rem 0 1rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .gallery-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .gallery-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }

        .gallery-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .gallery-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .gallery-item {
          flex-shrink: 0;
          width: 180px;
        }

        .gallery-image {
          width: 180px;
          height: 180px;
          border-radius: 8px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .gallery-image:hover {
          transform: scale(1.05);
        }

        .review-card {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
        }

        .reviewer-name {
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          font-size: 0.9375rem;
        }

        .reviewer-location {
          font-size: 0.8125rem;
          color: rgba(0,0,0,0.6);
        }

        .rating-badge {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .review-text {
          font-size: 0.9375rem;
          color: rgba(0,0,0,0.7);
          line-height: 1.5;
        }

        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-badge {
          background: #e5e7eb;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .rating-summary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef3c7;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-top: 0.75rem;
        }

        .rating-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f59e0b;
        }

        .rating-stars {
          color: #fbbf24;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: rgba(0,0,0,0.4);
          font-size: 0.9375rem;
        }

        /* Shop Section Styles */
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .shop-item {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          background: #fff;
        }

        .shop-item:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transform: translateY(-4px);
        }

        .shop-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
        }

        .shop-details {
          padding: 1rem;
        }

        .shop-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          margin: 0 0 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.8rem;
        }

        .shop-price {
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.75rem;
        }

        .shop-cta {
          display: block;
          width: 100%;
          padding: 0.625rem;
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          color: #1f2937;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          text-decoration: none;
        }

        .shop-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
        }

        @media (max-width: 768px) {
          .profile-cover {
            height: 120px;
          }

          .profile-header-section {
            margin-top: -60px;
          }

          .profile-avatar {
            width: 120px;
            height: 120px;
          }

          .profile-name {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-primary-custom,
          .btn-secondary-custom {
            width: 100%;
          }

          .profile-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>

      <div className="profile-container">
        <div className="container" style={{ maxWidth: '1024px' }}>
          
          {/* Main Profile Card */}
          <div className="profile-card">
            <div className="profile-cover"></div>
            
            <div className="profile-header-section">
              <img
                src={profileImage}
                alt={craftsman.name}
                className="profile-avatar"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/160')}
              />
              
              <h1 className="profile-name">{craftsman.name}</h1>
              <p className="profile-headline">{craftsman.company_name || 'Independent Craftsman'} • {craftsman.profession || 'Skilled Tradesperson'}</p>
              
              <div className="profile-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {craftsman.location || 'Kenya'}
              </div>

              {avgRating && (
                <div className="rating-summary">
                  <span className="rating-number">{avgRating}</span>
                  <span className="rating-stars">★★★★★</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>({craftsman.reviews.length} reviews)</span>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{services.length || 0}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{craftsman.reviews?.length || 0}</span>
                  <span className="stat-label">Reviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{craftsman.status === 'approved' ? 'Verified' : 'Active'}</span>
                  <span className="stat-label">Status</span>
                </div>
              </div>

              <div className="action-buttons">
                <Link to="/HireLogin" className="btn-primary-custom" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', display: 'inline' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Hire {craftsman.name}
                </Link>
                <button className="btn-secondary-custom" onClick={handleCopyLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', display: 'inline' }}>
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="section-card">
            <h2 className="section-title">About</h2>
            <p className="section-content">
              {craftsman.description || 'This craftsman has not yet added a description. They are a skilled professional ready to help with your projects.'}
            </p>
          </div>

          {/* Portfolio/Gallery Section */}
          <div className="section-card">
            <h2 className="section-title">Portfolio & Work Gallery</h2>
            {services.length > 0 ? (
              <div className="gallery-scroll">
                {services.map((service, index) => {
                  const imageUrl = getFullImageUrl(service.service_image_url);
                  return (
                    <div key={index} className="gallery-item">
                      <img
                        src={imageUrl}
                        alt={`Project ${index + 1}`}
                        className="gallery-image"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/180')}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No portfolio images available yet</div>
            )}
          </div>

          {/* Shop Section */}
          {/* {services.length > 0 && (
            <div className="section-card">
              <h2 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Shop
              </h2>
              <div className="shop-grid">
                {services.map((service, index) => {
                  const imageUrl = getFullImageUrl(service.service_image_url);
                  return (
                    <div key={index} className="shop-item">
                      <img
                        src={imageUrl}
                        alt={service.name || `Product ${index + 1}`}
                        className="shop-image"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
                      />
                      <div className="shop-details">
                        <h3 className="shop-title">{service.name || `Service ${index + 1}`}</h3>
                        <p className="shop-price">Contact for pricing</p>
                        <Link to="/HireLogin" className="shop-cta">
                          Inquire Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Skills Section */}
          <div className="section-card">
            <h2 className="section-title">Skills & Expertise</h2>
            {craftsman.skills ? (
              <div className="skills-container">
                {craftsman.skills.split(',').map((skill, index) => (
                  <span key={index} className="skill-badge">{skill.trim()}</span>
                ))}
              </div>
            ) : (
              <div className="empty-state">No skills listed</div>
            )}
          </div>

          {/* Experience/Credentials Section */}
          {proofDocument && (
            <div className="section-card">
              <h2 className="section-title">Credentials & Certifications</h2>
              <a 
                href={proofDocument} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary-custom"
                style={{ display: 'inline-block', textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', display: 'inline' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                View Verification Document
              </a>
            </div>
          )}

          {/* Reviews Section */}
          <div className="section-card">
            <h2 className="section-title">Client Reviews</h2>
            {craftsman.reviews?.length > 0 ? (
              <div>
                {craftsman.reviews.map((review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-header">
                      <div>
                        <div className="reviewer-name">{review.reviewer}</div>
                        <div className="reviewer-location">{review.location}</div>
                      </div>
                      <div className="rating-badge">{review.rating}/10</div>
                    </div>
                    <p className="review-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No reviews yet. Be the first to hire and review!</div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="footer text-light pt-5 pb-4" style={{ backgroundColor: '#1f2937' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
                <li className="mb-2"><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2"></i> Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2"></i> support@kaakazini.com</p>
            </div>

            <div className="col-lg-5 col-md-12 mb-4">
              <h5 className="text-uppercase fw-bold mb-3">Find Us</h5>
              <div style={{ width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kisumu Location Map"
                />
              </div>
            </div>
          </div>

          <hr className="border-secondary mt-4" />
          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
            <p className="mb-md-0 text-center">© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
            <div className="mt-2 mt-md-0 text-center">
              <a href="#top" className="text-light text-decoration-none">Back to top <i className="fas fa-arrow-up ms-2"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default CraftsmanProfile;
