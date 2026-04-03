import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  FaBell, FaHome, FaClipboardList, FaDollarSign, FaCheckCircle,
  FaChartLine, FaFileAlt, FaCog, FaQuestionCircle,
  FaEdit, FaToggleOff, FaSignOutAlt, FaChevronDown,
  FaHardHat, FaBars, FaTimes, FaUsers, FaShieldAlt,
  FaHeadset, FaUserCog, FaExclamationTriangle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axiosClient";
import CraftsmenTable    from '../components/CraftsmenTable';
import JobRequests       from '../components/JobRequests';
import PaymentDashboard  from '../components/AdminPaymentDashboard';
import RejectModal       from '../components/RejectModal';
import AnalyticsPage     from '../components/AnalyticsPage';
import ReportsPage       from '../components/ReportsPage';
import SupportPage       from '../components/SupportPage';
import SettingsPage      from '../components/SettingsPage';
import { getFullImageUrl } from "../../utils/getFullImageUrl";

/* ═══════════════════════════════════════════════════════
   THEME — Obsidian · Gold · Emerald
═══════════════════════════════════════════════════════ */
const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --blk:  #060607;
  --drk:  #0c0c0e;
  --srf:  #111114;
  --crd:  #16161a;
  --crd2: #1c1c21;
  --bdr:  rgba(255,255,255,.06);
  --bdr2: rgba(255,255,255,.1);
  --gld:  #FFD700;
  --gld2: #F59E0B;
  --gld3: rgba(255,215,0,.08);
  --grn:  #22c55e;
  --grn2: #16a34a;
  --grn3: rgba(34,197,94,.08);
  --txt:  #ECECEC;
  --txt2: #9A9AA5;
  --txt3: #555560;
  --red:  #EF4444;
  --blu:  #3B82F6;
  --pur:  #8B5CF6;
  --sid:  264px;
  --top:  64px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { background: var(--blk); }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

/* ── ADMIN SHELL ── */
.adm {
  font-family: 'DM Sans', sans-serif;
  background: var(--blk);
  color: var(--txt);
  min-height: 100vh;
  display: flex;
}

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
.sb {
  width: var(--sid);
  min-height: 100vh;
  background: var(--drk);
  border-right: 1px solid var(--bdr);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  z-index: 300;
  transition: width .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.sb.col { width: 68px; }
.sb.mh  { transform: translateX(-100%); }
.sb.ms  { transform: translateX(0) !important; }

/* Logo */
.sb-logo {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 1.125rem;
  height: var(--top);
  border-bottom: 1px solid var(--bdr);
  flex-shrink: 0;
}
.sb-gem {
  width: 36px; height: 36px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--gld) 0%, var(--gld2) 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 900; font-size: 1rem; color: #000;
  box-shadow: 0 4px 12px rgba(255,215,0,.3);
}
.sb-brand {
  font-family: 'Playfair Display', serif;
  font-weight: 800; font-size: 1rem;
  color: var(--txt);
  white-space: nowrap;
  transition: opacity .2s, transform .2s;
}
.sb-brand em { color: var(--gld); font-style: normal; }
.sb.col .sb-brand { opacity: 0; transform: translateX(-8px); pointer-events: none; }

/* Nav */
.sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: .75rem .625rem; }
.sb-section {
  font-size: .58rem; font-weight: 800;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--txt3);
  padding: .625rem .5rem .375rem;
  white-space: nowrap;
  transition: opacity .2s;
}
.sb.col .sb-section { opacity: 0; }

.sb-btn {
  width: 100%; border: none;
  background: transparent;
  color: var(--txt3);
  display: flex; align-items: center; gap: 10px;
  padding: .5rem .625rem;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: .84rem; font-weight: 500;
  cursor: pointer;
  transition: background .15s, color .15s;
  text-align: left;
  white-space: nowrap;
  margin-bottom: 2px;
  position: relative;
  min-height: 38px;
}
.sb-btn:hover { background: rgba(255,255,255,.04); color: var(--txt); }
.sb-btn.on {
  background: linear-gradient(90deg, rgba(255,215,0,.1) 0%, rgba(34,197,94,.05) 100%);
  color: var(--gld);
  font-weight: 600;
}
.sb-btn.on::before {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(var(--gld), var(--grn));
}
.sb-btn .sb-ic { flex-shrink: 0; width: 16px; font-size: .88rem; }
.sb-btn .sb-lbl { flex: 1; transition: opacity .2s; }
.sb.col .sb-btn .sb-lbl { opacity: 0; width: 0; overflow: hidden; }

.sb-badge {
  background: var(--red); color: #fff;
  border-radius: 50px; font-size: .6rem; font-weight: 700;
  padding: 2px 6px; flex-shrink: 0;
  transition: opacity .2s;
  min-width: 18px; text-align: center;
}
.sb.col .sb-badge { opacity: 0; }

/* Footer */
.sb-foot {
  padding: .875rem 1rem;
  border-top: 1px solid var(--bdr);
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.sb-av {
  width: 34px; height: 34px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--gld), var(--grn));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 800; font-size: .82rem; color: #000;
}
.sb-info { flex: 1; min-width: 0; transition: opacity .2s; overflow: hidden; }
.sb.col .sb-info { opacity: 0; width: 0; }
.sb-name { font-size: .82rem; font-weight: 700; color: var(--txt); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-role { font-size: .68rem; color: var(--txt3); }
.sb-logout {
  background: none; border: none;
  color: var(--txt3); cursor: pointer;
  padding: 6px; border-radius: 8px;
  font-size: .85rem; transition: all .15s;
  flex-shrink: 0;
}
.sb-logout:hover { color: var(--red); background: rgba(239,68,68,.1); }

/* Role pills */
.rpill {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 2px 8px;
  font-size: .58rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
}
.rpill-superadmin  { background: rgba(255,215,0,.12); color: #FFD700; border: 1px solid rgba(255,215,0,.25); }
.rpill-moderator   { background: rgba(139,92,246,.12); color: #a78bfa; border: 1px solid rgba(139,92,246,.25); }
.rpill-maintenance { background: rgba(59,130,246,.12); color: #60a5fa; border: 1px solid rgba(59,130,246,.25); }
.rpill-support     { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.25); }
.rpill-finance     { background: rgba(251,191,36,.12); color: #fbbf24; border: 1px solid rgba(251,191,36,.25); }
.rpill-analytics   { background: rgba(244,63,94,.12); color: #fb7185; border: 1px solid rgba(244,63,94,.25); }

/* ══════════════════════════════════════════════════
   MAIN AREA
══════════════════════════════════════════════════ */
.mn {
  margin-left: var(--sid);
  flex: 1;
  display: flex; flex-direction: column;
  transition: margin-left .28s cubic-bezier(.4,0,.2,1);
  min-width: 0; min-height: 100vh;
}
.mn.col { margin-left: 68px; }

/* ── TOPBAR ── */
.tb {
  height: var(--top);
  background: var(--drk);
  border-bottom: 1px solid var(--bdr);
  display: flex; align-items: center; gap: 12px;
  padding: 0 1.5rem;
  position: sticky; top: 0; z-index: 200;
  flex-shrink: 0;
}
.tb-toggle {
  width: 34px; height: 34px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--bdr);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: var(--txt2); cursor: pointer;
  transition: all .15s; flex-shrink: 0;
}
.tb-toggle:hover { background: rgba(255,255,255,.08); color: var(--txt); }
.tb-title {
  flex: 1;
  font-family: 'Playfair Display', serif;
  font-size: .95rem; font-weight: 800;
  color: var(--txt); letter-spacing: -.2px;
}
.tb-title em { color: var(--gld); font-style: normal; }
.tb-actions { display: flex; align-items: center; gap: 8px; }

.tb-bell {
  width: 34px; height: 34px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--bdr);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: var(--txt2); cursor: pointer; position: relative;
  transition: all .15s;
}
.tb-bell:hover { color: var(--gld); border-color: rgba(255,215,0,.2); }
.tb-bell-dot {
  position: absolute; top: 7px; right: 7px;
  width: 7px; height: 7px;
  border-radius: 50%; background: var(--red);
  border: 1.5px solid var(--drk);
}

.tb-user {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--bdr);
  border-radius: 50px;
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  transition: all .15s; position: relative;
}
.tb-user:hover { border-color: rgba(255,215,0,.2); background: rgba(255,215,0,.04); }
.tb-user-av {
  width: 26px; height: 26px;
  background: linear-gradient(135deg, var(--gld), var(--grn));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 800; color: #000;
}
.tb-user-name { font-size: .8rem; font-weight: 600; color: var(--txt); }

/* Dropdown */
.ddrop {
  position: absolute; top: calc(100% + 8px); right: 0;
  min-width: 200px;
  background: var(--crd2);
  border: 1px solid var(--bdr2);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
  z-index: 9999; overflow: hidden;
  animation: ddIn .15s ease;
}
@keyframes ddIn { from { opacity:0; transform:translateY(-6px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
.ddrop-head { padding: .875rem 1rem; border-bottom: 1px solid var(--bdr); }
.ddrop-head .ddn { font-weight: 700; font-size: .84rem; color: var(--txt); }
.ddrop-head .dde { font-size: .72rem; color: var(--txt3); margin-top: 1px; }
.ddrop-item {
  width: 100%; background: none; border: none;
  padding: .65rem 1rem;
  display: flex; align-items: center; gap: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: .82rem; color: var(--txt2);
  cursor: pointer; text-align: left;
  transition: background .12s, color .12s;
}
.ddrop-item:hover { background: rgba(255,255,255,.05); color: var(--txt); }
.ddrop-item.danger:hover { background: rgba(239,68,68,.08); color: var(--red); }
.ddrop-div { border-top: 1px solid var(--bdr); margin: 0; }

/* ── CONTENT ── */
.ct {
  flex: 1;
  padding: 1.75rem 1.75rem 3rem;
  overflow-y: auto;
}
.pg-head { margin-bottom: 1.5rem; }
.pg-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; font-weight: 800;
  color: var(--txt); margin-bottom: 2px;
  letter-spacing: -.3px;
}
.pg-title em { color: var(--gld); font-style: normal; }
.pg-sub { font-size: .82rem; color: var(--txt3); }

/* ── STAT GRID ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: var(--crd);
  border: 1px solid var(--bdr);
  border-radius: 16px;
  padding: 1.25rem 1.375rem;
  display: flex; justify-content: space-between; align-items: flex-start;
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform .2s, border-color .2s, box-shadow .2s;
}
.stat-card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--card-accent, var(--gld));
}
.stat-card:hover { transform: translateY(-3px); border-color: rgba(255,215,0,.15); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.sc-label { font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--txt3); margin-bottom: 8px; }
.sc-val { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; line-height: 1; color: var(--card-accent, var(--gld)); }
.sc-delta { font-size: .72rem; color: var(--txt3); margin-top: 5px; }
.sc-delta.up { color: var(--grn); }
.sc-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
  background: var(--card-icon-bg, rgba(255,215,0,.08));
  color: var(--card-accent, var(--gld));
}

/* ── GLASS CARD ── */
.glass { background: var(--crd); border: 1px solid var(--bdr); border-radius: 16px; overflow: hidden; }
.glass-h { padding: 1rem 1.375rem; border-bottom: 1px solid var(--bdr); display: flex; align-items: center; gap: 10px; }
.glass-t { font-family: 'Playfair Display', serif; font-size: .9rem; font-weight: 800; color: var(--txt); flex: 1; }
.glass-b { padding: 1.125rem 1.375rem; }

/* ── ACTIVITY FEED ── */
.act-row { display: flex; gap: 12px; padding: .75rem 0; border-bottom: 1px solid var(--bdr); }
.act-row:last-child { border-bottom: none; }
.act-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .7rem; flex-shrink: 0; }
.act-label { font-size: .82rem; font-weight: 600; color: var(--txt); margin-bottom: 2px; }
.act-time { font-size: .7rem; color: var(--txt3); }
.act-chip { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 20px; font-size: .62rem; font-weight: 700; margin-left: 6px; }

/* ── QUICK ACTIONS ── */
.qa-btn {
  width: 100%; background: rgba(255,255,255,.03);
  border: 1px solid var(--bdr);
  color: var(--txt2); border-radius: 10px;
  padding: .7rem 1rem;
  display: flex; align-items: center; gap: 10px;
  font-size: .83rem; font-weight: 600;
  cursor: pointer; transition: all .15s;
  font-family: 'DM Sans', sans-serif; text-align: left;
}
.qa-btn:hover { border-color: rgba(255,215,0,.2); color: var(--gld); background: rgba(255,215,0,.03); }

/* ── REVENUE ROWS ── */
.rev-row { display: flex; justify-content: space-between; padding: .5rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.rev-row:last-child { border-bottom: none; }

/* ── BUTTONS ── */
.btn-gld {
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, var(--gld), var(--gld2));
  color: #000; border: none; border-radius: 9px;
  padding: .6rem 1.25rem;
  font-family: 'DM Sans', sans-serif; font-size: .84rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 3px 12px rgba(255,215,0,.2);
}
.btn-gld:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,215,0,.35); }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 1000; }
.modal-box {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: min(500px, 95vw);
  background: var(--crd);
  border: 1px solid var(--bdr2);
  border-radius: 18px; z-index: 1001; overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,.7);
}
.modal-head {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--bdr);
  background: linear-gradient(90deg, rgba(255,215,0,.05), rgba(34,197,94,.03));
  display: flex; align-items: center; justify-content: space-between;
}
.modal-head-title { font-family: 'Playfair Display', serif; font-weight: 800; font-size: .92rem; color: var(--txt); display: flex; align-items: center; gap: 8px; }
.modal-close { background: none; border: none; color: var(--txt3); cursor: pointer; font-size: 1rem; }
.modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 12px; }
.modal-foot { padding: .875rem 1.5rem; border-top: 1px solid var(--bdr); display: flex; justify-content: flex-end; gap: 10px; background: rgba(255,255,255,.01); }

.minp {
  width: 100%; background: var(--srf);
  border: 1.5px solid var(--bdr2);
  border-radius: 9px; padding: .65rem 1rem;
  color: var(--txt); font-family: 'DM Sans', sans-serif;
  font-size: .88rem; outline: none; transition: border-color .2s;
}
.minp:focus { border-color: var(--gld); }
.mlabel { font-size: .68rem; font-weight: 700; color: var(--txt3); letter-spacing: .08em; text-transform: uppercase; display: block; margin-bottom: 5px; }

/* ── INFO BANNER ── */
.infobanner {
  background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.15);
  border-radius: 12px; padding: .875rem 1.125rem; margin-bottom: 1.25rem;
  display: flex; align-items: flex-start; gap: 10px;
  font-size: .82rem; color: #86efac;
}

/* ── ERROR BANNER ── */
.errbanner {
  background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.2);
  border-radius: 12px; padding: .875rem 1.125rem; margin-bottom: 1.25rem;
  display: flex; align-items: center; gap: 10px;
  font-size: .84rem; color: #fca5a5;
}

/* ── ACCESS DENIED ── */
.access-denied { text-align: center; padding: 5rem 2rem; }
.access-denied .lock-icon { font-size: 3rem; margin-bottom: 1rem; }
.access-denied h4 { font-family: 'Playfair Display', serif; font-weight: 800; color: var(--txt); margin-bottom: 8px; }
.access-denied p { color: var(--txt3); font-size: .88rem; }

/* ── MOBILE OVERLAY ── */
.mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 299; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 768px) {
  .sb { width: 264px !important; transform: translateX(-100%); }
  .mn { margin-left: 0 !important; }
  .ct { padding: 1rem; }
  .stat-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 520px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
`;

/* ═══════════════════════════════════════════════════════
   ROLE CONFIG
═══════════════════════════════════════════════════════ */
const ROLE_PERMISSIONS = {
  superadmin:  ['dashboard','craftsmen','jobs','payments','reports','analytics','support','settings'],
  moderator:   ['dashboard','craftsmen','support'],
  maintenance: ['dashboard','jobs'],
  support:     ['dashboard','support','jobs'],
  finance:     ['dashboard','payments','reports'],
  analytics:   ['dashboard','analytics','reports'],
};
const ROLE_LABELS = {
  superadmin:'Super Admin', moderator:'Moderator', maintenance:'Maintenance',
  support:'Support', finance:'Finance', analytics:'Analytics',
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────
  const [pendingCraftsmen,  setPendingCraftsmen]  = useState([]);
  const [approvedCraftsmen, setApprovedCraftsmen] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [pendingFilter,     setPendingFilter]     = useState('');
  const [approvedFilter,    setApprovedFilter]    = useState('');
  const [activeSection,     setActiveSection]     = useState('dashboard');
  const [craftsmenSub,      setCraftsmenSub]      = useState('pending');
  const [jobs,              setJobs]              = useState([]);
  const [jobsLoading,       setJobsLoading]       = useState(false);
  const [showRejectModal,   setShowRejectModal]   = useState(false);
  const [rejectReason,      setRejectReason]      = useState('');
  const [rejectTarget,      setRejectTarget]      = useState(null);
  const [selectedCraftsmen, setSelectedCraftsmen] = useState({});
  const [editingCraftsman,  setEditingCraftsman]  = useState(null);
  const [editForm,          setEditForm]          = useState({});
  const [adminName,         setAdminName]         = useState('');
  const [adminEmail,        setAdminEmail]        = useState('');
  const [adminRole,         setAdminRole]         = useState('superadmin');
  const [showDrop,          setShowDrop]          = useState(false);
  const [collapsed,         setCollapsed]         = useState(false);
  const [mobileOpen,        setMobileOpen]        = useState(false);
  const [recentActivity,    setRecentActivity]    = useState([]);
  const [notifications,     setNotifications]     = useState([]);

  // ── Helpers ───────────────────────────────────────────
  const isMob      = () => window.innerWidth < 768;
  const canAccess  = useCallback((sec) => (ROLE_PERMISSIONS[adminRole] || []).includes(sec), [adminRole]);
  const getImgSafe = (p) => getFullImageUrl(p);

  // ── Resize handler ────────────────────────────────────
  useEffect(() => {
    const fn = () => { if (window.innerWidth < 768) setCollapsed(false); };
    fn(); window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Approval criteria ─────────────────────────────────
  const isCraftsmanApproved = (c) => c?.is_approved === true;
  const checkCriteria = (c) => {
    const e = [];
    if (!c.full_name?.trim())   e.push('Full name missing');
    if (!c.profile)             e.push('Profile photo missing');
    if (!c.profession?.trim())  e.push('Profession missing');
    if (!c.description?.trim()) e.push('Description missing');
    if (!c.primary_service?.trim() && !c.services?.[0]?.name?.trim()) e.push('Service required');
    if (!Array.isArray(c.gallery_images) || !c.gallery_images.length) e.push('Work photo required');
    return e;
  };

  // ── Auto-approve ──────────────────────────────────────
  const autoApprovePending = async (list) => {
    const ready = list.filter(c => checkCriteria(c).length === 0);
    if (!ready.length) return;
    await Promise.allSettled(ready.map(c => api.post(`admin/craftsman/${c.id}/approve/`, {})));
    await fetchCraftsmen(false);
  };

  // ── Fetch admin profile ───────────────────────────────
  const fetchAdminProfile = async () => {
    try {
      const { data } = await api.get('admin/profile/');
      setAdminName(data.full_name || data.name || 'Admin');
      setAdminEmail(data.email || '');
      setAdminRole(data.role || 'superadmin');
    } catch {
      setAdminName('Admin');
    }
  };

  // ── Fetch craftsmen ───────────────────────────────────
  const fetchCraftsmen = async (runAuto = true) => {
    setLoading(true);
    try {
      const { data } = await api.get('admin/craftsman/');
      const all = Array.isArray(data) ? data : [];
      const p = all.filter(c => !isCraftsmanApproved(c));
      const a = all.filter(isCraftsmanApproved);
      setPendingCraftsmen(p);
      setApprovedCraftsmen(a);
      setError('');
      if (runAuto) await autoApprovePending(p);
    } catch {
      setError('Unable to load craftsmen. Check your connection and try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // ── Build activity feed ───────────────────────────────
  const buildActivity = (craftsmen, jobsList) => {
    const items = [];
    craftsmen.slice(0, 3).forEach(c => items.push({
      type: 'craftsman', icon: <FaHardHat/>, iconColor: '#FFD700',
      label: `${c.full_name} applied as craftsman`,
      tag: 'Pending', tagColor: '#fbbf24', time: 'Recently',
    }));
    jobsList.slice(0, 3).forEach(j => items.push({
      type: 'job', icon: <FaClipboardList/>, iconColor: '#3b82f6',
      label: `Job #${j.id}: ${j.service} — ${j.name || 'client'}`,
      tag: j.status, tagColor: j.status === 'Completed' ? '#22c55e' : '#3b82f6',
      time: j.schedule ? new Date(j.schedule).toLocaleDateString() : 'Recently',
    }));
    return items.slice(0, 8);
  };

  // ── Initial load ──────────────────────────────────────
  useEffect(() => { fetchCraftsmen(); fetchAdminProfile(); }, []);

  // ── Fetch jobs ────────────────────────────────────────
  const fetchAllJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const { data } = await api.get('/job-requests/');
      const list = data || [];
      setJobs(list);
      setRecentActivity(buildActivity(pendingCraftsmen, list));
    } catch {}
    finally { setJobsLoading(false); }
  }, [pendingCraftsmen]);

  useEffect(() => {
    if (['jobs', 'payments', 'dashboard'].includes(activeSection)) fetchAllJobs();
  }, [activeSection]);

  useEffect(() => {
    setRecentActivity(buildActivity(pendingCraftsmen, jobs));
  }, [pendingCraftsmen, jobs]);

  // ── Computed ──────────────────────────────────────────
  const jobsReady     = jobs.filter(j => j.status === 'Completed');
  const totalRevenue  = jobs.filter(j => /paid/i.test(j.status || '')).reduce((a, j) => a + (Number(j.budget) || 0), 0);
  const activeJobsLen = jobs.filter(j => ['accepted','in_progress','inprogress','quote approved'].some(s => (j.status || '').toLowerCase().includes(s))).length;

  // ── Actions ───────────────────────────────────────────
  const handleAction = async (type, id, model, craftsman = null, reason = null) => {
    if (model === 'craftsman' && type === 'approve' && craftsman) {
      const errs = checkCriteria(craftsman);
      if (errs.length) { alert('Cannot approve:\n• ' + errs.join('\n• ')); return; }
    }
    try {
      await api.post(`admin/${model}/${id}/${type}/`, reason ? { reason } : {});
      await fetchCraftsmen(false);
    } catch { alert(`Action failed: ${type}`); }
  };

  const openRejectModal = (c) => { setRejectTarget({ id: c.id, model: 'craftsman' }); setRejectReason(''); setShowRejectModal(true); };
  const confirmReject   = async () => {
    if (!rejectReason.trim()) { alert('Please provide a reason.'); return; }
    await handleAction('reject', rejectTarget.id, rejectTarget.model, null, rejectReason);
    setShowRejectModal(false);
  };
  const toggleActive = async (c) => {
    try { await api.patch(`admin/craftsman/${c.id}/toggle-active/`); fetchCraftsmen(false); }
    catch { alert('Failed to update status.'); }
  };
  const openEditModal = (c) => {
    setEditingCraftsman(c);
    setEditForm({ full_name: c.full_name || '', profession: c.profession || '', description: c.description || '', primary_service: c.primary_service || '' });
  };
  const saveEdit = async () => {
    if (!editingCraftsman) return;
    try { await api.patch(`admin/craftsman/${editingCraftsman.id}/`, editForm); setEditingCraftsman(null); fetchCraftsmen(false); }
    catch { alert('Save failed. Please try again.'); }
  };
  const processPayment = async (id) => {
    try { await api.post(`/job-requests/${id}/pay/`); fetchAllJobs(); }
    catch { alert('Payment processing failed. Please try again.'); }
  };
  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    navigate('/admin/login');
  };

  // ── Navigation ────────────────────────────────────────
  const navTo = (sec, sub = null) => {
    if (!canAccess(sec)) return;
    setActiveSection(sec);
    if (sub) setCraftsmenSub(sub);
    if (isMob()) setMobileOpen(false);
    setShowDrop(false);
  };

  // ── Title ─────────────────────────────────────────────
  const getTitle = () => {
    if (activeSection === 'dashboard') return { main: 'Dashboard', rest: 'Overview' };
    if (activeSection === 'craftsmen') {
      const m = { pending: 'Pending', approved: 'Active', inactive: 'Inactive' };
      return { main: m[craftsmenSub], rest: 'Craftsmen' };
    }
    const map = { jobs: 'Job', payments: 'Payment', reports: 'Reports', analytics: 'Analytics', support: 'Support', settings: 'Settings' };
    const rest = activeSection === 'jobs' ? 'Management' : activeSection === 'payments' ? 'Management' : '';
    return { main: map[activeSection] || activeSection, rest };
  };
  const { main: ptMain, rest: ptRest } = getTitle();

  // ── Dashboard stats ───────────────────────────────────
  const stats = [
    { lbl:'Pending Approvals', val:pendingCraftsmen.length,  accent:'#FFD700', iconBg:'rgba(255,215,0,.08)',  ic:<FaClipboardList/>, delta:'+2 today', deltaUp:true,  sec:'craftsmen', sub:'pending' },
    { lbl:'Active Craftsmen',  val:approvedCraftsmen.filter(c=>c.is_active).length, accent:'#22c55e', iconBg:'rgba(34,197,94,.08)', ic:<FaCheckCircle/>, delta:'on platform', sec:'craftsmen', sub:'approved' },
    { lbl:'Total Jobs',        val:jobs.length, accent:'#3b82f6', iconBg:'rgba(59,130,246,.08)', ic:<FaClipboardList/>, delta:`${activeJobsLen} active`, sec:'jobs' },
    { lbl:'Ready to Pay',      val:jobsReady.length, accent:'#EF4444', iconBg:'rgba(239,68,68,.08)', ic:<FaDollarSign/>, delta:'awaiting payout', sec:'payments' },
    { lbl:'Total Users',       val:approvedCraftsmen.length + 10, accent:'#8b5cf6', iconBg:'rgba(139,92,246,.08)', ic:<FaUsers/>, delta:'craftsmen + clients', sec:'settings' },
    { lbl:'Revenue (KSh)',     val:`${(totalRevenue/1000).toFixed(1)}k`, accent:'#22c55e', iconBg:'rgba(34,197,94,.08)', ic:<FaDollarSign/>, delta:'paid jobs total', sec:'payments' },
  ];

  // ── Classes ───────────────────────────────────────────
  const sbClass = `sb${collapsed ? ' col' : ''}${isMob() ? (mobileOpen ? ' ms' : ' mh') : ''}`;
  const mnClass = `mn${collapsed ? ' col' : ''}`;

  const showCraftsmen = canAccess('craftsmen');
  const showJobs      = canAccess('jobs');
  const showPayments  = canAccess('payments');
  const showReports   = canAccess('reports');
  const showAnalytics = canAccess('analytics');
  const showSupport   = canAccess('support');
  const showSettings  = canAccess('settings');

  // ─────────────────────────────────────────────────────
  return (
    <div className="adm">
      <style>{THEME}</style>

      {/* Mobile overlay */}
      {mobileOpen && <div className="mob-overlay" onClick={() => setMobileOpen(false)}/>}

      {/* ════════════ SIDEBAR ════════════ */}
      <aside className={sbClass}>
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-gem">K</div>
          <span className="sb-brand">Kaaka<em>Kazini</em></span>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <button className={`sb-btn${activeSection === 'dashboard' ? ' on' : ''}`} onClick={() => navTo('dashboard')}>
            <FaHome className="sb-ic"/><span className="sb-lbl">Dashboard</span>
          </button>

          {showCraftsmen && (<>
            <div className="sb-section">Craftsmen</div>
            {[
              { key: 'pending',  lbl: 'Pending',  Icon: FaClipboardList, badge: pendingCraftsmen.length },
              { key: 'approved', lbl: 'Active',   Icon: FaCheckCircle },
              { key: 'inactive', lbl: 'Inactive', Icon: FaToggleOff },
            ].map(({ key, lbl, Icon, badge }) => (
              <button key={key} className={`sb-btn${activeSection === 'craftsmen' && craftsmenSub === key ? ' on' : ''}`}
                onClick={() => navTo('craftsmen', key)} style={{ paddingLeft: '.9rem' }}>
                <Icon className="sb-ic"/><span className="sb-lbl">{lbl}</span>
                {badge > 0 && <span className="sb-badge">{badge}</span>}
              </button>
            ))}
          </>)}

          <div className="sb-section">Management</div>
          {showJobs     && <button className={`sb-btn${activeSection === 'jobs' ? ' on' : ''}`}     onClick={() => navTo('jobs')}><FaClipboardList className="sb-ic"/><span className="sb-lbl">Jobs</span></button>}
          {showPayments && <button className={`sb-btn${activeSection === 'payments' ? ' on' : ''}`} onClick={() => navTo('payments')}><FaDollarSign className="sb-ic"/><span className="sb-lbl">Payments</span>{jobsReady.length > 0 && <span className="sb-badge">{jobsReady.length}</span>}</button>}
          {showReports  && <button className={`sb-btn${activeSection === 'reports' ? ' on' : ''}`}  onClick={() => navTo('reports')}><FaFileAlt className="sb-ic"/><span className="sb-lbl">Reports</span></button>}
          {showAnalytics && <button className={`sb-btn${activeSection === 'analytics' ? ' on' : ''}`} onClick={() => navTo('analytics')}><FaChartLine className="sb-ic"/><span className="sb-lbl">Analytics</span></button>}

          <div className="sb-section">System</div>
          {showSupport  && <button className={`sb-btn${activeSection === 'support' ? ' on' : ''}`}  onClick={() => navTo('support')}><FaHeadset className="sb-ic"/><span className="sb-lbl">Support</span></button>}
          {showSettings && <button className={`sb-btn${activeSection === 'settings' ? ' on' : ''}`} onClick={() => navTo('settings')}><FaCog className="sb-ic"/><span className="sb-lbl">Settings</span></button>}
        </nav>

        {/* Footer */}
        <div className="sb-foot">
          <div className="sb-av">{(adminName.charAt(0) || 'A').toUpperCase()}</div>
          <div className="sb-info">
            <div className="sb-name">{adminName}</div>
            <div className="sb-role"><span className={`rpill rpill-${adminRole}`}>{ROLE_LABELS[adminRole] || adminRole}</span></div>
          </div>
          <button className="sb-logout" onClick={handleLogout} title="Log out"><FaSignOutAlt/></button>
        </div>
      </aside>

      {/* ════════════ MAIN ════════════ */}
      <div className={mnClass}>

        {/* Topbar */}
        <header className="tb">
          <button className="tb-toggle" onClick={() => isMob() ? setMobileOpen(o => !o) : setCollapsed(c => !c)}>
            {mobileOpen ? <FaTimes size={13}/> : <FaBars size={13}/>}
          </button>

          <div className="tb-title"><em>{ptMain}</em>{ptRest ? ` ${ptRest}` : ''}</div>

          <div className="tb-actions">
            <div className="tb-bell">
              <FaBell size={13}/>
              {(jobsReady.length > 0 || pendingCraftsmen.length > 0) && <span className="tb-bell-dot"/>}
            </div>

            <div className="position-relative">
              <div className="tb-user" onClick={() => setShowDrop(d => !d)}>
                <div className="tb-user-av">{(adminName.charAt(0) || 'A').toUpperCase()}</div>
                <span className="tb-user-name d-none d-sm-block">{adminName}</span>
                <FaChevronDown size={9} style={{ color: 'var(--txt3)', marginLeft: 2 }}/>
              </div>

              {showDrop && (<>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9996 }} onClick={() => setShowDrop(false)}/>
                <div className="ddrop">
                  <div className="ddrop-head">
                    <div className="ddn">{adminName}</div>
                    <div className="dde">{adminEmail}</div>
                    <div style={{ marginTop: 5 }}><span className={`rpill rpill-${adminRole}`}>{ROLE_LABELS[adminRole]}</span></div>
                  </div>
                  {showSettings && <button className="ddrop-item" onClick={() => { navTo('settings'); setShowDrop(false); }}><FaCog size={12}/> Settings</button>}
                  <button className="ddrop-item" onClick={() => setShowDrop(false)}><FaQuestionCircle size={12}/> Help</button>
                  <hr className="ddrop-div"/>
                  <button className="ddrop-item danger" onClick={handleLogout}><FaSignOutAlt size={12}/> Log out</button>
                </div>
              </>)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="ct">

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div className="spinner-border" style={{ color: '#FFD700', width: '2.5rem', height: '2.5rem' }} role="status"/>
              <p style={{ marginTop: '1rem', color: 'var(--txt3)', fontSize: '.88rem' }}>Loading dashboard…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="errbanner">
              <FaExclamationTriangle/>
              <span>{error}</span>
              <button onClick={() => fetchCraftsmen()} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.25)', color: '#fca5a5', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: 600 }}>
                Retry
              </button>
            </div>
          )}

          {!loading && (
            <>
              {/* ── DASHBOARD ── */}
              {activeSection === 'dashboard' && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Dashboard</em> Overview</h1>
                    <p className="pg-sub">Welcome back, {adminName}. Here's your platform at a glance.</p>
                  </div>

                  <div className="stat-grid">
                    {stats.map((s, i) => (
                      <div key={i} className="stat-card"
                        style={{ '--card-accent': s.accent, '--card-icon-bg': s.iconBg }}
                        onClick={() => s.sec && navTo(s.sec, s.sub)}>
                        <div>
                          <div className="sc-label">{s.lbl}</div>
                          <div className="sc-val">{s.val}</div>
                          {s.delta && <div className={`sc-delta${s.deltaUp ? ' up' : ''}`}>{s.deltaUp ? '▲ ' : ''}{s.delta}</div>}
                        </div>
                        <div className="sc-icon">{s.ic}</div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-lg-8">
                      <div className="glass">
                        <div className="glass-h">
                          <span className="glass-t">Recent Activity</span>
                          <span style={{ fontSize: '.7rem', color: 'var(--grn)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--grn)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}/>Live
                          </span>
                        </div>
                        <div style={{ padding: '0 1.375rem' }}>
                          {recentActivity.length === 0
                            ? <p style={{ color: 'var(--txt3)', fontSize: '.84rem', padding: '1.25rem 0' }}>No recent activity to display.</p>
                            : recentActivity.map((a, i) => (
                              <div key={i} className="act-row">
                                <div className="act-dot" style={{ background: `${a.iconColor}14`, color: a.iconColor }}>{a.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <div className="act-label">
                                    {a.label}
                                    <span className="act-chip" style={{ background: `${a.tagColor}18`, color: a.tagColor }}>{a.tag}</span>
                                  </div>
                                  <div className="act-time">{a.time}</div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-4">
                      <div className="glass mb-3">
                        <div className="glass-h"><span className="glass-t">Quick Actions</span></div>
                        <div className="glass-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {canAccess('craftsmen') && <button className="qa-btn" onClick={() => navTo('craftsmen','pending')}><FaShieldAlt style={{ color: '#FFD700' }}/> Review Pending ({pendingCraftsmen.length})</button>}
                          {canAccess('payments')  && <button className="qa-btn" onClick={() => navTo('payments')}><FaDollarSign style={{ color: '#22c55e' }}/> Process Payments ({jobsReady.length})</button>}
                          {canAccess('jobs')      && <button className="qa-btn" onClick={() => navTo('jobs')}><FaHardHat style={{ color: '#3b82f6' }}/> Manage Jobs ({jobs.length})</button>}
                          {canAccess('support')   && <button className="qa-btn" onClick={() => navTo('support')}><FaHeadset style={{ color: '#8b5cf6' }}/> Support Tickets</button>}
                          {canAccess('settings')  && <button className="qa-btn" onClick={() => navTo('settings')}><FaUserCog style={{ color: '#ef4444' }}/> Manage Staff</button>}
                        </div>
                      </div>

                      <div className="glass">
                        <div className="glass-h"><span className="glass-t">Revenue Snapshot</span></div>
                        <div className="glass-b">
                          {[
                            { lbl: 'Total Processed', val: `KSh ${totalRevenue.toLocaleString()}`, c: '#22c55e' },
                            { lbl: 'Platform Cut (10%)', val: `KSh ${Math.round(totalRevenue * .1).toLocaleString()}`, c: '#FFD700' },
                            { lbl: 'To Craftsmen (90%)', val: `KSh ${Math.round(totalRevenue * .9).toLocaleString()}`, c: 'var(--txt)' },
                          ].map((r, i) => (
                            <div key={i} className="rev-row">
                              <span style={{ fontSize: '.78rem', color: 'var(--txt3)' }}>{r.lbl}</span>
                              <span style={{ fontSize: '.86rem', fontWeight: 700, color: r.c, fontFamily: 'JetBrains Mono, monospace' }}>{r.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── CRAFTSMEN ── */}
              {activeSection === 'craftsmen' && canAccess('craftsmen') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>{ptMain}</em> {ptRest}</h1>
                    <p className="pg-sub">Review, approve and manage craftsman profiles</p>
                  </div>
                  {craftsmenSub === 'pending' && (
                    <div className="infobanner">
                      <FaCheckCircle style={{ flexShrink: 0 }}/>
                      <div><strong>Auto-approve enabled.</strong> Craftsmen meeting all criteria are approved automatically on load. Hover a disabled button to see missing fields.</div>
                    </div>
                  )}
                  <CraftsmenTable
                    list={craftsmenSub === 'pending' ? pendingCraftsmen : craftsmenSub === 'approved' ? approvedCraftsmen : approvedCraftsmen.filter(c => !c.is_active)}
                    filterValue={craftsmenSub === 'pending' ? pendingFilter : approvedFilter}
                    setFilterValue={craftsmenSub === 'pending' ? setPendingFilter : setApprovedFilter}
                    isPending={craftsmenSub === 'pending'}
                    getImageUrl={getImgSafe}
                    colorText={(t, c) => <span style={{ color: c }}>{t}</span>}
                    checkCraftsmanApprovalCriteria={checkCriteria}
                    isCraftsmanApproved={isCraftsmanApproved}
                    handleAction={handleAction}
                    openRejectModal={openRejectModal}
                    toggleActiveStatus={toggleActive}
                    openEditModal={openEditModal}
                  />
                </>
              )}

              {/* ── JOBS ── */}
              {activeSection === 'jobs' && canAccess('jobs') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Job</em> Management</h1>
                    <p className="pg-sub">View, filter and assign all service requests to craftsmen</p>
                  </div>
                  <JobRequests
                    jobs={jobs} jobsLoading={jobsLoading}
                    approvedCraftsmen={approvedCraftsmen}
                    selectedCraftsmen={selectedCraftsmen}
                    setSelectedCraftsmen={setSelectedCraftsmen}
                    onSuccessAssign={fetchAllJobs}
                  />
                </>
              )}

              {/* ── PAYMENTS ── */}
              {activeSection === 'payments' && canAccess('payments') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Payment</em> Management</h1>
                    <p className="pg-sub">Process M-Pesa payouts for completed jobs</p>
                  </div>
                  <PaymentDashboard jobsReadyForPayment={jobsReady} processPayment={processPayment}/>
                </>
              )}

              {/* ── ANALYTICS ── */}
              {activeSection === 'analytics' && canAccess('analytics') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Analytics</em></h1>
                    <p className="pg-sub">Platform performance, trends and key metrics</p>
                  </div>
                  <AnalyticsPage jobs={jobs} craftsmen={approvedCraftsmen}/>
                </>
              )}

              {/* ── REPORTS ── */}
              {activeSection === 'reports' && canAccess('reports') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Reports</em></h1>
                    <p className="pg-sub">Export platform data as CSV for Excel / Sheets</p>
                  </div>
                  <ReportsPage jobs={jobs} craftsmen={approvedCraftsmen}/>
                </>
              )}

              {/* ── SUPPORT ── */}
              {activeSection === 'support' && canAccess('support') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Support</em> Centre</h1>
                    <p className="pg-sub">Handle disputes, complaints and help requests</p>
                  </div>
                  <SupportPage/>
                </>
              )}

              {/* ── SETTINGS ── */}
              {activeSection === 'settings' && canAccess('settings') && (
                <>
                  <div className="pg-head">
                    <h1 className="pg-title"><em>Settings</em></h1>
                    <p className="pg-sub">Staff management, services, locations and system config</p>
                  </div>
                  <SettingsPage adminRole={adminRole}/>
                </>
              )}

              {/* ── ACCESS DENIED ── */}
              {!canAccess(activeSection) && activeSection !== 'dashboard' && (
                <div className="glass access-denied">
                  <div className="lock-icon">🔒</div>
                  <h4>Access Restricted</h4>
                  <p>Your role (<strong>{ROLE_LABELS[adminRole]}</strong>) does not have access to this section.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ════════════ EDIT MODAL ════════════ */}
      {editingCraftsman && (<>
        <div className="modal-overlay" onClick={() => setEditingCraftsman(null)}/>
        <div className="modal-box">
          <div className="modal-head">
            <span className="modal-head-title"><FaEdit style={{ color: '#FFD700' }}/> Edit Craftsman</span>
            <button className="modal-close" onClick={() => setEditingCraftsman(null)}>✕</button>
          </div>
          <div className="modal-body">
            {[
              ['Full Name', 'full_name', 'input'],
              ['Profession', 'profession', 'input'],
              ['Description', 'description', 'textarea'],
              ['Primary Service', 'primary_service', 'input'],
            ].map(([lbl, key, type]) => (
              <div key={key}>
                <label className="mlabel">{lbl}</label>
                {type === 'textarea'
                  ? <textarea rows={3} value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="minp" style={{ resize: 'vertical' }}/>
                  : <input value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="minp"/>
                }
              </div>
            ))}
          </div>
          <div className="modal-foot">
            <button onClick={() => setEditingCraftsman(null)} style={{ padding: '.6rem 1.1rem', background: 'rgba(255,255,255,.05)', border: '1px solid var(--bdr2)', borderRadius: 9, color: 'var(--txt2)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '.84rem' }}>Cancel</button>
            <button onClick={saveEdit} className="btn-gld"><FaCheckCircle size={12}/> Save Changes</button>
          </div>
        </div>
      </>)}

      {/* ════════════ REJECT MODAL ════════════ */}
      <RejectModal
        show={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmReject={confirmReject}
        closeModal={() => setShowRejectModal(false)}
      />

      {/* Pulse animation */}
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
