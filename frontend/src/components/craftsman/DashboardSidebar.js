import React from "react";
import {
  BsPerson, BsBriefcase, BsPeopleFill, BsGear,
  BsBoxArrowRight, BsGraphUp, BsSpeedometer2,
} from "react-icons/bs";
import { FaBuilding, FaUser, FaTimes } from "react-icons/fa";

function DashboardSidebar({ activeTab, setActiveTab, handleLogout, accountType, isOpen, onClose }) {

  const tabs = [
    { name: "Dashboard", icon: <BsSpeedometer2 />, label: "Dashboard" },
    { name: "Analytics", icon: <BsGraphUp />,      label: "Analytics" },
    { name: "Profile",   icon: <BsPerson />,       label: "Profile"   },
    { name: "Jobs",      icon: <BsBriefcase />,    label: "Jobs"      },
    ...(accountType === "Company"
      ? [{ name: "Members", icon: <BsPeopleFill />, label: "Team Members" }]
      : []
    ),
    { name: "Settings",  icon: <BsGear />,         label: "Settings"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .craftsman-sidebar {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          box-shadow: 4px 0 30px rgba(0,0,0,.2);
          width: 260px;
          min-height: 100vh;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          /* Desktop: always visible */
        }

        /* ── Mobile: slide-in drawer ── */
        @media (max-width: 991px) {
          .craftsman-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform .3s cubic-bezier(.4,0,.2,1);
            min-height: 100vh;
            overflow-y: auto;
            /* Prevent background scroll bleed */
            overscroll-behavior: contain;
          }
          .craftsman-sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-logo {
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg,#fbbf24,#22c55e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -.5px;
        }
        .sidebar-subtitle { color: #9ca3af; font-size: .8rem; font-weight: 500; }

        .account-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 50px; font-size: .72rem; font-weight: 700;
          margin-top: 8px;
          background: rgba(34,197,94,.15); color: #86efac; border: 1px solid rgba(34,197,94,.2);
        }

        .nav-btn {
          border: none !important; background: transparent !important;
          color: #d1d5db !important; padding: .875rem 1rem !important;
          border-radius: 12px !important; font-weight: 600 !important;
          font-size: .9375rem !important; transition: all .3s !important;
          margin-bottom: .5rem !important; display: flex; align-items: center;
          gap: 10px; width: 100%; text-align: left; cursor: pointer;
        }
        .nav-btn:hover {
          color: white !important; transform: translateX(4px);
          background: rgba(34,197,94,.18) !important;
        }
        .nav-btn.active {
          color: white !important;
          background: linear-gradient(135deg,rgba(34,197,94,.35),rgba(34,197,94,.15)) !important;
          box-shadow: 0 6px 20px rgba(34,197,94,.2) !important;
          border-left: 3px solid #22c55e !important;
        }
        .nav-btn.analytics-btn.active {
          background: linear-gradient(135deg,rgba(251,191,36,.25),rgba(34,197,94,.15)) !important;
          border-left-color: #fbbf24 !important;
          box-shadow: 0 6px 20px rgba(251,191,36,.15) !important;
        }
        .nav-btn.analytics-btn:hover { background: rgba(251,191,36,.12) !important; }

        .nav-icon { font-size: 1.2rem; flex-shrink: 0; }

        .logout-btn {
          background: rgba(239,68,68,.1) !important;
          border: 2px solid rgba(239,68,68,.2) !important;
          color: #f87171 !important; padding: .875rem 1rem !important;
          border-radius: 12px !important; font-weight: 600 !important;
          transition: all .3s !important; display: flex; align-items: center;
          gap: 10px; width: 100%; cursor: pointer;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,.2) !important;
          color: #fca5a5 !important; transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239,68,68,.2) !important;
        }

        .sidebar-divider { border: none; border-top: 1px solid rgba(255,255,255,.08); margin: 1rem 0; }

        .nav-new-badge {
          margin-left: auto;
          background: linear-gradient(135deg,#fbbf24,#22c55e);
          color: #1f2937; font-size: .58rem; font-weight: 800;
          padding: 2px 7px; border-radius: 50px; letter-spacing: .3px; flex-shrink: 0;
        }

        /* Close button — only shows on mobile */
        .sidebar-close-btn {
          display: none;
          background: rgba(255,255,255,.1);
          border: none; border-radius: 10px;
          width: 36px; height: 36px;
          color: white; cursor: pointer;
          align-items: center; justify-content: center;
          transition: background .2s; flex-shrink: 0;
        }
        .sidebar-close-btn:hover { background: rgba(255,255,255,.2); }

        @media (max-width: 991px) {
          .sidebar-close-btn { display: flex; }
        }
      `}</style>

      <div className={`craftsman-sidebar text-white ${isOpen ? "open" : ""}`}>

        {/* Logo row — with close button on mobile */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem", paddingBottom:"1rem", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
          <div style={{ textAlign:"left" }}>
            <h4 className="sidebar-logo mb-1">Kaakazini</h4>
            <div className="sidebar-subtitle">Craftsman Dashboard</div>
            {accountType && (
              <div className="account-chip">
                {accountType === "Company" ? <FaBuilding size={10}/> : <FaUser size={10}/>}
                {accountType} Account
              </div>
            )}
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <FaTimes size={16}/>
          </button>
        </div>

        {/* Navigation */}
        <div style={{ flexGrow: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.name}
              className={`nav-btn ${activeTab === tab.name ? "active" : ""} ${tab.name === "Analytics" ? "analytics-btn" : ""}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
              {tab.name === "Analytics" && activeTab !== "Analytics" && (
                <span className="nav-new-badge">NEW</span>
              )}
            </button>
          ))}
        </div>

        <hr className="sidebar-divider" />

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <BsBoxArrowRight style={{ fontSize: "1.2rem" }} />
          Logout
        </button>
      </div>
    </>
  );
}

export default DashboardSidebar;
