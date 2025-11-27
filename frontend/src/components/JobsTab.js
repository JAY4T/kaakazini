import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Badge, Form, Row, Col, Card } from "react-bootstrap";
import { FaPhone, FaComments } from "react-icons/fa";
import { authAxios } from "../api/axiosClient";

const COMPANY_FEE_PERCENT = 10;

function JobsTab({ jobs: initialJobs = [], setJobs }) {
  const [jobs, setLocalJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalJobs(initialJobs || []);
  }, [initialJobs]);

  useEffect(() => {
    if (!selectedJob) {
      clearTimer();
      return;
    }
    const status = normalizedStatus(selectedJob.status);
    if (status === "in progress" || status === "in_progress" || status === "inprogress") {
      startTimerFrom(selectedJob.start_time);
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [selectedJob]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsed(0);
  };

  const startTimerFrom = (startISO) => {
    clearTimer();
    let start = startISO ? new Date(startISO) : new Date();
    const update = () => {
      const now = new Date();
      const diffMs = Math.max(0, now - start);
      setElapsed(Math.floor(diffMs / 1000));
    };
    update();
    timerRef.current = setInterval(update, 1000);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setProofFiles([]);
  };

  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
    setUploading(false);
    setActionLoading(false);
    clearTimer();
  };

  const normalizedStatus = (status) =>
    (status || "").toString().toLowerCase().replace(/[_]/g, " ");

  const updateJobStatus = async (jobId, action, files = null) => {
    try {
      setActionLoading(true);
      const url = `/job-requests/${jobId}/${action}/`;

      if (files && files.length) {
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("proof_files", f));
        const res = await authAxios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        applyUpdatedJob(res.data);
      } else {
        const res = await authAxios.post(url, {});
        applyUpdatedJob(res.data);
      }
    } catch (err) {
      console.error("updateJobStatus error:", err);
      alert("Failed to update job. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const applyUpdatedJob = (updatedJob) => {
    if (typeof setJobs === "function") {
      setJobs((prev) =>
        Array.isArray(prev)
          ? prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
          : prev
      );
    }
    setLocalJobs((prev) =>
      Array.isArray(prev)
        ? prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        : prev
    );
    setSelectedJob(updatedJob);
  };

  const handleAcceptJob = (id) => updateJobStatus(id, "accept");

  const handleRejectJob = (id) => {
    if (!window.confirm("Are you sure you want to reject this job?")) return;
    updateJobStatus(id, "reject");
  };

  const handleStartJob = (id) => updateJobStatus(id, "start");

  const handleCompleteJob = (id) => {
    if (!proofFiles || proofFiles.length === 0)
      return alert("Please upload proof files before completing the job.");
    updateJobStatus(id, "complete", proofFiles);
    setProofFiles([]);
  };

  const handleConfirmReceived = (id) => {
    if (!window.confirm("Confirm that you have received the payment?")) return;
    updateJobStatus(id, "confirm-received");
  };

  const computePaymentBreakdown = (job) => {
    const total = parseFloat(job.total_payment ?? job.budget ?? 0) || 0;
    const companyCut = Math.round((total * COMPANY_FEE_PERCENT) / 100);
    const net = Math.round(total - companyCut);
    return { total, companyCut, net };
  };

  const showPhoneNumber = () => {
    if (!selectedJob) return "N/A";
    const status = normalizedStatus(selectedJob.status);
    const visibleStatuses = [
      "accepted",
      "in progress",
      "completed",
      "paid pending confirmation",
      "paid",
      "paid-awaiting confirmation",
      "paid awaiting confirmation",
    ];
    if (visibleStatuses.includes(status))
      return selectedJob.client?.phone || "N/A";
    return "";
  };

  const handleChat = () => {
    if (!selectedJob) return;
    alert(`Open chat with ${selectedJob.client?.full_name || "client"}`);
  };

  const formatElapsed = (sec) => {
    if (!sec && sec !== 0) return "N/A";
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="card p-4 shadow-sm border-0">
      <h4 className="mb-3 fw-bold">Assigned Jobs (Craftsman)</h4>

      {(!jobs || jobs.length === 0) ? (
        <p className="text-muted">No assigned jobs yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Service</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={job.id}>
                  <td>{i + 1}</td>
                  <td>{job.client?.full_name || "N/A"}</td>
                  <td>{job.service || "N/A"}</td>
                  <td>{job.location || "N/A"}</td>
                  <td>
                    <Badge
                      bg={
                        normalizedStatus(job.status).includes("pending")
                          ? "secondary"
                          : normalizedStatus(job.status).includes("accepted")
                          ? "info"
                          : normalizedStatus(job.status).includes("in progress")
                          ? "warning"
                          : normalizedStatus(job.status).includes("completed")
                          ? "primary"
                          : normalizedStatus(job.status).includes("paid")
                          ? "success"
                          : "dark"
                      }
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleViewJob(job)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedJob && (
        <Modal show onHide={handleClose} centered size="md">
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedJob.service} (Job #{selectedJob.id})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="fw-bold">{selectedJob.service}</h5>

                    <Badge
                      bg={
                        selectedJob.priority === "High" ? "danger" : "warning"
                      }
                      className="mb-2"
                    >
                      {selectedJob.priority || "Normal"}
                    </Badge>

                    <p className="mt-2">
                      {selectedJob.description || "No description provided."}
                    </p>

                    <p>
                      <FaPhone /> Phone:{" "}
                      <strong>{showPhoneNumber() || "Hidden until accepted"}</strong>
                    </p>

                    <p>Location: {selectedJob.location || "N/A"}</p>
                    <p>Start: {selectedJob.start_time || "N/A"}</p>
                    <p>End: {selectedJob.end_time || "N/A"}</p>

                    {["in progress", "inprogress", "in_progress"].includes(
                      normalizedStatus(selectedJob.status)
                    ) && <p>Duration (live): {formatElapsed(elapsed)}</p>}

                    {normalizedStatus(selectedJob.status) === "completed" && (
                      <p>Duration: {selectedJob.duration_hours ?? "N/A"} hrs</p>
                    )}

                    <p>Expected End: {selectedJob.expected_end || "N/A"}</p>
                    <p>Overtime: {selectedJob.overtime_hours ?? "0"} hrs</p>

                    {(normalizedStatus(selectedJob.status) === "completed" ||
                      normalizedStatus(selectedJob.status).includes("paid")) && (
                      (() => {
                        const { total, companyCut, net } =
                          computePaymentBreakdown(selectedJob);
                        return (
                          <>
                            <p className="mt-2 fw-bold">Payment Summary</p>
                            <p>Total Payment: KSh {total.toLocaleString()}</p>
                            <p>
                              Company Cut ({COMPANY_FEE_PERCENT}%): KSh{" "}
                              {companyCut.toLocaleString()}
                            </p>
                            <p>Net Payment: KSh {net.toLocaleString()}</p>
                            <p>
                              Payment Status:{" "}
                              {selectedJob.payment_status ||
                                "Pending Admin Payment"}
                            </p>
                          </>
                        );
                      })()
                    )}
                  </Col>

                  <Col md={4} className="text-end">
                    <h6>Job Details</h6>
                    <p>
                      Budget:{" "}
                      <strong>KSh {selectedJob.budget ?? "N/A"}</strong>
                    </p>
                    <p>Distance: {selectedJob.distance_km ?? "N/A"} km</p>

                    {selectedJob.proof_files &&
                      selectedJob.proof_files.length > 0 && (
                        <>
                          <p className="mt-3 mb-1">Proof</p>
                          {selectedJob.proof_files
                            .slice(0, 3)
                            .map((pf, idx) => (
                              <a
                                key={idx}
                                href={pf.url || pf}
                                target="_blank"
                                rel="noreferrer"
                                className="d-block text-truncate"
                              >
                                {pf.name || pf.url || `proof-${idx + 1}`}
                              </a>
                            ))}
                        </>
                      )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex flex-wrap gap-2">
            {["pending", "awaiting craftsman assignment"].includes(
              normalizedStatus(selectedJob.status)
            ) && (
              <>
                <Button
                  variant="success"
                  disabled={actionLoading}
                  onClick={() => handleAcceptJob(selectedJob.id)}
                >
                  Accept
                </Button>
                <Button
                  variant="outline-danger"
                  disabled={actionLoading}
                  onClick={() => handleRejectJob(selectedJob.id)}
                >
                  Reject
                </Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "accepted" && (
              <>
                <Button
                  variant="info"
                  disabled={actionLoading}
                  onClick={() => handleStartJob(selectedJob.id)}
                >
                  Start Job
                </Button>
                <Button variant="secondary" onClick={handleChat}>
                  <FaComments /> Chat
                </Button>
              </>
            )}

            {["in progress", "inprogress", "in_progress"].includes(
              normalizedStatus(selectedJob.status)
            ) && (
              <>
                <div style={{ minWidth: 240 }}>
                  <Form.Group controlId="proofFiles" className="mb-2">
                    <Form.Label className="small">
                      Upload proof (photos/videos)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={(e) => setProofFiles(e.target.files)}
                      disabled={uploading || actionLoading}
                    />
                  </Form.Group>
                </div>
                <Button
                  variant="outline-secondary"
                  disabled={
                    actionLoading || !proofFiles || proofFiles.length === 0
                  }
                  onClick={() => {
                    setUploading(true);
                    handleCompleteJob(selectedJob.id);
                    setUploading(false);
                  }}
                >
                  Upload & Complete
                </Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "completed" && (
              <>
                <Badge bg="primary">Completed — Pending Admin Payment</Badge>
                <Button variant="secondary" onClick={handleChat}>
                  <FaComments /> Chat
                </Button>
              </>
            )}

            {[
              "paid pending confirmation",
              "paid awaiting confirmation",
              "paid_pending_confirmation",
            ].includes(normalizedStatus(selectedJob.status)) && (
              <>
                <Button
                  variant="success"
                  onClick={() => handleConfirmReceived(selectedJob.id)}
                >
                  Confirm Payment Received
                </Button>
              </>
            )}

            {[
              "paid",
              "paid confirmed",
              "confirmed",
              "closed",
            ].includes(normalizedStatus(selectedJob.status)) && (
              <Badge bg="success">✅ Job Closed / Payment Confirmed</Badge>
            )}

            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

JobsTab.propTypes = {
  jobs: PropTypes.array,
  setJobs: PropTypes.func,
};

export default JobsTab;
