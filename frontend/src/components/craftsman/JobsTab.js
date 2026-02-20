import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Badge, Form, Row, Col, Card, Alert, ProgressBar } from "react-bootstrap";
import { 
  FaPhone, FaComments, FaClock, FaCheckCircle, FaTimesCircle,
  FaFileAlt, FaCamera, FaMoneyBillWave, FaStar, FaEnvelope, FaSms, FaWhatsapp, FaDownload 
} from "react-icons/fa";
import api from "../../api/axiosClient";
import jsPDF from "jspdf";

const COMPANY_FEE_PERCENT = 10;

function JobsTab({ jobs: initialJobs = [], setJobs }) {
  const [jobs, setLocalJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showSendQuote, setShowSendQuote] = useState(false);
  const [sendMethod, setSendMethod] = useState("email");
  const [quoteDetails, setQuoteDetails] = useState({
    plumberName: "",
    items: [{ desc: "", qty: 1, price: 0 }],
    workType: "",
    duration: "",
    startDate: "",
    completionDate: "",
    paymentTerms: "50% Deposit, 50% on Completion",
    notes: "",
    user: null,
    client: null,
  });

  const timerRef = useRef(null);

  useEffect(() => {
    setLocalJobs(initialJobs || []);
  }, [initialJobs]);

  useEffect(() => {
    if (!selectedJob) return clearTimer();
    const status = normalizedStatus(selectedJob.status);
    if (["inprogress"].includes(status)) {
      startTimerFrom(selectedJob.start_time);
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [selectedJob]);

  const normalizedStatus = (status) =>
    (status || "").toString().toLowerCase().replace(/[_\s]/g, "");

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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setProofFiles([]);
    setProgressPhotos([]);
    setShowQuoteForm(false);
    setShowSendQuote(false);
    setQuoteDetails({
      plumberName: job.craftsman?.full_name || "",
      items: [{ desc: job.service || "", qty: 1, price: job.budget || 0 }],
      workType: "",
      duration: "",
      startDate: "",
      completionDate: "",
      paymentTerms: "50% Deposit, 50% on Completion",
      notes: "",
      user: job.craftsman || null,
      client: job.client || null,
    });
  };

  const handleClose = () => {
    setSelectedJob(null);
    setProofFiles([]);
    setProgressPhotos([]);
    setActionLoading(false);
    setShowQuoteForm(false);
    setShowSendQuote(false);
    clearTimer();
  };

  const updateJobStatus = async (jobId, action, payload = null) => {
    try {
      setActionLoading(true);

      if (action === "accept") {
        await api.patch(`/job-requests/${jobId}/`, { status: "Accepted" });
      } else if (action === "reject") {
        await api.patch(`/job-requests/${jobId}/`, { status: "Rejected" });
      } else if (action === "start") {
        await api.patch(`/job-requests/${jobId}/`, { 
          status: "In Progress",
          start_time: new Date().toISOString()
        });
      } else if (action === "submit-quote") {
        if (payload && payload.quote) {
          const formData = new FormData();
          formData.append("quote_details", JSON.stringify(payload.quote));
          await api.post(`/job-requests/${jobId}/submit-quote/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
      } else if (action === "complete") {
        const formData = new FormData();
        if (payload && payload.files) {
          Array.from(payload.files).forEach((f) =>
            formData.append("proof_files", f)
          );
        }
        formData.append("status", "Completed - Pending Confirmation");
        formData.append("completion_time", new Date().toISOString());
        await api.patch(`/job-requests/${jobId}/`, formData);
      } else if (action === "confirm-received") {
        await api.patch(`/job-requests/${jobId}/`, { status: "Paid & Completed" });
      }

      // Refresh job data
      const { data } = await api.get(`/job-requests/${jobId}/`);
      applyUpdatedJob(data);
      
      alert(`✅ Job ${action} successful!`);
    } catch (err) {
      console.error("updateJobStatus error:", err);
      alert(`❌ Failed to ${action} job.`);
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

  const addQuoteItem = () => {
    setQuoteDetails({
      ...quoteDetails,
      items: [...quoteDetails.items, { desc: "", qty: 1, price: 0 }]
    });
  };

  const updateQuoteItem = (index, field, value) => {
    const newItems = [...quoteDetails.items];
    newItems[index][field] = value;
    setQuoteDetails({ ...quoteDetails, items: newItems });
  };

  const removeQuoteItem = (index) => {
    const newItems = quoteDetails.items.filter((_, i) => i !== index);
    setQuoteDetails({ ...quoteDetails, items: newItems });
  };

  const calculateTotal = () => {
    return quoteDetails.items.reduce((sum, item) => {
      return sum + (item.qty * item.price);
    }, 0);
  };

  const handleSubmitQuote = async () => {
    if (quoteDetails.items.some(item => !item.desc || !item.price)) {
      return alert("Please fill all item details");
    }

    const quotePayload = {
      ...quoteDetails,
      total: calculateTotal(),
      quoteNumber: `QTN-${selectedJob.id}-${Date.now()}`,
      date: new Date().toLocaleDateString(),
    };

    await updateJobStatus(selectedJob.id, "submit-quote", { quote: quotePayload });
    setShowQuoteForm(false);
    
    // Show send options after submitting
    setTimeout(() => {
      setShowSendQuote(true);
    }, 500);
  };

  const generateQuotePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, y, { align: "center" });
    
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // From section
    doc.setFont("helvetica", "bold");
    doc.text("FROM:", 14, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(quoteDetails.plumberName || "Craftsman Name", 14, y);
    y += lineHeight;
    doc.text(`Phone: ${quoteDetails.user?.phone || "N/A"}`, 14, y);
    y += lineHeight;
    doc.text(`Email: ${quoteDetails.user?.email || "N/A"}`, 14, y);
    
    // To section
    y += lineHeight * 2;
    doc.setFont("helvetica", "bold");
    doc.text("TO:", 14, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(quoteDetails.client?.full_name || "Client Name", 14, y);
    y += lineHeight;
    doc.text(`Phone: ${quoteDetails.client?.phone || "N/A"}`, 14, y);
    
    // Quote details
    y += lineHeight * 2;
    doc.text(`Quote Number: QTN-${selectedJob.id}`, 14, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, y);
    
    y += lineHeight * 2;
    
    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(34, 197, 94);
    doc.rect(14, y - 5, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Description", 16, y);
    doc.text("Qty", 120, y);
    doc.text("Unit Price", 140, y);
    doc.text("Total", 170, y);
    
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    // Items
    let subtotal = 0;
    quoteDetails.items.forEach((item) => {
      const total = item.qty * item.price;
      subtotal += total;
      
      doc.text(item.desc, 16, y);
      doc.text(item.qty.toString(), 120, y);
      doc.text(`KSh ${item.price.toLocaleString()}`, 140, y);
      doc.text(`KSh ${total.toLocaleString()}`, 170, y);
      y += lineHeight;
    });
    
    // Totals
    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: KSh ${subtotal.toLocaleString()}`, 140, y);
    
    // Terms
    y += lineHeight * 2;
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Terms: ${quoteDetails.paymentTerms}`, 14, y);
    y += lineHeight;
    doc.text(`Work Type: ${quoteDetails.workType}`, 14, y);
    y += lineHeight;
    doc.text(`Estimated Duration: ${quoteDetails.duration}`, 14, y);
    
    if (quoteDetails.notes) {
      y += lineHeight * 2;
      doc.text(`Notes: ${quoteDetails.notes}`, 14, y);
    }
    
    return doc;
  };

  const handleDownloadQuotePDF = () => {
    const doc = generateQuotePDF();
    doc.save(`Quote-${selectedJob.id}.pdf`);
  };

  const handleSendQuote = async () => {
    try {
      setActionLoading(true);
      
      const pdf = generateQuotePDF();
      const pdfBlob = pdf.output('blob');
      
      const formData = new FormData();
      formData.append('job_id', selectedJob.id);
      formData.append('quote_pdf', pdfBlob, `Quote-${selectedJob.id}.pdf`);
      formData.append('send_method', sendMethod);
      formData.append('quote_details', JSON.stringify(quoteDetails));
      
      if (sendMethod === 'email') {
        formData.append('email', selectedJob.client?.email || '');
      } else if (sendMethod === 'sms') {
        formData.append('phone', selectedJob.client?.phone || '');
      }

      const { data } = await api.post(`/job-requests/${selectedJob.id}/send-quote/`, formData);
      
      alert(`✅ Quote sent successfully via ${sendMethod}!`);
      setShowSendQuote(false);
      
    } catch (err) {
      console.error("Error sending quote:", err);
      alert(`❌ Failed to send quote via ${sendMethod}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openWhatsApp = () => {
    const total = calculateTotal();
    const message = encodeURIComponent(
      `Hi ${selectedJob.client?.full_name || 'there'}! 👋\n\n` +
      `Your quote for *${selectedJob.service}* is ready!\n\n` +
      `💰 *Total:* KSh ${total.toLocaleString()}\n` +
      `⏱️ *Duration:* ${quoteDetails.duration}\n` +
      `📋 *Payment Terms:* ${quoteDetails.paymentTerms}\n\n` +
      `Let me know if you have any questions!`
    );
    
    const phone = selectedJob.client?.phone?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    setShowSendQuote(false);
  };

  const showPhoneNumber = () => {
    if (!selectedJob) return "N/A";
    const status = normalizedStatus(selectedJob.status);
    const visibleStatuses = [
      "accepted", "quotesubmitted", "quoteapproved", 
      "inprogress", "completed", "paid"
    ];
    return visibleStatuses.includes(status)
      ? selectedJob.client?.phone || selectedJob.phone || "N/A"
      : "Hidden until accepted";
  };

  const getStatusBadge = (status) => {
    const normalized = normalizedStatus(status);
    const badges = {
      pending: { bg: "secondary", text: "Pending" },
      assigned: { bg: "info", text: "Assigned to You" },
      accepted: { bg: "success", text: "Accepted" },
      quotesubmitted: { bg: "warning", text: "Quote Submitted" },
      quoteapproved: { bg: "primary", text: "Quote Approved" },
      inprogress: { bg: "warning", text: "In Progress" },
      completed: { bg: "info", text: "Completed - Pending Confirmation" },
      paymentpending: { bg: "warning", text: "Payment Pending" },
      paid: { bg: "success", text: "Paid & Completed" },
      rejected: { bg: "danger", text: "Rejected" },
    };
    
    return badges[normalized] || { bg: "dark", text: status };
  };

  const getProgressPercentage = () => {
    if (!selectedJob) return 0;
    const status = normalizedStatus(selectedJob.status);
    const progress = {
      pending: 10,
      assigned: 20,
      accepted: 30,
      quotesubmitted: 50,
      quoteapproved: 60,
      inprogress: 75,
      completed: 90,
      paid: 100,
    };
    return progress[status] || 0;
  };

  const renderActionButtons = () => {
    if (!selectedJob) return null;
    const status = normalizedStatus(selectedJob.status);

    if (["pending", "assigned"].includes(status)) {
      return (
        <>
          <Button
            variant="success"
            disabled={actionLoading}
            onClick={() => updateJobStatus(selectedJob.id, "accept")}
          >
            <FaCheckCircle /> Accept Job
          </Button>
          <Button
            variant="outline-danger"
            disabled={actionLoading}
            onClick={() => {
              if (window.confirm("Are you sure you want to reject this job?")) {
                updateJobStatus(selectedJob.id, "reject");
              }
            }}
          >
            <FaTimesCircle /> Reject
          </Button>
        </>
      );
    }

    if (status === "accepted") {
      return (
        <>
          <Button variant="primary" onClick={() => setShowQuoteForm(true)}>
            <FaFileAlt /> Submit Quote
          </Button>
          <Button variant="outline-primary">
            <FaPhone /> Call Client: {showPhoneNumber()}
          </Button>
          <Button variant="secondary">
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (status === "quotesubmitted") {
      return (
        <>
          <Alert variant="info" className="mb-3">
            ⏳ Waiting for client to approve your quote
          </Alert>
          <Button variant="outline-primary" onClick={() => setShowQuoteForm(true)}>
            <FaFileAlt /> View/Edit Quote
          </Button>
          <Button variant="success" onClick={() => setShowSendQuote(true)}>
            📤 Send Quote to Client
          </Button>
          <Button variant="secondary">
            <FaComments /> Chat with Client
          </Button>
        </>
      );
    }

    if (status === "quoteapproved") {
      return (
        <>
          <Alert variant="success" className="mb-3">
            ✅ Quote approved! Ready to start work.
          </Alert>
          <Button
            variant="success"
            onClick={() => updateJobStatus(selectedJob.id, "start")}
            disabled={actionLoading}
          >
            🚀 Start Job
          </Button>
          <Button variant="outline-primary">
            <FaPhone /> Call: {showPhoneNumber()}
          </Button>
        </>
      );
    }

    if (status === "inprogress") {
      return (
        <>
          <Alert variant="warning" className="mb-3">
            <FaClock /> Time Elapsed: <strong>{formatTime(elapsed)}</strong>
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Upload Progress Photos (Optional)</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setProgressPhotos(e.target.files)}
            />
            <small className="text-muted">Keep client updated with progress photos</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Completion Proof (Required to complete)</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setProofFiles(e.target.files)}
              required
            />
            <small className="text-muted">Minimum 3 photos showing completed work</small>
          </Form.Group>

          <Button
            variant="success"
            disabled={!proofFiles || proofFiles.length < 3 || actionLoading}
            onClick={() => updateJobStatus(selectedJob.id, "complete", { files: proofFiles })}
          >
            <FaCheckCircle /> Mark Complete & Submit
          </Button>
          <Button variant="secondary">
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (status === "completed") {
      return (
        <>
          <Alert variant="info">
            ✅ Work completed! Waiting for client confirmation and payment.
          </Alert>
          <Button variant="outline-secondary">
            <FaComments /> Chat with Client
          </Button>
        </>
      );
    }

    if (status === "paymentpending") {
      return (
        <>
          <Alert variant="warning">
            💰 Client confirmed completion. Payment pending.
          </Alert>
          <div className="mb-3">
            <h6>Payment Details:</h6>
            <p>Amount Due: <strong>KSh {selectedJob.budget?.toLocaleString()}</strong></p>
            <p className="text-muted small">
              Client will pay via Cash, M-Pesa, or Bank Transfer. 
              Confirm receipt once you receive payment.
            </p>
          </div>
          <Button
            variant="success"
            onClick={() => {
              if (window.confirm("Have you received the payment?")) {
                updateJobStatus(selectedJob.id, "confirm-received");
              }
            }}
          >
            <FaMoneyBillWave /> Confirm Payment Received
          </Button>
        </>
      );
    }

    if (status === "paid") {
      return (
        <>
          <Alert variant="success">
            🎉 Job successfully completed and paid!
          </Alert>
          <div className="text-center">
            <FaStar color="gold" size={24} />
            <p>Client will leave a review soon</p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <style>{`
        .job-card {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .job-card:hover {
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }

        .progress-tracker {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .send-method-card {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .send-method-card:hover {
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }

        .send-method-card.active {
          border-color: #22c55e;
          background: #f0fdf4;
        }
      `}</style>

      <div className="card p-4 shadow-sm border-0">
        <h4 className="mb-3 fw-bold">My Jobs</h4>

        {!jobs || jobs.length === 0 ? (
          <Alert variant="info">
            No jobs assigned yet. Jobs will appear here when admin assigns them to you.
          </Alert>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const badge = getStatusBadge(job.status);
                  return (
                    <tr key={job.id}>
                      <td>{i + 1}</td>
                      <td>{job.client?.full_name || "N/A"}</td>
                      <td>{job.service || "N/A"}</td>
                      <td>{job.location || "N/A"}</td>
                      <td>KSh {job.budget?.toLocaleString() || "N/A"}</td>
                      <td>
                        <Badge bg={badge.bg}>{badge.text}</Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewJob(job)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <Modal show onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedJob.service} - Job #{selectedJob.id}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {/* Progress Tracker */}
              <div className="progress-tracker">
                <h6 className="mb-2">Job Progress</h6>
                <ProgressBar 
                  now={getProgressPercentage()} 
                  label={`${getProgressPercentage()}%`}
                  variant="success"
                />
              </div>

              {/* Job Details Card */}
              <Card className="mb-3 shadow-sm job-card">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h5 className="fw-bold">{selectedJob.service}</h5>
                      <Badge bg={getStatusBadge(selectedJob.status).bg} className="mb-3">
                        {getStatusBadge(selectedJob.status).text}
                      </Badge>

                      <p className="mt-2"><strong>Description:</strong></p>
                      <p>{selectedJob.description || "No description provided"}</p>

                      <p className="mt-3">
                        <FaPhone /> <strong>Client Phone:</strong> {showPhoneNumber()}
                      </p>

                      <p>
                        <strong>Location:</strong> {selectedJob.location}
                        <br />
                        <strong>Address:</strong> {selectedJob.address || "N/A"}
                      </p>

                      {selectedJob.schedule && (
                        <p>
                          <FaClock /> <strong>Scheduled:</strong> {new Date(selectedJob.schedule).toLocaleString()}
                        </p>
                      )}
                    </Col>

                    <Col md={4}>
                      <h6>Job Details</h6>
                      <p><strong>Budget:</strong><br />KSh {selectedJob.budget?.toLocaleString()}</p>
                      <p><strong>Priority:</strong><br />
                        <Badge bg={selectedJob.isUrgent ? "danger" : "secondary"}>
                          {selectedJob.isUrgent ? "Urgent" : "Normal"}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Quote Form */}
              {showQuoteForm && normalizedStatus(selectedJob.status) === "accepted" && (
                <Card className="mb-3 p-3 shadow-sm border">
                  <h6 className="fw-bold mb-3">📝 Submit Professional Quote</h6>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Business/Company Name</Form.Label>
                      <Form.Control
                        value={quoteDetails.plumberName}
                        onChange={(e) =>
                          setQuoteDetails({ ...quoteDetails, plumberName: e.target.value })
                        }
                        placeholder="Your name or business name"
                      />
                    </Form.Group>

                    <h6 className="mt-3">Items & Services</h6>
                    {quoteDetails.items.map((item, index) => (
                      <Row key={index} className="mb-2 align-items-end">
                        <Col md={5}>
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            value={item.desc}
                            onChange={(e) => updateQuoteItem(index, "desc", e.target.value)}
                            placeholder="e.g., Painting labor"
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Qty</Form.Label>
                          <Form.Control
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateQuoteItem(index, "qty", parseInt(e.target.value))}
                            min="1"
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>Unit Price (KSh)</Form.Label>
                          <Form.Control
                            type="number"
                            value={item.price}
                            onChange={(e) => updateQuoteItem(index, "price", parseFloat(e.target.value))}
                            min="0"
                          />
                        </Col>
                        <Col md={2}>
                          {quoteDetails.items.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeQuoteItem(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    
                    <Button variant="outline-secondary" size="sm" onClick={addQuoteItem} className="mb-3">
                      + Add Item
                    </Button>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Work Type</Form.Label>
                          <Form.Select
                            value={quoteDetails.workType}
                            onChange={(e) =>
                              setQuoteDetails({ ...quoteDetails, workType: e.target.value })
                            }
                          >
                            <option value="">Select...</option>
                            <option value="Labour Only">Labour Only</option>
                            <option value="Labour + Materials">Labour + Materials</option>
                            <option value="Materials Only">Materials Only</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Estimated Duration</Form.Label>
                          <Form.Control
                            value={quoteDetails.duration}
                            onChange={(e) =>
                              setQuoteDetails({ ...quoteDetails, duration: e.target.value })
                            }
                            placeholder="e.g., 2 days, 1 week"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Payment Terms</Form.Label>
                      <Form.Select
                        value={quoteDetails.paymentTerms}
                        onChange={(e) =>
                          setQuoteDetails({ ...quoteDetails, paymentTerms: e.target.value })
                        }
                      >
                        <option>50% Deposit, 50% on Completion</option>
                        <option>Full Payment on Completion</option>
                        <option>30% Deposit, 70% on Completion</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Additional Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={quoteDetails.notes}
                        onChange={(e) =>
                          setQuoteDetails({ ...quoteDetails, notes: e.target.value })
                        }
                        placeholder="Any special terms, warranties, or notes..."
                      />
                    </Form.Group>

                    <Alert variant="info">
                      <strong>Total Quote: KSh {calculateTotal().toLocaleString()}</strong>
                    </Alert>

                    <div className="d-flex justify-content-between">
                      <Button variant="outline-secondary" onClick={handleDownloadQuotePDF}>
                        📄 Download PDF
                      </Button>
                      <div>
                        <Button variant="secondary" onClick={() => setShowQuoteForm(false)} className="me-2">
                          Cancel
                        </Button>
                        <Button
                          variant="success"
                          onClick={handleSubmitQuote}
                          disabled={actionLoading}
                        >
                          Submit Quote
                        </Button>
                      </div>
                    </div>
                  </Form>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 flex-wrap">
                {renderActionButtons()}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Send Quote Modal */}
        {showSendQuote && selectedJob && (
          <Modal show={showSendQuote} onHide={() => setShowSendQuote(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>📤 Send Quote to Client</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted mb-3">
                Choose how to send the quote to <strong>{selectedJob.client?.full_name}</strong>
              </p>

              {/* Email Option */}
              <div 
                className={`send-method-card ${sendMethod === 'email' ? 'active' : ''}`}
                onClick={() => setSendMethod('email')}
              >
                <div className="d-flex align-items-center">
                  <FaEnvelope size={32} color="#3b82f6" className="me-3" />
                  <div>
                    <h6 className="mb-0">Email</h6>
                    <small className="text-muted">Send via email with PDF attachment</small>
                  </div>
                </div>
              </div>

              {/* SMS Option */}
              <div 
                className={`send-method-card ${sendMethod === 'sms' ? 'active' : ''}`}
                onClick={() => setSendMethod('sms')}
              >
                <div className="d-flex align-items-center">
                  <FaSms size={32} color="#f59e0b" className="me-3" />
                  <div>
                    <h6 className="mb-0">SMS</h6>
                    <small className="text-muted">Send text message with quote link</small>
                  </div>
                </div>
              </div>

              {/* WhatsApp Option */}
              <div 
                className={`send-method-card ${sendMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setSendMethod('whatsapp')}
              >
                <div className="d-flex align-items-center">
                  <FaWhatsapp size={32} color="#16a34a" className="me-3" />
                  <div>
                    <h6 className="mb-0">WhatsApp</h6>
                    <small className="text-muted">Opens WhatsApp with pre-filled message</small>
                  </div>
                </div>
              </div>

              {/* Download Option */}
              <div 
                className={`send-method-card ${sendMethod === 'download' ? 'active' : ''}`}
                onClick={() => setSendMethod('download')}
              >
                <div className="d-flex align-items-center">
                  <FaDownload size={32} color="#9333ea" className="me-3" />
                  <div>
                    <h6 className="mb-0">Download Only</h6>
                    <small className="text-muted">Download PDF to send manually</small>
                  </div>
                </div>
              </div>

              <Alert variant="info" className="mt-3">
                💰 <strong>Total:</strong> KSh {calculateTotal().toLocaleString()}
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSendQuote(false)}>
                Cancel
              </Button>
              {sendMethod === 'whatsapp' ? (
                <Button variant="success" onClick={openWhatsApp}>
                  <FaWhatsapp /> Open WhatsApp
                </Button>
              ) : sendMethod === 'download' ? (
                <Button variant="success" onClick={handleDownloadQuotePDF}>
                  <FaDownload /> Download PDF
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  onClick={handleSendQuote}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Sending...' : (
                    <>
                      {sendMethod === 'email' && <><FaEnvelope /> Send Email</>}
                      {sendMethod === 'sms' && <><FaSms /> Send SMS</>}
                    </>
                  )}
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </>
  );
}

JobsTab.propTypes = {
  jobs: PropTypes.array,
  setJobs: PropTypes.func,
};

export default JobsTab;
