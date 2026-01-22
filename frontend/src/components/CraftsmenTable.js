import React from "react";

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
}) {
  const query = filterValue.toLowerCase();

  const filtered = list.filter((c) =>
    (c.full_name || "").toLowerCase().includes(query)
  );

  return (
    <>
      {/* Header + Search */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          {isPending ? "Pending Craftsmen" : "Approved Craftsmen"}
        </h4>

        <input
          type="text"
          className="form-control form-control-sm w-25"
          placeholder="Search by name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover bg-white">
        <thead className="table-primary">
          <tr>
            <th>Profile</th>
            <th>Full Name</th>
            <th>Profession</th>
            <th>Description</th>
            <th>Service</th>
            <th>Service Image</th>
            <th>Status / Issues</th>
            {isPending && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((c) => {
              const errors = checkCraftsmanApprovalCriteria(c);
              const approved = isCraftsmanApproved(c);

              const mainService = {
                name:
                  c.primary_service ||
                  c.services?.[0]?.service_name ||
                  null,
                image: c.services?.[0]?.image || c.service_image || null,
              };

              return (
                <tr key={c.id} className="align-middle">
                  {/* Profile Image */}
                  <td>
                    {c.profile ? (
                      <img
                        src={getImageUrl(c.profile)}
                        alt="Profile"
                        className="rounded"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/60x60?text=No+Image";
                        }}
                      />
                    ) : (
                      colorText("No image", "red")
                    )}
                  </td>

                  {/* Name */}
                  <td>{c.full_name || colorText("No name", "orange")}</td>

                  {/* Profession */}
                  <td>
                    {c.profession || colorText("No profession", "purple")}
                  </td>

                  {/* Description */}
                  <td>
                    {c.description || colorText("No description", "brown")}
                  </td>

                  {/* Service */}
                  <td>
                    {mainService.name ||
                      colorText("No service", "blue")}
                  </td>

                  {/* Service Image */}
                  <td>
                    {mainService.image ? (
                      <img
                        src={getImageUrl(mainService.image)}
                        alt="Service"
                        className="rounded"
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80x60?text=No+Image";
                        }}
                      />
                    ) : (
                      colorText("No image", "red")
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    {errors.length > 0
                      ? colorText(errors.join(", "), "red")
                      : approved
                      ? colorText("Approved", "green")
                      : colorText("Pending", "gray")}
                  </td>

                  {/* Actions */}
                  {isPending && (
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        disabled={errors.length > 0}
                        onClick={() =>
                          handleAction("approve", c.id, "craftsman", c)
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openRejectModal(c)}
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={isPending ? 8 : 7}
                className="text-center text-muted"
              >
                {isPending
                  ? "No pending craftsmen"
                  : "No approved craftsmen"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
