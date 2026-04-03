import React, { useState } from 'react';
import { FaHeadset, FaExclamationTriangle, FaCheckCircle, FaClock, FaUser, FaHardHat, FaComment } from 'react-icons/fa';

const CARD = { background:'#141414', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' };

const MOCK_TICKETS = [
  { id:1, type:'Dispute', subject:'Craftsman did not complete the job', client:'John Kamau', craftsman:'Peter Ochieng', status:'Open', priority:'High', created:'2025-03-28', desc:'Client says plumbing work was left unfinished. Craftsman says job was complete.' },
  { id:2, type:'Complaint', subject:'Overcharged for electrical work', client:'Mary Wanjiku', craftsman:'James Kariuki', status:'In Review', priority:'Medium', created:'2025-03-27', desc:'Client was quoted KSh 3,000 but charged KSh 8,000.' },
  { id:3, type:'Help', subject:'Cannot access my account', client:'Ali Hassan', craftsman:null, status:'Resolved', priority:'Low', created:'2025-03-26', desc:'Client forgot password and is locked out.' },
  { id:4, type:'Dispute', subject:'Work quality is very poor', client:'Grace Mutua', craftsman:'Samuel Njoroge', status:'Open', priority:'High', created:'2025-03-25', desc:'Tiling work has visible cracks and gaps.' },
  { id:5, type:'Payment', subject:'Payment deducted but not confirmed', client:'David Otieno', craftsman:'Lucy Akinyi', status:'In Review', priority:'High', created:'2025-03-24', desc:'M-Pesa deducted but craftsman says no payment received.' },
];

const PRIORITY_COLOR = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' };
const STATUS_COLOR   = { Open:'#ef4444', 'In Review':'#f59e0b', Resolved:'#22c55e' };
const TYPE_COLOR     = { Dispute:'#ef4444', Complaint:'#f59e0b', Help:'#3b82f6', Payment:'#8b5cf6' };

export default function SupportPage() {
  const [tickets, setTickets]   = useState(MOCK_TICKETS);
  const [selected, setSelected] = useState(null);
  const [note, setNote]         = useState('');
  const [filter, setFilter]     = useState('All');

  const resolve = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status:'Resolved' } : t));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status:'Resolved' }));
  };

  const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  const counts = {
    Open:      tickets.filter(t => t.status === 'Open').length,
    'In Review': tickets.filter(t => t.status === 'In Review').length,
    Resolved:  tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { lbl:'Open',      val:counts.Open,          c:'#ef4444', ic:<FaExclamationTriangle/> },
          { lbl:'In Review', val:counts['In Review'],  c:'#f59e0b', ic:<FaClock/> },
          { lbl:'Resolved',  val:counts.Resolved,      c:'#22c55e', ic:<FaCheckCircle/> },
          { lbl:'Total',     val:tickets.length,        c:'#FFD700', ic:<FaHeadset/> },
        ].map((s,i) => (
          <div key={i} style={CARD}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'.7rem', color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>{s.lbl}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.6rem', fontWeight:800, color:s.c }}>{s.val}</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:10, background:`${s.c}18`, display:'flex', alignItems:'center', justifyContent:'center', color:s.c, fontSize:'.85rem' }}>{s.ic}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Ticket list */}
        <div className="col-12 col-lg-5">
          <div style={CARD}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'.95rem', color:'#f0f0f0' }}>Tickets</div>
              <select value={filter} onChange={e => setFilter(e.target.value)}
                style={{ background:'#1a1a1a', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:8, padding:'4px 10px', color:'#f0f0f0', fontSize:'.78rem', outline:'none', cursor:'pointer' }}>
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(t => (
                <div key={t.id} onClick={() => setSelected(t)}
                  style={{ padding:'.875rem', borderRadius:10, border:`1px solid ${selected?.id===t.id ? '#FFD700' : 'rgba(255,255,255,.07)'}`, cursor:'pointer', background: selected?.id===t.id ? 'rgba(255,215,0,.04)' : 'rgba(255,255,255,.01)', transition:'all .15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:'.72rem', fontWeight:700, color:TYPE_COLOR[t.type]||'#888', background:`${TYPE_COLOR[t.type]||'#888'}18`, borderRadius:20, padding:'2px 8px' }}>{t.type}</span>
                    <span style={{ fontSize:'.7rem', fontWeight:700, color:STATUS_COLOR[t.status]||'#888' }}>{t.status}</span>
                  </div>
                  <div style={{ fontSize:'.85rem', fontWeight:600, color:'#f0f0f0', marginBottom:3, lineHeight:1.3 }}>{t.subject}</div>
                  <div style={{ fontSize:'.75rem', color:'#555' }}>
                    <FaUser size={9} style={{ marginRight:4 }}/>{t.client}
                    {t.craftsman && <> · <FaHardHat size={9} style={{ marginRight:4 }}/>{t.craftsman}</>}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color:'#444', fontSize:'.84rem', textAlign:'center', padding:'1rem' }}>No tickets to show.</p>}
            </div>
          </div>
        </div>

        {/* Ticket detail */}
        <div className="col-12 col-lg-7">
          {selected ? (
            <div style={CARD}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
                <div>
                  <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:'.72rem', fontWeight:700, color:TYPE_COLOR[selected.type], background:`${TYPE_COLOR[selected.type]}18`, borderRadius:20, padding:'2px 8px' }}>{selected.type}</span>
                    <span style={{ fontSize:'.72rem', fontWeight:700, color:PRIORITY_COLOR[selected.priority], background:`${PRIORITY_COLOR[selected.priority]}18`, borderRadius:20, padding:'2px 8px' }}>{selected.priority} Priority</span>
                  </div>
                  <div style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.05rem', color:'#f0f0f0' }}>#{selected.id} · {selected.subject}</div>
                  <div style={{ fontSize:'.75rem', color:'#555', marginTop:4 }}>Opened {selected.created}</div>
                </div>
                <span style={{ fontSize:'.78rem', fontWeight:700, color:STATUS_COLOR[selected.status], background:`${STATUS_COLOR[selected.status]}18`, borderRadius:20, padding:'4px 12px' }}>{selected.status}</span>
              </div>

              {/* Parties */}
              <div style={{ display:'flex', gap:10, marginBottom:'1.25rem', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:140, background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.15)', borderRadius:10, padding:'.75rem' }}>
                  <div style={{ fontSize:'.68rem', color:'#3b82f6', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Client</div>
                  <div style={{ fontSize:'.88rem', fontWeight:700, color:'#f0f0f0', display:'flex', alignItems:'center', gap:6 }}><FaUser size={12} style={{ color:'#3b82f6' }}/> {selected.client}</div>
                </div>
                {selected.craftsman && (
                  <div style={{ flex:1, minWidth:140, background:'rgba(255,215,0,.06)', border:'1px solid rgba(255,215,0,.15)', borderRadius:10, padding:'.75rem' }}>
                    <div style={{ fontSize:'.68rem', color:'#FFD700', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Craftsman</div>
                    <div style={{ fontSize:'.88rem', fontWeight:700, color:'#f0f0f0', display:'flex', alignItems:'center', gap:6 }}><FaHardHat size={12} style={{ color:'#FFD700' }}/> {selected.craftsman}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:10, padding:'1rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'.72rem', color:'#666', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Issue Description</div>
                <div style={{ fontSize:'.88rem', color:'#bbb', lineHeight:1.6 }}>{selected.desc}</div>
              </div>

              {/* Note / Response */}
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'.72rem', color:'#666', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
                  <FaComment size={10} style={{ marginRight:5 }}/>Add Note / Response
                </label>
                <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Type your response or internal note…"
                  style={{ width:'100%', background:'#1a1a1a', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:9, padding:'.75rem 1rem', color:'#f0f0f0', fontFamily:'DM Sans,sans-serif', fontSize:'.88rem', outline:'none', resize:'vertical' }}/>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {selected.status !== 'Resolved' && (
                  <button onClick={() => resolve(selected.id)}
                    style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', border:'none', borderRadius:9, padding:'.65rem 1.25rem', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:'.84rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <FaCheckCircle size={12}/> Mark Resolved
                  </button>
                )}
                <button style={{ background:'rgba(255,255,255,.05)', color:'#bbb', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'.65rem 1.25rem', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.84rem', cursor:'pointer' }}>
                  Save Note
                </button>
                <button style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)', borderRadius:9, padding:'.65rem 1.25rem', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.84rem', cursor:'pointer' }}>
                  Escalate
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...CARD, textAlign:'center', padding:'4rem 2rem' }}>
              <FaHeadset style={{ fontSize:'2.5rem', color:'#333', marginBottom:12 }}/>
              <p style={{ color:'#555', fontWeight:600 }}>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
