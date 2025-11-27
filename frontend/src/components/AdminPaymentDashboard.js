
import React from "react";

export default function AdminPaymentDashboard({ jobsReadyForPayment, processPayment }) {
  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4>Payment Dashboard</h4>
      {jobsReadyForPayment.length === 0 ? (
        <p className="text-muted mt-3">No payments to process.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover mt-3">
            <thead>
              <tr>
                <th>Client</th>
                <th>Job</th>
                <th>Total Payment (KSh)</th>
                <th>Company Cut (KSh)</th>
                <th>Net Payment (KSh)</th>
                <th>Craftsman Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobsReadyForPayment.map((job) => {
                const total = job.budget || 0;
                const companyCut = Math.floor(total * 0.1); // 10% fee
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
                      <span
                        className={`badge ${
                          job.payment_status === "paid"
                            ? "bg-success"
                            : job.payment_status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {job.payment_status === "pending"
                          ? "Awaiting Payment"
                          : job.payment_status === "paid"
                          ? "Sent to Craftsman"
                          : "Cancelled"}
                      </span>
                    </td>
                    <td>
                      {job.payment_status === "pending" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => processPayment(job.id)}
                        >
                          Send Payment
                        </button>
                      )}
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
