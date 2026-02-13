import React from "react";
import { Button } from "react-bootstrap";
import { BsPerson, BsBriefcase, BsGear, BsBoxArrowRight } from "react-icons/bs";

function DashboardSidebar({ activeTab, setActiveTab, handleLogout }) {
  const tabs = [
    { name: "Profile", icon: <BsPerson /> },
    { name: "Jobs", icon: <BsBriefcase /> },
    { name: "Settings", icon: <BsGear /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .craftsman-sidebar {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          box-shadow: 4px 0 30px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .craftsman-sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .sidebar-header {
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .sidebar-logo {
          font-size: 1.5rem;
          font-weight: 800;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .sidebar-subtitle {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nav-button {
          position: relative;
          border: none !important;
          background: transparent !important;
          color: #d1d5db !important;
          padding: 0.875rem 1rem !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 0.9375rem !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          margin-bottom: 0.5rem !important;
          overflow: hidden;
        }

        .nav-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
          z-index: 0;
        }

        .nav-button > * {
          position: relative;
          z-index: 1;
        }

        .nav-button:hover {
          color: white !important;
          transform: translateX(4px);
          background: rgba(34, 197, 94, 0.2) !important;
        }

        .nav-button:hover::before {
          opacity: 0.2;
        }

        /* Ensure text is visible on hover */
        .nav-button:hover span,
        .nav-button:hover .nav-icon {
          color: white !important;
          opacity: 1 !important;
        }

        .nav-button.active {
          color: white !important;
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.35) !important;
        }

        .nav-button.active::before {
          opacity: 1;
        }

        .nav-button:active {
          transform: translateX(2px) scale(0.98);
        }

        .nav-icon {
          font-size: 1.375rem !important;
          margin-right: 0.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .logout-button {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 2px solid rgba(239, 68, 68, 0.2) !important;
          color: #f87171 !important;
          padding: 0.875rem 1rem !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 0.9375rem !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          margin-top: 1rem;
        }

        .logout-button:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #fca5a5 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25) !important;
        }

        .logout-button:active {
          transform: translateY(0) !important;
        }

        .logout-icon {
          font-size: 1.25rem !important;
          margin-right: 0.75rem;
        }
      `}</style>

      <div
        className="d-flex flex-column craftsman-sidebar text-white p-3"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        {/* Logo / Header */}
        <div className="mb-4 text-center sidebar-header">
          <h4 className="fw-bold sidebar-logo">Kaakazini</h4>
          <small className="sidebar-subtitle">Craftsman Dashboard</small>
        </div>

        {/* Navigation */}
        <div className="flex-grow-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`btn d-flex align-items-center w-100 text-start nav-button ${
                activeTab === tab.name ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.name)}
              style={{ gap: "10px" }}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="danger"
          className="d-flex align-items-center w-100 mt-auto logout-button"
          style={{ gap: "10px" }}
          onClick={handleLogout}
        >
          <BsBoxArrowRight className="logout-icon" />
          Logout
        </Button>
      </div>
    </>
  );
}

export default DashboardSidebar;
