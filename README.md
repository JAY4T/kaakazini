# kaakazini
Kaakazini is a full-stack web platform built with React.js (frontend) and Django REST Framework (backend), that connects craftsmen to home owners and businesses to guarantee quality, cost effective and reliable services.

# Installation Guide

# Backend (Django)

- Clone the backend repo:


- git clone https://github.com/JAY4T/kaakazini/backend.git

- cd kaakazini/backend


- Set up virtual environment:


- python3 -m venv venv


- source venv/bin/activate


- pip install -r requirements.txt


- Configure environment variables (optional):


- Run migrations and create superuser:


- python manage.py migrate


- python manage.py createsuperuser


- Start development server:


- python manage.py runserver


# Frontend (React)


- Clone the frontend repo:


- git clone https://github.com/JAY4T/kaakazini/frontend.git


- cd kaakazini/frontend


- Install dependencies:


- npm install

- Create .env file:


- REACT_APP_API_BASE_URL=http://localhost:8000/api

- Start frontend:


- npm start

# Deployment (Production)

- Provision a DigitalOcean droplet.

- Install dependencies:


- sudo apt update && sudo apt install python3-pip python3-venv nginx git

- Clone backend,

- set up Gunicorn & collectstatic.

- Build React:


- npm run build

- Configure Nginx to serve React & proxy API.


<section className="py-5 bg-light">
  <div className="container">
    <h2 className="text-center fw-bold text-success display-5 mb-5" data-aos="fade-left">What Our Clients Say</h2> {/* Increased mb for more space */}
    <div className="row justify-content-center"> {/* justify-content-center for better alignment if cards aren't full width */}
      {[
        {
          quote: "The carpenter I hired was extremely professional. Highly recommend!",
          stars: 4,
          name: "Sarah M.",
          img: "https://i.pravatar.cc/150?img=47", // Unique placeholder image
        },
        {
          quote: "The metalworker exceeded my expectations. Great job!",
          stars: 5,
          name: "James K.",
          img: "https://i.pravatar.cc/150?img=68", // Unique placeholder image
        },
        {
          quote: "The textile artist made a beautiful custom outfit. Loved it!",
          stars: 3.5,
          name: "Linda O.",
          img: "https://i.pravatar.cc/150?img=25", // Unique placeholder image
        },
      ].map((testi, idx) => (
        <div className="col-md-4 mb-4" key={idx}>
          <div className="card h-100 border-0 testimonial-card-glow text-center shadow-lg flip-right-infinite" > {/* Changed shadow-sm to shadow-lg and added testimonial-card-glow */}
            <div className="card-body d-flex flex-column align-items-center p-4"> {/* Added padding */}
              <img src={testi.img} className="rounded-circle testimonial-img-circle mb-3" alt={testi.name} /> {/* Added image */}
              <i className="bi bi-quote display-4 text-muted mb-2"></i>
              <p className="card-text fst-italic flex-grow-1 mb-3">"{testi.quote}"</p>
              <div className="text-warning mb-2">
                {[...Array(Math.floor(testi.stars))].map((_, i) => (
                  <i key={i} className="fas fa-star" />
                ))}
                {testi.stars % 1 !== 0 && (
                  <i className="fas fa-star-half-alt" />
                )}
                {[...Array(5 - Math.ceil(testi.stars))].map((_, i) => (
                  <i key={i} className="far fa-star" />
                ))}
              </div>
              <h5 className="card-title mt-3 fw-bold text-green">– {testi.name}</h5> 
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    .testimonial-card-glow {
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
      border-radius: 0.75rem; /* Slightly rounded corners */
      background-color: #fff;
    }

    .testimonial-card-glow:hover {
      transform: translateY(-10px);
      /* Custom glow effect */
      // box-shadow: 0 0.5rem 2rem rgba(13, 110, 253, 0.3), 0 0.25rem 1rem rgba(0,0,0,0.1) !important; /* Blue glow */
        box-shadow: 0 0.5rem 2rem rgba(33, 253, 13, 0.3), 0 0.25rem 1rem rgba(0,0,0,0.1) !important; /* Blue glow */
      }

    .testimonial-img-circle {
      width: 90px; /* Slightly smaller for elegance */
      height: 90px;
      object-fit: cover;
      // border: 3px solid #0d6efd; /* Blue border for the image */
      border: 3px solid #29a745;
      box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
    }

    .testimonial-card-glow .card-body p {
      font-size: 1.15rem; /* Slightly larger font for quotes */
      color: #495057; /* Darker grey for better readability */
    }

    .testimonial-card-glow .card-body h5 {
      color: #2fc552; 
      margin-top: 1rem;
    }
    .text-green{
      color: #2fc552;
    }
    .testimonial-card-glow .bi-quote {
      font-size: 3.5rem; /* Slightly larger quote icon */
      color: #adb5bd; /* Lighter grey for subtle icon */
    }

    .testimonial-card-glow .text-warning i {
      color: #ffc107; /* Standard warning yellow for stars */
    }
  `}</style>
</section>