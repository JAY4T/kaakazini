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
    <div
      className="d-flex flex-column bg-dark text-white p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      {/* Logo / Header */}
      <div className="mb-4 text-center">
        <h4 className="fw-bold">Craftsman Dashboard</h4>
        <small className="text-muted">Manage your account</small>
      </div>

      {/* Navigation */}
      <div className="flex-grow-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`btn d-flex align-items-center w-100 mb-2 text-start ${
              activeTab === tab.name
                ? "btn-primary text-white"
                : "btn-outline-light text-white"
            }`}
            onClick={() => setActiveTab(tab.name)}
            style={{ gap: "10px", borderRadius: "0.5rem" }}
          >
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="danger"
        className="d-flex align-items-center w-100 mt-auto"
        style={{ gap: "10px", borderRadius: "0.5rem" }}
        onClick={handleLogout}
      >
        <BsBoxArrowRight />
        Logout
      </Button>
    </div>
  );
}

export default DashboardSidebar;
