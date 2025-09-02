import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import heroImage from '../assets/craftOnline.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // includes Popper


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

function LandingPage() {
  const [approvedServices, setApprovedServices] = useState([]);

  useEffect(() => {
    async function fetchApprovedServices() {
      try {
        const response = await axios.get(`${API_BASE_URL}/public-craftsman/`);
        const approved = response.data.filter(
          item => item.status === 'approved' && item.primary_service
        );
        setApprovedServices(approved);
      } catch (error) {
        console.error('Error fetching approved services:', error);
      }
    }

    fetchApprovedServices();
  }, []);

  const getImageUrl = path => {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
    return `${API_BASE_URL}/media/${path}`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="text-center d-flex align-items-center"
        style={{
          // background: `url(${heroImage}) no-repeat center center/cover`,
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage}) no-repeat center center/cover`,
          height: '100vh',
          color: 'white',
        }}>


        <div className="container" style={{ paddingTop: "120px" }}>
          <h1 className="display-4 fw-bold moving-text" style={{ animation: 'slide 5s infinite alternate' }}>
            Empowering Local Craftsmen
          </h1>
          <p className="lead mt-3">
            Manage clients, showcase your work, and grow your trade — all in one platform.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/signup" className="btn btn-green-transparent btn-lg mt-4 fw-bold">  
              Join as a Craftsman
            </Link>
            <Link to="/HireSignUp" className="btn btn-green-solid btn-lg mt-4 fw-bold">
              Hire a Craftsman
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">About Us</h2>
          <div className="row">
            <div className="col-md-6">
              <p>
                We aim to empower local craftsmen by providing them with a platform to manage their projects, showcase their work, and grow their business. We believe in the power of craftsmanship to bring unique, handmade products to the world.
              </p>
            </div>
            <div className="col-md-6">
              <img src="https://www.ariseiip.com/wp-content/uploads/2022/06/textile.png" alt="About Us" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </section>

      {/*Services*/}

<section className="py-5 bg-light" id="services">
  <div className="container">
    {/* Heading */}
    <h2 className="text-center mb-3 fw-bold text-primary">
      Explore Our Services
    </h2>

    {/* Paragraph */}
    <p className="text-center fs-8 text-secondary mb-3" style={{ fontFamily: 'inherit' }}>
      Discover a wide variety of skilled services offered by experienced craftsmen.
      From metalwork and carpentry to plumbing and textile design, we connect you with professionals who deliver quality you can trust.
    </p>

    {/* View All Services Button */}
    <div className="text-end mb-4">
      <Link to="/services" className="btn btn-outline-primary fw-bold">
        View All Services
      </Link>
    </div>

    {/* Carousel */}
    {approvedServices.length === 0 ? (
      <p className="text-center">No approved services available yet.</p>
    ) : (
      <>
        <div
          id="servicesCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
        >
          <div className="carousel-inner">
            {approvedServices.map((service, index) => (
              <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <div className="d-flex justify-content-center">
                  <div className="card border-0 shadow" style={{ width: '24rem' }}>
                    <div className="position-relative">
                      <img
                        src={getImageUrl(service.service_image)}
                        className="card-img-top"
                        alt={service.service}
                        style={{ height: '340px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white bg-dark bg-opacity-75 overlay">
                        <h5 className="fw-bold">{service.primary_service}</h5>
                        {/* <p className="text-center px-3 small">
                          {service.description?.slice(0, 70) || 'Reliable and professional craftsmanship.'}
                        </p> */}
                      </div>
                    </div>
                    <div className="card-body text-center">
                      <h5 className="card-title fw-bold mb-0">{service.service}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Arrows */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#servicesCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: 'invert(1)' }} />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#servicesCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: 'invert(1)' }} />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </>
    )}
  </div>

  {/* Hover overlay styling */}
  <style>{`
    .overlay {
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
    }

    .position-relative:hover .overlay {
      opacity: 1;
    }
  `}</style>
</section>





      {/* How It Works Section */}
      <section className="py-5 bg-white" id="how-it-works">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">How It Works</h2>
          <div className="row text-center">
            {[
              {
                title: 'Post Project',
                img: 'https://wordpress-411969-1603232.cloudwaysapps.com/wp-content/uploads/2017/06/how_1.png',
                text: 'Add projects and in 24 hours craftsmen will start responding.',
              },
              {
                title: 'Browse Quotes',
                img: 'https://wordpress-411969-1603232.cloudwaysapps.com/wp-content/uploads/2017/06/how_2.png',
                text: 'Browse received applications and quotes from craftsmen.',
              },
              {
                title: 'Leave Review',
                img: 'https://wordpress-411969-1603232.cloudwaysapps.com/wp-content/uploads/2017/06/how_3.png',
                text: 'After a craftsman finishes, you can rate them.',
              },
            ].map((step, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="card border-0 h-100">
                  <div className="card-body">
                    <img src={step.img} alt={step.title} className="mb-3" style={{ width: '100px', height: '100px' }} />
                    <h5 className="card-title fw-bold">{step.title}</h5>
                    <p className="card-text">{step.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">What Our Clients Say</h2>
          <div className="row">
            {[
              {
                quote: "The carpenter I hired was extremely professional. Highly recommend!",
                stars: 4,
                name: "Sarah M.",
              },
              {
                quote: "The metalworker exceeded my expectations. Great job!",
                stars: 5,
                name: "James K.",
              },
              {
                quote: "The textile artist made a beautiful custom outfit. Loved it!",
                stars: 3.5,
                name: "Linda O.",
              },
            ].map((testi, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card shadow-sm p-3 mb-4 bg-white rounded">
                  <div className="card-body">
                    <p className="card-text fst-italic">"{testi.quote}"</p>
                    <div className="text-warning mb-2">
                      {[...Array(Math.floor(testi.stars))].map((_, i) => <i key={i} className="fas fa-star" />)}
                      {testi.stars % 1 !== 0 && <i className="fas fa-star-half-alt" />}
                      {[...Array(5 - Math.ceil(testi.stars))].map((_, i) => <i key={i} className="far fa-star" />)}
                    </div>
                    <h5 className="card-title mt-3 fw-bold">– {testi.name}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold text-primary">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            {[
              {
                question: "How do I hire a craftsman?",
                answer: "Click on 'Hire a Craftsman', register your account, and post your project. Craftsmen will reach out to you with quotes."
              },
              {
                question: "Is there a cost to join as a craftsman?",
                answer: "No, joining the platform as a craftsman is completely free."
              },
              {
                question: "Can I trust the craftsmen on your platform?",
                answer: "Yes, we review all craftsmen submissions and only approve those with complete and verified profiles."
              },
              {
                question: "How do I leave a review for a craftsman?",
                answer: "After your project is completed, go to your dashboard and leave a review based on your experience."
              }
            ].map((faq, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded={index === 0 ? 'true' : 'false'}
                    aria-controls={`collapse${index}`}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">{faq.answer}</div>
                </div>
              </div>
            ))}
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
              <p><i className="fas fa-envelope me-2 text-primary"></i> kaakazini.jay4t@gmail.com</p>
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

      {/* Animation CSS */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0px); }
          100% { transform: translateX(20px); }
        }
      `}</style>
    </>
  );
}

export default LandingPage;
