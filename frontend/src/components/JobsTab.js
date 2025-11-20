import React, { useState, useEffect } from "react";
import { Modal, Button, Badge, Form, Row, Col, Card } from "react-bootstrap";
import { FaPhone, FaComments } from "react-icons/fa";

// System-wide constant — only used for displaying backend value
const COMPANY_FEE_PERCENT = 10;

function JobsTab({ jobs: initialJobs = [], userRole = "craftsman" }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    setJobs(initialJobs); // Trust backend completely
  }, [initialJobs]);

  const handleViewJob = (job) => setSelectedJob(job);
  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
  };

  const normalizedStatus = (status) => (status || "").toLowerCase();

  // FRONTEND STATUS UPDATE ONLY FOR UI (backend will handle real update)
  const updateJobStatusLocally = (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    setSelectedJob((prev) =>
      prev?.id === jobId ? { ...prev, status: newStatus } : prev
    );
  };

  const handleAcceptJob = (id) => updateJobStatusLocally(id, "accepted");
  const handleRejectJob = (id) => updateJobStatusLocally(id, "rejected");
  const handleStartJob = (id) => updateJobStatusLocally(id, "in progress");
  const handleMarkCompleted = (id) =>
    updateJobStatusLocally(id, "completed");
  const handleApproveJob = (id) => updateJobStatusLocally(id, "approved");
  const handleMarkPaid = (id) => updateJobStatusLocally(id, "paid");

  const handleUploadProof = (jobId) => {
    if (!proofFiles.length) return alert("Select files first!");
    alert(`${proofFiles.length} file(s) uploaded for job ${jobId}`);
    setProofFiles([]);
  };

  // Who should see which phone number
  const showPhoneNumber = () => {
    if (!selectedJob) return null;
    const status = normalizedStatus(selectedJob.status);

    if (userRole === "admin") return selectedJob.client?.phone || "N/A";

    if (userRole === "client" &&
      ["accepted", "in progress", "completed", "approved", "paid"].includes(status)
    ) {
      return selectedJob.craftsman?.phone || "N/A";
    }

    if (userRole === "craftsman" &&
      ["accepted", "in progress", "completed", "approved", "paid"].includes(status)
    ) {
      return selectedJob.client?.phone || "N/A";
    }

    return "";
  };

  const handleChat = () => {
    alert(`Open chat with ${selectedJob.client?.full_name}`);
  };

  return (
    <div className="card p-4 shadow-sm border-0">
      <h4 className="mb-3 fw-bold">Assigned Jobs</h4>

      {jobs.length === 0 ? (
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
                <th>Actions</th>
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
                    <Badge bg="secondary">{job.status}</Badge>
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
                    >
                      {selectedJob.priority || "Normal"}
                    </Badge>

                    <p className="mt-2">{selectedJob.description}</p>

                    <p>
                      <FaPhone /> Phone: <strong>{showPhoneNumber()}</strong>
                    </p>

                    {/* All values now come directly from backend */}
                    <p>Start Time: {selectedJob.start_time || "N/A"}</p>
                    <p>End Time: {selectedJob.end_time || "N/A"}</p>
                    <p>Duration: {selectedJob.duration_hours || "N/A"} hrs</p>
                    <p>Expected End: {selectedJob.expected_end || "N/A"}</p>
                    <p>Overtime: {selectedJob.overtime_hours || "0"} hrs</p>

                    <p>Total Payment: KSh {selectedJob.total_payment || "0"}</p>
                    <p>
                      Company Cut ({COMPANY_FEE_PERCENT}%): KSh{" "}
                      {selectedJob.company_fee || "0"}
                    </p>
                    <p>Net Payment: KSh {selectedJob.net_payment || "0"}</p>
                  </Col>

                  <Col md={4} className="text-end">
                    <h6>Job Details</h6>

                    <p>
                      Budget: <strong>KSh {selectedJob.budget}</strong>
                    </p>
                    <p>Distance: {selectedJob.distance_km} km</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          {/* Footer Buttons (same but simplified) */}
          <Modal.Footer className="d-flex flex-wrap gap-2">

            {["pending", "assigned"].includes(
              normalizedStatus(selectedJob.status)
            ) && (
              <>
                <Button
                  variant="success"
                  onClick={() => handleAcceptJob(selectedJob.id)}
                >
                  Accept
                </Button>
                <Button
                  variant="outline-danger"
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
                  onClick={() => handleStartJob(selectedJob.id)}
                >
                  Start Job
                </Button>
                <Button variant="secondary" onClick={handleChat}>
                  <FaComments /> Chat
                </Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "in progress" && (
              <>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => setProofFiles(e.target.files)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => handleUploadProof(selectedJob.id)}
                >
                  Upload Proof
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleMarkCompleted(selectedJob.id)}
                >
                  Mark Completed
                </Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "completed" && (
              <Button
                variant="primary"
                onClick={() => handleApproveJob(selectedJob.id)}
              >
                Approve / Trigger Payment
              </Button>
            )}

            {normalizedStatus(selectedJob.status) === "approved" && (
              <Button
                variant="success"
                onClick={() => handleMarkPaid(selectedJob.id)}
              >
                Mark Paid
              </Button>
            )}

            {normalizedStatus(selectedJob.status) === "paid" && (
              <Badge bg="success">✅ Job Closed / Paid</Badge>
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

export default JobsTab;
