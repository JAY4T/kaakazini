import React from "react";
import { FaEdit, FaToggleOn, FaToggleOff, FaSearch, FaCheck, FaTimes, FaUser, FaBriefcase, FaExclamationTriangle } from "react-icons/fa";

export default function CraftsmenTable({
  list = [],
  filterValue = "",
  setFilterValue,
  isPending = false,
  getImageUrl,
  colorText,
  checkCraftsmanApprovalCriteria,
  isCraftsmanApproved,
  handleAction,
  openRejectModal,
  toggleActiveStatus,
  openEditModal,
}) {
  const query = filterValue.toLowerCase();

  const filtered = list.filter((c) =>
    (c.full_name || "").toLowerCase().includes(query)
  );

  const getRowStyle = (c, approved) => {
    if (isPending) return { backgroundColor: "#fffef0" }; // very light yellow
    if (approved) return c.is_active ? { backgroundColor: "#f0fdf9" } : { backgroundColor: "#ffffff" }; // very light green or white
    return {};
  };

  const renderStatusBadge = (c, approved, errors) => {
    if (errors.length > 0) return (
      <span className="badge bg-danger">
        {errors.length} Issue{errors.length > 1 ? 's' : ''}
      </span>
    );
    if (isPending) return (
      <span className="badge" style={{ backgroundColor: '#fbbf24', color: '#ffffff' }}>
        Pending
      </span>
    );
    if (approved) return (
      <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'}`}>
        {c.is_active ? 'Active' : 'Inactive'}
      </span>
    );
    return null;
  };

  return (
    <div className="container-fluid px-0">
      <style>{`
        /* Clean professional styles */
        .btn-group-sm > .btn {
          white-space: nowrap;
          font-size: 0.875rem;
          padding: 0.4rem 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .table tbody tr {
          transition: all 0.15s ease;
        }

        .table tbody tr:hover {
          background-color: rgba(34, 197, 94, 0.04) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .btn-group {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        .btn-group .btn {
          border-radius: 0 !important;
          border-right: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-group .btn:first-child {
          border-top-left-radius: 4px !important;
          border-bottom-left-radius: 4px !important;
        }

        .btn-group .btn:last-child {
          border-top-right-radius: 4px !important;
          border-bottom-right-radius: 4px !important;
          border-right: none;
        }

        .btn-group .btn:hover {
          filter: brightness(0.95);
          z-index: 1;
        }

        .badge {
          font-weight: 600;
          padding: 0.4rem 0.7rem;
          font-size: 0.8rem;
        }

        .input-group .form-control:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 0.15rem rgba(34, 197, 94, 0.12);
        }

        .input-group-text {
          background-color: #ffffff;
        }

        @media (max-width: 576px) {
          .btn-group-sm > .btn {
            padding: 0.35rem 0.6rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 768px) {
          .btn-group-sm > .btn {
            padding: 0.4rem 0.7rem;
          }
        }
      `}</style>
      {/* Header Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6">
              <h4 className="mb-0 fw-bold text-dark">
                {isPending ? "Pending Craftsmen" : "Approved Craftsmen"}
                <span className="ms-3 badge rounded-pill" style={{ 
                  backgroundColor: isPending ? '#fbbf24' : '#22c55e',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  padding: '0.4rem 0.8rem'
                }}>
                  {filtered.length}
                </span>
              </h4>
            </div>

            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ borderColor: '#22c55e' }}>
                  <FaSearch className="text-success" size={14}/>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search craftsmen by name..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  style={{ 
                    borderColor: '#22c55e',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #22c55e 100%)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <tr>
                  <th className="text-dark fw-bold border-0 py-3 ps-3 ps-md-4" style={{ minWidth: '90px' }}>Profile</th>
                  <th className="text-dark fw-bold border-0 py-3" style={{ minWidth: '140px' }}>Full Name</th>
                  <th className="text-dark fw-bold border-0 py-3 d-none d-lg-table-cell" style={{ minWidth: '130px' }}>Profession</th>
                  <th className="text-dark fw-bold border-0 py-3 d-none d-xl-table-cell" style={{ minWidth: '200px' }}>Description</th>
                  <th className="text-dark fw-bold border-0 py-3 d-none d-md-table-cell" style={{ minWidth: '130px' }}>Service</th>
                  <th className="text-dark fw-bold border-0 py-3 d-none d-lg-table-cell" style={{ minWidth: '100px' }}>Service Image</th>
                  <th className="text-dark fw-bold border-0 py-3" style={{ minWidth: '110px' }}>Status</th>
                  <th className="text-dark fw-bold border-0 py-3 pe-3 pe-md-4" style={{ minWidth: '200px' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((c) => {
                    const errors = checkCraftsmanApprovalCriteria(c);
                    const approved = isCraftsmanApproved(c);
                    const mainService = {
                      name: c.primary_service || c.services?.[0]?.service_name || null,
                      image: c.services?.[0]?.image || c.service_image || null,
                    };

                    return (
                      <tr 
                        key={c.id} 
                        style={{
                          ...getRowStyle(c, approved),
                          borderLeft: isPending ? '3px solid #fbbf24' : approved && c.is_active ? '3px solid #22c55e' : '3px solid #e5e7eb'
                        }}
                        className="border-bottom"
                      >
                        <td className="ps-3 ps-md-4">
                          {c.profile ? (
                            <img
                              src={getImageUrl(c.profile)}
                              alt="Profile"
                              className="rounded-circle shadow-sm"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                border: "2px solid #22c55e"
                              }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/50x50?text=No+Image"; }}
                            />
                          ) : (
                            <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", borderColor: '#22c55e' }}>
                              <FaUser className="text-success" size={20}/>
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                            {c.full_name || colorText("No name", "orange")}
                          </div>
                        </td>

                        <td className="d-none d-lg-table-cell">{c.profession || colorText("No profession", "purple")}</td>

                        <td className="d-none d-xl-table-cell">
                          <div className="text-muted small" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.description}>
                            {c.description || colorText("No description", "brown")}
                          </div>
                        </td>

                        <td className="d-none d-md-table-cell">
                          <span className="badge bg-light text-dark border px-2 py-2" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                            {mainService.name || colorText("No service", "blue")}
                          </span>
                        </td>

                        <td className="d-none d-lg-table-cell">
                          {mainService.image ? (
                            <img
                              src={getImageUrl(mainService.image)}
                              alt="Service"
                              className="rounded shadow-sm"
                              style={{ width: "65px", height: "50px", objectFit: "cover", border: "2px solid #22c55e" }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/65x50?text=No+Image"; }}
                            />
                          ) : (
                            <div className="rounded bg-light border d-inline-flex align-items-center justify-content-center" style={{ width: "65px", height: "50px", borderColor: '#22c55e' }}>
                              <FaBriefcase className="text-success" size={18}/>
                            </div>
                          )}
                        </td>

                        <td>{renderStatusBadge(c, approved, errors)}</td>

                        <td className="pe-3 pe-md-4">
                          <div className="btn-group btn-group-sm" role="group">
                            {isPending && (
                              <>
                                <button 
                                  className="btn btn-success" 
                                  disabled={errors.length > 0} 
                                  onClick={() => handleAction("approve", c.id, "craftsman", c)}
                                  title="Approve"
                                >
                                  <span className="d-none d-sm-inline">Approve</span>
                                  <span className="d-inline d-sm-none"><FaCheck /></span>
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => openRejectModal(c)}
                                  title="Reject"
                                >
                                  <span className="d-none d-sm-inline">Reject</span>
                                  <span className="d-inline d-sm-none"><FaTimes /></span>
                                </button>
                              </>
                            )}
                            <button 
                              className="btn btn-primary" 
                              onClick={() => openEditModal(c)}
                              title="Edit"
                            >
                              <span className="d-none d-sm-inline">Edit</span>
                              <span className="d-inline d-sm-none"><FaEdit /></span>
                            </button>
                            {!isPending && (
                              <button 
                                className={`btn ${c.is_active ? "btn-warning" : "btn-success"}`} 
                                onClick={() => toggleActiveStatus(c)}
                                title={c.is_active ? "Deactivate" : "Activate"}
                              >
                                {c.is_active ? (
                                  <>
                                    <span className="d-none d-sm-inline">Deactivate</span>
                                    <span className="d-inline d-sm-none"><FaToggleOn /></span>
                                  </>
                                ) : (
                                  <>
                                    <span className="d-none d-sm-inline">Activate</span>
                                    <span className="d-inline d-sm-none"><FaToggleOff /></span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <p className="text-muted mb-0">
                        {isPending ? "No pending craftsmen at this time" : "No craftsmen found matching your search"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
