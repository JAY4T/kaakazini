import React from "react";

function DashboardSidebar({ activeTab, setActiveTab, handleLogout }) {
  const tabs = ["Profile", "Jobs", "Settings"];

  return (
    <div className="bg-dark text-white p-3" style={{ width: 250 }}>
      <h4 className="text-center mb-4">Craftsman Dashboard</h4>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`btn w-100 mb-2 ${activeTab === tab ? "btn-primary" : "btn-outline-light"}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
      <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default DashboardSidebar;
