import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Row, Col } from "react-bootstrap";
import {
  FaPhone, FaComments, FaClock, FaCheckCircle, FaTimesCircle,
  FaFileAlt, FaCamera, FaMoneyBillWave, FaStar, FaEnvelope,
  FaSms, FaWhatsapp, FaDownload, FaPlus, FaTrash, FaEdit,
  FaMapMarkerAlt, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle,
  FaBriefcase, FaArrowRight, FaTools, FaHardHat,
} from "react-icons/fa";
import api from "../../api/axiosClient";
import jsPDF from "jspdf";

// ─── Status config — source of truth ────────────────────────────────────────
const STATUS = {
  pending:        { label:"Pending",               color:"#78716c", bg:"#f5f5f4", dot:"#a8a29e",  step:1  },
  assigned:       { label:"Assigned to You",       color:"#1d4ed8", bg:"#eff6ff", dot:"#3b82f6",  step:2  },
  accepted:       { label:"Accepted",              color:"#15803d", bg:"#f0fdf4", dot:"#22c55e",  step:3  },
  quotesubmitted: { label:"Quote Submitted",       color:"#b45309", bg:"#fffbeb", dot:"#f59e0b",  step:4  },
  quoteapproved:  { label:"Quote Approved",        color:"#0f766e", bg:"#f0fdfa", dot:"#14b8a6",  step:5  },
  inprogress:     { label:"In Progress",           color:"#9a3412", bg:"#fff7ed", dot:"#f97316",  step:6  },
  completed:      { label:"Awaiting Confirmation", color:"#1e40af", bg:"#eff6ff", dot:"#3b82f6",  step:7  },
  paymentpending: { label:"Payment Pending",       color:"#92400e", bg:"#fffbeb", dot:"#f59e0b",  step:8  },
  paid:           { label:"Paid & Closed",         color:"#166534", bg:"#f0fdf4", dot:"#16a34a",  step:9  },
  rejected:       { label:"Rejected",              color:"#991b1b", bg:"#fef2f2", dot:"#ef4444",  step:0  },
};

const norm = s => (s || "").toLowerCase().replace(/[_\s]/g, "");
const getStatus = s => STATUS[norm(s)] || { label: s, color:"#6b7280", bg:"#f9fafb", dot:"#9ca3af", step:0 };

function JobsTab({ jobs: initialJobs = [], setJobs, addToast }) {
  const [jobs, setLocalJobs]       = useState([]);
  const [selected, setSelected]    = useState(null);
  const [proofFiles, setProofFiles]= useState([]);
  const [actionLoading, setAction] = useState(false);
  const [elapsed, setElapsed]      = useState(0);
  const [showQuote, setShowQuote]  = useState(false);
  const [showSend, setShowSend]    = useState(false);
  const [sendMethod, setSend]      = useState("email");
  const [filter, setFilter]        = useState("all");
  const [quoteDetails, setQuote]   = useState({
    plumberName:"", items:[{ desc:"", qty:1, price:0 }],
    workType:"", duration:"", startDate:"", completionDate:"",
    paymentTerms:"50% Deposit, 50% on Completion", notes:"",
    user:null, client:null,
  });
  const timerRef = useRef(null);

  useEffect(() => { setLocalJobs(initialJobs || []); }, [initialJobs]);

  useEffect(() => {
    if (!selected) return clearTimer();
    if (norm(selected.status) === "inprogress") startTimerFrom(selected.start_time);
    else clearTimer();
    return clearTimer;
  }, [selected]);

  const clearTimer = () => { clearInterval(timerRef.current); timerRef.current = null; setElapsed(0); };
  const startTimerFrom = (iso) => {
    clearTimer();
    const start = iso ? new Date(iso) : new Date();
    const tick = () => setElapsed(Math.floor(Math.max(0, new Date() - start) / 1000));
    tick(); timerRef.current = setInterval(tick, 1000);
  };
  const fmt = (s) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const openJob = (job) => {
    setSelected(job); setProofFiles([]); setShowQuote(false); setShowSend(false);
    const eq = job.quote_details ? (typeof job.quote_details==="string" ? JSON.parse(job.quote_details) : job.quote_details) : null;
    setQuote(eq || { plumberName: job.craftsman?.full_name||"", items:[{desc:job.service||"",qty:1,price:job.budget||0}], workType:"", duration:"", startDate:"", completionDate:"", paymentTerms:"50% Deposit, 50% on Completion", notes:"", user:job.craftsman||null, client:job.client||null });
  };
  const closeJob = () => { setSelected(null); setProofFiles([]); setAction(false); setShowQuote(false); setShowSend(false); clearTimer(); };

  const doAction = async (jobId, action, payload=null) => {
    try {
      setAction(true);
      if (action==="accept")            await api.post(`/job-requests/${jobId}/accept/`);
      else if (action==="reject")       await api.post(`/job-requests/${jobId}/reject/`);
      else if (action==="start")        await api.post(`/job-requests/${jobId}/start/`);
      else if (action==="complete") {
        const fd = new FormData();
        if (payload?.files) Array.from(payload.files).forEach(f => fd.append("proof_files",f));
        await api.post(`/job-requests/${jobId}/complete/`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      }
      else if (action==="confirm-received") await api.post(`/job-requests/${jobId}/confirm-payment/`);
      else if (action==="submit-quote") {
        const fd = new FormData();
        fd.append("quote_details", JSON.stringify(payload.quote));
        await api.post(`/job-requests/${jobId}/submit-quote/`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      }
      const { data } = await api.get(`/job-requests/${jobId}/`);
      const update = prev => Array.isArray(prev) ? prev.map(j => j.id===data.id ? data : j) : prev;
      setJobs?.(update); setLocalJobs(update); setSelected(data);
      const msgs = {
        accept:            ["Job accepted! Get in touch with the client.", "success","Accepted"],
        reject:            ["Job declined.",                               "warning","Declined"],
        start:             ["Job started — timer running.",               "info",   "Started"],
        complete:          ["Marked complete. Awaiting client sign-off.", "success","Complete"],
        "confirm-received":["Payment confirmed. Job closed.",             "success","Paid"],
        "submit-quote":    ["Quote submitted.",                           "success","Quote Sent"],
      };
      const m = msgs[action]||["Done","success","Done"];
      addToast?.(m[0], m[1], m[2], 5000);
    } catch(e) {
      addToast?.(`Failed to ${action}. Try again.`, "error", "Error");
    } finally { setAction(false); }
  };

  const calcTotal = () => quoteDetails.items.reduce((s,i) => s + i.qty*i.price, 0);
  const addItem   = () => setQuote({...quoteDetails, items:[...quoteDetails.items,{desc:"",qty:1,price:0}]});
  const removeItem= (i)=> setQuote({...quoteDetails, items:quoteDetails.items.filter((_,idx)=>idx!==i)});
  const updateItem= (i,f,v)=>{ const it=[...quoteDetails.items]; it[i][f]=v; setQuote({...quoteDetails,items:it}); };

  const submitQuote = async () => {
    if (quoteDetails.items.some(i=>!i.desc||!i.price)) { addToast?.("Fill all item descriptions and prices.","warning","Incomplete"); return; }
    await doAction(selected.id,"submit-quote",{ quote:{...quoteDetails,total:calcTotal(),quoteNumber:`QTN-${selected.id}-${Date.now()}`,date:new Date().toLocaleDateString()} });
    setShowQuote(false); setTimeout(()=>setShowSend(true),500);
  };

  const buildPDF = () => {
    const doc=new jsPDF(); let y=20; const lh=8;
    doc.setFontSize(20); doc.setFont("helvetica","bold"); doc.text("QUOTATION",105,y,{align:"center"});
    y+=15; doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.setFont("helvetica","bold"); doc.text("FROM:",14,y);
    doc.setFont("helvetica","normal"); y+=lh; doc.text(quoteDetails.plumberName||"Craftsman",14,y);
    y+=lh*2; doc.setFont("helvetica","bold"); doc.text("TO:",14,y);
    doc.setFont("helvetica","normal"); y+=lh; doc.text(quoteDetails.client?.full_name||"Client",14,y);
    y+=lh*2; doc.text(`Quote: QTN-${selected.id}`,14,y); doc.text(`Date: ${new Date().toLocaleDateString()}`,120,y); y+=lh*2;
    doc.setFont("helvetica","bold"); doc.setFillColor(34,197,94); doc.rect(14,y-5,182,8,"F");
    doc.setTextColor(255,255,255); doc.text("Description",16,y); doc.text("Qty",120,y); doc.text("Unit Price",140,y); doc.text("Total",170,y);
    y+=lh; doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0); let subtotal=0;
    quoteDetails.items.forEach(i=>{ const t=i.qty*i.price; subtotal+=t; doc.text(i.desc,16,y); doc.text(String(i.qty),120,y); doc.text(`KSh ${i.price.toLocaleString()}`,140,y); doc.text(`KSh ${t.toLocaleString()}`,170,y); y+=lh; });
    y+=lh; doc.setFont("helvetica","bold"); doc.text(`TOTAL: KSh ${subtotal.toLocaleString()}`,140,y);
    y+=lh*2; doc.setFont("helvetica","normal"); doc.text(`Payment Terms: ${quoteDetails.paymentTerms}`,14,y);
    y+=lh; doc.text(`Duration: ${quoteDetails.duration}`,14,y);
    return doc;
  };
  const downloadPDF = () => buildPDF().save(`Quote-${selected.id}.pdf`);
  const sendQuote   = async () => {
    try {
      setAction(true);
      const pdf=buildPDF(); const blob=pdf.output("blob");
      const fd=new FormData();
      fd.append("job_id",selected.id); fd.append("quote_pdf",blob,`Quote-${selected.id}.pdf`);
      fd.append("send_method",sendMethod); fd.append("quote_details",JSON.stringify(quoteDetails));
      if (sendMethod==="email") fd.append("email",selected.client?.email||"");
      if (sendMethod==="sms")   fd.append("phone",selected.client?.phone||"");
      await api.post(`/job-requests/${selected.id}/send-quote/`,fd);
      addToast?.(`Quote sent via ${sendMethod}!`,"success","Sent",5000);
      setShowSend(false);
    } catch(e){ addToast?.("Failed to send quote.","error","Error"); } finally { setAction(false); }
  };
  const openWA = () => {
    const msg=encodeURIComponent(`Hi ${selected.client?.full_name||"there"}! 👋\n\nYour quote for *${selected.service}* is ready!\n\n💰 *Total:* KSh ${calcTotal().toLocaleString()}\n⏱️ *Duration:* ${quoteDetails.duration}\n📋 *Terms:* ${quoteDetails.paymentTerms}\n\nLet me know if you have questions!`);
    const ph=(selected.client?.phone||"").replace(/\D/g,"");
    window.open(`https://wa.me/${ph}?text=${msg}`,"_blank");
    setShowSend(false);
  };

  const phoneVisible = () => {
    if (!selected) return "N/A";
    return ["accepted","quotesubmitted","quoteapproved","inprogress","completed","paid"].includes(norm(selected.status))
      ? selected.client?.phone||selected.phone||"N/A"
      : "Hidden until accepted";
  };

  // Filter tabs
  const FILTERS = [
    { id:"all",      label:"All Jobs" },
    { id:"active",   label:"Active"   },
    { id:"done",     label:"Completed"},
  ];
  const filterFn = (j) => {
    if (filter==="active") return ["pending","assigned","accepted","quotesubmitted","quoteapproved","inprogress"].includes(norm(j.status));
    if (filter==="done")   return ["completed","paymentpending","paid"].includes(norm(j.status));
    return true;
  };
  const visible = jobs.filter(filterFn);

  // Progress steps
  const STEPS = ["Assigned","Accepted","Quoted","Approved","In Progress","Done","Paid"];
  const stepIdx = (status) => {
    const s = getStatus(status).step;
    if (s===0) return -1;
    return Math.min(s-2, STEPS.length-1);
  };

  // Action panel
  const Actions = () => {
    if (!selected) return null;
    const s = norm(selected.status);

    const Btn = ({variant="green", icon, children, ...props}) => {
      const styles = {
        green:  { bg:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white", shadow:"rgba(34,197,94,.3)" },
        amber:  { bg:"linear-gradient(135deg,#f59e0b,#d97706)", color:"white", shadow:"rgba(245,158,11,.3)" },
        slate:  { bg:"#f1f5f9",                                 color:"#475569",shadow:"transparent"        },
        red:    { bg:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", shadow:"rgba(239,68,68,.3)"  },
        blue:   { bg:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"white", shadow:"rgba(59,130,246,.3)" },
        outline:{ bg:"white", color:"#374151", shadow:"transparent", border:"2px solid #e5e7eb" },
      }[variant];
      return (
        <button {...props} style={{
          background:styles.bg, color:styles.color, border:styles.border||"none",
          borderRadius:12, padding:".75rem 1.375rem", fontWeight:700, fontSize:".9rem",
          display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer",
          boxShadow:styles.shadow ? `0 4px 16px ${styles.shadow}` : "none",
          transition:"all .2s", fontFamily:"'DM Sans',sans-serif", opacity:props.disabled?.8:1,
          ...props.style,
        }}
          onMouseEnter={e=>{ if(!props.disabled) e.currentTarget.style.transform="translateY(-2px)"; }}
          onMouseLeave={e=>e.currentTarget.style.transform=""}
        >
          {icon} {children}
        </button>
      );
    };

    const InfoStrip = ({color, icon, children}) => (
      <div style={{ background:color+"15", borderLeft:`4px solid ${color}`, borderRadius:"0 10px 10px 0", padding:".875rem 1.125rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:10, fontWeight:600, fontSize:".875rem", color }}>
        {icon} {children}
      </div>
    );

    if (["pending","assigned"].includes(s)) return (
      <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
        <Btn variant="green" icon={<FaCheckCircle/>} disabled={actionLoading} onClick={()=>doAction(selected.id,"accept")}>Accept Job</Btn>
        <Btn variant="outline" icon={<FaTimesCircle/>} disabled={actionLoading}
          onClick={()=>{ if(window.confirm("Reject this job?")) doAction(selected.id,"reject"); }}
          style={{color:"#ef4444",borderColor:"#fca5a5"}}>
          Decline
        </Btn>
      </div>
    );

    if (s==="accepted") return (
      <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
        <Btn variant="blue" icon={<FaFileAlt/>} onClick={()=>setShowQuote(true)}>Prepare Quote</Btn>
        <Btn variant="outline" icon={<FaPhone/>}>{phoneVisible()}</Btn>
        <Btn variant="slate" icon={<FaComments/>}>Message</Btn>
      </div>
    );

    if (s==="quotesubmitted") return (
      <>
        <InfoStrip color="#3b82f6" icon={<FaClock/>}>Waiting for client to approve your quote</InfoStrip>
        <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
          <Btn variant="outline" icon={<FaEdit/>} onClick={()=>setShowQuote(true)}>Edit Quote</Btn>
          <Btn variant="green" icon={<FaEnvelope/>} onClick={()=>setShowSend(true)}>Resend Quote</Btn>
        </div>
      </>
    );

    if (s==="quoteapproved") return (
      <>
        <InfoStrip color="#16a34a" icon={<FaCheckCircle/>}>Quote approved — ready to start work!</InfoStrip>
        <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
          <Btn variant="amber" icon={<FaTools/>} disabled={actionLoading} onClick={()=>doAction(selected.id,"start")}>Start Job</Btn>
          <Btn variant="outline" icon={<FaPhone/>}>{phoneVisible()}</Btn>
        </div>
      </>
    );

    if (s==="inprogress") return (
      <>
        <div style={{ background:"#1c1917", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1rem", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#f97316", boxShadow:"0 0 0 4px rgba(249,115,22,.25)", animation:"pulse 1.5s infinite" }}/>
          <span style={{ color:"#fed7aa", fontWeight:700, fontFamily:"'DM Mono',monospace", fontSize:"1.25rem", letterSpacing:2 }}>{fmt(elapsed)}</span>
          <span style={{ color:"#78716c", fontSize:".78rem", fontWeight:600 }}>elapsed</span>
        </div>

        <Form.Group className="mb-3">
          <label style={{ fontWeight:700, fontSize:".8rem", color:"#44403c", textTransform:"uppercase", letterSpacing:.5, marginBottom:6, display:"block" }}>
            <FaCheckCircle style={{color:"#22c55e",marginRight:6}}/>Completion Proof — min 3 photos *
          </label>
          <div style={{ border:"2px dashed #d4cdc8", borderRadius:12, padding:"1.25rem", background:"#fafaf9", cursor:"pointer", textAlign:"center" }}
            onClick={()=>document.getElementById("proofInput").click()}>
            <FaCamera size={20} style={{color:"#a8a29e",marginBottom:6}}/>
            <p style={{margin:0,fontSize:".8rem",color:"#78716c",fontWeight:600}}>
              {proofFiles.length > 0 ? `${proofFiles.length} file${proofFiles.length>1?"s":""} selected` : "Click to upload photos"}
            </p>
            {proofFiles.length>0 && proofFiles.length<3 && <p style={{margin:"4px 0 0",fontSize:".72rem",color:"#f97316"}}>Need {3-proofFiles.length} more</p>}
          </div>
          <input id="proofInput" type="file" multiple accept="image/*" style={{display:"none"}} onChange={e=>setProofFiles(e.target.files)}/>
        </Form.Group>

        <Btn variant="green" icon={<FaCheckCircle/>}
          disabled={!proofFiles||proofFiles.length<3||actionLoading}
          onClick={()=>doAction(selected.id,"complete",{files:proofFiles})}>
          Submit & Mark Complete
        </Btn>
      </>
    );

    if (s==="completed") return (
      <InfoStrip color="#3b82f6" icon={<FaCheckCircle/>}>Work submitted — awaiting client confirmation and payment</InfoStrip>
    );

    if (s==="paymentpending") return (
      <>
        <div style={{ background:"#fefce8", border:"2px solid #fde68a", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
          <div style={{fontSize:".72rem",color:"#92400e",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Amount Due</div>
          <div style={{fontSize:"2rem",fontWeight:900,color:"#15803d",lineHeight:1}}>KSh {selected.budget?.toLocaleString()}</div>
          <div style={{fontSize:".75rem",color:"#78716c",marginTop:4}}>Cash · M-Pesa · Bank Transfer</div>
        </div>
        <Btn variant="green" icon={<FaMoneyBillWave/>}
          onClick={()=>{ if(window.confirm("Confirm payment received?")) doAction(selected.id,"confirm-received"); }}>
          Confirm Payment Received
        </Btn>
      </>
    );

    if (s==="paid") return (
      <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
        <div style={{fontSize:"3rem",marginBottom:".5rem"}}>🎉</div>
        <div style={{fontWeight:900,fontSize:"1.25rem",color:"#15803d"}}>Job Complete & Paid</div>
        <div style={{color:"#78716c",marginTop:4,fontSize:".875rem"}}>Client may leave a review</div>
      </div>
    );

    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,500&family=DM+Mono:wght@400;500&display=swap');

        .jt-wrap { font-family:'DM Sans',sans-serif; color:#1c1917; }

        /* Filter tabs */
        .jt-filters { display:flex; gap:.5rem; margin-bottom:1.5rem; }
        .jt-filter {
          padding:.5rem 1.25rem; border-radius:50px; font-weight:700; font-size:.8rem;
          border:2px solid #e7e5e4; background:white; color:#78716c; cursor:pointer;
          transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .jt-filter:hover   { border-color:#d4cdc8; color:#44403c; }
        .jt-filter.active  { background:#1c1917; color:white; border-color:#1c1917; }

        /* Job cards grid */
        .jt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1rem; }

        /* Job ticket card */
        .jt-card {
          background:white; border-radius:16px; overflow:hidden;
          border:2px solid #e7e5e4; cursor:pointer;
          transition:transform .2s, box-shadow .2s, border-color .2s;
          position:relative;
        }
        .jt-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.1); border-color:#d4cdc8; }
        .jt-card-top { padding:1.125rem 1.25rem .875rem; }
        .jt-card-bottom { padding:.75rem 1.25rem; background:#fafaf9; border-top:2px solid #f5f5f4; display:flex; align-items:center; justify-content:space-between; }

        /* Status strip at top of card */
        .jt-status-strip { height:4px; width:100%; }

        /* Status dot */
        .jt-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        /* Number chip */
        .jt-num { font-family:'DM Mono',monospace; font-size:.68rem; color:#a8a29e; font-weight:500; }

        /* Empty state */
        .jt-empty { text-align:center; padding:5rem 2rem; }

        /* Modal overrides */
        .jt-modal .modal-content {
          border-radius:20px; border:none;
          box-shadow:0 24px 64px rgba(0,0,0,.15);
          font-family:'DM Sans',sans-serif;
          overflow:hidden;
        }
        .jt-modal .modal-header { border:none; padding:1.5rem 1.75rem 0; }
        .jt-modal .modal-body   { padding:1.25rem 1.75rem; }
        .jt-modal .modal-footer { border:none; padding:1.25rem 1.75rem 1.5rem; background:#fafaf9; }

        /* Quote items */
        .qt-item { background:#fafaf9; border:2px solid #e7e5e4; border-radius:12px; padding:1rem; margin-bottom:.75rem; }
        .qt-input { width:100%; border:2px solid #e5e7eb; border-radius:10px; padding:.625rem .875rem; font-family:'DM Sans',sans-serif; font-size:.9rem; transition:border-color .2s; background:white; }
        .qt-input:focus { outline:none; border-color:#22c55e; }
        .qt-select { width:100%; border:2px solid #e5e7eb; border-radius:10px; padding:.625rem .875rem; font-family:'DM Sans',sans-serif; font-size:.9rem; background:white; }

        /* Send method cards */
        .sm-card { border:2px solid #e7e5e4; border-radius:14px; padding:1rem 1.25rem; cursor:pointer; transition:all .2s; margin-bottom:.75rem; display:flex; align-items:center; gap:1rem; background:white; }
        .sm-card:hover   { border-color:#d4cdc8; background:#fafaf9; }
        .sm-card.active  { border-color:#22c55e; background:#f0fdf4; }
        .sm-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* Progress steps */
        .jt-steps { display:flex; align-items:center; gap:0; margin:1.25rem 0; overflow-x:auto; padding-bottom:.25rem; }
        .jt-step { display:flex; align-items:center; gap:0; }
        .jt-step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:800; flex-shrink:0; transition:all .3s; }
        .jt-step-dot.done   { background:#22c55e; color:white; }
        .jt-step-dot.current{ background:#1c1917; color:white; box-shadow:0 0 0 4px rgba(28,25,23,.15); }
        .jt-step-dot.future { background:#f5f5f4; color:#a8a29e; }
        .jt-step-line { width:28px; height:2px; background:#e7e5e4; flex-shrink:0; }
        .jt-step-line.done { background:#22c55e; }

        /* Keyframes */
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 4px rgba(249,115,22,.25)} 50%{box-shadow:0 0 0 8px rgba(249,115,22,.1)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .jt-animate { animation:slideIn .35s ease forwards; }

        /* Detail rows */
        .jt-detail { display:flex; align-items:flex-start; gap:.75rem; padding:.75rem 0; border-bottom:1px solid #f5f5f4; }
        .jt-detail:last-child { border-bottom:none; }
        .jt-detail-icon { width:32px; height:32px; background:#f5f5f4; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#78716c; font-size:.8rem; flex-shrink:0; margin-top:2px; }
        .jt-detail-label { font-size:.72rem; color:#a8a29e; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
        .jt-detail-val   { font-size:.9375rem; color:#1c1917; font-weight:600; }

        @media(max-width:600px) { .jt-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="jt-wrap">

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2 style={{ margin:0, fontWeight:800, fontSize:"1.5rem", letterSpacing:"-.5px" }}>Work Orders</h2>
            <p style={{ margin:"3px 0 0", color:"#78716c", fontSize:".875rem" }}>
              {jobs.length} job{jobs.length!==1?"s":""} assigned · {jobs.filter(j=>["inprogress","accepted"].includes(norm(j.status))).length} active
            </p>
          </div>
          <div className="jt-filters">
            {FILTERS.map(f => (
              <button key={f.id} className={`jt-filter ${filter===f.id?"active":""}`} onClick={()=>setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {visible.length === 0 && (
          <div className="jt-empty">
            <FaHardHat size={48} style={{ color:"#d4cdc8", marginBottom:"1rem", display:"block", margin:"0 auto 1rem" }}/>
            <h3 style={{ fontWeight:800, color:"#44403c", marginBottom:".5rem" }}>No jobs here</h3>
            <p style={{ color:"#a8a29e", margin:0 }}>
              {filter==="all" ? "Jobs will appear once admin assigns them to you." : `No ${filter} jobs at the moment.`}
            </p>
          </div>
        )}

        {/* ── Job card grid ── */}
        <div className="jt-grid">
          {visible.map((job, i) => {
            const s    = getStatus(job.status);
            const isUrgent = job.isUrgent;
            return (
              <div key={job.id} className="jt-card jt-animate" style={{ animationDelay:`${i*40}ms` }} onClick={()=>openJob(job)}>
                {/* Status colour strip */}
                <div className="jt-status-strip" style={{ background:s.dot }}/>

                <div className="jt-card-top">
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:".75rem" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>
                        <span style={{ fontSize:".72rem", fontWeight:700, color:s.color, textTransform:"uppercase", letterSpacing:.5 }}>{s.label}</span>
                        {isUrgent && <span style={{ background:"#fef2f2", color:"#ef4444", fontSize:".65rem", fontWeight:800, padding:"1px 7px", borderRadius:50 }}>URGENT</span>}
                      </div>
                      <h4 style={{ margin:0, fontWeight:800, fontSize:"1.0625rem", color:"#1c1917", letterSpacing:"-.25px" }}>{job.service||"Service"}</h4>
                    </div>
                    <div style={{ background:"#f5f5f4", borderRadius:8, padding:"4px 10px", textAlign:"right" }}>
                      <div style={{ fontSize:".65rem", color:"#a8a29e", fontWeight:600 }}>Budget</div>
                      <div style={{ fontWeight:800, fontSize:".9rem", color:"#15803d" }}>KSh {job.budget?.toLocaleString()||"TBD"}</div>
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"#78716c", fontSize:".8rem", marginBottom:6 }}>
                    <FaMapMarkerAlt size={11}/> {job.location||"Location TBD"}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"#78716c", fontSize:".8rem" }}>
                    <FaTools size={11}/> {job.client?.full_name||"Client"}
                  </div>
                </div>

                <div className="jt-card-bottom">
                  <span className="jt-num">#{String(job.id).padStart(4,"0")}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:".8rem", color:"#44403c", fontWeight:700 }}>
                    View <FaArrowRight size={11}/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ Job Detail Modal ══ */}
        {selected && (
          <Modal show onHide={closeJob} centered size="lg" className="jt-modal">
            <Modal.Header closeButton>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:getStatus(selected.status).dot+"22", display:"flex", alignItems:"center", justifyContent:"center", color:getStatus(selected.status).dot }}>
                  <FaBriefcase size={18}/>
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:"1.0625rem", lineHeight:1.2 }}>{selected.service}</div>
                  <div style={{ fontSize:".75rem", color:"#78716c", marginTop:2 }}>Job #{String(selected.id).padStart(4,"0")} · {selected.client?.full_name||"Client"}</div>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body>
              {/* Progress tracker */}
              <div style={{ background:"#fafaf9", border:"2px solid #f5f5f4", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:".72rem", fontWeight:700, color:"#a8a29e", textTransform:"uppercase", letterSpacing:.5, marginBottom:".75rem" }}>Progress</div>
                <div className="jt-steps">
                  {STEPS.map((step, i) => {
                    const cur = stepIdx(selected.status);
                    const isDone    = i < cur;
                    const isCurrent = i === cur;
                    return (
                      <div key={i} className="jt-step">
                        <div style={{ textAlign:"center" }}>
                          <div className={`jt-step-dot ${isDone?"done":isCurrent?"current":"future"}`}>
                            {isDone ? "✓" : i+1}
                          </div>
                          <div style={{ fontSize:".58rem", color:isDone||isCurrent?"#44403c":"#a8a29e", fontWeight:600, marginTop:4, whiteSpace:"nowrap", textAlign:"center" }}>{step}</div>
                        </div>
                        {i < STEPS.length-1 && <div className={`jt-step-line ${isDone?"done":""}`} style={{ marginTop:"-14px" }}/>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two-column details */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
                {/* Left: job info */}
                <div style={{ background:"white", border:"2px solid #f5f5f4", borderRadius:14, padding:"1.125rem" }}>
                  <div style={{ fontSize:".72rem", fontWeight:700, color:"#a8a29e", textTransform:"uppercase", letterSpacing:.5, marginBottom:".75rem" }}>Job Details</div>
                  <div className="jt-detail">
                    <div className="jt-detail-icon"><FaPhone/></div>
                    <div><div className="jt-detail-label">Client Phone</div><div className="jt-detail-val">{phoneVisible()}</div></div>
                  </div>
                  <div className="jt-detail">
                    <div className="jt-detail-icon"><FaMapMarkerAlt/></div>
                    <div><div className="jt-detail-label">Location</div><div className="jt-detail-val">{selected.location||"N/A"}</div></div>
                  </div>
                  {selected.schedule && (
                    <div className="jt-detail">
                      <div className="jt-detail-icon"><FaCalendarAlt/></div>
                      <div><div className="jt-detail-label">Scheduled</div><div className="jt-detail-val">{new Date(selected.schedule).toLocaleString()}</div></div>
                    </div>
                  )}
                  {selected.description && (
                    <div className="jt-detail">
                      <div className="jt-detail-icon"><FaFileAlt/></div>
                      <div><div className="jt-detail-label">Description</div><div className="jt-detail-val" style={{fontSize:".85rem",color:"#78716c"}}>{selected.description}</div></div>
                    </div>
                  )}
                </div>

                {/* Right: budget & urgency */}
                <div style={{ background:"white", border:"2px solid #f5f5f4", borderRadius:14, padding:"1.125rem" }}>
                  <div style={{ fontSize:".72rem", fontWeight:700, color:"#a8a29e", textTransform:"uppercase", letterSpacing:.5, marginBottom:".75rem" }}>Financial</div>
                  <div style={{ marginBottom:"1rem" }}>
                    <div style={{ fontSize:".72rem", color:"#a8a29e", fontWeight:600, marginBottom:3 }}>Budget / Quote</div>
                    <div style={{ fontSize:"1.75rem", fontWeight:900, color:"#15803d", letterSpacing:"-.5px" }}>
                      KSh {selected.budget?.toLocaleString()||"TBD"}
                    </div>
                  </div>
                  <div className="jt-detail" style={{ paddingTop:0 }}>
                    <div><div className="jt-detail-label">Priority</div>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:selected.isUrgent?"#fef2f2":"#f5f5f4", color:selected.isUrgent?"#ef4444":"#78716c", padding:"3px 12px", borderRadius:50, fontWeight:700, fontSize:".8rem", marginTop:3 }}>
                        {selected.isUrgent ? <><FaExclamationTriangle size={11}/> Urgent</> : "Normal"}
                      </div>
                    </div>
                  </div>
                  <div className="jt-detail">
                    <div><div className="jt-detail-label">Status</div>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:getStatus(selected.status).bg, color:getStatus(selected.status).color, padding:"3px 12px", borderRadius:50, fontWeight:700, fontSize:".8rem", marginTop:3 }}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:getStatus(selected.status).dot,flexShrink:0}}/>
                        {getStatus(selected.status).label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote form */}
              {showQuote && ["accepted","quotesubmitted"].includes(norm(selected.status)) && (
                <div style={{ background:"#fafaf9", border:"2px solid #e7e5e4", borderRadius:16, padding:"1.375rem", marginBottom:"1.25rem" }}>
                  <div style={{ fontWeight:800, fontSize:"1rem", marginBottom:"1.125rem", display:"flex", alignItems:"center", gap:8 }}>
                    <FaFileAlt style={{color:"#22c55e"}}/> 
                    {norm(selected.status)==="accepted" ? "Prepare Quote" : "Edit Quote"}
                  </div>

                  <div style={{marginBottom:"1rem"}}>
                    <label style={{fontWeight:600,fontSize:".8rem",color:"#44403c",display:"block",marginBottom:5}}>Your Name / Business</label>
                    <input className="qt-input" value={quoteDetails.plumberName} placeholder="e.g. James Kamau Electrical"
                      onChange={e=>setQuote({...quoteDetails,plumberName:e.target.value})}/>
                  </div>

                  <div style={{ fontWeight:700, fontSize:".85rem", marginBottom:".75rem", color:"#44403c" }}>Line Items</div>
                  {quoteDetails.items.map((item,idx)=>(
                    <div key={idx} className="qt-item">
                      <Row className="g-2 align-items-end">
                        <Col xs={12} md={5}>
                          <label style={{fontSize:".72rem",fontWeight:600,color:"#78716c",display:"block",marginBottom:3}}>Description</label>
                          <input className="qt-input" value={item.desc} placeholder="e.g. Labour charge" onChange={e=>updateItem(idx,"desc",e.target.value)}/>
                        </Col>
                        <Col xs={4} md={2}>
                          <label style={{fontSize:".72rem",fontWeight:600,color:"#78716c",display:"block",marginBottom:3}}>Qty</label>
                          <input className="qt-input" type="number" min="1" value={item.qty} onChange={e=>updateItem(idx,"qty",parseInt(e.target.value))}/>
                        </Col>
                        <Col xs={8} md={3}>
                          <label style={{fontSize:".72rem",fontWeight:600,color:"#78716c",display:"block",marginBottom:3}}>Unit Price (KSh)</label>
                          <input className="qt-input" type="number" min="0" value={item.price} onChange={e=>updateItem(idx,"price",parseFloat(e.target.value))}/>
                        </Col>
                        <Col xs={12} md={2} style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",color:"#15803d",padding:"5px 10px",borderRadius:8,fontWeight:700,fontSize:".8rem",whiteSpace:"nowrap"}}>
                            {(item.qty*item.price).toLocaleString()}
                          </div>
                          {quoteDetails.items.length>1 && (
                            <button onClick={()=>removeItem(idx)} style={{background:"#fef2f2",border:"1.5px solid #fca5a5",color:"#ef4444",borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><FaTrash size={11}/></button>
                          )}
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <button onClick={addItem} style={{background:"white",border:"2px dashed #d4cdc8",color:"#78716c",borderRadius:10,padding:".625rem 1.125rem",fontWeight:700,fontSize:".85rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:"1rem",fontFamily:"'DM Sans',sans-serif"}}>
                    <FaPlus size={11}/> Add Item
                  </button>

                  <Row className="g-2 mb-3">
                    <Col md={6}>
                      <label style={{fontWeight:600,fontSize:".8rem",color:"#44403c",display:"block",marginBottom:5}}>Work Type</label>
                      <select className="qt-select" value={quoteDetails.workType} onChange={e=>setQuote({...quoteDetails,workType:e.target.value})}>
                        <option value="">Select…</option>
                        <option>Labour Only</option><option>Labour + Materials</option><option>Materials Only</option>
                      </select>
                    </Col>
                    <Col md={6}>
                      <label style={{fontWeight:600,fontSize:".8rem",color:"#44403c",display:"block",marginBottom:5}}>Duration</label>
                      <input className="qt-input" value={quoteDetails.duration} placeholder="e.g. 2 days" onChange={e=>setQuote({...quoteDetails,duration:e.target.value})}/>
                    </Col>
                  </Row>
                  <div style={{marginBottom:"1rem"}}>
                    <label style={{fontWeight:600,fontSize:".8rem",color:"#44403c",display:"block",marginBottom:5}}>Payment Terms</label>
                    <select className="qt-select" value={quoteDetails.paymentTerms} onChange={e=>setQuote({...quoteDetails,paymentTerms:e.target.value})}>
                      <option>50% Deposit, 50% on Completion</option>
                      <option>Full Payment on Completion</option>
                      <option>30% Deposit, 70% on Completion</option>
                    </select>
                  </div>
                  <div style={{marginBottom:"1.125rem"}}>
                    <label style={{fontWeight:600,fontSize:".8rem",color:"#44403c",display:"block",marginBottom:5}}>Notes</label>
                    <textarea className="qt-input" rows={3} style={{resize:"vertical"}} value={quoteDetails.notes} placeholder="Warranties, special terms…" onChange={e=>setQuote({...quoteDetails,notes:e.target.value})}/>
                  </div>

                  {/* Total */}
                  <div style={{ background:"#1c1917", borderRadius:12, padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                    <span style={{ color:"#a8a29e", fontWeight:600, fontSize:".875rem" }}>Quote Total</span>
                    <span style={{ color:"white", fontWeight:900, fontSize:"1.375rem", letterSpacing:"-.5px" }}>KSh {calcTotal().toLocaleString()}</span>
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
                    <button onClick={downloadPDF} style={{ background:"white", border:"2px solid #e7e5e4", color:"#44403c", borderRadius:10, padding:".625rem 1.125rem", fontWeight:700, fontSize:".85rem", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif" }}>
                      <FaDownload size={13}/> Download PDF
                    </button>
                    <div style={{ display:"flex", gap:".5rem" }}>
                      <button onClick={()=>setShowQuote(false)} style={{ background:"#f5f5f4", border:"none", color:"#78716c", borderRadius:10, padding:".625rem 1.125rem", fontWeight:700, fontSize:".85rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                      {norm(selected.status)==="accepted" && (
                        <button onClick={submitQuote} disabled={actionLoading} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", color:"white", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontSize:".85rem", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif", opacity:actionLoading?.7:1 }}>
                          <FaCheckCircle size={13}/> Submit Quote
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ padding:"0", marginTop:".5rem" }}>
                <div style={{ fontSize:".72rem", fontWeight:700, color:"#a8a29e", textTransform:"uppercase", letterSpacing:.5, marginBottom:".875rem" }}>Actions</div>
                <Actions/>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <button onClick={closeJob} style={{ background:"#f5f5f4", border:"none", color:"#78716c", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>Close</button>
            </Modal.Footer>
          </Modal>
        )}

        {/* ══ Send Quote Modal ══ */}
        {showSend && selected && (
          <Modal show onHide={()=>setShowSend(false)} centered className="jt-modal">
            <Modal.Header closeButton>
              <div style={{ fontWeight:800, fontSize:"1.0625rem" }}>Send Quote</div>
            </Modal.Header>
            <Modal.Body>
              <p style={{ color:"#78716c", marginBottom:"1.25rem", fontSize:".875rem" }}>
                Sending to <strong style={{color:"#1c1917"}}>{selected.client?.full_name||"client"}</strong>
              </p>
              {[
                { id:"email",    icon:<FaEnvelope color="#3b82f6"/>,  bg:"#eff6ff", label:"Email",         desc:"PDF attachment via email"     },
                { id:"sms",      icon:<FaSms color="#f59e0b"/>,       bg:"#fffbeb", label:"SMS",           desc:"Text message with quote link" },
                { id:"whatsapp", icon:<FaWhatsapp color="#16a34a"/>,  bg:"#f0fdf4", label:"WhatsApp",      desc:"Pre-filled WhatsApp message"  },
                { id:"download", icon:<FaDownload color="#6366f1"/>,  bg:"#eef2ff", label:"Download Only", desc:"Save PDF to share manually"   },
              ].map(m => (
                <div key={m.id} className={`sm-card ${sendMethod===m.id?"active":""}`} onClick={()=>setSend(m.id)}>
                  <div className="sm-icon" style={{background:m.bg}}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:".9rem", color:"#1c1917" }}>{m.label}</div>
                    <div style={{ fontSize:".78rem", color:"#78716c", marginTop:2 }}>{m.desc}</div>
                  </div>
                  {sendMethod===m.id && <div style={{ marginLeft:"auto", color:"#22c55e" }}><FaCheckCircle/></div>}
                </div>
              ))}
              <div style={{ background:"#fafaf9", border:"2px solid #f5f5f4", borderRadius:12, padding:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ color:"#78716c", fontWeight:600, fontSize:".875rem" }}>Quote Total</span>
                <span style={{ color:"#15803d", fontWeight:900, fontSize:"1.125rem" }}>KSh {calcTotal().toLocaleString()}</span>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button onClick={()=>setShowSend(false)} style={{ background:"#f5f5f4", border:"none", color:"#78716c", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>Cancel</button>
              {sendMethod==="whatsapp" ? (
                <button onClick={openWA} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", color:"white", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <FaWhatsapp/> Open WhatsApp
                </button>
              ) : sendMethod==="download" ? (
                <button onClick={downloadPDF} style={{ background:"#1c1917", border:"none", color:"white", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <FaDownload/> Download PDF
                </button>
              ) : (
                <button onClick={sendQuote} disabled={actionLoading} style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", color:"white", borderRadius:10, padding:".625rem 1.375rem", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:actionLoading?.7:1 }}>
                  {actionLoading ? "Sending…" : sendMethod==="email" ? <><FaEnvelope/> Send Email</> : <><FaSms/> Send SMS</>}
                </button>
              )}
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </>
  );
}

JobsTab.propTypes = { jobs: PropTypes.array, setJobs: PropTypes.func, addToast: PropTypes.func };
export default JobsTab;
