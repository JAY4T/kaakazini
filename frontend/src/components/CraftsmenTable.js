import React from 'react';

export default function CraftsmenTable({
  list,
  filterValue,
  setFilterValue,
  isPending = false,
  getImageUrl,
  colorText,
  checkCraftsmanApprovalCriteria,
  isCraftsmanApproved,
  handleAction,
  openRejectModal
}) {
  const q = (filterValue || '').toLowerCase();
  const filtered = list.filter(c => ((c.full_name || '').toLowerCase()).includes(q));

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>{isPending ? 'Pending Craftsmen' : 'Approved Craftsmen'}</h4>
        <input
          type="text"
          className="form-control form-control-sm w-25"
          placeholder="Search..."
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />
      </div>

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
            filtered.map(c => {
              const errors = checkCraftsmanApprovalCriteria(c);

             const mainService = {
  name: c.primary_service || (c.services?.[0]?.name),
  image: c.service_images?.[0] || c.services?.[0]?.image || c.service_image || null
};


              const approved = isCraftsmanApproved(c);

              return (
                <tr key={c.id} className="align-middle">
                  <td>
                    {c.profile ? (
                      <img
                        src={getImageUrl(c.profile)}
                        alt=""
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    ) : colorText('No image', 'red')}
                  </td>
                  <td>{c.full_name || colorText('No name', 'orange')}</td>
                  <td>{c.profession || colorText('No profession', 'purple')}</td>
                  <td>{c.description || colorText('No description', 'brown')}</td>
                  <td>{mainService?.name || colorText('No service', 'blue')}</td>
                  <td>
                    {mainService?.image ? (
                      <img
                        src={getImageUrl(mainService.image)}
                        alt=""
                        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    ) : colorText('No image', 'red')}
                  </td>
                  <td>
                    {errors.length
                      ? colorText(errors.join(', '), 'red')
                      : approved
                      ? colorText('Approved', 'green')
                      : colorText('Pending', 'gray')}
                  </td>
                  {isPending && (
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        disabled={errors.length > 0}
                        onClick={() => handleAction('approve', c.id, 'craftsman', c)}
                      >
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openRejectModal(c)}>
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isPending ? 8 : 7} className="text-center text-muted">
                {isPending ? 'No pending craftsmen' : 'No approved craftsmen'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
