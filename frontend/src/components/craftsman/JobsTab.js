import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Badge, Form, Row, Col, Card, Alert, ProgressBar } from "react-bootstrap";
import { 
  FaPhone, FaComments, FaClock, FaCheckCircle, FaTimesCircle,
  FaFileAlt, FaCamera, FaMoneyBillWave, FaStar, FaEnvelope, FaSms, FaWhatsapp, FaDownload,
  FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle
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
    
    // Load existing quote details if available
    const existingQuote = job.quote_details ? (typeof job.quote_details === 'string' ? JSON.parse(job.quote_details) : job.quote_details) : null;
    
    setQuoteDetails(existingQuote || {
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
      await api.post(`/job-requests/${jobId}/accept/`);
    }

    else if (action === "reject") {
      await api.post(`/job-requests/${jobId}/reject/`);
    }

    else if (action === "start") {
      await api.post(`/job-requests/${jobId}/start/`);
    }

    else if (action === "complete") {
      const formData = new FormData();

      if (payload?.files) {
        Array.from(payload.files).forEach((file) =>
          formData.append("proof_files", file)
        );
      }

      await api.post(`/job-requests/${jobId}/complete/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    else if (action === "confirm-received") {
      await api.post(`/job-requests/${jobId}/confirm-payment/`);
    }

    else if (action === "submit-quote") {
      const formData = new FormData();
      formData.append("quote_details", JSON.stringify(payload.quote));

      await api.post(
        `/job-requests/${jobId}/submit-quote/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }

    const { data } = await api.get(`/job-requests/${jobId}/`);
    applyUpdatedJob(data);

    alert(`✅ Job ${action} successful!`);

  } catch (err) {
    console.error(err.response?.data);
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
    
    setTimeout(() => {
      setShowSendQuote(true);
    }, 500);
  };

  const generateQuotePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, y, { align: "center" });
    
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.setFont("helvetica", "bold");
    doc.text("FROM:", 14, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(quoteDetails.plumberName || "Craftsman Name", 14, y);
    y += lineHeight;
    doc.text(`Phone: ${quoteDetails.user?.phone || "N/A"}`, 14, y);
    y += lineHeight;
    doc.text(`Email: ${quoteDetails.user?.email || "N/A"}`, 14, y);
    
    y += lineHeight * 2;
    doc.setFont("helvetica", "bold");
    doc.text("TO:", 14, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(quoteDetails.client?.full_name || "Client Name", 14, y);
    y += lineHeight;
    doc.text(`Phone: ${quoteDetails.client?.phone || "N/A"}`, 14, y);
    
    y += lineHeight * 2;
    doc.text(`Quote Number: QTN-${selectedJob.id}`, 14, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, y);
    
    y += lineHeight * 2;
    
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
    
    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: KSh ${subtotal.toLocaleString()}`, 140, y);
    
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
            className="modern-btn modern-btn-success"
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
            className="modern-btn modern-btn-outline"
          >
            <FaTimesCircle /> Reject
          </Button>
        </>
      );
    }

    if (status === "accepted") {
      return (
        <>
          <Button variant="primary" onClick={() => setShowQuoteForm(true)} className="modern-btn modern-btn-primary">
            <FaFileAlt /> Submit Quote
          </Button>
          <Button variant="outline-primary" className="modern-btn modern-btn-outline">
            <FaPhone /> Call Client: {showPhoneNumber()}
          </Button>
          <Button variant="secondary" className="modern-btn modern-btn-secondary">
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (status === "quotesubmitted") {
      return (
        <>
          <Alert variant="info" className="modern-alert modern-alert-info mb-3">
            <FaClock className="me-2" /> Waiting for client to approve your quote
          </Alert>
          <Button variant="outline-primary" onClick={() => setShowQuoteForm(true)} className="modern-btn modern-btn-outline">
            <FaFileAlt /> View/Edit Quote
          </Button>
          <Button variant="success" onClick={() => setShowSendQuote(true)} className="modern-btn modern-btn-success">
            <FaEnvelope /> Send Quote to Client
          </Button>
          <Button variant="secondary" className="modern-btn modern-btn-secondary">
            <FaComments /> Chat with Client
          </Button>
        </>
      );
    }

    if (status === "quoteapproved") {
      return (
        <>
          <Alert variant="success" className="modern-alert modern-alert-success mb-3">
            <FaCheckCircle className="me-2" /> Quote approved! Ready to start work.
          </Alert>
          <Button
            variant="success"
            onClick={() => updateJobStatus(selectedJob.id, "start")}
            disabled={actionLoading}
            className="modern-btn modern-btn-success"
          >
            🚀 Start Job
          </Button>
          <Button variant="outline-primary" className="modern-btn modern-btn-outline">
            <FaPhone /> Call: {showPhoneNumber()}
          </Button>
        </>
      );
    }

    if (status === "inprogress") {
      return (
        <>
          <Alert variant="warning" className="modern-alert modern-alert-warning mb-3">
            <FaClock className="me-2" /> Time Elapsed: <strong>{formatTime(elapsed)}</strong>
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label className="modern-label">
              <FaCamera className="me-2" /> Upload Progress Photos (Optional)
            </Form.Label>
            <div className="file-upload-wrapper">
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setProgressPhotos(e.target.files)}
                className="modern-file-input"
              />
              {progressPhotos.length > 0 && (
                <div className="file-count-badge badge-success">
                  <FaCheckCircle className="me-1" /> {progressPhotos.length} file(s) selected
                </div>
              )}
            </div>
            <small className="text-muted d-block mt-1">Keep client updated with progress photos</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="modern-label">
              <FaCheckCircle className="me-2" /> Upload Completion Proof (Required to complete)
            </Form.Label>
            <div className="file-upload-wrapper">
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setProofFiles(e.target.files)}
                required
                className="modern-file-input"
              />
              {proofFiles.length > 0 && (
                <div className={`file-count-badge ${proofFiles.length >= 3 ? 'badge-success' : 'badge-warning'}`}>
                  <FaCamera className="me-1" /> {proofFiles.length} file(s) selected
                  {proofFiles.length < 3 && ` (Need ${3 - proofFiles.length} more)`}
                </div>
              )}
            </div>
            <small className="text-muted d-block mt-1">Minimum 3 photos showing completed work</small>
          </Form.Group>

          <Button
            variant="success"
            disabled={!proofFiles || proofFiles.length < 3 || actionLoading}
            onClick={() => updateJobStatus(selectedJob.id, "complete", { files: proofFiles })}
            className="modern-btn modern-btn-success"
          >
            <FaCheckCircle /> Mark Complete & Submit
          </Button>
          <Button variant="secondary" className="modern-btn modern-btn-secondary">
            <FaComments /> Chat
          </Button>
        </>
      );
    }

    if (status === "completed") {
      return (
        <>
          <Alert variant="info" className="modern-alert modern-alert-info">
            <FaCheckCircle className="me-2" /> Work completed! Waiting for client confirmation and payment.
          </Alert>
          <Button variant="outline-secondary" className="modern-btn modern-btn-outline">
            <FaComments /> Chat with Client
          </Button>
        </>
      );
    }

    if (status === "paymentpending") {
      return (
        <>
          <Alert variant="warning" className="modern-alert modern-alert-warning">
            <FaMoneyBillWave className="me-2" /> Client confirmed completion. Payment pending.
          </Alert>
          <div className="mb-3 payment-details-card">
            <h6 className="fw-bold mb-2">Payment Details:</h6>
            <p className="mb-2">Amount Due: <strong className="text-success">KSh {selectedJob.budget?.toLocaleString()}</strong></p>
            <p className="text-muted small mb-0">
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
            className="modern-btn modern-btn-success"
          >
            <FaMoneyBillWave /> Confirm Payment Received
          </Button>
        </>
      );
    }

    if (status === "paid") {
      return (
        <>
          <Alert variant="success" className="modern-alert modern-alert-success">
            🎉 Job successfully completed and paid!
          </Alert>
          <div className="text-center review-section">
            <FaStar color="gold" size={32} />
            <p className="mt-2 mb-0">Client will leave a review soon</p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <style>{`
        /* ========== ENHANCED UI STYLES ========== */
        
        /* Modern Buttons */
        .modern-btn {
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 0.9375rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
        }

        .modern-btn-success {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
        }

        .modern-btn-success:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
        }

        .modern-btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .modern-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .modern-btn-secondary {
          background: #6b7280;
          border-color: #6b7280;
        }

        .modern-btn-outline {
          background: white;
          color: #374151;
          border-color: #d1d5db;
        }

        .modern-btn-outline:hover {
          border-color: #22c55e;
          color: #16a34a;
          background: #f0fdf4;
        }

        /* Cards */
        .job-card {
          transition: all 0.3s ease;
          border: 2px solid transparent;
          border-radius: 16px;
        }
        
        .job-card:hover {
          border-color: #22c55e;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
          transform: translateY(-2px);
        }

        /* Progress Tracker */
        .progress-tracker {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%);
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .progress-tracker h6 {
          color: #16a34a;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .progress {
          height: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.7);
        }

        .progress-bar {
          border-radius: 10px;
          background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
        }

        /* Modern Alerts */
        .modern-alert {
          border-radius: 12px;
          border: none;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          font-weight: 500;
        }

        .modern-alert-success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #22c55e;
          color: #15803d;
        }

        .modern-alert-warning {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-left: 4px solid #f59e0b;
          color: #92400e;
        }

        .modern-alert-info {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-left: 4px solid #3b82f6;
          color: #1e40af;
        }

        /* Quote Form Card */
        .quote-form-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border: 2px solid #86efac;
          border-radius: 20px;
          padding: 2rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quote-form-header {
          border-bottom: 2px solid #86efac;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        /* Form Inputs */
        .modern-input {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .modern-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        .modern-label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        /* Quote Items */
        .quote-item-row {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .quote-item-row:hover {
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
        }

        .item-total {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          display: inline-block;
        }

        /* File Upload */
        .file-upload-wrapper {
          position: relative;
        }

        .modern-file-input {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          background: #f9fafb;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .modern-file-input:hover {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .file-count-badge {
          margin-top: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .badge-success {
          background: #dcfce7;
          color: #15803d;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        /* Send Method Cards */
        .send-method-card {
          padding: 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
          background: white;
        }

        .send-method-card:hover {
          border-color: #22c55e;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.12);
          transform: translateY(-2px);
        }

        .send-method-card.active {
          border-color: #22c55e;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.15);
        }

        .send-method-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .send-method-card:hover .send-method-icon {
          transform: scale(1.1);
        }

        .icon-email { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
        .icon-sms { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
        .icon-whatsapp { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
        .icon-download { background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); }

        /* Payment Details */
        .payment-details-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border: 2px solid #86efac;
          border-radius: 12px;
          padding: 1.25rem;
        }

        /* Review Section */
        .review-section {
          padding: 2rem;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-radius: 12px;
        }

        /* Detail Sections */
        .detail-item {
          padding: 0.75rem;
          background: white;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          border-left: 3px solid #22c55e;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="card p-4 shadow-sm border-0">
        <h4 className="mb-3 fw-bold">My Jobs</h4>

        {!jobs || jobs.length === 0 ? (
          <Alert variant="info" className="modern-alert modern-alert-info">
            <FaInfoCircle className="me-2" />
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
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="d-flex align-items-center gap-2">
                <FaFileAlt className="text-success" />
                {selectedJob.service} - Job #{selectedJob.id}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {/* Progress Tracker */}
              <div className="progress-tracker">
                <h6 className="mb-2 d-flex align-items-center gap-2">
                  <FaClock />
                  Job Progress
                </h6>
                <ProgressBar 
                  now={getProgressPercentage()} 
                  label={`${getProgressPercentage()}%`}
                  variant="success"
                  animated
                  striped
                />
                <small className="text-muted d-block mt-2">
                  {getStatusBadge(selectedJob.status).text}
                </small>
              </div>

              {/* Job Details Card */}
              <Card className="mb-3 shadow-sm job-card border-0">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
                        <FaFileAlt className="text-success" />
                        {selectedJob.service}
                      </h5>
                      <Badge bg={getStatusBadge(selectedJob.status).bg} className="mb-3 px-3 py-2">
                        {getStatusBadge(selectedJob.status).text}
                      </Badge>

                      <div className="detail-item">
                        <p className="mb-1"><strong>📝 Description:</strong></p>
                        <p className="text-muted mb-0">{selectedJob.description || "No description provided"}</p>
                      </div>

                      <div className="detail-item">
                        <p className="mb-0">
                          <FaPhone className="text-success me-2" />
                          <strong>Client Phone:</strong> {showPhoneNumber()}
                        </p>
                      </div>

                      <div className="detail-item">
                        <p className="mb-0">
                          <FaMapMarkerAlt className="text-success me-2" />
                          <strong>Location:</strong> {selectedJob.location}
                        </p>
                        {selectedJob.address && (
                          <p className="mb-0 text-muted small mt-1">
                            <strong>Address:</strong> {selectedJob.address}
                          </p>
                        )}
                      </div>

                      {selectedJob.schedule && (
                        <div className="detail-item">
                          <p className="mb-0">
                            <FaCalendarAlt className="text-success me-2" />
                            <strong>Scheduled:</strong> {new Date(selectedJob.schedule).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col md={4}>
                      <div className="detail-item">
                        <h6 className="fw-bold mb-3">Job Details</h6>
                        <div className="mb-3">
                          <small className="text-muted d-block">Budget</small>
                          <h4 className="text-success fw-bold mb-0">KSh {selectedJob.budget?.toLocaleString()}</h4>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-2">Priority</small>
                          <Badge bg={selectedJob.isUrgent ? "danger" : "secondary"} className="px-3 py-2">
                            {selectedJob.isUrgent ? (
                              <><FaExclamationTriangle className="me-1" /> Urgent</>
                            ) : (
                              <><FaCheckCircle className="me-1" /> Normal</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Quote Form - FIXED: Added condition to show for "accepted" and "quotesubmitted" statuses */}
              {showQuoteForm && ["accepted", "quotesubmitted"].includes(normalizedStatus(selectedJob.status)) && (
                <Card className="mb-3 quote-form-card border-0">
                  <div className="quote-form-header">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <FaFileAlt className="text-success" />
                      {normalizedStatus(selectedJob.status) === "accepted" ? "Submit Professional Quote" : "View/Edit Quote"}
                    </h6>
                  </div>

                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label className="modern-label">
                        <FaEdit /> Business/Company Name
                      </Form.Label>
                      <Form.Control
                        className="modern-input"
                        value={quoteDetails.plumberName}
                        onChange={(e) =>
                          setQuoteDetails({ ...quoteDetails, plumberName: e.target.value })
                        }
                        placeholder="Your name or business name"
                      />
                    </Form.Group>

                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <FaFileAlt className="text-success" />
                      Items & Services
                    </h6>

                    {quoteDetails.items.map((item, index) => (
                      <div key={index} className="quote-item-row">
                        <Row className="align-items-end g-2">
                          <Col md={5}>
                            <Form.Label className="modern-label small">Description</Form.Label>
                            <Form.Control
                              className="modern-input"
                              value={item.desc}
                              onChange={(e) => updateQuoteItem(index, "desc", e.target.value)}
                              placeholder="e.g., Painting labor"
                            />
                          </Col>
                          <Col md={2}>
                            <Form.Label className="modern-label small">Qty</Form.Label>
                            <Form.Control
                              className="modern-input"
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateQuoteItem(index, "qty", parseInt(e.target.value))}
                              min="1"
                            />
                          </Col>
                          <Col md={3}>
                            <Form.Label className="modern-label small">Unit Price (KSh)</Form.Label>
                            <Form.Control
                              className="modern-input"
                              type="number"
                              value={item.price}
                              onChange={(e) => updateQuoteItem(index, "price", parseFloat(e.target.value))}
                              min="0"
                            />
                          </Col>
                          <Col md={2} className="d-flex align-items-center gap-2">
                            <span className="item-total small">
                              {(item.qty * item.price).toLocaleString()}
                            </span>
                            {quoteDetails.items.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeQuoteItem(index)}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </div>
                    ))}

                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={addQuoteItem}
                      className="mb-4"
                    >
                      <FaPlus /> Add Item
                    </Button>

                    <Row className="mb-4 g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="modern-label">Work Type</Form.Label>
                          <Form.Select
                            className="modern-input"
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
                          <Form.Label className="modern-label">
                            <FaClock /> Estimated Duration
                          </Form.Label>
                          <Form.Control
                            className="modern-input"
                            value={quoteDetails.duration}
                            onChange={(e) =>
                              setQuoteDetails({ ...quoteDetails, duration: e.target.value })
                            }
                            placeholder="e.g., 2 days, 1 week"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="modern-label">
                        <FaMoneyBillWave /> Payment Terms
                      </Form.Label>
                      <Form.Select
                        className="modern-input"
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

                    <Form.Group className="mb-4">
                      <Form.Label className="modern-label">Additional Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        className="modern-input"
                        value={quoteDetails.notes}
                        onChange={(e) =>
                          setQuoteDetails({ ...quoteDetails, notes: e.target.value })
                        }
                        placeholder="Any special terms, warranties, or notes..."
                      />
                    </Form.Group>

                    <Alert variant="success" className="modern-alert modern-alert-success">
                      <FaMoneyBillWave className="me-2" />
                      <strong>Total Quote: KSh {calculateTotal().toLocaleString()}</strong>
                    </Alert>

                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={handleDownloadQuotePDF}
                        className="modern-btn modern-btn-outline"
                      >
                        <FaDownload /> Download PDF
                      </Button>
                      <div className="d-flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setShowQuoteForm(false)}
                          className="modern-btn"
                        >
                          Cancel
                        </Button>
                        {normalizedStatus(selectedJob.status) === "accepted" && (
                          <Button
                            variant="success"
                            onClick={handleSubmitQuote}
                            disabled={actionLoading}
                            className="modern-btn modern-btn-success"
                          >
                            <FaCheckCircle /> Submit Quote
                          </Button>
                        )}
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

            <Modal.Footer className="border-0">
              <Button variant="secondary" onClick={handleClose} className="modern-btn">
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Send Quote Modal */}
        {showSendQuote && selectedJob && (
          <Modal show={showSendQuote} onHide={() => setShowSendQuote(false)} centered>
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-success" />
                Send Quote to Client
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted mb-4">
                Choose how to send the quote to <strong>{selectedJob.client?.full_name}</strong>
              </p>

              <div 
                className={`send-method-card ${sendMethod === 'email' ? 'active' : ''}`}
                onClick={() => setSendMethod('email')}
              >
                <div className="d-flex align-items-center">
                  <div className="send-method-icon icon-email me-3">
                    <FaEnvelope size={24} color="#3b82f6" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">Email</h6>
                    <small className="text-muted">Send via email with PDF attachment</small>
                  </div>
                </div>
              </div>

              <div 
                className={`send-method-card ${sendMethod === 'sms' ? 'active' : ''}`}
                onClick={() => setSendMethod('sms')}
              >
                <div className="d-flex align-items-center">
                  <div className="send-method-icon icon-sms me-3">
                    <FaSms size={24} color="#f59e0b" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">SMS</h6>
                    <small className="text-muted">Send text message with quote link</small>
                  </div>
                </div>
              </div>

              <div 
                className={`send-method-card ${sendMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setSendMethod('whatsapp')}
              >
                <div className="d-flex align-items-center">
                  <div className="send-method-icon icon-whatsapp me-3">
                    <FaWhatsapp size={24} color="#16a34a" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">WhatsApp</h6>
                    <small className="text-muted">Opens WhatsApp with pre-filled message</small>
                  </div>
                </div>
              </div>

              <div 
                className={`send-method-card ${sendMethod === 'download' ? 'active' : ''}`}
                onClick={() => setSendMethod('download')}
              >
                <div className="d-flex align-items-center">
                  <div className="send-method-icon icon-download me-3">
                    <FaDownload size={24} color="#9333ea" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">Download Only</h6>
                    <small className="text-muted">Download PDF to send manually</small>
                  </div>
                </div>
              </div>

              <Alert variant="info" className="modern-alert modern-alert-info mt-3">
                <FaMoneyBillWave className="me-2" />
                <strong>Total:</strong> KSh {calculateTotal().toLocaleString()}
              </Alert>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="secondary" onClick={() => setShowSendQuote(false)} className="modern-btn">
                Cancel
              </Button>
              {sendMethod === 'whatsapp' ? (
                <Button variant="success" onClick={openWhatsApp} className="modern-btn modern-btn-success">
                  <FaWhatsapp /> Open WhatsApp
                </Button>
              ) : sendMethod === 'download' ? (
                <Button variant="success" onClick={handleDownloadQuotePDF} className="modern-btn modern-btn-success">
                  <FaDownload /> Download PDF
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  onClick={handleSendQuote}
                  disabled={actionLoading}
                  className="modern-btn modern-btn-success"
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