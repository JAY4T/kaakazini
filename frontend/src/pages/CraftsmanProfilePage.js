import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

function CraftsmanProfile() {
  const { id } = useParams();
  const [craftsman, setCraftsman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setNotFound(true);
      setLoading(false);
      setErrorMsg('Invalid craftsman ID.');
      return;
    }

    const fetchCraftsman = async () => {
      setLoading(true);
      setNotFound(false);
      setErrorMsg('');

      const storedData = sessionStorage.getItem(`craftsman-${id}`);
      if (storedData) {
        setCraftsman(JSON.parse(storedData));
        setLoading(false);
      } else {
        try {
          const response = await axios.get(`${API_BASE_URL}/public-craftsman/${id}/`);
          if (response.status === 200 && response.data) {
            setCraftsman(response.data);
            sessionStorage.setItem(`craftsman-${id}`, JSON.stringify(response.data));
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
      }
    };

    fetchCraftsman();
  }, [id]);

  if (loading) return <div className="text-center py-5 text-secondary fs-5">Loading...</div>;

  if (notFound || !craftsman)
    return (
      <div className="text-center py-5">
        <h2 className="text-danger fs-4 fw-semibold">Craftsman Not Found</h2>
        <p className="text-muted mt-2">{errorMsg || 'Please check the URL or select another craftsman.'}</p>
      </div>
    );

  const profileImage = craftsman.profile || 'https://via.placeholder.com/150';
  const primaryService = craftsman.primary_service || null;
  const services = primaryService
    ? [{ name: primaryService }, ...(craftsman.services || [])]
    : craftsman.services || [];

  const avgRating =
    craftsman.reviews && craftsman.reviews.length > 0
      ? (craftsman.reviews.reduce((sum, r) => sum + r.rating, 0) / craftsman.reviews.length).toFixed(1)
      : null;

 

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/craftsman/${id}`;
    navigator.clipboard.writeText(profileUrl).then(() => alert('Profile link copied to clipboard!'));
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out ${craftsman.name}'s profile`);
    const body = encodeURIComponent(
      `Hi,\n\nTake a look at this craftsman profile:\n${window.location.origin}/craftsman/${id}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div className="container py-4">
        <div className="card shadow-lg p-4">
          {/* Profile Header */}
          <div className="text-center mb-4">
            <img
              src={profileImage}
              alt={craftsman.name}
              className="rounded-circle shadow mb-3"
              style={{ width: '144px', height: '144px', objectFit: 'cover' }}
            />
            <h2 className="fw-bold d-block">{craftsman.name}</h2>
            <p className="text-muted mb-2">{craftsman.company_name || 'Independent Craftsman'}</p>

            <button className="btn btn-sm btn-outline-secondary mb-2" onClick={handleCopyLink}>
              <i className="fas fa-share-alt me-1"></i> Share profile
            </button>

            {avgRating && (
              <p className="fw-bold text-warning">
                ⭐ {avgRating}/10 ({craftsman.reviews.length} reviews)
              </p>
            )}
          </div>

          {/* Location */}
          <div className="mb-4">
            <h4 className="fw-semibold mb-2">Location</h4>
            <p className="text-muted">{craftsman.location || 'N/A'}</p>
          </div>

          {/* About */}
          <div className="mb-4">
            <h4 className="fw-semibold mb-2">About</h4>
            <p className="text-muted">{craftsman.description || 'No information available.'}</p>
          </div>

         {/* Services Offered (only names) */}
<div className="mb-4">
  <h4 className="fw-semibold mb-2">Services Offered</h4>
  {services.length > 0 ? (
    services.map((service, index) => (
      <p key={index}>{service.name}</p>
    ))
  ) : (
    <p className="text-muted">No services listed.</p>
  )}
</div>

          {/* Client Reviews */}
          <div className="mb-4">
            <h4 className="fw-semibold mb-2">Client Reviews</h4>
            {craftsman.reviews?.length > 0 ? (
              <div className="vstack gap-3">
                {craftsman.reviews.map((review, index) => (
                  <div key={index} className="border rounded p-3 bg-light">
                    <p className="mb-1 fw-semibold">
                      {review.reviewer}{' '}
                      <span className="text-muted small">({review.location})</span>
                    </p>
                    <p className="text-warning small mb-1">Rating: {review.rating}/10</p>
                    <p className="text-muted">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No reviews available.</p>
            )}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <h4 className="fw-semibold mb-2">Skills</h4>
            <p className="text-muted">{craftsman.skills || 'N/A'}</p>
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
              <p><i className="fas fa-envelope me-2 text-primary"></i> support@kaakazini.com</p>
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

export default CraftsmanProfile;
