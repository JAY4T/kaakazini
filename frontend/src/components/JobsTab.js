// JobsTab.js
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
  const [quoteDetails, setQuoteDetails] = useState({
    item: "",
    workType: "",
    duration: "",
    quantity: "",
    price: "",
    notes: "",
    plumberName: "", // Craftsman / company name
    user: null, // Logged-in craftsman
    client: null,
    items: [],
  });

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

  const normalizedStatus = (status) =>
    (status || "").toString().toLowerCase().replace(/[_]/g, " ");

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

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setProofFiles([]);
    setQuoteDetails({
      item: "",
      workType: "",
      duration: "",
      quantity: "",
      price: "",
      notes: "",
      plumberName: "",
      user: job.craftsman || null,
      client: job.client || null,
      items: [],
      quoteNumber: job.quoteNumber || `QTN-${job.id}`,
      date: job.date || new Date().toLocaleDateString(),
    });
  };

  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
    setActionLoading(false);
    clearTimer();
  };

  const updateJobStatus = async (jobId, action, payload = null) => {
    try {
      setActionLoading(true);
      const url = `/job-requests/${jobId}/submit-quote/`;

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
  const handleSubmitQuote = () => {
    if (!quoteDetails.quantity || !quoteDetails.price)
      return alert("Quantity & Price required");

    const itemEntry = {
      desc: quoteDetails.item,
      qty: quoteDetails.quantity,
      price: parseFloat(quoteDetails.price),
    };

    const quotePayload = {
      ...quoteDetails,
      items: [itemEntry],
      user: quoteDetails.user,
      client: quoteDetails.client,
    };

    updateJobStatus(selectedJob.id, "submit-quote", { quote: quotePayload });
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

  const handleDownloadQuotePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, y, { align: "center" });

    y += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const craftsman = quoteDetails.user?.full_name || "Craftsman Name";
    const craftsmanPhone = quoteDetails.user?.phone || "";
    const craftsmanEmail = quoteDetails.user?.email || "";

    doc.text(`From: ${craftsman}`, 14, y);
    y += lineHeight;
    if (craftsmanPhone) doc.text(`Phone: ${craftsmanPhone}`, 14, y);
    y += lineHeight;
    if (craftsmanEmail) doc.text(`Email: ${craftsmanEmail}`, 14, y);

    const client = quoteDetails.client?.full_name || "Client Name";
    const clientPhone = quoteDetails.client?.phone || "";
    const clientEmail = quoteDetails.client?.email || "";
    const clientAddress = quoteDetails.client?.address || "";

    doc.text(`To: ${client}`, 120, y - lineHeight * 2);
    if (clientPhone) doc.text(`Phone: ${clientPhone}`, 120, y - lineHeight);
    if (clientEmail) doc.text(`Email: ${clientEmail}`, 120, y);
    if (clientAddress) doc.text(`Address: ${clientAddress}`, 120, y + lineHeight);

    y += lineHeight * 3;

    const quoteNumber = quoteDetails.quoteNumber || "QTN-XXXX";
    const quoteDate = quoteDetails.date || new Date().toLocaleDateString();
    doc.text(`Quote #: ${quoteNumber}`, 14, y);
    doc.text(`Date: ${quoteDate}`, 120, y);
    y += lineHeight * 2;

    doc.setFont("helvetica", "bold");
    doc.setFillColor(34, 85, 34);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y - 6, 180, 8, "F");
    doc.text("Description", 16, y);
    doc.text("Qty", 120, y);
    doc.text("Unit Price", 140, y);
    doc.text("Total", 170, y);

    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const items = quoteDetails.items || [];
    let subtotal = 0;

    items.forEach((item) => {
      doc.text(item.desc, 16, y);
      doc.text(`${item.qty}`, 120, y);
      doc.text(`${item.price.toLocaleString()} KES`, 140, y);

      const total = item.qty === "-" ? item.price : item.qty * item.price;
      subtotal += total;
      doc.text(`${total.toLocaleString()} KES`, 170, y);
      y += lineHeight;
    });

    y += 2;
    const taxRate = quoteDetails.taxRate || 0.16;
    const tax = Math.round(subtotal * taxRate);
    const totalCost = subtotal + tax;

    doc.text(`Subtotal: ${subtotal.toLocaleString()} KES`, 140, y);
    y += lineHeight;
    doc.text(`Tax (${taxRate * 100}%): ${tax.toLocaleString()} KES`, 140, y);
    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Cost: ${totalCost.toLocaleString()} KES`, 140, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight * 2;

    const paymentTerms =
      quoteDetails.paymentTerms || "50% Deposit Required, Balance on Completion";
    const notes =
      quoteDetails.notes ||
      "Work to be completed within the agreed timeline. All work guaranteed.";

    doc.text(`Payment Terms: ${paymentTerms}`, 14, y);
    y += lineHeight;
    doc.text(`Notes: ${notes}`, 14, y);
    y += lineHeight * 3;

    doc.text("Thank you for choosing our services!", 14, y);
    y += lineHeight * 2;

    doc.text(`${craftsman}`, 14, y);
    y += lineHeight;
    if (quoteDetails.craftsmanSignatureImage) {
      doc.addImage(quoteDetails.craftsmanSignatureImage, "PNG", 14, y, 50, 20);
      y += 25;
    } else {
      doc.text("Craftsman Signature: ___________________________", 14, y);
      y += lineHeight * 2;
    }

    doc.text(`${client}`, 120, y - 25);
    if (quoteDetails.clientSignatureImage) {
      doc.addImage(quoteDetails.clientSignatureImage, "PNG", 120, y - 20, 50, 20);
    } else {
      doc.text("Client Signature: ___________________________", 120, y);
    }

    doc.save(`${quoteNumber}.pdf`);
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
            onClick={handleRejectJob}
          >
            Reject
          </Button>
        </>
      );
    }

    if (status === "accepted") {
      return (
        <Button variant="secondary" onClick={handleChat}>
          <FaComments /> Chat
        </Button>
      );
    }

    if (status === "quote submitted") {
      return (
        <>
          <Button
            variant="success"
            onClick={() => handleStartJob(selectedJob.id)}
            disabled={actionLoading}
          >
            Start Job
          </Button>
          <Button variant="secondary" onClick={handleChat}>
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (["in progress", "inprogress", "in_progress"].includes(status)) {
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
          <Badge bg="primary">Completed — Pending Admin Payment</Badge>
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
                          : normalizedStatus(job.status).includes("quote submitted")
                          ? "warning"
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
        <Modal show onHide={handleClose} centered size="lg">
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
                      bg={selectedJob.priority === "High" ? "danger" : "warning"}
                    >
                      {selectedJob.priority}
                    </Badge>

                    <p>{selectedJob.description}</p>

                    <p>
                      <FaPhone /> Phone:{" "}
                      <strong>{showPhoneNumber() || "Hidden"}</strong>
                    </p>
                  </Col>

                  <Col md={4}>
                    <h6>Job Details</h6>
                    <p>Budget: KSh {selectedJob.budget}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Quote form */}
            {normalizedStatus(selectedJob.status) === "accepted" && (
              <Card className="mb-3 p-3 shadow-sm border">
                <h6 className="fw-bold">Submit Quote</h6>
                <Form>
                  <Form.Group>
                    <Form.Label>Plumber / Company Name</Form.Label>
                    <Form.Control
                      value={quoteDetails.plumberName}
                      onChange={(e) =>
                        setQuoteDetails({
                          ...quoteDetails,
                          plumberName: e.target.value,
                        })
                      }
                      placeholder="Enter your name or business"
                    />
                  </Form.Group>

                  <Form.Group className="mt-2">
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
                        setQuoteDetails({ ...quoteDetails, workType: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Labour Only">Labour Only</option>
                      <option value="Labour + Materials">Labour + Materials</option>
                      <option value="Materials Only">Materials Only</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Estimated Duration</Form.Label>
                    <Form.Control
                      value={quoteDetails.duration}
                      onChange={(e) =>
                        setQuoteDetails({ ...quoteDetails, duration: e.target.value })
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
                        setQuoteDetails({ ...quoteDetails, quantity: e.target.value })
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
                        setQuoteDetails({ ...quoteDetails, price: e.target.value })
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
                        setQuoteDetails({ ...quoteDetails, notes: e.target.value })
                      }
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="secondary" onClick={handleDownloadQuotePDF}>
                      Download PDF
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitQuote}
                      disabled={!quoteDetails.quantity || !quoteDetails.price || actionLoading}
                    >
                      Submit Quote
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

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
