import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Badge, Form, Row, Col, Card } from "react-bootstrap";
import { FaPhone, FaComments } from "react-icons/fa";
import { authAxios } from "../api/axiosClient";
import jsPDF from "jspdf";

const COMPANY_FEE_PERCENT = 10;

function JobsTab({ jobs: initialJobs = [], setJobs }) {
  const [jobs, setLocalJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const [quoteDetails, setQuoteDetails] = useState({
    item: "",
    workType: "",
    duration: "",
    quantity: "",
    price: "",
    notes: "",
  });

  const [quoteJobId, setQuoteJobId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalJobs(initialJobs || []);
  }, [initialJobs]);

  useEffect(() => {
    if (!selectedJob) return clearTimer();

    const status = normalizedStatus(selectedJob.status);

    if (["in progress", "inprogress", "in_progress"].includes(status)) {
      startTimerFrom(selectedJob.start_time);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [selectedJob]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsed(0);
  };

  const startTimerFrom = (startISO) => {
    clearTimer();
    const start = startISO ? new Date(startISO) : new Date();
    const update = () =>
      setElapsed(Math.floor(Math.max(0, new Date() - start) / 1000));
    update();
    timerRef.current = setInterval(update, 1000);
  };

  const normalizedStatus = (status) =>
    (status || "").toString().toLowerCase().replace(/[_]/g, " ");

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setProofFiles([]);
  };

  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
    setActionLoading(false);
    clearTimer();
  };

  const handleOpenQuoteModal = (jobId) => {
    setQuoteJobId(jobId);
    setQuoteDetails({
      item: "",
      workType: "",
      duration: "",
      quantity: "",
      price: "",
      notes: "",
    });
    setQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setQuoteModalOpen(false);
    setQuoteJobId(null);
  };

  const updateJobStatus = async (jobId, action, payload = null) => {
    try {
      setActionLoading(true);
      const url = `/job-requests/${jobId}/${action}/`;

      let res;
      if (payload) {
        const formData = new FormData();

        if (payload.files) {
          Array.from(payload.files).forEach((f) =>
            formData.append("proof_files", f)
          );
        }

        if (payload.quote) {
          formData.append("quote_details", JSON.stringify(payload.quote));
        }

        res = await authAxios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await authAxios.post(url, {});
      }

      applyUpdatedJob(res.data);
    } catch (err) {
      console.error("updateJobStatus error:", err);
      alert("Failed to update job.");
    } finally {
      setActionLoading(false);
    }
  };

  const applyUpdatedJob = (updatedJob) => {
    setJobs?.((prev) =>
      Array.isArray(prev)
        ? prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        : prev
    );

    setLocalJobs((prev) =>
      Array.isArray(prev)
        ? prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        : prev
    );

    setSelectedJob(updatedJob);
  };

  const handleAcceptJob = (id) => updateJobStatus(id, "accept");

  const handleRejectJob = (id) => {
    if (!window.confirm("Reject this job?")) return;
    updateJobStatus(id, "reject");
  };

  const handleStartJob = (id) => updateJobStatus(id, "start");

  const handleCompleteJob = () => {
    if (!proofFiles || proofFiles.length === 0)
      return alert("Upload proof files.");
    updateJobStatus(selectedJob.id, "complete", { files: proofFiles });
    setProofFiles([]);
  };

  const handleConfirmReceived = (id) => {
    if (!window.confirm("Confirm you've received payment?")) return;
    updateJobStatus(id, "confirm-received");
  };

  const handleSubmitQuoteModal = () => {
    if (!quoteDetails.quantity || !quoteDetails.price)
      return alert("Quantity & Price required");

    updateJobStatus(quoteJobId, "submit-quote", { quote: quoteDetails });
    handleCloseQuoteModal();
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
    ];
    return visibleStatuses.includes(status)
      ? selectedJob.client?.phone || "N/A"
      : "";
  };

  const handleChat = () => {
    if (!selectedJob) return;
    alert(`Open chat with ${selectedJob.client?.full_name}`);
  };

  const formatElapsed = (sec) => {
    if (!sec && sec !== 0) return "N/A";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleDownloadQuotePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("QUOTATION SUMMARY", 10, 10);

    const y = 20;

    doc.text(`Item/Service: ${quoteDetails.item || "N/A"}`, 10, y);
    doc.text(`Type of Work: ${quoteDetails.workType || "N/A"}`, 10, y + 10);
    doc.text(`Estimated Duration: ${quoteDetails.duration || "N/A"}`, 10, y + 20);
    doc.text(`Quantity: ${quoteDetails.quantity}`, 10, y + 30);
    doc.text(
      `Unit Price: KSh ${Number(quoteDetails.price).toLocaleString()}`,
      10,
      y + 40
    );

    const subtotal =
      Number(quoteDetails.quantity) * Number(quoteDetails.price);
    const companyFee = Math.round(subtotal * 0.1);
    const total = subtotal + companyFee;

    doc.text(`Subtotal: KSh ${subtotal.toLocaleString()}`, 10, y + 60);
    doc.text(`Company Fee (10%): KSh ${companyFee.toLocaleString()}`, 10, y + 70);
    doc.text(`Total Payable: KSh ${total.toLocaleString()}`, 10, y + 80);

    doc.text(`Notes: ${quoteDetails.notes || "None"}`, 10, y + 100);

    doc.save("quotation.pdf");
  };

  const renderFooterButtons = () => {
    if (!selectedJob) return null;
    const status = normalizedStatus(selectedJob.status);

    if (["pending", "assigned"].includes(status)) {
      return (
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
      );
    }

    if (status === "accepted") {
      return (
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
      );
    }

    if (
      ["in progress", "inprogress", "in_progress"].includes(status)
    ) {
      return (
        <>
          <div style={{ minWidth: 240 }}>
            <Form.Group className="mb-2">
              <Form.Label className="small">Upload proof</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => setProofFiles(e.target.files)}
                disabled={actionLoading}
              />
            </Form.Group>
          </div>
          <Button
            variant="outline-secondary"
            disabled={!proofFiles || proofFiles.length === 0}
            onClick={handleCompleteJob}
          >
            Upload & Complete
          </Button>
        </>
      );
    }

    if (status === "completed") {
      return (
        <>
          <Badge bg="primary">
            Completed — Pending Admin Payment
          </Badge>
          <Button variant="secondary" onClick={handleChat}>
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (status.includes("paid")) {
      return (
        <Button
          variant="success"
          onClick={() => handleConfirmReceived(selectedJob.id)}
        >
          Confirm Payment Received
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="card p-4 shadow-sm border-0">
      <h4 className="mb-3 fw-bold">Assigned Jobs (Craftsman)</h4>

      {!jobs || jobs.length === 0 ? (
        <p className="text-muted">No jobs assigned.</p>
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
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleOpenQuoteModal(job.id)}
                    >
                      Submit Quote
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ——— QUOTE MODAL ——— */}
      <Modal
        show={quoteModalOpen}
        onHide={handleCloseQuoteModal}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Quote</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Item / Service</Form.Label>
              <Form.Control
                value={quoteDetails.item}
                onChange={(e) =>
                  setQuoteDetails({ ...quoteDetails, item: e.target.value })
                }
                placeholder="Painting 2BR House"
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Type of Work</Form.Label>
              <Form.Select
                value={quoteDetails.workType}
                onChange={(e) =>
                  setQuoteDetails({
                    ...quoteDetails,
                    workType: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="Labour Only">Labour Only</option>
                <option value="Labour + Materials">
                  Labour + Materials
                </option>
                <option value="Materials Only">Materials Only</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Estimated Duration</Form.Label>
              <Form.Control
                value={quoteDetails.duration}
                onChange={(e) =>
                  setQuoteDetails({
                    ...quoteDetails,
                    duration: e.target.value,
                  })
                }
                placeholder="2 days"
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quoteDetails.quantity}
                onChange={(e) =>
                  setQuoteDetails({
                    ...quoteDetails,
                    quantity: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Unit Price (KSh)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quoteDetails.price}
                onChange={(e) =>
                  setQuoteDetails({
                    ...quoteDetails,
                    price: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={quoteDetails.notes}
                onChange={(e) =>
                  setQuoteDetails({
                    ...quoteDetails,
                    notes: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* ——— QUOTE SUMMARY ——— */}
            {quoteDetails.quantity && quoteDetails.price && (
              <div className="border rounded p-3 mt-3">
                <h6 className="fw-bold">QUOTATION SUMMARY</h6>
                <hr />

                <p>
                  <strong>Item:</strong> {quoteDetails.item || "N/A"}
                </p>
                <p>
                  <strong>Work Type:</strong>{" "}
                  {quoteDetails.workType || "N/A"}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {quoteDetails.duration || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong> {quoteDetails.quantity}
                </p>
                <p>
                  <strong>Unit Price:</strong> KSh{" "}
                  {Number(quoteDetails.price).toLocaleString()}
                </p>

                <p>
                  <strong>Notes:</strong>{" "}
                  {quoteDetails.notes || "None"}
                </p>

                {(() => {
                  const subtotal =
                    Number(quoteDetails.quantity) *
                    Number(quoteDetails.price);
                  const companyFee = Math.round(subtotal * 0.1);
                  const totalPayable = subtotal + companyFee;

                  return (
                    <>
                      <p>
                        <strong>Subtotal:</strong> KSh{" "}
                        {subtotal.toLocaleString()}
                      </p>
                      <p>
                        <strong>Company Fee:</strong> KSh{" "}
                        {companyFee.toLocaleString()}
                      </p>
                      <p className="fw-bold">
                        <strong>Total Payable:</strong> KSh{" "}
                        {totalPayable.toLocaleString()}
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="d-flex justify-content-between mt-3">
              <Button variant="secondary" onClick={handleDownloadQuotePDF}>
                Download PDF
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmitQuoteModal}
                disabled={!quoteDetails.quantity || !quoteDetails.price}
              >
                Submit Quote
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ——— SINGLE JOB VIEW MODAL (unchanged) ——— */}
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
                        selectedJob.priority === "High"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {selectedJob.priority}
                    </Badge>

                    <p>{selectedJob.description}</p>

                    <p>
                      <FaPhone /> Phone:{" "}
                      <strong>
                        {showPhoneNumber() || "Hidden"}
                      </strong>
                    </p>
                  </Col>

                  <Col md={4}>
                    <h6>Job Details</h6>
                    <p>Budget: KSh {selectedJob.budget}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Modal.Footer>
              {renderFooterButtons()}
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal.Body>
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
