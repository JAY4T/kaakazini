
import React, { useState } from "react";
import { Modal, Button, Badge, ProgressBar, Form, Row, Col, Card } from "react-bootstrap";
import { FaStar, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import axios from "axios";

function JobsTab({ jobs = [], setJobs }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);

  const handleViewJob = (job) => setSelectedJob(job);
  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
  };

  const normalizedStatus = (status) => (status || "").toLowerCase();

  const updateJobStatus = async (jobId, payload) => {
    try {
      const res = await axios.patch(`/api/job-requests/${jobId}/`, payload, {
        headers: payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
      });
      const updatedJob = res.data;
      setSelectedJob(updatedJob);
      setJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
    } catch (err) {
      console.error("Action failed:", err.response?.data || err.message);
      alert("Action failed! Check console for details.");
    }
  };

  const handleAcceptJob = (id) => updateJobStatus(id, { status: "accepted" });
  const handleRejectJob = (id) => updateJobStatus(id, { status: "rejected" });
  const handleStartJob = (id) => updateJobStatus(id, { status: "in progress" });
  const handleMarkCompleted = (id) => updateJobStatus(id, { status: "completed" });
  const handleApproveJob = (id) => updateJobStatus(id, { status: "approved" });
  const handleMarkPaid = (id) => updateJobStatus(id, { status: "paid" });

  const handleUploadProof = (jobId) => {
    if (!proofFiles.length) {
      alert("Select files first!");
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < proofFiles.length; i++) {
      formData.append("proof_files", proofFiles[i]);
    }
    updateJobStatus(jobId, formData);
    setProofFiles([]);
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
                  <td><Badge bg="secondary">{job.status}</Badge></td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => handleViewJob(job)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <Modal show onHide={handleClose} centered size="md" dialogClassName="slim-modal">
          <Modal.Header closeButton>
            <Modal.Title>{selectedJob.service}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Job Details */}
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="fw-bold">{selectedJob.service}</h5>
                    <Badge bg={selectedJob.priority === "High" ? "danger" : "warning"}>
                      {selectedJob.priority || "Normal"}
                    </Badge>
                    <p className="mt-2">{selectedJob.description}</p>
                  </Col>
                  <Col md={4} className="text-end">
                    <h6>Why Accept This Job?</h6>
                    <p>Good Pay: <strong>KSh {selectedJob.budget}</strong></p>
                    <p>Great Client: <FaStar className="text-warning" /> {selectedJob.client?.rating || "N/A"} rating</p>
                    <p>Close By: {selectedJob.distance || 0} km</p>
                    <p>Quick Job: {selectedJob.estimated_duration}h</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Client Info */}
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Client Information</h6>
                    <p><strong>{selectedJob.client?.full_name}</strong></p>
                    <p><FaStar className="text-warning" /> {selectedJob.client?.rating || "N/A"} ⭐ • {selectedJob.client?.completed_jobs || 0} completed jobs</p>
                    {["accepted","in progress","completed","approved","paid"].includes(normalizedStatus(selectedJob.status)) && (
                      <>
                        <p><FaPhone /> {selectedJob.client?.phone}</p>
                        <p><FaMapMarkerAlt /> {selectedJob.location}</p>
                      </>
                    )}
                  </Col>
                  <Col md={6}>
                    <h6>Scheduled</h6>
                    <p>{selectedJob.scheduled_time}</p>
                    <h6>Requirements</h6>
                    <ul>
                      {selectedJob.requirements?.map((req, idx) => <li key={idx}>{req}</li>)}
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <ProgressBar now={selectedJob.progress || 0} label={`${selectedJob.progress || 0}%`} animated />
          </Modal.Body>

          <Modal.Footer className="d-flex flex-wrap gap-2">
            {["pending", "assigned"].includes(normalizedStatus(selectedJob.status)) && (
              <>
                <Button variant="success" onClick={() => handleAcceptJob(selectedJob.id)}>Accept</Button>
                <Button variant="outline-danger" onClick={() => handleRejectJob(selectedJob.id)}>Reject</Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "accepted" && (
              <Button variant="info" onClick={() => handleStartJob(selectedJob.id)}>Start Job</Button>
            )}

            {normalizedStatus(selectedJob.status) === "in progress" && (
              <>
                <Form.Control type="file" multiple onChange={(e) => setProofFiles(e.target.files)} />
                <Button variant="outline-secondary" onClick={() => handleUploadProof(selectedJob.id)}>Upload Proof</Button>
                <Button variant="primary" onClick={() => handleMarkCompleted(selectedJob.id)}>Mark Completed</Button>
              </>
            )}

            {normalizedStatus(selectedJob.status) === "completed" && (
              <Button variant="primary" onClick={() => handleApproveJob(selectedJob.id)}>Approve / Trigger Payment</Button>
            )}

            {normalizedStatus(selectedJob.status) === "approved" && (
              <Button variant="success" onClick={() => handleMarkPaid(selectedJob.id)}>Mark Paid</Button>
            )}

            {normalizedStatus(selectedJob.status) === "paid" && (
              <Badge bg="success">✅ Job Closed / Paid</Badge>
            )}

            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default JobsTab;
