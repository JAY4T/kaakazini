import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const [approvedServices, setApprovedServices] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const getImageUrl = (filename) => {
    return filename.startsWith('http')
      ? filename
      : `http://127.0.0.1:8001${filename}`;
  };

  useEffect(() => {
    const fetchApprovedServices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8001/api/public-craftsman/');
        const filteredServices = response.data.filter(service => service.service_image && service.service_image.trim() !== '');
        setApprovedServices(filteredServices);
      } catch (error) {
        console.error('Error fetching approved services:', error);
      }
    };

    fetchApprovedServices();
  }, []);

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8001/api/contact/', contactForm);
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
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container text-center">
          <h1 className="fw-bold display-4">Our Services</h1>
          <p className="fs-5 fst-italic">Skilled. Trusted. Certified Craftsmen.</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-5 bg-light" id="services">
        <div className="container">
          <h2 className="text-center mb-3 fw-bold text-primary">What We offer</h2>
          <p className="text-center fs-6 text-secondary mb-4">
           We offer a diverse range of high-quality, personalized services—from carpentry, masonry, and electrical work to plumbing, interior finishes, and custom designs.
          </p>

          {approvedServices.length === 0 ? (
            <p className="text-center">No approved services available yet.</p>
          ) : (
            <div className="row g-4">
              {approvedServices.map((service, index) => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={index}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="position-relative">
                      <img
                        src={getImageUrl(service.service_image)}
                        alt={service.service || 'Craftsman Service'}
                        className="card-img-top"
                        style={{ height: '220px', objectFit: 'cover' }}
                      />
                      <span
                        className="position-absolute bottom-0 start-0 m-2 badge bg-primary"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {service.primary_service}
                      </span>
                    </div>
                    <div className="card-body text-center">
                      <h5 className="card-title fw-bold mb-0">{service.service}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-5 bg-white" id="contact">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">Contact Us</h2>
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
                  <button type="submit" className="btn btn-primary fw-bold">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

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
              {/* <p><i className="fas fa-phone me-2 text-primary"></i> +254 716 293 710</p> */}
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
    </div>
  );
};

export default ServicesPage;
