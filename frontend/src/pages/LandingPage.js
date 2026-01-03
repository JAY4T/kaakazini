import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import heroImage from '../assets/craftOnline.jpg';
import heroBottom from '../assets/hero-bottom.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js";



import { FaFileAlt, FaSearch, FaStar } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';




const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

function LandingPage() {
  const [approvedServices, setApprovedServices] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);

  // Fetch approved services
  useEffect(() => {
    async function fetchApprovedServices() {
      try {
        const response = await axios.get(`${API_BASE_URL}/public-craftsman/`);
        const approved = response.data.filter(
  item => item.status === 'approved' && item.primary_service
).map(item => ({
  ...item,
  images: item.images || [], // ensure images is always an array
}));

        setApprovedServices(approved);
        setFilteredServices(approved);
      } catch (error) {
        console.error('Error fetching approved services:', error);
      }
    }

    fetchApprovedServices();
  }, []);

  // Initialize animations
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  // Live search filtering
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = approvedServices.filter(service =>
      service.name?.toLowerCase().includes(query) ||
      service.primary_service?.toLowerCase().includes(query) ||
      service.location?.toLowerCase().includes(query)
    );
    setFilteredServices(filtered);
  }, [searchQuery, approvedServices]);

  const handleSearch = () => {
    // Already handled by live search effect
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300"; // fallback
  if (path.startsWith("http")) return path;
  return `${process.env.REACT_APP_MEDIA_URL || "https://staging.kaakazini.com"}${path}`;
};

  return (
    <>
    {/* Hero Section */}
<section
  className="text-center d-flex align-items-center"
  style={{
    background: `url(${heroImage}) no-repeat center center/cover`,
    height: '80vh',
    color: 'white',
    width: '100%',
    position: 'relative',
    paddingTop: '100px', //keeps hero below navbar
    zIndex: 1,
  }}
>

  <div className="container">
    <h1
      className="display-4 fw-bold moving-text"
      style={{ animation: 'slide 5s infinite alternate', fontSize: '2.8rem' }}
    >
      Empowering Local Craftsmen
    </h1>
    <p className="lead mt-3" style={{ fontSize: '1.3rem' }}>
      Manage clients, showcase your work, and grow your trade — all in one platform.
    </p>
    <div className="d-flex justify-content-center align-items-center gap-3 mb-4 hero-buttons">

  <Link
    to="/login"
    className="btn btn-yellow-solid btn-lg fw-bold"
  >
    Become A Craftsman
  </Link>
  <Link
    to="/Hirelogin"
    className="btn btn-yellow-solid btn-lg fw-bold"
  >
    Hire a Craftsman
  </Link>
</div>
</div>
</section>

{/* decoration */}
<section
  className="text-center d-flex align-items-center"
  style={{
    background: `url(${heroBottom}) no-repeat center center/cover`,
    height: '10vh',
    // color: 'white',
    width: '100%',
    position: 'relative',
    // zIndex: 1,
  }}
>
</section>

{/* stats */}
<section className="py-5 bg-white text-center" id="impact">
  <div className="container">
    <div className="row justify-content-center g-4">

      {[
        { icon: "bi-people-fill", value: "100+", label: "Active Craftsmen" },
        { icon: "bi-clipboard-check", value: "50+", label: "Jobs Completed" },
        { icon: "bi-emoji-smile", value: "30+", label: "Happy Clients" },
        { icon: "bi-shop", value: "100+", label: "Shops Connected" },
      ].map((item, idx) => (
        <div key={idx} className="col-6 col-md-3 d-flex justify-content-center">
          <div className="impact-circle">
            <i className={`bi ${item.icon} impact-icon`}></i>
            <h3 className="impact-value">{item.value}</h3>
            <p className="impact-label">{item.label}</p>
          </div>
        </div>
      ))}

    </div>
  </div>

  {/* Local styles just like your other sections */}
  <style>{`
    .impact-circle {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      border: 4px solid #f4c430;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #fff;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .impact-circle:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
    }

    .impact-icon {
      font-size: 1.6rem;
      color: #212529;
      margin-bottom: 4px;
    }

    .impact-value {
      margin: 0;
      font-weight: 700;
      color: #f4c430;
    }

    .impact-label {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #212529;
    }
  `}</style>
</section>

{/* decoration */}
<section
  className="text-center d-flex align-items-center"
  style={{
    background: `url(${heroBottom}) no-repeat center center/cover`,
    height: '10vh',
    // color: 'white',
    width: '100%',
    position: 'relative',
    // zIndex: 1,
  }}
>
</section>

      {/* About Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-success display-6" data-aos="fade-left">About Us</h2>
            <p className="text-muted fs-5" data-aos="fade-right">
              Empowering local craftsmen to grow, showcase their work, and reach the world.
            </p>
          </div>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
              <p className="fs-5 lh-lg">
                At KaaKazini, we are passionate about supporting local craftsmen by providing a platform that helps them manage projects, showcase their unique handmade products, and grow their business. We believe in the power of craftsmanship to bring one-of-a-kind creations to the world while fostering community and opportunity.
              </p>
              <p className="fs-5 lh-lg">
                From connecting with clients to managing orders seamlessly, our platform is designed to elevate the craft and empower artisans to succeed.
              </p>
            </div>
            <div className="col-lg-6 text-center" data-aos="fade-right">
              <img 
                src="https://www.ariseiip.com/wp-content/uploads/2022/06/textile.png" 
                alt="Craftsmen at Work" 
                className="img-fluid rounded shadow-lg" 
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

{/* Services Section */}
<section className="py-5 bg-light" id="services">
  <div className="container overflow-hidden">
    <h2 className="text-center fw-bold text-success display-6" data-aos="fade-left">
      Explore Our Services
    </h2>
    <p className="text-center fs-5 lh-lg" data-aos="fade-right">
      Discover skilled services offered by experienced craftsmen.
    </p>

    {filteredServices.length === 0 ? (
      <p className="text-center">No services found.</p>
    ) : (
      <>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {filteredServices.map((service, idx) => {
            const imageUrl = service.services?.[0]?.image || service.service_image || "https://via.placeholder.com/300";

            return (
              <div key={idx} className="col d-flex justify-content-center">
                <div className="card border-0 shadow" style={{ width: '18rem' }}>
                  <div className="position-relative">
                    <img
                      src={getImageUrl(imageUrl)}
                      alt={service.primary_service}
                      className="card-img-top"
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white bg-dark bg-opacity-50 overlay">
                      <h5 className="fw-bold">{service.primary_service}</h5>
                    </div>
                  </div>
                 <div className="card-body text-center">
  <h5 className="card-title fw-bold mb-1">{service.service || service.primary_service}</h5>
  {service.location && (
    <p className="mb-0">
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-success fw-bold text-decoration-none"
      >
        <i className="fas fa-map-marker-alt me-1"></i> {service.location} 
      </a>
    </p>
  )}
</div>


                </div>
              </div>
            );
          })}
        </div>

        {/* Button below the services grid */}
        <div className="text-center mt-4">
          <a
            href="/services"
            className="btn btn-success btn-lg fw-bold"
            style={{ backgroundColor: '#198754', borderColor: '#198754' }}
          >
            View Our Services
          </a>
        </div>
      </>
    )}

    <style>{`
      .overlay {
        opacity: 0;
        transition: opacity 0.4s ease-in-out;
      }
      .position-relative:hover .overlay {
        opacity: 1;
      }
    `}</style>
  </div>
</section>


     {/* How It Works Section */}
<section className="py-5 bg-light" id="how-it-works">
  <div className="container">
    <h2 className="text-center fw-bold text-success display-6 mb-5" data-aos="fade-left">How It Works</h2> 
    <div className="row text-center d-flex justify-content-center">
      <div className="col-12">
        <div className="how-it-works-steps">
          {/* Step 1: Post Project */}
          <div className="step-item">
            <div className="step-icon-wrapper">
              <span className="step-number">1</span>
              <div className="step-icon">
                <i className="bi bi-file-earmark-plus"></i>
              </div>
            </div>
            <div className="step-content">
              <h5 className="fw-bold" data-aos="fade-left">Post Project</h5>
                            <p className="text-center fs-5 lh-lg" data-aos="fade-right">
Tell us about your project, and skilled craftsmen will start responding within 24 hours.</p>
            </div>
          </div>

          {/* Step 2: Browse Quotes */}
          <div className="step-item">
            <div className="step-icon-wrapper">
              <span className="step-number">2</span>
              <div className="step-icon">
                <i className="bi bi-search"></i>
              </div>
            </div>
            <div className="step-content">
              <h5 className="fw-bold" data-aos="fade-left">Browse Quotes</h5>
              <p className="text-center fs-5 lh-lg" data-aos="fade-right">
  Review applications and quotes from various craftsmen to find the best fit for you.
</p>

            </div>
          </div>

          {/* Step 3: Leave Review */}
          <div className="step-item">
            <div className="step-icon-wrapper">
              <span className="step-number">3</span>
              <div className="step-icon">
                <i className="bi bi-chat-right-dots"></i>
              </div>
            </div>
            <div className="step-content">
              <h5 className="fw-bold" data-aos="fade-left">Leave Review</h5>
              <p className="text-center fs-5 lh-lg" data-aos="fade-right">After the job is complete, you can rate the craftsman's work and provide valuable feedback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>{`
    .how-it-works-steps {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      padding-bottom: 2rem;
    }
    .how-it-works-steps::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10%;
      right: 10%;
      height: 2px;
      background-color: #e9ecef;
      z-index: 0;
      /* Animation for the line */
      background-image: linear-gradient(to right, #e9ecef 33%, rgba(255,255,255,0) 0%);
      background-position: top;
      background-size: 15px 2px;
      animation: dash 60s linear infinite; /* Increased duration for subtlety */
    }
    @keyframes dash {
      from { background-position: 0px top; }
      to { background-position: -1000px top; }
    }

    .step-item {
      position: relative;
      z-index: 1;
      text-align: center;
      flex: 1;
      padding: 0 1rem;
      transition: transform 0.3s ease-out;
    }
    .step-item:hover {
      transform: translateY(-5px); /* Slight lift on hover */
    }

    .step-icon-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .step-number {
      position: absolute;
      top: -10px;
      right: -10px;
      background-color: #198754; /* Changed to yellow */
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.9rem;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); /* yellow shadow */
      animation: pulse-glow 2s infinite; /* Pulsing glow */
    }
    @keyframes pulse-glow {
      0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); } /* yellow shadow */
      70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); } /* yellow shadow */
      100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); } /* yellow shadow */
    }

    .step-icon {
      background-color: white;
      color: #198754; /* Changed to yellow */
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease-in-out; /* Smooth transitions for hover */
      animation: icon-pop 0.6s ease-out; /* Initial pop animation */
      animation-fill-mode: backwards; /* Ensures starting state before animation */
    }
    .step-item:nth-child(1) .step-icon { animation-delay: 0.1s; }
    .step-item:nth-child(2) .step-icon { animation-delay: 0.2s; }
    .step-item:nth-child(3) .step-icon { animation-delay: 0.3s; }

    @keyframes icon-pop {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); }
    }

    .step-icon:hover {
      transform: scale(1.1); /* Slightly enlarge on hover */
      box-shadow: 0 8px 20px rgba(0,0,0,0.2); /* Deeper shadow on hover */
      color: #157347; /* Slightly darker yellow on hover */
    }
    .step-content h5 {
      color: #343a40;
    }
    .step-content p {
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      .how-it-works-steps {
        flex-direction: column;
        align-items: center;
        padding-bottom: 0;
      }
      .how-it-works-steps::before {
        display: none; /* Hide the line on small screens */
      }
      .step-item {
        margin-bottom: 2rem;
      }
    }
  `}</style>
</section>

<section className="py-5 bg-light">
  <div className="container">
{/* Hero/About Section */}
<div className="row align-items-center mb-5">
  {/* Text */}
  <div className="col-md-6">
  <h2 className="fw-bold display-6" style={{ color: '#198754' }}>
    Hire Skilled Craftsmen & Artisans Effortlessly
  </h2>
  <p className="text-muted fs-5 lh-lg">
    We connect you with verified, skilled artisans across plumbing, electrical work, carpentry, painting, tiling, and more. Browse portfolios, check certifications, and hire the right professional for your project — fast, reliable, and hassle-free.
  </p>
  <a
    href="/craftsmen"
    className="btn btn-lg fw-bold mt-3"
    style={{ backgroundColor: '#198754', borderColor: '#198754', color: '#fff' }}
  >
    Find & Hire Craftsmen
  </a>
</div>


  {/* Images */}
  <div className="col-md-6 position-relative">
    {/* Main Image */}
    <img
      src="https://couplingz.com/wp-content/uploads/2025/01/Couplingz-Plumbers-12.jpg"
      className="img-fluid rounded shadow-sm"
      alt="Skilled plumber at work"
    />

    {/* Top-right offset image */}
    <img
      src="https://www.wilsonmclain.com/wp-content/uploads/2013/03/2-resized.png"
      className="img-fluid rounded shadow-sm position-absolute"
      style={{ top: '-20px', right: '0', width: '45%', zIndex: 2 }}
      alt="Tools and equipment"
    />

    {/* Bottom-left offset image */}
    <img
      src="https://www.shutterstock.com/image-photo/man-worker-building-wooden-frame-600nw-2215979483.jpg"
      className="img-fluid rounded shadow-sm position-absolute"
      style={{ bottom: '-20px', left: '0', width: '45%', zIndex: 1 }}
      alt="Carpentry project"
    />
  </div>
</div>

    
  </div>
</section>

 


   <section className="py-5 bg-light">
  <div className="container">
    <h2
      className="text-center fw-bold text-success display-6 mb-5"
      data-aos="fade-left"
    >
      What Our Clients Say
    </h2>
    <div className="row justify-content-center">
      {[
        {
          quote:
            "The carpenter I hired was extremely professional. Highly recommend!",
          stars: 4,
          name: "Sarah M.",
        },
        {
          quote: "The metalworker exceeded my expectations. Great job!",
          stars: 5,
          name: "James K.",
        },
        {
          quote:
            "The textile artist made a beautiful custom outfit. Loved it!",
          stars: 3.5,
          name: "Linda O.",
        },
      ].map((testi, idx) => (
        <div className="col-md-4 mb-4" key={idx}>
          <div className="card h-100 border-0 testimonial-card-glow text-center shadow-lg flip-right-infinite">
            <div className="card-body d-flex flex-column align-items-center p-4">
              <i className="bi bi-quote display-4 text-muted mb-2"></i>
              <p className="card-text fst-italic flex-grow-1 mb-3">
                "{testi.quote}"
              </p>
              <div className="text-warning mb-2">
                {[...Array(Math.floor(testi.stars))].map((_, i) => (
                  <i key={i} className="fas fa-star" />
                ))}
                {testi.stars % 1 !== 0 && <i className="fas fa-star-half-alt" />}
                {[...Array(5 - Math.ceil(testi.stars))].map((_, i) => (
                  <i key={i} className="far fa-star" />
                ))}
              </div>
              <h5 className="card-title mt-3 fw-bold text-yellow">
                – {testi.name}
              </h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    .testimonial-card-glow {
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
      border-radius: 0.75rem;
      background-color: #fff;
    }

    .testimonial-card-glow:hover {
      transform: translateY(-10px);
      box-shadow: 0 0.5rem 2rem rgba(33, 253, 13, 0.3),
                  0 0.25rem 1rem rgba(0,0,0,0.1) !important;
    }

    .testimonial-card-glow .card-body p {
      font-size: 1.15rem;
      color: #495057;
    }

    .testimonial-card-glow .card-body h5 {
      color: #2fc552;
      margin-top: 1rem;
    }

    .text-yellow {
      color: #2fc552;
    }

    .testimonial-card-glow .bi-quote {
      font-size: 3.5rem;
      color: #adb5bd;
    }

    .testimonial-card-glow .text-warning i {
      color: #ffc107;
    }
  `}</style>
</section>

     {/* Impact / Statistics */}
<section className="py-5 bg-light text-center" id="impact">
  <div className="container">
    <div className="row text-center justify-content-center">
      {[
        { icon: "bi-people-fill", label: "Active Craftsmen", value: 100 },
        { icon: "bi-clipboard-check", label: "Jobs Completed", value: 50 },
        { icon: "bi-emoji-smile-fill", label: "Happy Clients", value: 30 },
        { icon: "bi-shop", label: "Shops Connected", value: 2 },
      ].map((stat, idx) => (
        <div className="col-md-3 mb-4" key={idx}>
          <i 
            className={`bi ${stat.icon} mb-2`}
            style={{ fontSize: "2.5rem", color: "#28a745" }}
          ></i>
          <h3 className="fw-bold">{stat.value}+</h3>
          <p className="mb-0 fw-bold">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>





{/* Add this global CSS for hover effect */}
<style>{`
  .hover-zoom {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .hover-zoom:hover {
    transform: scale(1.08);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    z-index: 10;
  }
`}</style>


    <section className="py-5 bg-white">
  <div className="container">
    <h2 className="text-center mb-5 fw-bold text-success" data-aos="fade-left">Frequently Asked Questions</h2>
    <div className="row justify-content-center">
      <div className="col-lg-12">
        <div className="accordion faq-accordion shadow-lg rounded-3" id="faqAccordion" data-aos="fade-right">
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
                  className={`accordion-button faq-button fw-bold ${index !== 0 ? 'collapsed' : ''}`}
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
                <div className="accordion-body text-secondary">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  
  <style>{`
    .faq-accordion {
      border: none !important;
    }
    .text-yellow{
      color: #2fc552;
    }
    .accordion-item {
      border: none !important;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.05);
      transition: box-shadow 0.3s ease-in-out;
    }
    .accordion-item:hover {
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1);
    }
    .accordion-button.faq-button {
      background-color: #f8f9fa;
      color: #343a40;
      padding: 1.5rem;
      transition: background-color 0.3s ease-in-out;
    }
    .accordion-button.faq-button:hover {
      background-color: #e9ecef;
    }
    .accordion-button:not(.collapsed) {
      background-color: #e9ecef;
      color: #2fc552;
    }
    .accordion-button:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
    }
    .accordion-button::after {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23212529'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
      transition: transform 0.3s ease-in-out;
    }
    .accordion-button:not(.collapsed)::after {
      transform: rotate(-180deg);
    }
    .accordion-body {
      padding: 1.5rem;
    }
  `}</style>
</section>

<footer className="footer text-light pt-5 pb-4 mt-5">
  <div className="container">
    <div className="row">
      {/* Quick Links */}
      <div className="col-lg-3 col-md-6 mb-4">
        <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Quick Links</h5>
        <ul className="list-unstyled" data-aos="fade-right">
          <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
          <li className="mb-2"><Link to="/signup" className="text-light text-decoration-none">Become A Craftsman</Link></li>
          <li className="mb-2"><Link to="/HireSignUp" className="text-light text-decoration-none">Hire a Craftsman</Link></li>
          <li className="mb-2"><a href="#services" className="text-light text-decoration-none">Services</a></li>
          <li className="mb-2"><a href="#how-it-works" className="text-light text-decoration-none">How It Works</a></li>
        </ul>
      </div>

      {/* Contact Info */}
      <div className="col-lg-4 col-md-6 mb-4">
        <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Contact Us</h5>
        <p><i className="fas fa-map-marker-alt me-2 " data-aos="fade-right"></i> Kisumu, Kenya</p>
        <p><i className="fas fa-envelope me-2" data-aos="fade-right"></i> support@kaakazini.com

</p>
        {/* Social Icons */}
        <div className="mt-4 social-icons" data-aos="fade-right">
          <h6 className="fw-bold mb-3">Follow Us</h6>
          <a href="#" className="me-3 text-light"><i className="fab fa-facebook-f fa-lg"></i></a>
          <a href="#" className="me-3 text-light"><i className="fab fa-twitter fa-lg"></i></a>
          <a href="#" className="me-3 text-light"><i className="fab fa-instagram fa-lg"></i></a>
          <a href="#" className="me-3 text-light"><i className="fab fa-linkedin-in fa-lg"></i></a>
        </div>
      </div>
      
      {/* Map */}
      <div className="col-lg-5 col-md-12 mb-4">
        <h5 className="text-uppercase fw-bold mb-3" data-aos="fade-left">Find Us</h5>
        <div className="map-container" data-aos="fade-right">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
            width="100%"
            height="300"
            style={{ border: 0 }}
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
      <p className="mb-md-0 text-center ">© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
      <div className="mt-2 mt-md-0 text-center">
        <a href="#top" className="text-light text-decoration-none">Back to top <i className="fas fa-arrow-up ms-2"></i></a>
      </div>
    </div>
  </div>

  <style>{`
    .footer {
     background-color: #1b692cff;
    }
    .footer-links li a {
      transition: color 0.3s ease-in-out;
    }
    .footer-links li a:hover {
      color: #0d6efd !important;
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
     @keyframes slide {
          0% { transform: translateX(0px); }
          100% { transform: translateX(20px); }
        }

  `
  
  
  }</style>
  <style>{`
  .hero-buttons {
    flex-wrap: nowrap !important; /* prevents wrapping on smaller screens */
    gap: 1rem;
  }

  .hero-buttons a {
    min-width: 150px;
  }

  @media (max-width: 576px) {
    .hero-buttons {
      flex-direction: row !important;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
    }
    .hero-buttons a {
      font-size: 0.9rem;
      padding: 0.6rem 1rem;
    }
  }
`}</style>

  
</footer>
    </>
  );
}

export default LandingPage; 
