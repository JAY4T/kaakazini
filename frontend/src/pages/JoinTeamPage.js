import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";

const ROLE_ICONS  = { helper:"", foreman:"", partner:"" };
const ROLE_PERKS  = {
  helper:  ["View assigned jobs","Update job progress","Upload completion photos"],
  foreman: ["Manage job tasks","Update job progress","Communicate with clients"],
  partner: ["Full access to jobs","Submit and view quotes","Manage team members"],
};

export default function JoinTeamPage() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [invite,    setInvite]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted,  setAccepted]  = useState(false);
  const [error,     setError]     = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => { fetchInviteDetails(); }, [token]);

  const fetchInviteDetails = async () => {
    try {
      const { data } = await api.get(`/join/${token}/`);
      setInvite(data);
    } catch (err) {
      setError(
        err.response?.status === 404 ? "This invite link is invalid or has already been used."
        : err.response?.status === 410 ? "This invite link has expired."
        : "Something went wrong. Please try again."
      );
    } finally { setLoading(false); }
  };

  const handleAccept = async () => {
    if (!isLoggedIn) {
      localStorage.setItem("pending_invite_token", token);
      navigate(`/login?redirect=/join/${token}`);
      return;
    }
    setAccepting(true);
    try {
      await api.post(`/join/${token}/accept/`);
      setAccepted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept invite. Please try again.");
    } finally { setAccepting(false); }
  };

  // ── Shared styles ──────────────────────────────────────────────
  const page      = { minHeight:"100vh", background:"linear-gradient(135deg,#fbbf24 0%,#22c55e 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", fontFamily:"'Outfit',sans-serif" };
  const card      = { background:"white", borderRadius:"24px", maxWidth:"480px", width:"100%", padding:"2.5rem", boxShadow:"0 25px 60px rgba(0,0,0,.15)" };
  const logo      = { fontSize:"1.25rem", fontWeight:800, background:"linear-gradient(135deg,#fbbf24,#22c55e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"1.5rem", display:"block" };
  const acceptBtn = { width:"100%", padding:"1rem", background:"linear-gradient(135deg,#fbbf24 0%,#22c55e 100%)", border:"none", borderRadius:"14px", color:"#1f2937", fontWeight:800, fontSize:"1.0625rem", cursor:"pointer", transition:"all .3s", marginBottom:".75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" };
  const declineBtn= { width:"100%", padding:".875rem", background:"white", border:"2px solid #e5e7eb", borderRadius:"14px", color:"#6b7280", fontWeight:600, fontSize:"1rem", cursor:"pointer" };
  const stepNum   = { width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#fbbf24,#22c55e)", color:"#1f2937", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:".8rem", flexShrink:0 };

  if (loading) return (
    <div style={page}><div style={card}>
      <span style={logo}>Kaakazini</span>
      <div style={{textAlign:"center",padding:"3rem 0"}}>
        <div className="spinner-border text-success" style={{width:"3rem",height:"3rem"}}/>
        <p style={{marginTop:"1rem",color:"#6b7280"}}>Loading your invite...</p>
      </div>
    </div></div>
  );

  if (error && !invite) return (
    <div style={page}><div style={card}>
      <span style={logo}>Kaakazini</span>
      <div style={{background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:"14px",padding:"1.5rem",textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:"1rem"}}>❌</div>
        <h4 style={{color:"#991b1b",fontWeight:800}}>Invite Not Found</h4>
        <p style={{color:"#6b7280"}}>{error}</p>
        <button onClick={() => navigate("/")} style={{...declineBtn,marginTop:"1rem"}}>Go to Homepage</button>
      </div>
    </div></div>
  );

  if (accepted) return (
    <div style={page}><div style={card}>
      <span style={logo}>Kaakazini</span>
      <div style={{textAlign:"center",padding:"1rem 0"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🎉</div>
        <h3 style={{fontSize:"1.5rem",fontWeight:800,color:"#15803d",marginBottom:".5rem"}}>Request Sent!</h3>
        <p style={{color:"#6b7280",fontSize:".9375rem",lineHeight:1.6}}>
          <strong>{invite.craftsman_name}</strong> will review your request and approve you shortly. You'll receive an SMS when approved.
        </p>
        <div style={{textAlign:"left",marginTop:"2rem",marginBottom:"2rem"}}>
          <p style={{fontWeight:700,color:"#374151",marginBottom:"1rem"}}>What happens next:</p>
          {[
            `${invite.craftsman_name} gets notified via SMS`,
            "They approve your request in their dashboard",
            "You receive an SMS confirming you're on the team",
            "Log in to see your assigned jobs",
          ].map((text,i) => (
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:".75rem",marginBottom:".75rem"}}>
              <div style={stepNum}>{i+1}</div>
              <div style={{fontSize:".9rem",color:"#374151",paddingTop:"3px"}}>{text}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/dashboard")} style={acceptBtn}>Go to My Dashboard</button>
      </div>
    </div></div>
  );

  const perks = ROLE_PERKS[invite?.role] || [];

  return (
    <div style={page}><div style={card}>
      <span style={logo}>Kaakazini</span>

      <h2 style={{fontSize:"1.625rem",fontWeight:800,color:"#1f2937",lineHeight:1.2,marginBottom:".5rem"}}>
        {invite.invitee_name ? `Hi ${invite.invitee_name}!` : "You're invited!"}
      </h2>
      <p style={{color:"#6b7280",fontSize:"1rem",marginBottom:"2rem"}}>
        <strong>{invite.craftsman_name}</strong> has invited you to join their team on Kaakazini.
      </p>

      {/* Role badge — green */}
      <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"2px solid #86efac",borderRadius:"16px",padding:"1.25rem 1.5rem",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"1rem"}}>
        <span style={{fontSize:"2.5rem"}}>{ROLE_ICONS[invite.role] || "👷"}</span>
        <div>
          <div style={{fontSize:"1.25rem",fontWeight:800,color:"#15803d"}}>{invite.role_display}</div>
          <div style={{fontSize:".875rem",color:"#6b7280",marginTop:"2px"}}>Your role on the team</div>
        </div>
      </div>

      {/* Perks */}
      {perks.length > 0 && (
        <>
          <p style={{fontWeight:700,color:"#374151",marginBottom:".75rem",fontSize:".9rem"}}>
            As a {invite.role_display} you can:
          </p>
          <ul style={{listStyle:"none",padding:0,margin:"0 0 2rem 0"}}>
            {perks.map((perk,i) => (
              <li key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:".5rem 0",fontSize:".9375rem",color:"#374151",borderBottom:"1px solid #f3f4f6"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>{perk}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Login notice — green */}
      {!isLoggedIn && (
        <div style={{background:"#f0fdf4",border:"2px solid #86efac",borderRadius:"12px",padding:"1rem",fontSize:".875rem",color:"#15803d",marginBottom:"1.5rem",lineHeight:1.5}}>
          📱 You'll need to <strong>log in or create a free account</strong> to join the team. It only takes 1 minute!
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:".75rem 1rem",color:"#991b1b",fontSize:".875rem",marginBottom:"1rem"}}>
          {error}
        </div>
      )}

      <button style={acceptBtn} onClick={handleAccept} disabled={accepting}>
        {accepting ? "Sending request..." : isLoggedIn ? "✅ Accept & Join Team" : "🔑 Log In to Accept"}
      </button>
      <button style={declineBtn} onClick={() => navigate("/")}>No thanks, decline</button>

      <p style={{textAlign:"center",color:"#9ca3af",fontSize:".78rem",marginTop:"1.5rem"}}>
        By accepting you agree to Kaakazini's terms of service. Your craftsman approves all team members.
      </p>
    </div></div>
  );
}
