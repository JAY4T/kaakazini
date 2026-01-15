import React, { useState, useEffect } from 'react';
import c2 from '../assets/c2.png';
import c3 from '../assets/c3.png';
import c4 from '../assets/c4.png';
import c5 from '../assets/c5.png';
import c6 from '../assets/c6.png';
import c7 from '../assets/c7.png';
import c8 from '../assets/c8.png';

export default function Coverflow() {
  const images = [c2, c3, c4, c5, c6, c7, c8];
  const [active, setActive] = useState(3);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const getClass = (index) => {
    const len = images.length;
    // Calculate shortest distance in a circular array
    let diff = index - active;
    
    // Logic to handle infinite wrap-around distance
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    if (diff === 0) return "active";
    if (diff === -1) return "left1";
    if (diff === 1) return "right1";
    if (diff === -2) return "left2";
    if (diff === 2) return "right2";
    return "hidden";
  };

  return (
    <div className="coverflow-wrapper mb-5">
      <div className="coverflow-container">
        {/* Navigation Arrows moved outside */}
        <button className="nav prev" onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}>‹</button>
        
        <div className="coverflow">
          {images.map((img, i) => (
            <div key={i} className={`coverflow-item ${getClass(i)}`}>
              <img src={img} alt={`carousel-${i}`} />
            </div>
          ))}
        </div>

        <button className="nav next" onClick={() => setActive((a) => (a + 1) % images.length)}>›</button>
      </div>

      {/* Indicators */}
      <div className="dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      <style>{`
        .coverflow-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .coverflow-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1200px;
          position: relative;
        }

        .coverflow {
          perspective: 1400px;
          position: relative;
          width: 100%;
          height: 320px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
        }

        .coverflow-item {
          position: absolute;
          width: 420px;
          height: 260px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          pointer-events: none;
        }

        .coverflow-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .active {
          transform: translateX(0) scale(1);
          z-index: 5;
          opacity: 1;
          pointer-events: auto;
        }

        .left1 {
          transform: translateX(-240px) scale(0.85) rotateY(35deg);
          z-index: 4;
          opacity: 0.8;
        }

        .right1 {
          transform: translateX(240px) scale(0.85) rotateY(-35deg);
          z-index: 4;
          opacity: 0.8;
        }

        .left2 {
          transform: translateX(-400px) scale(0.7) rotateY(45deg);
          z-index: 3;
          opacity: 0.4;
        }

        .right2 {
          transform: translateX(400px) scale(0.7) rotateY(-45deg);
          z-index: 3;
          opacity: 0.4;
        }

        .hidden {
          opacity: 0;
          z-index: 0;
        }

        /* Nav Arrows Styling */
        .nav {
          background: none;
          border: none;
          color: #198754;
          font-size: 4rem;
          cursor: pointer;
          z-index: 10;
          padding: 0 20px;
          transition: color 0.3s;
          line-height: 1;
        }

        .nav:hover {
          color: #146c43;
        }

        .dots {
          margin-top: 20px;
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ccc;
          cursor: pointer;
          transition: background 0.3s;
        }

        .dot.active {
          background: #198754;
        }

        @media (max-width: 992px) {
          .coverflow-item { width: 320px; height: 200px; }
          .left1 { transform: translateX(-180px) scale(0.85); }
          .right1 { transform: translateX(180px) scale(0.85); }
          .left2, .right2 { opacity: 0; }
        }

        @media (max-width: 768px) {
          .nav { display: none; }
          .coverflow-item { width: 280px; height: 180px; }
          .left1 { transform: translateX(-100px) scale(0.8); }
          .right1 { transform: translateX(100px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}