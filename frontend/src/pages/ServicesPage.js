import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

const ServicesPage = () => {
  const [approvedServices, setApprovedServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const serviceCategories = ['All', 'Carpentry', 'Electrical', 'Plumbing', 'Masonry', 'Painting', 'Interior'];

  const getImageUrl = (filename) => filename.startsWith('http') ? filename : `${API_BASE_URL}${filename}`;

  useEffect(() => {
    const fetchApprovedServices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public-craftsman/`);
        const filtered = response.data.filter(s => s.service_image && s.service_image.trim() !== '');
        setApprovedServices(filtered);
        setFilteredServices(filtered);
      } catch (err) {
        console.error('Error fetching approved services:', err);
      }
    };
    fetchApprovedServices();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilteredServices(category === 'All' ? approvedServices : approvedServices.filter(s => s.primary_service === category));
  };

  const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/contact/`, contactForm);
      alert('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="d-flex align-items-center text-white"
        style={{
          height: '60vh',
          backgroundImage: 'url("https://jay4t.org/wp-content/uploads/2025/04/pexels-kindelmedia-8487371-1536x1152.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container text-center">
          <h1 className="fw-bold display-4 text-white">Our Services</h1>
          <p className="fs-5 fst-italic text-white">Skilled. Trusted. Certified Craftsmen.</p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container text-center">
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              className={`btn me-2 mb-2 ${selectedCategory === cat ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleCategorySelect(cat)}
              style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-4 text-success">What We Offer</h2>
          <p className="fs-5 mx-auto" style={{ maxWidth: '800px', color: '#6c757d' }}>
            We offer a diverse range of high-quality, personalized services—from carpentry, masonry, and electrical work to plumbing, interior finishes, and custom designs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-4 text-success">Available Services</h2>
          {filteredServices.length === 0 ? (
            <p className="text-center" style={{ color: '#6c757d' }}>No services available in this category.</p>
          ) : (
            <div className="row g-4">
              {filteredServices.map((service, idx) => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={idx}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="position-relative">
                      <img
                        src={getImageUrl(service.service_image)}
                        alt={service.service || 'Craftsman Service'}
                        className="card-img-top"
                        style={{ height: '220px', objectFit: 'cover' }}
                      />
                      <span
                        className="position-absolute bottom-0 start-0 m-2 badge bg-success"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {service.primary_service}
                      </span>
                    </div>
                    <div className="card-body text-center">
                      <h5 className="card-title fw-bold" style={{ color: '#6c757d' }}>{service.service}</h5>
                      <Link to={`/services/${service.id}`} className="btn btn-outline-success mt-2">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call-to-Action with Payment Info */}
      <section className="py-5 text-white text-center" style={{ backgroundColor: '#198754' }}>
        <div className="container">
          <h3 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Ready to Hire a Craftsman?</h3>
          <p className="mb-4" style={{ maxWidth: '700px', margin: '0 auto', color: '#ffffff' }}>
            Join thousands of satisfied clients who trust KaaKazini. Payments to craftsmen are handled securely through our platform. 
            You can pay per project or hourly, depending on the agreement, and be assured of transparency and timely service.
          </p>
          <Link to="/hire" className="btn btn-light btn-lg">Get Started</Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5" style={{ backgroundColor: '#ffffff' }} id="contact">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-success">Contact Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form onSubmit={handleContactSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    name="message"
                    className="form-control"
                    rows="5"
                    placeholder="Your Message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-success">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-5 pb-4 mt-5" style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-3 mb-4">
              <h5 className="text-uppercase fw-bold" style={{ color: '#6c757d' }}>Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-decoration-none" style={{ color: '#6c757d' }}>Home</Link></li>
                <li><Link to="/signup" className="text-decoration-none" style={{ color: '#6c757d' }}>Join as a Craftsman</Link></li>
                <li><Link to="/HireSignUp" className="text-decoration-none" style={{ color: '#6c757d' }}>Hire a Craftsman</Link></li>
                <li><a href="#services" className="text-decoration-none" style={{ color: '#6c757d' }}>Services</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase fw-bold" style={{ color: '#6c757d' }}>Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2"></i> <span style={{ color: '#6c757d' }}>Kisumu, Kenya</span></p>
              <p><i className="fas fa-envelope me-2"></i> <span style={{ color: '#6c757d' }}>kaakazini.jay4t@gmail.com</span></p>
            </div>
            <div className="col-md-5 mb-4">
              <h5 className="text-uppercase fw-bold" style={{ color: '#6c757d' }}>Find Us</h5>
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
          <hr style={{ borderColor: '#6c757d' }} />
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0" style={{ color: '#6c757d' }}>&copy; {new Date().getFullYear()} <strong>KaaKazini</strong> - Empowering Craftsmen Everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;
