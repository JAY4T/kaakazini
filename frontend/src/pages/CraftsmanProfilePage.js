import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function CraftsmanProfile() {
  const { id } = useParams();
  const [craftsman, setCraftsman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
          const response = await axios.get(`http://127.0.0.1:8001/api/public-craftsman/${id}/`);
          if (response.status === 200 && response.data) {
            setCraftsman(response.data);
            sessionStorage.setItem(`craftsman-${id}`, JSON.stringify(response.data));
          } else {
            setNotFound(true);
            setErrorMsg('No data returned from API.');
          }
        } catch (error) {
          console.error('Error fetching craftsman data:', error);
          setErrorMsg(error.response?.status === 404 ? 'Craftsman not found on the server.' : 'Failed to fetch craftsman data.');
          setNotFound(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCraftsman();
  }, [id]);

  if (loading) {
    return <div className="text-center py-5 text-secondary fs-5">Loading...</div>;
  }

  if (notFound || !craftsman) {
    return (
      <div className="text-center py-5">
        <h2 className="text-danger fs-4 fw-semibold">Craftsman Not Found</h2>
        <p className="text-muted mt-2">{errorMsg || 'Please check the URL or select another craftsman.'}</p>
      </div>
    );
  }

  const profileImage = craftsman.profile || 'https://via.placeholder.com/150';
  const serviceImages = craftsman.service_images && craftsman.service_images.length > 0
    ? craftsman.service_images
    : craftsman.service_image
      ? [craftsman.service_image]
      : [];

  return (
    <div className="container py-4">
      <div className="card shadow-lg p-4">
        <div className="text-center mb-4">
          <img
            src={profileImage}
            alt={craftsman.name}
            className="rounded-circle shadow mb-3"
            style={{ width: '144px', height: '144px', objectFit: 'cover' }}
          />
          <h2 className="fw-bold">{craftsman.name}</h2>
          <p className="text-muted">{craftsman.company_name || 'Independent Craftsman'}</p>
        </div>

        <div className="row text-muted mb-4">
          <div className="col-md-6 mb-3">
            {/* <p><strong>Member Since:</strong> {craftsman.member_since ? new Date(craftsman.member_since).toDateString() : 'N/A'}</p> */}
            <p><strong>Location:</strong> {craftsman.location || 'N/A'}</p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="fw-semibold mb-2">About</h4>
          <p className="text-muted">{craftsman.description || 'No information available.'}</p>
        </div>

        <div className="mb-4">
          <h4 className="fw-semibold mb-2">Image Gallery</h4>
          {serviceImages.length > 0 ? (
            <div className="row">
              {serviceImages.map((img, index) => (
                <div key={index} className="col-6 col-md-3 mb-3">
                  <img
                    src={img}
                    alt={`Service Image ${index + 1}`}
                    className="img-fluid rounded shadow-sm"
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No service images available.</p>
          )}
        </div>

        <div className="mb-4">
          <h4 className="fw-semibold mb-2">Client Reviews</h4>
          {craftsman.reviews?.length > 0 ? (
            <div className="vstack gap-3">
              {craftsman.reviews.map((review, index) => (
                <div key={index} className="border rounded p-3 bg-light">
                  <p className="mb-1 fw-semibold">
                    {review.reviewer}
                    <span className="text-muted small"> ({review.location})</span>
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

        {craftsman.video && (
          <div className="mb-4">
            <h4 className="fw-semibold mb-2">Promotional Video</h4>
            <div className="ratio ratio-16x9">
              <iframe
                src={craftsman.video}
                title="Craftsman Video"
                className="rounded shadow"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="fw-semibold mb-2">Skills</h4>
          <p className="text-muted">{craftsman.skills || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default CraftsmanProfile;
