import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  FaBell, FaHome, FaClipboardList, FaDollarSign, FaCheckCircle,
  FaChartLine, FaFileAlt, FaLifeRing, FaCog, FaQuestionCircle,
  FaEdit, FaToggleOff, FaSignOutAlt, FaChevronDown,
  FaHardHat, FaBars, FaTimes,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axiosClient";
import CraftsmenTable   from '../components/CraftsmenTable';
import JobRequests      from '../components/JobRequests';
import PaymentDashboard from '../components/AdminPaymentDashboard';
import RejectModal      from '../components/RejectModal';
import { getFullImageUrl } from "../../utils/getFullImageUrl";

/* ══════════════════════════════════════════════════
   THEME  —  Black · Green · Gold
══════════════════════════════════════════════════ */
const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --blk:  #080808;
  --drk:  #0f0f0f;
  --crd:  #141414;
  --crd2: #1a1a1a;
  --bdr:  rgba(255,255,255,.07);
  --gld:  #FFD700;
  --gld2: #FFA500;
  --grn:  #22c55e;
  --grn2: #16a34a;
  --txt:  #f0f0f0;
  --mut:  #666;
  --red:  #ef4444;
  --sid:  260px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root { margin: 0 !important; padding: 0 !important; background: var(--blk); }

.adm { font-family: 'DM Sans', sans-serif; background: var(--blk); color: var(--txt); min-height: 100vh; display: flex; margin: 0; padding: 0; }

/* ─── Sidebar ─────────────────────────────────── */
.sb { width: var(--sid); min-height: 100vh; background: var(--drk); border-right: 1px solid var(--bdr); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 300; transition: width .3s, transform .3s; }
.sb.col { width: 72px; }
.sb.mh  { transform: translateX(-100%); }
.sb.ms  { transform: translateX(0); }

.sb-logo { display: flex; align-items: center; gap: 10px; padding: 1.25rem; border-bottom: 1px solid var(--bdr); min-height: 66px; }
.sb-lb   { width: 38px; height: 38px; flex-shrink: 0; background: linear-gradient(135deg, var(--gld), var(--gld2)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.1rem; color: #000; }
.sb-ln   { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.05rem; color: var(--txt); white-space: nowrap; overflow: hidden; transition: opacity .2s, width .2s; }
.sb-ln span { color: var(--gld); }
.sb.col .sb-ln { opacity: 0; width: 0; }

.sb-nav { flex: 1; overflow-y: auto; padding: .75rem; }
.sb-nav::-webkit-scrollbar { width: 0; }

.sb-sec { font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--mut); padding: .5rem .6rem .3rem; white-space: nowrap; overflow: hidden; transition: opacity .2s; margin-top: .5rem; }
.sb.col .sb-sec { opacity: 0; }

.sb-btn { width: 100%; border: none; background: transparent; color: #888; display: flex; align-items: center; gap: 10px; padding: .58rem .75rem; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: .86rem; font-weight: 500; cursor: pointer; transition: all .15s; text-align: left; white-space: nowrap; overflow: hidden; margin-bottom: 2px; position: relative; }
.sb-btn:hover { background: rgba(255,255,255,.05); color: var(--txt); }
.sb-btn.on { background: linear-gradient(90deg, rgba(255,215,0,.1), rgba(34,197,94,.06)); color: var(--gld); font-weight: 600; }
.sb-btn.on::before { content: ''; position: absolute; left: 0; top: 22%; bottom: 22%; width: 3px; border-radius: 0 3px 3px 0; background: linear-gradient(var(--gld), var(--grn)); }
.sb-btn .ni { flex-shrink: 0; font-size: .92rem; }
.sb-btn .nl { flex: 1; transition: opacity .2s; }
.sb.col .nl { opacity: 0; width: 0; overflow: hidden; }
.sb-bdg { background: var(--red); color: #fff; border-radius: 50px; font-size: .62rem; font-weight: 700; padding: 2px 7px; flex-shrink: 0; transition: opacity .2s; }
.sb.col .sb-bdg { opacity: 0; }

.sb-foot { padding: .875rem 1.25rem; border-top: 1px solid var(--bdr); display: flex; align-items: center; gap: 10px; }
.sb-av  { width: 36px; height: 36px; flex-shrink: 0; background: linear-gradient(135deg, var(--gld), var(--grn)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 800; font-size: .88rem; color: #000; }
.sb-ui  { overflow: hidden; flex: 1; transition: opacity .2s; }
.sb.col .sb-ui { opacity: 0; width: 0; }
.sb-un  { font-size: .82rem; font-weight: 700; color: var(--txt); white-space: nowrap; }
.sb-ur  { font-size: .7rem; color: var(--mut); }
.sb-out { background: none; border: none; color: var(--mut); cursor: pointer; padding: 6px; border-radius: 7px; font-size: .88rem; transition: all .15s; flex-shrink: 0; }
.sb-out:hover { color: var(--red); background: rgba(239,68,68,.1); }

/* ─── Main ────────────────────────────────────── */
.mn { margin-left: var(--sid); flex: 1; display: flex; flex-direction: column; transition: margin-left .3s; }
.mn.col { margin-left: 72px; }

/* ─── Topbar ──────────────────────────────────── */
.tb { height: 66px; flex-shrink: 0; background: var(--drk); border-bottom: 1px solid var(--bdr); display: flex; align-items: center; gap: 12px; padding: 0 1.5rem; position: sticky; top: 0; z-index: 200; }
.tb-ttl { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 800; color: var(--txt); flex: 1; letter-spacing: -.2px; }
.tb-ttl span { color: var(--gld); }
.tb-acts { display: flex; align-items: center; gap: 8px; }
.tb-ib { width: 36px; height: 36px; background: rgba(255,255,255,.04); border: 1px solid var(--bdr); border-radius: 9px; cursor: pointer; color: #999; display: flex; align-items: center; justify-content: center; position: relative; transition: all .15s; }
.tb-ib:hover { background: rgba(255,255,255,.09); color: var(--gld); border-color: rgba(255,215,0,.2); }
.tb-ndot { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--red); border: 2px solid var(--drk); }
.tb-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.04); border: 1px solid var(--bdr); border-radius: 50px; padding: 5px 12px 5px 5px; cursor: pointer; transition: all .15s; }
.tb-chip:hover { border-color: rgba(255,215,0,.2); background: rgba(255,215,0,.04); }
.tb-ca { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--gld), var(--grn)); display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 800; color: #000; flex-shrink: 0; }
.tb-cn { font-size: .82rem; font-weight: 600; color: var(--txt); }

.ddmenu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 210px; background: var(--crd2); border: 1px solid var(--bdr); border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.5); z-index: 9999; overflow: hidden; animation: ddin .18s ease; }
@keyframes ddin { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
.ddmenu .ddh { padding: .875rem 1rem; border-bottom: 1px solid var(--bdr); background: rgba(255,255,255,.02); }
.ddmenu .ddh .n { font-weight: 700; font-size: .86rem; }
.ddmenu .ddh .e { font-size: .72rem; color: var(--mut); }
.ddmenu .ddi { width: 100%; background: none; border: none; padding: .7rem 1rem; display: flex; align-items: center; gap: 10px; font-family: 'DM Sans', sans-serif; font-size: .84rem; color: #999; cursor: pointer; text-align: left; transition: all .15s; }
.ddmenu .ddi:hover { background: rgba(255,255,255,.05); color: var(--txt); }
.ddmenu .ddi.dng:hover { background: rgba(239,68,68,.1); color: var(--red); }
.ddmenu .ddiv { border: none; border-top: 1px solid var(--bdr); margin: 0; }

/* ─── Content ─────────────────────────────────── */
.ct { flex: 1; padding: 1.75rem 1.75rem 3rem; overflow-y: auto; }
.phdr { margin-bottom: 1.5rem; }
.ptitle { font-family: 'Playfair Display', serif; font-size: 1.45rem; font-weight: 800; color: var(--txt); margin-bottom: 3px; letter-spacing: -.3px; }
.ptitle span { color: var(--gld); }
.psub { font-size: .84rem; color: var(--mut); }

/* ─── Stat cards ──────────────────────────────── */
.sgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
.scard { background: var(--crd); border: 1px solid var(--bdr); border-radius: 14px; padding: 1.2rem 1.4rem; display: flex; justify-content: space-between; align-items: flex-start; transition: border-color .2s, transform .2s; cursor: pointer; }
.scard:hover { border-color: rgba(255,215,0,.2); transform: translateY(-3px); }
.slbl { font-size: .75rem; color: var(--mut); font-weight: 500; margin-bottom: 6px; }
.sval { font-family: 'Playfair Display', serif; font-size: 1.85rem; font-weight: 800; line-height: 1; color: var(--txt); }
.sval.g  { color: var(--gld); }
.sval.gr { color: var(--grn); }
.sval.r  { color: var(--red); }
.sib { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }

/* ─── Glass card ──────────────────────────────── */
.glass { background: var(--crd); border: 1px solid var(--bdr); border-radius: 14px; overflow: hidden; }
.glass-h { padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--bdr); display: flex; align-items: center; gap: 10px; }
.glass-t { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 800; color: var(--txt); flex: 1; }
.glass-b { padding: 1.25rem 1.5rem; }

/* ─── Info banner ─────────────────────────────── */
.infobanner { background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.2); border-radius: 12px; padding: .875rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 10px; font-size: .84rem; color: #86efac; }

/* ─── Buttons ─────────────────────────────────── */
.btn-gld { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg,var(--gld),var(--gld2)); color: #000; border: none; border-radius: 9px; padding: .6rem 1.25rem; font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 3px 12px rgba(255,215,0,.2); }
.btn-gld:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,215,0,.35); }
.qbtn { background: rgba(255,255,255,.04); border: 1px solid var(--bdr); color: #bbb; border-radius: 10px; padding: .7rem 1rem; display: flex; align-items: center; gap: 10px; font-size: .85rem; font-weight: 600; cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif; text-align: left; width: 100%; }
.qbtn:hover { border-color: rgba(255,215,0,.25); color: var(--gld); }

/* ─── Modal input ─────────────────────────────── */
.minp { width: 100%; background: #1a1a1a; border: 1.5px solid rgba(255,255,255,.08); border-radius: 9px; padding: .7rem 1rem; color: var(--txt); font-family: 'DM Sans', sans-serif; font-size: .9rem; outline: none; transition: border-color .2s; }
.minp:focus { border-color: var(--gld); }

/* ─── Responsive ──────────────────────────────── */
@media (max-width: 1100px) { .sgrid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 768px) {
  .sb { width: 260px !important; transform: translateX(-100%); }
  .sb.ms { transform: translateX(0); }
  .mn { margin-left: 0 !important; }
  .ct { padding: 1rem; }
  .sgrid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 480px) { .sgrid { grid-template-columns: 1fr 1fr; } .tb-ttl { font-size: .88rem; } }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [pendingCraftsmen,   setPendingCraftsmen]   = useState([]);
  const [approvedCraftsmen,  setApprovedCraftsmen]  = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState('');
  const [pendingFilter,      setPendingFilter]      = useState('');
  const [approvedFilter,     setApprovedFilter]     = useState('');
  const [activeSection,      setActiveSection]      = useState('dashboard');
  const [craftsmenSub,       setCraftsmenSub]       = useState('pending');
  const [jobs,               setJobs]               = useState([]);
  const [jobsLoading,        setJobsLoading]        = useState(false);
  const [showRejectModal,    setShowRejectModal]    = useState(false);
  const [rejectReason,       setRejectReason]       = useState('');
  const [rejectTarget,       setRejectTarget]       = useState(null);
  const [selectedCraftsmen,  setSelectedCraftsmen]  = useState({});
  const [editingCraftsman,   setEditingCraftsman]   = useState(null);
  const [editForm,           setEditForm]           = useState({});
  const [adminName,          setAdminName]          = useState('');
  const [adminEmail,         setAdminEmail]         = useState('');
  const [showDrop,           setShowDrop]           = useState(false);
  const [collapsed,          setCollapsed]          = useState(false);
  const [mobileOpen,         setMobileOpen]         = useState(false);

  const isMob = () => typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const fn = () => { if (window.innerWidth < 768) setCollapsed(false); };
    fn(); window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ─── Criteria ─────────────────────── */
  const isCraftsmanApproved = (c) => c?.is_approved === true;

  const checkCraftsmanApprovalCriteria = (c) => {
    const e = [];
    if (!c.full_name?.trim())   e.push('Full name missing');
    if (!c.profile)             e.push('Profile photo missing');
    if (!c.profession?.trim())  e.push('Profession missing');
    if (!c.description?.trim()) e.push('Description missing');
    if (!c.primary_service?.trim() && !c.services?.[0]?.name?.trim()) e.push('At least one service required');
    if (!Array.isArray(c.gallery_images) || !c.gallery_images.length) e.push('At least one work photo required');
    return e;
  };

  /* ─── Auto-approve ─────────────────── */
  const autoApprovePending = async (list) => {
    const ready = list.filter(c => checkCraftsmanApprovalCriteria(c).length === 0);
    if (!ready.length) return;
    await Promise.allSettled(ready.map(c => api.post(`admin/craftsman/${c.id}/approve/`, {})));
    await fetchCraftsmen(false);
  };

  /* ─── Data fetching ────────────────── */
  const fetchAdminProfile = async () => {
    try { const { data } = await api.get('admin/profile/'); setAdminName(data.full_name || data.name || 'Admin'); setAdminEmail(data.email || ''); }
    catch { setAdminName('Admin'); }
  };

  const fetchCraftsmen = async (runAuto = true) => {
    setLoading(true);
    try {
      const { data } = await api.get('admin/craftsman/');
      const all = Array.isArray(data) ? data : [];
      const p = all.filter(c => !isCraftsmanApproved(c));
      const a = all.filter(isCraftsmanApproved);
      setPendingCraftsmen(p); setApprovedCraftsmen(a); setError('');
      if (runAuto) await autoApprovePending(p);
    } catch { setError('Failed to load craftsmen data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCraftsmen(); fetchAdminProfile(); }, []);

  const fetchAllJobs = async () => {
    setJobsLoading(true);
    try { const { data } = await api.get('/job-requests/'); setJobs(data || []); }
    catch {} finally { setJobsLoading(false); }
  };
  useEffect(() => { if (['jobs','payments'].includes(activeSection)) fetchAllJobs(); }, [activeSection]);

  const jobsReady = jobs.filter(j => j.status === 'Completed');

  /* ─── Actions ──────────────────────── */
  const handleAction = async (type, id, model, craftsman = null, reason = null) => {
    if (model === 'craftsman' && type === 'approve' && craftsman) {
      const errs = checkCraftsmanApprovalCriteria(craftsman);
      if (errs.length) { alert('Cannot approve:\n• ' + errs.join('\n• ')); return; }
    }
    try { await api.post(`admin/${model}/${id}/${type}/`, reason ? { reason } : {}); await fetchCraftsmen(false); }
    catch { alert(`Action failed: ${type}`); }
  };

  const openRejectModal = (c) => { setRejectTarget({ id: c.id, model: 'craftsman' }); setRejectReason(''); setShowRejectModal(true); };
  const confirmReject   = async () => { if (!rejectReason.trim()) { alert('Please provide a reason.'); return; } await handleAction('reject', rejectTarget.id, rejectTarget.model, null, rejectReason); setShowRejectModal(false); };
  const toggleActive    = async (c) => { try { await api.patch(`admin/craftsman/${c.id}/toggle-active/`); fetchCraftsmen(false); } catch { alert('Failed.'); } };
  const openEditModal   = (c) => { setEditingCraftsman(c); setEditForm({ full_name: c.full_name||'', profession: c.profession||'', description: c.description||'', primary_service: c.primary_service||'' }); };
  const saveEdit        = async () => { if (!editingCraftsman) return; try { await api.patch(`admin/craftsman/${editingCraftsman.id}/`, editForm); setEditingCraftsman(null); fetchCraftsmen(false); } catch { alert('Save failed.'); } };
  const processPayment  = async (id) => { try { await api.post(`/job-requests/${id}/pay/`); fetchAllJobs(); } catch { alert('Payment failed.'); } };
  const handleLogout    = () => { if (window.confirm('Log out?')) { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); sessionStorage.clear(); navigate('/admin/login'); } };
  const colorText       = (t, c) => <span style={{ color: c }}>{t}</span>;
  const getImageUrlSafe = (p) => getFullImageUrl(p);

  const navTo = (sec, sub = null) => { setActiveSection(sec); if (sub) setCraftsmenSub(sub); if (isMob()) setMobileOpen(false); };

  /* ─── Page label ───────────────────── */
  const getTitle = () => {
    if (activeSection === 'dashboard') return { main: 'Dashboard', rest: 'Overview' };
    if (activeSection === 'craftsmen') {
      const m = { pending:'Pending', approved:'Active', inactive:'Inactive' };
      return { main: m[craftsmenSub], rest: 'Craftsmen' };
    }
    const map = { jobs:'Job', payments:'Payment', reports:'Reports', analytics:'Analytics', support:'Support', settings:'Settings' };
    return { main: map[activeSection] || activeSection, rest: activeSection === 'jobs' ? 'Management' : activeSection === 'payments' ? 'Management' : '' };
  };

  const { main: ptMain, rest: ptRest } = getTitle();

  /* ─── Stats ────────────────────────── */
  const stats = [
    { lbl: 'Pending Approvals', val: pendingCraftsmen.length,                         vc: 'g',  bg: 'rgba(255,215,0,.08)',   icon: <FaClipboardList color="#FFD700"/> },
    { lbl: 'Active Craftsmen',  val: approvedCraftsmen.filter(c=>c.is_active).length,  vc: 'gr', bg: 'rgba(34,197,94,.08)',   icon: <FaCheckCircle color="#22c55e"/>   },
    { lbl: 'Total Jobs',        val: jobs.length,                                     vc: '',   bg: 'rgba(255,255,255,.05)',  icon: <FaClipboardList color="#777"/>    },
    { lbl: 'Pending Payments',  val: jobsReady.length,                                vc: 'r',  bg: 'rgba(239,68,68,.08)',   icon: <FaDollarSign color="#ef4444"/>    },
  ];

  const sbClass = `sb${collapsed?' col':''}${isMob()?(mobileOpen?' ms':' mh'):''}`;
  const mnClass = `mn${collapsed?' col':''}`;

  return (
    <div className="adm">
      <style>{THEME}</style>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:299 }}/>}

      {/* ════ SIDEBAR ════ */}
      <aside className={sbClass}>
        <div className="sb-logo">
          <div className="sb-lb">K</div>
          <span className="sb-ln">Kaaka<span>Kazini</span></span>
        </div>

        <nav className="sb-nav">
          <button className={`sb-btn${activeSection==='dashboard'?' on':''}`} onClick={() => navTo('dashboard')}>
            <FaHome className="ni"/><span className="nl">Dashboard</span>
          </button>

          <div className="sb-sec">Craftsmen</div>
          {[
            { key:'pending',  lbl:'Pending',  Icon:FaClipboardList, badge:pendingCraftsmen.length },
            { key:'approved', lbl:'Active',   Icon:FaCheckCircle },
            { key:'inactive', lbl:'Inactive', Icon:FaToggleOff },
          ].map(({ key, lbl, Icon, badge }) => (
            <button key={key}
              className={`sb-btn${activeSection==='craftsmen'&&craftsmenSub===key?' on':''}`}
              onClick={() => navTo('craftsmen', key)}
              style={{ paddingLeft: '.9rem' }}
            >
              <Icon className="ni"/><span className="nl">{lbl}</span>
              {badge > 0 && <span className="sb-bdg">{badge}</span>}
            </button>
          ))}

          <div className="sb-sec">Management</div>
          {[
            { sec:'jobs',      lbl:'Jobs',      Icon:FaClipboardList },
            { sec:'payments',  lbl:'Payments',  Icon:FaDollarSign,  badge:jobsReady.length },
            { sec:'reports',   lbl:'Reports',   Icon:FaFileAlt },
            { sec:'analytics', lbl:'Analytics', Icon:FaChartLine },
          ].map(({ sec, lbl, Icon, badge }) => (
            <button key={sec}
              className={`sb-btn${activeSection===sec?' on':''}`}
              onClick={() => navTo(sec)}
            >
              <Icon className="ni"/><span className="nl">{lbl}</span>
              {badge > 0 && <span className="sb-bdg">{badge}</span>}
            </button>
          ))}

          <div className="sb-sec">System</div>
          {[
            { sec:'support',  lbl:'Support',  Icon:FaLifeRing },
            { sec:'settings', lbl:'Settings', Icon:FaCog },
          ].map(({ sec, lbl, Icon }) => (
            <button key={sec}
              className={`sb-btn${activeSection===sec?' on':''}`}
              onClick={() => navTo(sec)}
            >
              <Icon className="ni"/><span className="nl">{lbl}</span>
            </button>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-av">{adminName.charAt(0).toUpperCase()}</div>
          <div className="sb-ui">
            <div className="sb-un">{adminName}</div>
            <div className="sb-ur">Administrator</div>
          </div>
          <button className="sb-out" onClick={handleLogout} title="Log out"><FaSignOutAlt/></button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className={mnClass}>

        {/* TOPBAR */}
        <header className="tb">
          <button className="tb-ib" onClick={() => isMob() ? setMobileOpen(o => !o) : setCollapsed(c => !c)}>
            {mobileOpen ? <FaTimes size={13}/> : <FaBars size={13}/>}
          </button>

          <div className="tb-ttl">
            <span>{ptMain} </span>{ptRest}
          </div>

          <div className="tb-acts">
            <div className="tb-ib" style={{ cursor:'default' }}>
              <FaBell size={14}/>
              {jobsReady.length > 0 && <span className="tb-ndot"/>}
            </div>

            <div className="position-relative">
              <div className="tb-chip" onClick={() => setShowDrop(d => !d)}>
                <div className="tb-ca">{adminName.charAt(0).toUpperCase()}</div>
                <span className="tb-cn d-none d-sm-block">{adminName}</span>
                <FaChevronDown size={9} style={{ color:'#555', marginLeft: 2 }}/>
              </div>
              {showDrop && (
                <>
                  <div style={{ position:'fixed',inset:0,zIndex:9997 }} onClick={() => setShowDrop(false)}/>
                  <div className="ddmenu">
                    <div className="ddh">
                      <div className="n">{adminName}</div>
                      <div className="e">{adminEmail}</div>
                    </div>
                    <button className="ddi" onClick={() => { setShowDrop(false); navTo('settings'); }}><FaCog size={13}/> Settings</button>
                    <button className="ddi" onClick={() => setShowDrop(false)}><FaQuestionCircle size={13}/> Help</button>
                    <hr className="ddiv"/>
                    <button className="ddi dng" onClick={handleLogout}><FaSignOutAlt size={13}/> Log out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="ct">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color:'#FFD700', width:'3rem', height:'3rem' }} role="status"/>
              <p className="mt-3" style={{ color:'#444' }}>Loading data…</p>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <>
              {/* ── DASHBOARD ── */}
              {activeSection === 'dashboard' && (
                <>
                  <div className="phdr">
                    <h1 className="ptitle"><span>Dashboard</span> Overview</h1>
                    <p className="psub">Welcome back, {adminName}. Here's your command centre.</p>
                  </div>

                  <div className="sgrid">
                    {stats.map((s, i) => (
                      <div key={i} className="scard">
                        <div>
                          <div className="slbl">{s.lbl}</div>
                          <div className={`sval ${s.vc}`}>{s.val}</div>
                        </div>
                        <div className="sib" style={{ background: s.bg }}>{s.icon}</div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-lg-8">
                      <div className="glass">
                        <div className="glass-h"><span className="glass-t">Recent Activity</span></div>
                        <div className="glass-b" style={{ color:'#444', fontSize:'.86rem' }}>Activity feed coming soon…</div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-4">
                      <div className="glass">
                        <div className="glass-h"><span className="glass-t">Quick Actions</span></div>
                        <div className="glass-b" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          {[
                            { lbl:`Review Pending (${pendingCraftsmen.length})`, fn:()=>navTo('craftsmen','pending'), ic:<FaClipboardList/> },
                            { lbl:`Payments (${jobsReady.length})`,              fn:()=>navTo('payments'),            ic:<FaDollarSign/> },
                            { lbl:'Manage Jobs',                                  fn:()=>navTo('jobs'),                ic:<FaHardHat/> },
                          ].map(({ lbl, fn, ic }) => (
                            <button key={lbl} className="qbtn" onClick={fn}>
                              <span style={{ color:'#FFD700' }}>{ic}</span> {lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── CRAFTSMEN ── */}
              {activeSection === 'craftsmen' && (
                <>
                  <div className="phdr">
                    <h1 className="ptitle"><span>{ptMain}</span> {ptRest}</h1>
                    <p className="psub">Review and manage craftsmen profiles</p>
                  </div>

                  {craftsmenSub === 'pending' && (
                    <div className="infobanner">
                      <span>ℹ</span>
                      <div>
                        <strong>Auto-approve is active.</strong> Craftsmen with all required fields (profile photo, profession, description, a service, and at least one work photo) are approved automatically on page load.
                        Hover a disabled Approve button to see exactly what is missing.
                      </div>
                    </div>
                  )}

                  <CraftsmenTable
                    list={craftsmenSub==='pending' ? pendingCraftsmen : craftsmenSub==='approved' ? approvedCraftsmen : approvedCraftsmen.filter(c=>!c.is_active)}
                    filterValue={craftsmenSub==='pending' ? pendingFilter : approvedFilter}
                    setFilterValue={craftsmenSub==='pending' ? setPendingFilter : setApprovedFilter}
                    isPending={craftsmenSub==='pending'}
                    getImageUrl={getImageUrlSafe}
                    colorText={colorText}
                    checkCraftsmanApprovalCriteria={checkCraftsmanApprovalCriteria}
                    isCraftsmanApproved={isCraftsmanApproved}
                    handleAction={handleAction}
                    openRejectModal={openRejectModal}
                    toggleActiveStatus={toggleActive}
                    openEditModal={openEditModal}
                  />
                </>
              )}

              {/* ── JOBS ── */}
              {activeSection === 'jobs' && (
                <>
                  <div className="phdr">
                    <h1 className="ptitle"><span>Job</span> Management</h1>
                    <p className="psub">View and assign all service requests to craftsmen</p>
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
              {activeSection === 'payments' && (
                <>
                  <div className="phdr">
                    <h1 className="ptitle"><span>Payment</span> Management</h1>
                    <p className="psub">Process MPesa payouts for completed jobs</p>
                  </div>
                  <PaymentDashboard jobsReadyForPayment={jobsReady} processPayment={processPayment}/>
                </>
              )}

              {/* ── PLACEHOLDER ── */}
              {['reports','analytics','support','settings','help'].includes(activeSection) && (
                <div className="glass" style={{ textAlign:'center', padding:'4rem 2rem' }}>
                  <div style={{ fontSize:'2rem', marginBottom:12, opacity:.2 }}>◎</div>
                  <h4 style={{ fontFamily:'Playfair Display,serif', fontWeight:800, marginBottom:8, textTransform:'capitalize' }}>{activeSection}</h4>
                  <p style={{ color:'#444', fontSize:'.88rem' }}>This section is under development</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ════ EDIT MODAL ════ */}
      {editingCraftsman && (
        <>
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:1000 }} onClick={() => setEditingCraftsman(null)}/>
          <div style={{
            position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            width:'min(500px,95vw)', background:'#141414',
            border:'1px solid rgba(255,255,255,.1)', borderRadius:16,
            zIndex:1001, overflow:'hidden',
            boxShadow:'0 24px 64px rgba(0,0,0,.7)',
          }}>
            {/* Header */}
            <div style={{ padding:'1.1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,.08)', background:'linear-gradient(90deg,rgba(255,215,0,.06),rgba(34,197,94,.04))', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'.95rem', display:'flex', alignItems:'center', gap:8 }}>
                <FaEdit style={{ color:'#FFD700' }}/> Edit Craftsman
              </span>
              <button style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:'1rem' }} onClick={() => setEditingCraftsman(null)}>✕</button>
            </div>
            {/* Body */}
            <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['Full Name',      'full_name',       'input'],
                ['Profession',     'profession',      'input'],
                ['Description',    'description',     'textarea'],
                ['Primary Service','primary_service', 'input'],
              ].map(([lbl, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize:'.72rem', fontWeight:700, color:'#777', letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:5 }}>{lbl}</label>
                  {type === 'textarea'
                    ? <textarea rows={3} value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="minp" style={{ resize:'vertical' }}/>
                    : <input value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="minp"/>
                  }
                </div>
              ))}
            </div>
            {/* Footer */}
            <div style={{ padding:'.875rem 1.5rem', borderTop:'1px solid rgba(255,255,255,.06)', display:'flex', justifyContent:'flex-end', gap:10, background:'rgba(255,255,255,.02)' }}>
              <button onClick={() => setEditingCraftsman(null)} style={{ padding:'.6rem 1.1rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, color:'#aaa', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.84rem' }}>Cancel</button>
              <button onClick={saveEdit} className="btn-gld"><FaCheckCircle size={12}/> Save Changes</button>
            </div>
          </div>
        </>
      )}

      {/* ════ REJECT MODAL ════ */}
      <RejectModal
        show={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmReject={confirmReject}
        closeModal={() => setShowRejectModal(false)}
      />
    </div>
  );
}
