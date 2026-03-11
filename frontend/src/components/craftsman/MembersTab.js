import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Alert } from "react-bootstrap";
import {
  FaUserPlus, FaEnvelope, FaTrash, FaCrown,
  FaUser, FaCopy, FaCheckCircle, FaClock, FaTimesCircle,
  FaWhatsapp, FaSms, FaLink, FaUsers, FaExclamationTriangle,
  FaQuestionCircle, FaShieldAlt, FaBell,
} from "react-icons/fa";
import api from "../../api/axiosClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = [
  { value: "helper",  label: "Helper",  color: "#22c55e", desc: "Assists on jobs, no management access" },
  { value: "foreman", label: "Foreman", color: "#f59e0b", desc: "Manages job tasks and progress updates" },
  { value: "partner", label: "Partner", color: "#16a34a", desc: "Full access to jobs and quotes"         },
];

const STATUS_CFG = {
  pending_invite:   { bg:"#fef3c7", color:"#92400e", icon:<FaClock />,         label:"Invite Sent"        },
  pending_approval: { bg:"#f0fdf4", color:"#15803d", icon:<FaQuestionCircle />, label:"Awaiting Approval"  },
  accepted:         { bg:"#d1fae5", color:"#065f46", icon:<FaCheckCircle />,   label:"Active"             },
  rejected:         { bg:"#fee2e2", color:"#991b1b", icon:<FaTimesCircle />,   label:"Rejected"           },
  declined:         { bg:"#fee2e2", color:"#991b1b", icon:<FaTimesCircle />,   label:"Declined"           },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending_invite;
  return (
    <span style={{
      background:cfg.bg, color:cfg.color, padding:"4px 12px",
      borderRadius:"50px", fontSize:".78rem", fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function MembersTab({ craftsman, addToast }) {
  const [members,       setMembers]       = useState([]);
  const [invites,       setInvites]       = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showInvite,    setShowInvite]    = useState(false);
  const [inviteMethod,  setInviteMethod]  = useState("email");
  const [inviteRole,    setInviteRole]    = useState("helper");
  const [inviteValue,   setInviteValue]   = useState("");
  const [inviteName,    setInviteName]    = useState("");
  const [sending,       setSending]       = useState(false);
  const [linkCopied,    setLinkCopied]    = useState(false);
  const [approvingId,   setApprovingId]   = useState(null);

  const inviteLink = `https://kaakazini.com/join?craftsman=${craftsman?.id}&role=${inviteRole}`;
  const pendingApprovalCount = approvalQueue.length;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mRes, iRes, aRes] = await Promise.all([
        api.get("/craftsman/members/"),
        api.get("/craftsman/invites/"),
        api.get("/craftsman/members/pending-approval/"),
      ]);
      setMembers(mRes.data || []);
      setInvites(iRes.data || []);
      setApprovalQueue(aRes.data || []);
    } catch (err) {
      console.warn("Members API not ready yet:", err.message);
      setMembers([]); setInvites([]); setApprovalQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicantId) => {
    setApprovingId(applicantId);
    try {
      await api.post(`/craftsman/members/${applicantId}/approve/`);
      const approved = approvalQueue.find(a => a.id === applicantId);
      if (approved) {
        setApprovalQueue(prev => prev.filter(a => a.id !== applicantId));
        setMembers(prev => [...prev, { ...approved, status:"accepted" }]);
      }
      addToast?.(`${approved?.full_name || "Member"} has been approved and added to your team!`, "success", "Member Approved");
    } catch {
      addToast?.("Failed to approve member. Please try again.", "error", "Error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (applicantId) => {
    if (!window.confirm("Reject this member request?")) return;
    setApprovingId(applicantId);
    try {
      await api.post(`/craftsman/members/${applicantId}/reject/`);
      setApprovalQueue(prev => prev.filter(a => a.id !== applicantId));
      addToast?.("Member request rejected.", "warning", "Request Rejected");
    } catch {
      addToast?.("Failed to reject. Please try again.", "error", "Error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleSendInvite = async () => {
    if (inviteMethod !== "link" && !inviteValue.trim()) {
      addToast?.("Please enter a valid email or phone number.", "warning", "Missing Info");
      return;
    }
    setSending(true);
    try {
      await api.post("/craftsman/invites/", {
        method: inviteMethod, contact: inviteValue,
        name: inviteName, role: inviteRole,
      });
      addToast?.("Invite sent! They'll appear here once they accept and you approve them.", "success", "Invite Sent!");
      setInviteValue(""); setInviteName(""); setShowInvite(false);
      fetchAll();
    } catch (err) {
      addToast?.(err.response?.data?.detail || "Failed to send invite.", "error", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(
      `Hi ${inviteName || "there"}! 👷\n\n` +
      `I'd like you to join my team on *Kaakazini* as a *${inviteRole}*.\n\n` +
      `Click the link to request to join — I'll approve you right away:\n${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleRemoveMember = async (id, name) => {
    if (!window.confirm(`Remove ${name || "this member"} from your team?`)) return;
    try {
      await api.delete(`/craftsman/members/${id}/`);
      setMembers(prev => prev.filter(m => m.id !== id));
      addToast?.("Member removed from your team.", "info", "Member Removed");
    } catch {
      addToast?.("Failed to remove member.", "error", "Error");
    }
  };

  const handleRevokeInvite = async (id) => {
    try {
      await api.delete(`/craftsman/invites/${id}/`);
      setInvites(prev => prev.filter(i => i.id !== id));
      addToast?.("Invite revoked.", "info", "Revoked");
    } catch {
      addToast?.("Failed to revoke invite.", "error", "Error");
    }
  };

  const activeMembers  = members.filter(m => m.status === "accepted");
  const pendingInvites = invites.filter(i => i.status === "pending_invite");

  return (
    <>
      <style>{`
        .members-wrap { font-family: 'Outfit', sans-serif; }

        /* Stats */
        .stat-chip {
          background: linear-gradient(135deg,#f0fdf4,#dcfce7);
          border: 2px solid #86efac; border-radius: 16px;
          padding: 1rem 1.25rem; flex:1; min-width:120px; text-align:center;
        }
        .stat-chip.alert-chip {
          background: linear-gradient(135deg,#fffbeb,#fef3c7);
          border-color: #fde68a;
        }
        .stat-chip .sv { font-size:1.875rem; font-weight:800; color:#16a34a; line-height:1; }
        .stat-chip.alert-chip .sv { color:#92400e; }
        .stat-chip .sl { font-size:.75rem; color:#6b7280; font-weight:600; margin-top:4px; }

        /* Approval banner — green instead of purple */
        .approval-banner {
          background: linear-gradient(135deg,#f0fdf4,#dcfce7);
          border: 2px solid #86efac;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          position: relative; overflow: hidden;
        }
        .approval-banner::before {
          content: ''; position:absolute; top:0; left:0; right:0; height:3px;
          background: linear-gradient(90deg,#fbbf24,#22c55e);
        }
        .approval-banner h6 { color:#15803d; font-weight:800; margin-bottom:.25rem; }
        .approval-banner p  { color:#16a34a; font-size:.875rem; margin:0; }

        /* Approval card */
        .approval-card {
          background: white;
          border: 2px solid #86efac;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          margin-bottom: .75rem;
          display: flex; align-items: center; gap:1rem;
          animation: slideIn .3s ease;
        }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .approval-card .avi {
          width:44px; height:44px; border-radius:12px;
          background: linear-gradient(135deg,#f0fdf4,#dcfce7);
          color:#16a34a; display:flex; align-items:center;
          justify-content:center; font-weight:700; font-size:1rem; flex-shrink:0;
        }

        .approve-btn {
          background: linear-gradient(135deg,#22c55e,#16a34a);
          border:none; border-radius:10px; color:white;
          font-weight:700; padding:.5rem 1.1rem; font-size:.875rem;
          cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:5px;
        }
        .approve-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(34,197,94,.3); }
        .approve-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

        .reject-btn {
          background:white; border:2px solid #fca5a5; color:#ef4444;
          border-radius:10px; font-weight:700; padding:.5rem 1.1rem;
          font-size:.875rem; cursor:pointer; transition:all .2s;
          display:inline-flex; align-items:center; gap:5px;
        }
        .reject-btn:hover { background:#fef2f2; border-color:#ef4444; }
        .reject-btn:disabled { opacity:.6; cursor:not-allowed; }

        /* Role cards */
        .role-card {
          border:2px solid #e5e7eb; border-radius:14px;
          padding:.875rem; cursor:pointer; transition:all .2s; flex:1;
        }
        .role-card:hover,.role-card.sel {
          border-color:#22c55e; background:#f0fdf4;
          box-shadow:0 4px 12px rgba(34,197,94,.15);
        }

        /* Method tabs */
        .m-tab {
          flex:1; padding:.65rem; border:2px solid #e5e7eb; border-radius:12px;
          background:white; cursor:pointer; font-weight:600; font-size:.8rem;
          transition:all .2s; display:flex; align-items:center;
          justify-content:center; gap:5px; color:#374151;
        }
        .m-tab:hover,.m-tab.act { border-color:#22c55e; color:#16a34a; background:#f0fdf4; }

        /* Member rows */
        .member-row {
          background:white; border:2px solid #f3f4f6; border-radius:14px;
          padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;
          transition:all .25s; margin-bottom:.75rem;
        }
        .member-row:hover { border-color:#86efac; box-shadow:0 4px 16px rgba(34,197,94,.1); }
        .member-row .avi {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:1rem; flex-shrink:0;
        }

        /* Invite CTA */
        .invite-cta {
          background:linear-gradient(135deg,#fbbf24,#22c55e);
          border:none; border-radius:14px; color:#1f2937; font-weight:700;
          padding:.875rem 2rem; font-size:1rem; transition:all .3s;
          display:inline-flex; align-items:center; gap:8px; cursor:pointer;
        }
        .invite-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(34,197,94,.3); color:#1f2937; }
        .invite-cta:disabled { opacity:.7; transform:none; cursor:not-allowed; }

        /* Link box */
        .link-box {
          background:#f9fafb; border:2px dashed #d1d5db; border-radius:12px;
          padding:1rem; font-family:monospace; font-size:.78rem;
          color:#374151; word-break:break-all;
        }

        .mi {
          border:2px solid #e5e7eb; border-radius:10px;
          padding:.7rem 1rem; width:100%; font-size:.9375rem; transition:all .2s;
        }
        .mi:focus { outline:none; border-color:#22c55e; box-shadow:0 0 0 4px rgba(34,197,94,.1); }

        .empty-state {
          text-align:center; padding:4rem 2rem;
          background:#f9fafb; border-radius:20px; border:2px dashed #e5e7eb;
        }

        /* Flow diagram */
        .flow-diagram { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; margin-top:.75rem; }
        .flow-step {
          background:white; border:1.5px solid #d1d5db; border-radius:8px;
          padding:.35rem .75rem; font-size:.75rem; font-weight:600; color:#374151;
          display:flex; align-items:center; gap:4px;
        }
        .flow-arrow { color:#9ca3af; font-size:.875rem; }

        .section-label {
          font-size:.72rem; font-weight:700; color:#9ca3af;
          text-transform:uppercase; letter-spacing:1px; margin-bottom:.75rem;
        }

        .notification-dot {
          width:8px; height:8px; background:#22c55e;
          border-radius:50%; display:inline-block; margin-left:5px;
          animation:pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
      `}</style>

      <div className="members-wrap">

        {/* ── Approval Flow Banner ── */}
        <div className="approval-banner">
          <h6 className="d-flex align-items-center gap-2">
            <FaShieldAlt/> How Team Approval Works
          </h6>
          <div className="flow-diagram">
            <div className="flow-step"><FaEnvelope size={11}/> You invite</div>
            <span className="flow-arrow">→</span>
            <div className="flow-step"><FaUser size={11}/> They accept link</div>
            <span className="flow-arrow">→</span>
            <div className="flow-step" style={{background:"#fffbeb", borderColor:"#fde68a", color:"#92400e"}}>
              <FaShieldAlt size={11}/> You approve
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step" style={{background:"#f0fdf4", borderColor:"#86efac", color:"#15803d"}}>
              <FaCheckCircle size={11}/> Active member
            </div>
          </div>
          <p className="mt-2" style={{fontSize:".8rem", color:"#15803d"}}>
            <strong>You are in control.</strong> Nobody joins your team without your explicit approval.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="d-flex gap-3 flex-wrap mb-4">
          <div className="stat-chip">
            <div className="sv">{activeMembers.length}</div>
            <div className="sl">Active Members</div>
          </div>
          <div className={`stat-chip ${pendingApprovalCount > 0 ? "alert-chip" : ""}`}>
            <div className="sv">{pendingApprovalCount}</div>
            <div className="sl">
              Need Your Approval
              {pendingApprovalCount > 0 && <span className="notification-dot ms-1"/>}
            </div>
          </div>
          <div className="stat-chip">
            <div className="sv">{pendingInvites.length}</div>
            <div className="sl">Awaiting Response</div>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">
              Team Members
              {pendingApprovalCount > 0 && (
                <span style={{marginLeft:8, background:"#fbbf24", color:"#1f2937", borderRadius:"50px", padding:"2px 10px", fontSize:".75rem", fontWeight:800}}>
                  {pendingApprovalCount} need approval
                </span>
              )}
            </h5>
            <small className="text-muted">Invite and approve your craftsman team</small>
          </div>
          <button className="invite-cta" onClick={() => setShowInvite(true)}>
            <FaUserPlus/> Invite Member
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success"/>
            <p className="mt-3 text-muted">Loading team...</p>
          </div>
        ) : (
          <>
            {/* Pending approval */}
            {approvalQueue.length > 0 && (
              <>
                <div className="section-label d-flex align-items-center gap-2" style={{color:"#92400e"}}>
                  <FaBell size={11}/> Waiting for your approval ({approvalQueue.length})
                </div>
                {approvalQueue.map(applicant => {
                  const role = ROLES.find(r => r.value === applicant.role) || ROLES[0];
                  const initials = (applicant.full_name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
                  const isProcessing = approvingId === applicant.id;
                  return (
                    <div key={applicant.id} className="approval-card">
                      <div className="avi">{initials}</div>
                      <div className="flex-grow-1">
                        <div className="fw-bold" style={{fontSize:".9375rem"}}>{applicant.full_name}</div>
                        <div className="text-muted" style={{fontSize:".8rem"}}>
                          {applicant.email || applicant.phone}
                          {" · "}
                          <span style={{color:role.color, fontWeight:600}}>Requested: {role.label}</span>
                        </div>
                        <div style={{fontSize:".75rem", color:"#9ca3af", marginTop:2}}>
                          Joined via invite link · {applicant.joined_at || "Just now"}
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="approve-btn" onClick={() => handleApprove(applicant.id)} disabled={isProcessing}>
                          {isProcessing ? "..." : <><FaCheckCircle/> Approve</>}
                        </button>
                        <button className="reject-btn" onClick={() => handleReject(applicant.id)} disabled={isProcessing}>
                          {isProcessing ? "..." : <><FaTimesCircle/> Reject</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Active members */}
            {activeMembers.length > 0 && (
              <>
                <div className="section-label mt-3">Active Team ({activeMembers.length})</div>
                {activeMembers.map(m => {
                  const role = ROLES.find(r => r.value === m.role) || ROLES[0];
                  const initials = (m.full_name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
                  return (
                    <div key={m.id} className="member-row">
                      <div className="avi" style={{background:role.color+"22", color:role.color}}>{initials}</div>
                      <div className="flex-grow-1">
                        <div className="fw-bold" style={{fontSize:".9375rem"}}>{m.full_name}</div>
                        <div className="text-muted" style={{fontSize:".8rem"}}>{m.email || m.phone}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{background:role.color+"18", color:role.color, borderRadius:8, padding:"3px 10px", fontSize:".78rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4}}>
                          {m.role === "partner" ? <FaCrown size={11}/> : <FaUser size={10}/>} {role.label}
                        </span>
                        <span style={{background:"#d1fae5", color:"#065f46", padding:"4px 12px", borderRadius:"50px", fontSize:".78rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:5}}>
                          <FaCheckCircle/> Active
                        </span>
                        <button style={{border:"1.5px solid #fca5a5", color:"#ef4444", borderRadius:8, padding:"4px 10px", background:"white", cursor:"pointer", fontSize:".8rem"}}
                          onClick={() => handleRemoveMember(m.id, m.full_name)}>
                          <FaTrash size={11}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Pending invites */}
            {pendingInvites.length > 0 && (
              <>
                <div className="section-label mt-3">Sent — Awaiting Response ({pendingInvites.length})</div>
                {pendingInvites.map(inv => {
                  const role = ROLES.find(r => r.value === inv.role) || ROLES[0];
                  return (
                    <div key={inv.id} className="member-row" style={{opacity:.8}}>
                      <div className="avi" style={{background:"#f3f4f6", color:"#9ca3af"}}><FaEnvelope/></div>
                      <div className="flex-grow-1">
                        <div className="fw-bold" style={{fontSize:".9375rem"}}>{inv.name || inv.contact}</div>
                        <div className="text-muted" style={{fontSize:".8rem"}}>{inv.contact} · Invite sent</div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{background:role.color+"18", color:role.color, borderRadius:8, padding:"3px 10px", fontSize:".78rem", fontWeight:700}}>{role.label}</span>
                        <span style={{background:"#fef3c7", color:"#92400e", padding:"4px 12px", borderRadius:"50px", fontSize:".78rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:5}}>
                          <FaClock/> Invite Sent
                        </span>
                        <button style={{border:"1.5px solid #d1d5db", color:"#9ca3af", borderRadius:8, padding:"4px 10px", background:"white", cursor:"pointer", fontSize:".75rem"}}
                          onClick={() => handleRevokeInvite(inv.id)}>
                          Revoke
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Empty state */}
            {activeMembers.length === 0 && approvalQueue.length === 0 && pendingInvites.length === 0 && (
              <div className="empty-state">
                <FaUsers size={56} color="#22c55e" style={{opacity:.15, display:"block", margin:"0 auto 1rem"}}/>
                <h5 className="fw-bold" style={{color:"#374151"}}>No team members yet</h5>
                <p className="text-muted">Invite helpers, foremen, or partners. You approve everyone before they join.</p>
                <button className="invite-cta mt-2" onClick={() => setShowInvite(true)}>
                  <FaUserPlus/> Invite First Member
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ INVITE MODAL ══ */}
        <Modal show={showInvite} onHide={() => setShowInvite(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title style={{fontWeight:800, display:"flex", alignItems:"center", gap:8}}>
              <FaUserPlus className="text-success"/> Invite a Team Member
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-2">
            {/* Role */}
            <p style={{fontSize:".875rem", fontWeight:700, color:"#374151", marginBottom:8}}>1. Choose their role</p>
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {ROLES.map(role => (
                <div key={role.value} className={`role-card ${inviteRole === role.value ? "sel" : ""}`}
                  onClick={() => setInviteRole(role.value)}>
                  <div style={{fontWeight:700, fontSize:".875rem", marginBottom:4}}>
                    <span style={{width:10, height:10, borderRadius:"50%", background:role.color, display:"inline-block", marginRight:6}}/>
                    {role.label}
                  </div>
                  <div style={{fontSize:".75rem", color:"#6b7280"}}>{role.desc}</div>
                </div>
              ))}
            </div>

            {/* Method */}
            <p style={{fontSize:".875rem", fontWeight:700, color:"#374151", marginBottom:8}}>2. How to send the invite</p>
            <div className="d-flex gap-2 mb-4">
              {[
                { id:"email",    icon:<FaEnvelope/>,  label:"Email"    },
                { id:"sms",      icon:<FaSms/>,       label:"SMS"      },
                { id:"whatsapp", icon:<FaWhatsapp/>,  label:"WhatsApp" },
                { id:"link",     icon:<FaLink/>,      label:"Link"     },
              ].map(m => (
                <button key={m.id} className={`m-tab ${inviteMethod === m.id ? "act" : ""}`}
                  onClick={() => setInviteMethod(m.id)}>
                  {m.icon} <span className="d-none d-sm-inline">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Details */}
            {inviteMethod !== "link" ? (
              <>
                <p style={{fontSize:".875rem", fontWeight:700, color:"#374151", marginBottom:8}}>3. Their contact details</p>
                <input className="mi mb-3" placeholder="Name (optional)" value={inviteName} onChange={e => setInviteName(e.target.value)}/>
                <input className="mi mb-3"
                  placeholder={inviteMethod === "email" ? "Email address" : "Phone e.g. 0712345678"}
                  type={inviteMethod === "email" ? "email" : "tel"}
                  value={inviteValue} onChange={e => setInviteValue(e.target.value)}/>
                {inviteMethod === "whatsapp" && (
                  <div style={{background:"#f0fdf4", borderLeft:"4px solid #22c55e", borderRadius:10, padding:".75rem 1rem", color:"#15803d", fontSize:".875rem"}}>
                    <FaWhatsapp className="me-2"/> Opens WhatsApp with a pre-filled invite message including your approval notice.
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{fontSize:".875rem", fontWeight:700, color:"#374151", marginBottom:8}}>3. Share this invite link</p>
                <div className="link-box mb-3">{inviteLink}</div>
                <div style={{background:"#fffbeb", borderLeft:"4px solid #fbbf24", borderRadius:10, padding:".75rem 1rem", color:"#92400e", fontSize:".8rem", marginBottom:"1rem"}}>
                  <FaShieldAlt className="me-2"/>
                  Anyone who clicks this link must still be <strong>approved by you</strong> before joining.
                </div>
                <button onClick={handleCopyLink} style={{
                  width:"100%", padding:".75rem", borderRadius:12, fontWeight:700,
                  background: linkCopied ? "#f0fdf4" : "#1f2937",
                  color: linkCopied ? "#16a34a" : "white",
                  border: linkCopied ? "2px solid #86efac" : "none",
                  cursor:"pointer", transition:"all .3s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  {linkCopied ? <><FaCheckCircle/> Copied!</> : <><FaCopy/> Copy Invite Link</>}
                </button>
              </>
            )}
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <button onClick={() => setShowInvite(false)}
              style={{border:"2px solid #e5e7eb", borderRadius:12, fontWeight:600, padding:".7rem 1.5rem", background:"white", cursor:"pointer"}}>
              Cancel
            </button>
            {inviteMethod !== "link" && (
              inviteMethod === "whatsapp" ? (
                <button className="invite-cta" onClick={handleWhatsAppInvite}>
                  <FaWhatsapp/> Open WhatsApp
                </button>
              ) : (
                <button className="invite-cta" onClick={handleSendInvite} disabled={sending}>
                  {sending ? "Sending..." : <><FaUserPlus/> Send Invite</>}
                </button>
              )
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

MembersTab.propTypes = { craftsman: PropTypes.object, addToast: PropTypes.func };
export default MembersTab;
