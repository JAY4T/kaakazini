import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://staging.kaakazini.com/api";

export default function ClientPaymentTab({ clientId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clientId) fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(`${BASE_URL}/payments/`, {
        withCredentials: true, // ✅ cookie-based auth
      });

      const clientPayments = data.filter(
        (p) => p.client === clientId || p.client?.id === clientId
      );

      setPayments(clientPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="card p-4">
      <h4 className="mb-4">Your Payments</h4>

      {payments.length === 0 ? (
        <p className="text-muted">You have no payments yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Job</th>
                <th>Total (KSh)</th>
                <th>Company Cut (KSh)</th>
                <th>Net Payment (KSh)</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((pay) => {
                const total = pay.amount || 0;
                const companyCut = Math.floor(total * 0.1);
                const net = total - companyCut;

                return (
                  <tr key={pay.id}>
                    <td>{pay.job?.service || "N/A"}</td>
                    <td>KSh {total.toLocaleString()}</td>
                    <td>KSh {companyCut.toLocaleString()}</td>
                    <td>KSh {net.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          pay.status === "paid"
                            ? "bg-success"
                            : pay.status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {pay.status === "pending"
                          ? "Awaiting Admin Payment"
                          : pay.status === "paid"
                          ? "Paid to Craftsman"
                          : "Cancelled"}
                      </span>
                    </td>
                    <td>
                      {pay.created_at
                        ? new Date(pay.created_at).toLocaleString()
                        : "—"}
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
