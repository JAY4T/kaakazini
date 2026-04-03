import React, { useState, useEffect } from 'react';
import {
  FaUserCog, FaToggleOn, FaToggleOff, FaPlus, FaTrash,
  FaCog, FaMapMarkerAlt, FaDollarSign, FaBell, FaShieldAlt,
  FaCheck, FaSpinner, FaLock,
} from 'react-icons/fa';
import api from '../../api/axiosClient';

/* ── Styles ── */
const CARD  = { background:'#16161a', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' };
const TITLE = { fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'.95rem', color:'#ECECEC', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 };
const INP   = { width:'100%', background:'#111114', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:9, padding:'.65rem 1rem', color:'#ECECEC', fontFamily:'DM Sans,sans-serif', fontSize:'.88rem', outline:'none', transition:'border-color .2s' };
const LABEL = { fontSize:'.68rem', color:'#555560', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:5 };
const SEL   = { width:'100%', background:'#111114', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:9, padding:'.65rem 1rem', color:'#ECECEC', fontFamily:'DM Sans,sans-serif', fontSize:'.88rem', outline:'none' };

const ROLES       = ['moderator','maintenance','support','finance','analytics'];
const ROLE_LABELS = { superadmin:'Super Admin', moderator:'Moderator', maintenance:'Maintenance', support:'Support', finance:'Finance', analytics:'Analytics' };
const ROLE_COLORS = { superadmin:'#FFD700', moderator:'#8b5cf6', maintenance:'#3b82f6', support:'#22c55e', finance:'#f59e0b', analytics:'#f43f5e' };

const SERVICES_LIST  = ['Plumbing','Electrical','Carpentry','Painting','Masonry','Tiling','Roofing','Tailoring','Metalwork','Auto Repair','AC Repair','Landscaping','Borehole Drilling'];
const LOCATIONS_LIST = ['Nairobi','Mombasa','Kisumu','Eldoret','Nakuru','Thika','Kisii','Nyeri','Meru','Machakos'];

function Toggle({ on, onChange, color = '#22c55e' }) {
  return (
    <button onClick={() => onChange(!on)}
      style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.4rem', color: on ? color : '#333', transition:'color .2s', padding:0, lineHeight:1 }}>
      {on ? <FaToggleOn/> : <FaToggleOff/>}
    </button>
  );
}

function SaveBtn({ onClick, loading, label = 'Save', color = '#FFD700' }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{
        background: color === '#FFD700'
          ? 'linear-gradient(135deg,#FFD700,#F59E0B)'
          : `linear-gradient(135deg,${color},${color}cc)`,
        color: color === '#FFD700' ? '#000' : '#fff',
        border:'none', borderRadius:9, padding:'.65rem 1.375rem',
        fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:'.84rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', gap:6,
        opacity: loading ? .7 : 1,
      }}>
      {loading ? <FaSpinner style={{ animation:'spin .7s linear infinite' }}/> : <FaCheck size={11}/>} {label}
    </button>
  );
}

export default function SettingsPage({ adminRole = 'superadmin' }) {
  const isSuperAdmin = adminRole === 'superadmin';
  const [activeTab,  setActiveTab]  = useState('staff');
  const [saved,      setSaved]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [staffError, setStaffError] = useState('');

  // ── Staff state ──
  const [staff,        setStaff]        = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaff,     setNewStaff]     = useState({ name:'', email:'', role:'moderator', password:'' });

  // ── Change password state ──
  const [pwForm,    setPwForm]    = useState({ old_password:'', new_password:'', confirm:'' });
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);

  // ── Services & Locations ──
  const [enabledServices,  setEnabledServices]  = useState(Object.fromEntries(SERVICES_LIST.map(s => [s, true])));
  const [enabledLocations, setEnabledLocations] = useState(Object.fromEntries(LOCATIONS_LIST.map(l => [l, true])));

  // ── Payment ──
  const [commission, setCommission] = useState('10');
  const [minBudget,  setMinBudget]  = useState('500');
  const [maxBudget,  setMaxBudget]  = useState('500000');
  const [shortcode,  setShortcode]  = useState('');

  // ── Notifications ──
  const [notifs, setNotifs] = useState({ newJob:true, newApply:true, jobPaid:true, dispute:true, smsEnabled:false });

  const saveMsg = (key) => { setSaved(key); setTimeout(() => setSaved(''), 2500); };

  // ── Load staff ──
  const loadStaff = async () => {
    if (!isSuperAdmin) return;
    setStaffLoading(true);
    try {
      const { data } = await api.get('admin/staff/');
      setStaff(data);
    } catch { /* silent */ }
    finally { setStaffLoading(false); }
  };

  useEffect(() => { if (activeTab === 'staff') loadStaff(); }, [activeTab]);

  // ── Load settings ──
  useEffect(() => {
    api.get('admin/settings/').then(({ data }) => {
      if (data.commission_pct)   setCommission(String(data.commission_pct));
      if (data.min_budget)       setMinBudget(String(data.min_budget));
      if (data.max_budget)       setMaxBudget(String(data.max_budget));
      if (data.mpesa_shortcode)  setShortcode(data.mpesa_shortcode);
      if (data.notifications)    setNotifs(n => ({ ...n, ...data.notifications }));
      if (data.enabled_services) {
        setEnabledServices(Object.fromEntries(SERVICES_LIST.map(s => [s, data.enabled_services.includes(s)])));
      }
      if (data.enabled_locations) {
        setEnabledLocations(Object.fromEntries(LOCATIONS_LIST.map(l => [l, data.enabled_locations.includes(l)])));
      }
    }).catch(() => {});
  }, []);

  // ── Add staff ──
  const addStaff = async () => {
    setStaffError('');
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      setStaffError('Please fill in all fields.'); return;
    }
    if (newStaff.password.length < 8) {
      setStaffError('Password must be at least 8 characters.'); return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('admin/staff/', newStaff);
      setStaff(prev => [...prev, data]);
      setNewStaff({ name:'', email:'', role:'moderator', password:'' });
      saveMsg('staff');
    } catch (err) {
      setStaffError(err.response?.data?.error || 'Failed to create staff user.');
    } finally { setSaving(false); }
  };

  // ── Toggle staff active ──
  const toggleStaff = async (id) => {
    try {
      const { data } = await api.patch(`admin/staff/${id}/toggle/`);
      setStaff(prev => prev.map(s => s.id === id ? { ...s, active: data.active } : s));
    } catch { alert('Failed to update staff status.'); }
  };

  // ── Remove staff ──
  const removeStaff = async (id) => {
    if (!window.confirm('Remove this staff member? This cannot be undone.')) return;
    try {
      await api.delete(`admin/staff/${id}/`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch { alert('Failed to remove staff member.'); }
  };

  // ── Save settings ──
  const saveSettings = async (key, payload) => {
    setSaving(true);
    try {
      await api.post('admin/settings/', payload);
      saveMsg(key);
    } catch { alert('Failed to save settings. Please try again.'); }
    finally { setSaving(false); }
  };

  // ── Change password ──
  const changePassword = async () => {
    setPwError('');
    setPwSuccess('');

    if (!pwForm.old_password || !pwForm.new_password || !pwForm.confirm) {
      setPwError('Please fill in all fields.'); return;
    }
    if (pwForm.new_password.length < 8) {
      setPwError('New password must be at least 8 characters.'); return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('New passwords do not match.'); return;
    }
    if (pwForm.old_password === pwForm.new_password) {
      setPwError('New password must be different from your current password.'); return;
    }

    setPwSaving(true);
    try {
      await api.post('admin/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess('Password changed successfully. Use your new password next time you log in.');
      setPwForm({ old_password:'', new_password:'', confirm:'' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password. Please try again.');
    } finally { setPwSaving(false); }
  };

  // ── Tabs ──
  const TABS = [
    { id:'staff',    lbl:'User Management', icon:<FaUserCog/>,      show:isSuperAdmin },
    { id:'services', lbl:'Services',        icon:<FaCog/>,          show:isSuperAdmin },
    { id:'locations',lbl:'Locations',       icon:<FaMapMarkerAlt/>, show:isSuperAdmin },
    { id:'payment',  lbl:'Payment',         icon:<FaDollarSign/>,   show:isSuperAdmin },
    { id:'notifs',   lbl:'Notifications',   icon:<FaBell/>,         show:true },
    { id:'approval', lbl:'Approval Rules',  icon:<FaShieldAlt/>,    show:true },
    { id:'password', lbl:'Change Password', icon:<FaLock/>,         show:true },
  ].filter(t => t.show);

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display:'flex', alignItems:'center', gap:7, padding:'.55rem 1.1rem',
            borderRadius:9, border:'1px solid',
            fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.83rem',
            cursor:'pointer', transition:'all .15s',
            background:  activeTab === t.id ? 'linear-gradient(135deg,#FFD700,#F59E0B)' : 'rgba(255,255,255,.04)',
            color:       activeTab === t.id ? '#000' : '#9A9AA5',
            borderColor: activeTab === t.id ? 'transparent' : 'rgba(255,255,255,.07)',
          }}>
            {t.icon} {t.lbl}
          </button>
        ))}
      </div>

      {/* ── STAFF ── */}
      {activeTab === 'staff' && (
        <div>
          <div style={CARD}>
            <div style={TITLE}><FaPlus style={{ color:'#22c55e' }}/> Add Staff Member</div>
            {staffError && (
              <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:9, padding:'.75rem 1rem', color:'#fca5a5', fontSize:'.83rem', marginBottom:12 }}>
                {staffError}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:12 }}>
              <div><label style={LABEL}>Full Name</label><input style={INP} value={newStaff.name} onChange={e => setNewStaff({...newStaff,name:e.target.value})} placeholder="e.g. Jane Wangari"/></div>
              <div><label style={LABEL}>Email</label><input style={INP} type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff,email:e.target.value})} placeholder="jane@kaakazini.co.ke"/></div>
              <div>
                <label style={LABEL}>Role</label>
                <select style={SEL} value={newStaff.role} onChange={e => setNewStaff({...newStaff,role:e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div><label style={LABEL}>Temporary Password</label><input style={INP} type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff,password:e.target.value})} placeholder="Min. 8 characters"/></div>
            </div>
            <SaveBtn onClick={addStaff} loading={saving} label="Create Staff User" color="#22c55e"/>
            {saved === 'staff' && (
              <div style={{ marginTop:10, fontSize:'.8rem', color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}>
                <FaCheck size={11}/> Staff member created! They will receive an email with their login details.
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={TITLE}><FaUserCog style={{ color:'#FFD700' }}/> Current Staff ({staff.length})</div>
            {staffLoading ? (
              <p style={{ color:'#555560', fontSize:'.84rem' }}>Loading staff…</p>
            ) : staff.length === 0 ? (
              <p style={{ color:'#555560', fontSize:'.84rem' }}>No staff members yet. Add one above.</p>
            ) : staff.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'.875rem 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:`${ROLE_COLORS[s.role]||'#555'}18`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:800, color:ROLE_COLORS[s.role]||'#ECECEC', flexShrink:0, fontSize:'1rem' }}>
                  {(s.name||'?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'#ECECEC', fontSize:'.88rem' }}>{s.name}</div>
                  <div style={{ fontSize:'.73rem', color:'#555560' }}>{s.email}</div>
                </div>
                <span style={{ fontSize:'.66rem', fontWeight:700, color:ROLE_COLORS[s.role]||'#888', background:`${ROLE_COLORS[s.role]||'#888'}18`, borderRadius:20, padding:'3px 9px', flexShrink:0 }}>
                  {ROLE_LABELS[s.role]||s.role}
                </span>
                <Toggle on={s.active !== false} onChange={() => toggleStaff(s.id)} color="#22c55e"/>
                <button onClick={() => removeStaff(s.id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:7, padding:'5px 9px', cursor:'pointer', fontSize:'.78rem' }}>
                  <FaTrash/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVICES ── */}
      {activeTab === 'services' && (
        <div style={CARD}>
          <div style={TITLE}><FaCog style={{ color:'#FFD700' }}/> Enable / Disable Services</div>
          <p style={{ fontSize:'.82rem', color:'#555560', marginBottom:'1rem' }}>Toggle which service categories are available on the platform.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:'1.25rem' }}>
            {SERVICES_LIST.map(svc => (
              <div key={svc} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 1rem', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10 }}>
                <span style={{ fontSize:'.85rem', color: enabledServices[svc] ? '#ECECEC' : '#555560', fontWeight:500 }}>{svc}</span>
                <Toggle on={enabledServices[svc]} onChange={v => setEnabledServices(p => ({...p,[svc]:v}))}/>
              </div>
            ))}
          </div>
          <SaveBtn onClick={() => saveSettings('services', { enabled_services: SERVICES_LIST.filter(s => enabledServices[s]) })} loading={saving} label="Save Services"/>
          {saved === 'services' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}><FaCheck size={11}/> Services saved!</div>}
        </div>
      )}

      {/* ── LOCATIONS ── */}
      {activeTab === 'locations' && (
        <div style={CARD}>
          <div style={TITLE}><FaMapMarkerAlt style={{ color:'#22c55e' }}/> Service Areas</div>
          <p style={{ fontSize:'.82rem', color:'#555560', marginBottom:'1rem' }}>Control which counties are active on the platform.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginBottom:'1.25rem' }}>
            {LOCATIONS_LIST.map(loc => (
              <div key={loc} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 1rem', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10 }}>
                <span style={{ fontSize:'.85rem', color: enabledLocations[loc] ? '#ECECEC' : '#555560', fontWeight:500 }}>{loc}</span>
                <Toggle on={enabledLocations[loc]} onChange={v => setEnabledLocations(p => ({...p,[loc]:v}))} color="#22c55e"/>
              </div>
            ))}
          </div>
          <SaveBtn onClick={() => saveSettings('locations', { enabled_locations: LOCATIONS_LIST.filter(l => enabledLocations[l]) })} loading={saving} label="Save Locations" color="#22c55e"/>
          {saved === 'locations' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}><FaCheck size={11}/> Locations saved!</div>}
        </div>
      )}

      {/* ── PAYMENT ── */}
      {activeTab === 'payment' && (
        <div style={CARD}>
          <div style={TITLE}><FaDollarSign style={{ color:'#22c55e' }}/> Payment & Commission Settings</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:'1.25rem' }}>
            <div><label style={LABEL}>Platform Commission (%)</label><input style={INP} type="number" min="0" max="50" value={commission} onChange={e => setCommission(e.target.value)}/></div>
            <div><label style={LABEL}>Minimum Budget (KSh)</label><input style={INP} type="number" value={minBudget} onChange={e => setMinBudget(e.target.value)}/></div>
            <div><label style={LABEL}>Maximum Budget (KSh)</label><input style={INP} type="number" value={maxBudget} onChange={e => setMaxBudget(e.target.value)}/></div>
            <div><label style={LABEL}>M-Pesa Business Shortcode</label><input style={INP} value={shortcode} onChange={e => setShortcode(e.target.value)} placeholder="e.g. 174379"/></div>
          </div>
          <div style={{ background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.12)', borderRadius:10, padding:'1rem', marginBottom:'1.25rem' }}>
            <div style={{ fontSize:'.78rem', color:'#4ade80', fontWeight:600, marginBottom:6 }}>💡 Current Split Preview</div>
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
              <span style={{ fontSize:'.83rem', color:'#bbb' }}>Platform: <strong style={{ color:'#FFD700' }}>{commission}%</strong></span>
              <span style={{ fontSize:'.83rem', color:'#bbb' }}>Craftsman: <strong style={{ color:'#22c55e' }}>{100 - Number(commission)}%</strong></span>
              <span style={{ fontSize:'.83rem', color:'#bbb' }}>Min Job: <strong style={{ color:'#ECECEC' }}>KSh {Number(minBudget).toLocaleString()}</strong></span>
            </div>
          </div>
          <SaveBtn onClick={() => saveSettings('payment', { commission_pct: Number(commission), min_budget: Number(minBudget), max_budget: Number(maxBudget), mpesa_shortcode: shortcode })} loading={saving} label="Save Payment Settings"/>
          {saved === 'payment' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}><FaCheck size={11}/> Saved!</div>}
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === 'notifs' && (
        <div style={CARD}>
          <div style={TITLE}><FaBell style={{ color:'#FFD700' }}/> Notification Triggers</div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {[
              { key:'newJob',     lbl:'New job request submitted',  sub:'Alert admin when a client submits a job' },
              { key:'newApply',   lbl:'New craftsman application',   sub:'Notify when a craftsman applies for approval' },
              { key:'jobPaid',    lbl:'Job payment confirmed',       sub:'Notify when M-Pesa payment succeeds' },
              { key:'dispute',    lbl:'Dispute or complaint filed',  sub:'Alert support team on new dispute' },
              { key:'smsEnabled', lbl:'Enable SMS notifications',    sub:'Send SMS alerts in addition to email' },
            ].map(n => (
              <div key={n.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.875rem 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ fontSize:'.87rem', fontWeight:600, color:'#ECECEC' }}>{n.lbl}</div>
                  <div style={{ fontSize:'.74rem', color:'#555560', marginTop:2 }}>{n.sub}</div>
                </div>
                <Toggle on={notifs[n.key]} onChange={v => setNotifs(p => ({...p,[n.key]:v}))} color="#22c55e"/>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'1rem' }}>
            <SaveBtn onClick={() => saveSettings('notifs', { notifications: notifs })} loading={saving} label="Save Notifications"/>
          </div>
          {saved === 'notifs' && <div style={{ marginTop:8, fontSize:'.8rem', color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}><FaCheck size={11}/> Saved!</div>}
        </div>
      )}

      {/* ── APPROVAL RULES ── */}
      {activeTab === 'approval' && (
        <div style={CARD}>
          <div style={TITLE}><FaShieldAlt style={{ color:'#8b5cf6' }}/> Craftsman Approval Requirements</div>
          <p style={{ fontSize:'.83rem', color:'#555560', marginBottom:'1.25rem' }}>Criteria a craftsman must meet before approval on the platform.</p>
          {[
            { lbl:'Profile photo required',  sub:'Must upload a clear, recognisable profile photo' },
            { lbl:'Profession must be set',   sub:'Must select a primary profession (e.g. Plumber)' },
            { lbl:'Description required',     sub:'Must write a description of their services (min 30 chars)' },
            { lbl:'At least one service',     sub:'Must define at least one service with a rate' },
            { lbl:'At least one work photo',  sub:'Must upload at least one portfolio / work image' },
            { lbl:'Phone number verified',    sub:'Phone must be valid and Safaricom-compatible' },
          ].map((r, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'.875rem 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(139,92,246,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                <FaCheck style={{ color:'#8b5cf6', fontSize:'.7rem' }}/>
              </div>
              <div>
                <div style={{ fontSize:'.87rem', fontWeight:700, color:'#ECECEC' }}>{r.lbl}</div>
                <div style={{ fontSize:'.77rem', color:'#555560', marginTop:2 }}>{r.sub}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:'1rem', padding:'1rem', background:'rgba(139,92,246,.06)', border:'1px solid rgba(139,92,246,.12)', borderRadius:10 }}>
            <div style={{ fontSize:'.8rem', color:'#a78bfa', fontWeight:600 }}>
              ℹ️ Auto-approve is active — craftsmen meeting all criteria above are approved automatically on page load.
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD ── */}
      {activeTab === 'password' && (
        <div style={CARD}>
          <div style={TITLE}><FaLock style={{ color:'#FFD700' }}/> Change Password</div>
          <p style={{ fontSize:'.82rem', color:'#555560', marginBottom:'1.25rem' }}>
            Update your password. You will use the new password the next time you log in.
          </p>

          {/* Error banner */}
          {pwError && (
            <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:9, padding:'.75rem 1rem', color:'#fca5a5', fontSize:'.83rem', marginBottom:14 }}>
              {pwError}
            </div>
          )}

          {/* Success banner */}
          {pwSuccess && (
            <div style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:9, padding:'.75rem 1rem', color:'#86efac', fontSize:'.83rem', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <FaCheck size={12}/> {pwSuccess}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:420 }}>
            <div>
              <label style={LABEL}>Current Password</label>
              <input
                style={INP}
                type="password"
                value={pwForm.old_password}
                onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))}
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label style={LABEL}>New Password</label>
              <input
                style={INP}
                type="password"
                value={pwForm.new_password}
                onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label style={LABEL}>Confirm New Password</label>
              <input
                style={INP}
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat your new password"
              />
            </div>

            {/* Strength hint */}
            {pwForm.new_password.length > 0 && (
              <div style={{ fontSize:'.75rem', color: pwForm.new_password.length >= 8 ? '#22c55e' : '#f59e0b' }}>
                {pwForm.new_password.length >= 8 ? '✓ Password length is good' : `⚠ ${8 - pwForm.new_password.length} more characters needed`}
              </div>
            )}

            <div style={{ marginTop:4 }}>
              <SaveBtn
                onClick={changePassword}
                loading={pwSaving}
                label="Update Password"
                color="#FFD700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}