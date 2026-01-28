import React from "react";

export default function AdminPaymentDashboard({
  jobsReadyForPayment = [],
  processPayment,
  processingJobId, // 🔒 lock button while paying
}) {
  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4 className="mb-3">Payment Dashboard</h4>

      {jobsReadyForPayment.length === 0 ? (
        <p className="text-muted">No payments to process.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Client</th>
                <th>Job</th>
                <th>Total (KSh)</th>
                <th>Company Cut</th>
                <th>Net</th>
                <th>Craftsman Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobsReadyForPayment.map((job) => {
                const total = job.budget || 0;
                const companyCut = Math.floor(total * 0.1);
                const net = total - companyCut;

                return (
                  <tr key={job.id}>
                    <td>{job.name}</td>
                    <td>{job.service}</td>
                    <td>KSh {total.toLocaleString()}</td>
                    <td>KSh {companyCut.toLocaleString()}</td>
                    <td>KSh {net.toLocaleString()}</td>
                    <td>{job.craftsman?.phone || "—"}</td>

                    <td>
                      <span className="badge bg-warning text-dark">
                        Awaiting Payment
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={processingJobId === job.id}
                        onClick={() => processPayment(job.id)}
                      >
                        {processingJobId === job.id
                          ? "Processing..."
                          : "Send Payment"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
