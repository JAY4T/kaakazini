import React from 'react';

export default function RejectModal({ show, rejectReason, setRejectReason, confirmReject, closeModal }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reject Craftsman</h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <label>Reason for rejection:</label>
            <textarea
              className="form-control mt-2"
              rows="4"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmReject}>
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
