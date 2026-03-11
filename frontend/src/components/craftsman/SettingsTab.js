import React, { useState } from "react";
import {
  FaUser, FaPhone, FaEnvelope, FaLock, FaBell, FaMoon, FaSun,
  FaShieldAlt, FaTrash, FaCheckCircle, FaCamera, FaGlobe,
  FaToggleOn, FaToggleOff, FaWhatsapp, FaSms, FaSignOutAlt,
  FaExclamationTriangle, FaKey, FaEye, FaEyeSlash,
} from "react-icons/fa";
import { BsPhone, BsToggleOn, BsToggleOff } from "react-icons/bs";
import api from "../../api/axiosClient";

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange, accent = "#22c55e" }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 50,
        background: value ? accent : "#d1d5db",
        position: "relative", cursor: "pointer",
        transition: "background .25s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        transition: "left .25s cubic-bezier(.34,1.56,.64,1)",
      }}/>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children, danger }) {
  return (
    <div style={{
      background: "white", borderRadius: 18,
      border: danger ? "2px solid #fecaca" : "2px solid #f3f4f6",
      overflow: "hidden", marginBottom: "1.25rem",
    }}>
      {/* Section header */}
      <div style={{
        padding: "1.125rem 1.5rem",
        borderBottom: "2px solid #f9fafb",
        display: "flex", alignItems: "center", gap: 10,
        background: danger ? "#fef2f2" : "white",
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10,
          background: danger ? "#fee2e2" : "#f0fdf4",
          color: danger ? "#ef4444" : "#16a34a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: ".9rem", flexShrink: 0,
        }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: ".9375rem", color: danger ? "#991b1b" : "#1c1917" }}>{title}</div>
          {subtitle && <div style={{ fontSize: ".75rem", color: "#9ca3af", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "1.25rem 1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Row: label + control on same line ───────────────────────────────────────
function SettingRow({ label, sub, children, border = true }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "1rem", paddingBottom: border ? "1rem" : 0,
      marginBottom: border ? "1rem" : 0,
      borderBottom: border ? "1px solid #f5f5f4" : "none",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: ".9rem", color: "#1c1917" }}>{label}</div>
        {sub && <div style={{ fontSize: ".75rem", color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────
function SettingInput({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={{
        border: "2px solid #e5e7eb", borderRadius: 10,
        padding: ".625rem .875rem", fontSize: ".9rem",
        fontFamily: "'DM Sans', sans-serif", color: "#1c1917",
        background: disabled ? "#f9fafb" : "white",
        width: "100%", transition: "border-color .2s",
        outline: "none",
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = "#22c55e"; }}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  );
}

// ════════════════════════════════════════════════════════════════════
// SettingsTab
// Props: craftsman, addToast
// ════════════════════════════════════════════════════════════════════
function SettingsTab({ craftsman = {}, addToast }) {
  // ── Account info ─────────────────────────────────────────────────
  const [phone,    setPhone]    = useState(craftsman.phone    || "");
  const [email,    setEmail]    = useState(craftsman.email    || "");
  const [language, setLanguage] = useState(craftsman.language || "en");
  const [savingAccount, setSavingAccount] = useState(false);

  // ── Password ──────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  // ── Notifications ─────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    newJob:       true,
    jobAccepted:  true,
    quoteApproved:true,
    payment:      true,
    smsAlerts:    false,
    whatsappAlerts:true,
    emailDigest:  false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // ── Appearance ────────────────────────────────────────────────────
  const [theme,    setTheme]    = useState("light");
  const [compact,  setCompact]  = useState(false);

  // ── Danger zone ───────────────────────────────────────────────────
  const [deactivating, setDeactivating] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────
  const saveAccount = async () => {
    if (!phone && !email) { addToast?.("Enter at least a phone or email.", "warning", "Missing Info"); return; }
    setSavingAccount(true);
    try {
      await api.patch("/craftsman/", { phone, email, language });
      addToast?.("Contact details updated.", "success", "Saved");
    } catch { addToast?.("Failed to save. Try again.", "error", "Error"); }
    finally { setSavingAccount(false); }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw) { addToast?.("Fill in all password fields.", "warning", "Missing Fields"); return; }
    if (newPw.length < 8)     { addToast?.("New password must be at least 8 characters.", "warning", "Too Short"); return; }
    if (newPw !== confirmPw)  { addToast?.("Passwords don't match.", "warning", "Mismatch"); return; }
    setSavingPw(true);
    try {
      await api.post("/auth/change-password/", { current_password: currentPw, new_password: newPw });
      addToast?.("Password changed successfully.", "success", "Password Updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      addToast?.(e.response?.data?.detail || "Incorrect current password.", "error", "Failed");
    } finally { setSavingPw(false); }
  };

  const saveNotifs = async () => {
    setSavingNotifs(true);
    try {
      await api.patch("/craftsman/", { notification_settings: notifs });
      addToast?.("Notification preferences saved.", "success", "Saved");
    } catch { addToast?.("Failed to save preferences.", "error", "Error"); }
    finally { setSavingNotifs(false); }
  };

  const requestDeactivation = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? This hides your profile from clients.")) return;
    setDeactivating(true);
    try {
      await api.post("/craftsman/deactivate/");
      addToast?.("Account deactivation requested. Admin will review.", "warning", "Deactivation Requested", 7000);
    } catch { addToast?.("Failed to submit request.", "error", "Error"); }
    finally { setDeactivating(false); }
  };

  // ── Password field ────────────────────────────────────────────────
  const PwField = ({ value, onChange, placeholder }) => (
    <div style={{ position: "relative" }}>
      <input type={showPw ? "text" : "password"} value={value} onChange={onChange}
        placeholder={placeholder}
        style={{ border:"2px solid #e5e7eb", borderRadius:10, padding:".625rem 2.5rem .625rem .875rem", fontSize:".9rem", fontFamily:"'DM Sans',sans-serif", width:"100%", outline:"none", transition:"border-color .2s" }}
        onFocus={e=>e.target.style.borderColor="#22c55e"}
        onBlur={e=>e.target.style.borderColor="#e5e7eb"}
      />
      <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center" }}>
        {showPw ? <FaEyeSlash/> : <FaEye/>}
      </button>
    </div>
  );

  // ── Save button ───────────────────────────────────────────────────
  const SaveBtn = ({ loading, onClick, children }) => (
    <button onClick={onClick} disabled={loading} style={{
      background: "linear-gradient(135deg,#fbbf24,#22c55e)",
      border: "none", borderRadius: 10, color: "#1f2937",
      fontWeight: 800, fontSize: ".875rem", padding: ".625rem 1.375rem",
      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
      display: "inline-flex", alignItems: "center", gap: 7,
      fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
    }}>
      {loading ? <span className="spinner-border spinner-border-sm" role="status" style={{width:14,height:14,borderWidth:2}}/> : <FaCheckCircle size={13}/>}
      {loading ? "Saving…" : children}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .st-wrap { font-family: 'DM Sans', sans-serif; max-width: 720px; }
        .st-wrap * { box-sizing: border-box; }

        .st-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; color: #15803d;
          border: 1.5px solid #86efac; border-radius: 50px;
          font-size: .72rem; font-weight: 700; padding: 3px 10px;
        }

        .lang-pill {
          padding: .5rem 1rem; border-radius: 50px; border: 2px solid #e5e7eb;
          background: white; color: #6b7280; font-weight: 700; font-size: .8rem;
          cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .lang-pill.active { background: #1c1917; color: white; border-color: #1c1917; }

        .theme-card {
          flex: 1; border: 2px solid #e5e7eb; border-radius: 14px;
          padding: 1rem; cursor: pointer; transition: all .2s; text-align: center;
          background: white;
        }
        .theme-card:hover { border-color: #d4cdc8; }
        .theme-card.active { border-color: #22c55e; background: #f0fdf4; }

        .danger-btn {
          background: white; border: 2px solid #fca5a5; color: #ef4444;
          border-radius: 10px; padding: ".625rem 1.25rem";
          font-weight: 700; font-size: ".875rem"; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7;
          font-family: 'DM Sans', sans-serif; transition: all .2s;
        }
        .danger-btn:hover { background: #fef2f2; }

        /* Profile avatar section */
        .st-avatar-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .st-avatar { width: 80px; height: 80px; border-radius: 20px; object-fit: cover; background: #f0fdf4; border: 3px solid #86efac; }
        .st-avatar-placeholder { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg,#fbbf24,#22c55e); display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 3px solid rgba(255,255,255,.4); }
        .st-avatar-edit { position: absolute; bottom: -4px; right: -4px; width: 26px; height: 26px; border-radius: 50%; background: #1c1917; color: white; border: 2px solid white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .65rem; }
      `}</style>

      <div className="st-wrap">

        {/* ── Profile identity strip ── */}
        <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", marginBottom:"1.75rem", padding:"1.25rem 1.5rem", background:"white", borderRadius:18, border:"2px solid #f3f4f6" }}>
          <div className="st-avatar-wrap">
            {craftsman.profile_url
              ? <img src={craftsman.profile_url} className="st-avatar" alt="Profile"/>
              : <div className="st-avatar-placeholder">👷</div>
            }
            <div className="st-avatar-edit"><FaCamera/></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "#1c1917", letterSpacing: "-.25px" }}>
              {craftsman.full_name || craftsman.name || "Your Name"}
            </div>
            <div style={{ fontSize: ".8rem", color: "#9ca3af", marginTop: 2 }}>
              {craftsman.profession || "Craftsman"} · {craftsman.location || "Location not set"}
            </div>
            <div style={{ marginTop: 8, display:"flex", gap: 6, flexWrap:"wrap" }}>
              <span className="st-tag">
                <FaCheckCircle size={9}/>
                {craftsman.status === "approved" ? "Verified" : craftsman.status || "Pending"}
              </span>
              <span className="st-tag" style={{ background:"#fffbeb", color:"#92400e", borderColor:"#fde68a" }}>
                {craftsman.account_type || "Individual"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 1: Contact & Account ── */}
        <Section icon={<FaUser/>} title="Contact & Account" subtitle="Phone and email used for job notifications">
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Phone Number</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background:"#f5f5f4", border:"2px solid #e5e7eb", borderRadius:10, padding:".625rem .875rem", color:"#6b7280", fontWeight:600, fontSize:".9rem", whiteSpace:"nowrap" }}>🇰🇪 +254</span>
              <SettingInput value={phone} onChange={e=>setPhone(e.target.value)} placeholder="7XX XXX XXX" type="tel"/>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Email Address</label>
            <SettingInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/>
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:8 }}>Language</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[{id:"en",label:"English"},{id:"sw",label:"Kiswahili"}].map(l => (
                <button key={l.id} className={`lang-pill ${language===l.id?"active":""}`} onClick={()=>setLanguage(l.id)}>{l.label}</button>
              ))}
            </div>
          </div>
          <SaveBtn loading={savingAccount} onClick={saveAccount}>Save Contact Info</SaveBtn>
        </Section>

        {/* ── 2: Password / Security ── */}
        <Section icon={<FaShieldAlt/>} title="Password & Security" subtitle="Change your login password">
          <div style={{ display:"flex", flexDirection:"column", gap:".875rem", marginBottom:"1.25rem" }}>
            <div>
              <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Current Password</label>
              <PwField value={currentPw} onChange={e=>setCurrentPw(e.target.value)} placeholder="Enter current password"/>
            </div>
            <div>
              <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>New Password</label>
              <PwField value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min. 8 characters"/>
            </div>
            <div>
              <label style={{ fontWeight:600, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Confirm New Password</label>
              <PwField value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Repeat new password"/>
            </div>
          </div>
          {newPw && confirmPw && newPw !== confirmPw && (
            <div style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:".625rem 1rem", fontSize:".8rem", color:"#ef4444", fontWeight:600, marginBottom:"1rem", display:"flex", alignItems:"center", gap:7 }}>
              <FaExclamationTriangle size={12}/> Passwords don't match
            </div>
          )}
          {newPw && newPw.length >= 8 && newPw === confirmPw && (
            <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:10, padding:".625rem 1rem", fontSize:".8rem", color:"#15803d", fontWeight:600, marginBottom:"1rem", display:"flex", alignItems:"center", gap:7 }}>
              <FaCheckCircle size={12}/> Passwords match
            </div>
          )}
          <SaveBtn loading={savingPw} onClick={savePassword}>Update Password</SaveBtn>
        </Section>

        {/* ── 3: Notifications ── */}
        <Section icon={<FaBell/>} title="Notifications" subtitle="Control when and how you get alerted">

          <div style={{ marginBottom:"1rem", paddingBottom:"1rem", borderBottom:"2px solid #f5f5f4" }}>
            <div style={{ fontWeight:700, fontSize:".72rem", color:"#9ca3af", textTransform:"uppercase", letterSpacing:.8, marginBottom:".75rem" }}>Job Alerts</div>
            {[
              { key:"newJob",        label:"New job assigned",          sub:"When admin assigns a job to you"           },
              { key:"jobAccepted",   label:"Quote activity",            sub:"When client approves or rejects your quote" },
              { key:"quoteApproved", label:"Job status changes",        sub:"In-progress, completed confirmations"       },
              { key:"payment",       label:"Payment notifications",     sub:"When payment is confirmed"                  },
            ].map(n => (
              <SettingRow key={n.key} label={n.label} sub={n.sub}>
                <Toggle value={notifs[n.key]} onChange={v=>setNotifs({...notifs,[n.key]:v})}/>
              </SettingRow>
            ))}
          </div>

          <div style={{ marginBottom:"1.25rem" }}>
            <div style={{ fontWeight:700, fontSize:".72rem", color:"#9ca3af", textTransform:"uppercase", letterSpacing:.8, marginBottom:".75rem" }}>Delivery Channels</div>
            {[
              { key:"smsAlerts",      label:"SMS Alerts",             sub:"Texts to your phone number",     icon:<FaSms color="#f59e0b"/>    },
              { key:"whatsappAlerts", label:"WhatsApp Notifications", sub:"Messages to your WhatsApp",      icon:<FaWhatsapp color="#16a34a"/>},
              { key:"emailDigest",    label:"Weekly Email Digest",    sub:"Summary of your week's activity",icon:<FaEnvelope color="#3b82f6"/>},
            ].map((n,i,arr) => (
              <SettingRow key={n.key} label={<span style={{display:"flex",alignItems:"center",gap:7}}>{n.icon}{n.label}</span>} sub={n.sub} border={i<arr.length-1}>
                <Toggle value={notifs[n.key]} onChange={v=>setNotifs({...notifs,[n.key]:v})} accent={n.key==="smsAlerts"?"#f59e0b":n.key==="whatsappAlerts"?"#16a34a":"#3b82f6"}/>
              </SettingRow>
            ))}
          </div>

          <SaveBtn loading={savingNotifs} onClick={saveNotifs}>Save Preferences</SaveBtn>
        </Section>

        {/* ── 4: Appearance ── */}
        <Section icon={<FaSun/>} title="Appearance" subtitle="Personalise how the dashboard looks">
          <div style={{ marginBottom:"1.25rem" }}>
            <div style={{ fontWeight:700, fontSize:".78rem", color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, marginBottom:".875rem" }}>Theme</div>
            <div style={{ display:"flex", gap:".75rem" }}>
              {[
                { id:"light", icon:<FaSun size={20} color="#f59e0b"/>, label:"Light" },
                { id:"dark",  icon:<FaMoon size={20} color="#6366f1"/>, label:"Dark" },
                { id:"auto",  icon:<span style={{fontSize:"1.25rem"}}>🖥️</span>,     label:"System" },
              ].map(t => (
                <div key={t.id} className={`theme-card ${theme===t.id?"active":""}`} onClick={()=>setTheme(t.id)}>
                  <div style={{ marginBottom:6 }}>{t.icon}</div>
                  <div style={{ fontWeight:700, fontSize:".8rem", color: theme===t.id?"#15803d":"#6b7280" }}>{t.label}</div>
                  {theme===t.id && <div style={{ marginTop:4, color:"#22c55e", fontSize:".65rem", fontWeight:800 }}>✓ ACTIVE</div>}
                </div>
              ))}
            </div>
          </div>

          <SettingRow label="Compact Mode" sub="Reduce padding for a denser layout" border={false}>
            <Toggle value={compact} onChange={setCompact} accent="#6366f1"/>
          </SettingRow>

          <div style={{ marginTop:"1rem", background:"#fafaf9", borderRadius:10, padding:".875rem", fontSize:".78rem", color:"#9ca3af", fontWeight:600, display:"flex", alignItems:"center", gap:7 }}>
            <FaExclamationTriangle size={11} color="#fbbf24"/>
            Dark mode and compact mode will be fully applied in a future update. Changes are saved.
          </div>
        </Section>

        {/* ── 5: Danger zone ── */}
        <Section icon={<FaExclamationTriangle/>} title="Danger Zone" subtitle="Irreversible account actions" danger>
          <SettingRow
            label="Deactivate Account"
            sub="Hides your profile from clients. You can reactivate by contacting support."
            border={false}
          >
            <button
              onClick={requestDeactivation}
              disabled={deactivating}
              style={{
                background:"white", border:"2px solid #fca5a5", color:"#ef4444",
                borderRadius:10, padding:".5rem 1.125rem",
                fontWeight:700, fontSize:".85rem", cursor:"pointer",
                display:"inline-flex", alignItems:"center", gap:7,
                fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
                opacity: deactivating?.7:1, whiteSpace:"nowrap",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
              onMouseLeave={e=>e.currentTarget.style.background="white"}
            >
              {deactivating ? "Requesting…" : <><FaSignOutAlt size={13}/> Deactivate</>}
            </button>
          </SettingRow>
        </Section>

        {/* ── App version footer ── */}
        <div style={{ textAlign:"center", padding:"1rem 0 .5rem", color:"#d1d5db", fontSize:".72rem", fontWeight:600 }}>
          Kaakazini Craftsman App · v1.0.0 · <a href="/privacy" style={{color:"#d1d5db"}}>Privacy</a> · <a href="/terms" style={{color:"#d1d5db"}}>Terms</a>
        </div>

      </div>
    </>
  );
}

export default SettingsTab;
