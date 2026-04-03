import React, { useState } from "react";
import { FaDollarSign, FaMobile, FaCheckCircle, FaSearch, FaClock, FaMoneyBillWave, FaChevronRight } from "react-icons/fa";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .pay-wrap * { box-sizing: border-box; }

  /* ── Summary Cards ── */
  .pay-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .pay-stat-card {
    background: #111;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 18px;
    padding: 1.375rem 1.5rem;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: transform .2s, border-color .2s, box-shadow .2s;
  }
  .pay-stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top left, var(--card-glow, rgba(255,215,0,.06)), transparent 65%);
    pointer-events: none;
  }
  .pay-stat-card:hover {
    transform: translateY(-3px);
    border-color: var(--card-accent, rgba(255,215,0,.25));
    box-shadow: 0 12px 32px rgba(0,0,0,.4);
  }
  .pay-stat-card .card-label {
    font-family: 'DM Sans', sans-serif;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #555;
    margin-bottom: .75rem;
  }
  .pay-stat-card .card-val {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    color: var(--card-accent, #FFD700);
    margin-bottom: .375rem;
  }
  .pay-stat-card .card-icon {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--card-icon-bg, rgba(255,215,0,.08));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: var(--card-accent, #FFD700);
  }

  /* ── Search ── */
  .pay-search-bar {
    background: #111;
    border: 1.5px solid rgba(255,255,255,.08);
    border-radius: 14px;
    padding: .875rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.25rem;
    transition: border-color .2s;
  }
  .pay-search-bar:focus-within {
    border-color: rgba(255,215,0,.35);
    box-shadow: 0 0 0 3px rgba(255,215,0,.06);
  }
  .pay-search-bar input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e0e0e0;
    font-family: 'DM Sans', sans-serif;
    font-size: .92rem;
  }
  .pay-search-bar input::placeholder { color: #444; }

  /* ── Table Shell ── */
  .pay-table-shell {
    background: #111;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 18px;
    overflow: hidden;
  }

  .pay-table-shell table {
    width: 100%;
    border-collapse: collapse;
  }

  /* ── Table Head ── */
  .pay-table-shell thead tr {
    background: linear-gradient(90deg, #1a1400, #0d1a0d);
    border-bottom: 1px solid rgba(255,215,0,.12);
  }
  .pay-table-shell thead th {
    padding: 1rem 1.25rem;
    font-family: 'DM Sans', sans-serif;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #666;
    text-align: left;
    white-space: nowrap;
  }
  .pay-table-shell thead th:first-child { padding-left: 1.75rem; }
  .pay-table-shell thead th:last-child  { padding-right: 1.75rem; text-align: right; }

  /* ── Table Rows ── */
  .pay-table-shell tbody tr {
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .15s;
  }
  .pay-table-shell tbody tr:last-child { border-bottom: none; }
  .pay-table-shell tbody tr:hover { background: rgba(255,215,0,.025); }

  .pay-table-shell tbody td {
    padding: 1.1rem 1.25rem;
    font-family: 'DM Sans', sans-serif;
    font-size: .86rem;
    color: #bbb;
    vertical-align: middle;
  }
  .pay-table-shell tbody td:first-child { padding-left: 1.75rem; }
  .pay-table-shell tbody td:last-child  { padding-right: 1.75rem; text-align: right; }

  /* ── Job ID badge ── */
  .pay-job-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: .78rem;
    font-weight: 600;
    color: #FFD700;
    background: rgba(255,215,0,.08);
    border: 1px solid rgba(255,215,0,.15);
    border-radius: 8px;
    padding: 4px 10px;
    display: inline-block;
  }

  /* ── Client cell ── */
  .pay-client-name {
    font-weight: 600;
    color: #e8e8e8;
  }

  /* ── Service tag ── */
  .pay-service-tag {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    padding: 3px 10px;
    font-size: .8rem;
    color: #888;
    display: inline-block;
  }

  /* ── Money cells ── */
  .pay-amount-total {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #e8e8e8;
    font-size: .88rem;
  }
  .pay-amount-cut {
    font-family: 'JetBrains Mono', monospace;
    font-size: .84rem;
    color: #3b82f6;
    font-weight: 500;
  }
  .pay-amount-net {
    font-family: 'JetBrains Mono', monospace;
    font-size: .88rem;
    color: #22c55e;
    font-weight: 700;
  }

  /* ── Phone ── */
  .pay-phone {
    font-family: 'JetBrains Mono', monospace;
    font-size: .8rem;
    color: #555;
  }

  /* ── Status pill ── */
  .pay-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 20px;
    padding: 4px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .04em;
  }
  .pay-status-pill.awaiting {
    background: rgba(255,215,0,.1);
    color: #FFD700;
    border: 1px solid rgba(255,215,0,.2);
  }
  .pay-status-pill.paid {
    background: rgba(34,197,94,.1);
    color: #4ade80;
    border: 1px solid rgba(34,197,94,.2);
  }
  .pay-status-pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: .4; }
  }

  /* ── Action Buttons ── */
  .pay-btn-send {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: .55rem 1.1rem;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    box-shadow: 0 4px 14px rgba(34,197,94,.25);
    white-space: nowrap;
  }
  .pay-btn-send:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(34,197,94,.4);
  }
  .pay-btn-send:disabled {
    opacity: .5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .pay-btn-done {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: .55rem 1.1rem;
    background: rgba(34,197,94,.08);
    color: #4ade80;
    border: 1px solid rgba(34,197,94,.2);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem;
    font-weight: 700;
    white-space: nowrap;
  }

  /* ── Empty State ── */
  .pay-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    gap: 1rem;
  }
  .pay-empty .icon-ring {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(34,197,94,.08);
    border: 1px solid rgba(34,197,94,.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #22c55e;
  }
  .pay-empty h4 {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #e0e0e0;
    margin: 0;
  }
  .pay-empty p {
    font-size: .84rem;
    color: #555;
    margin: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .pay-table-shell { overflow-x: auto; }
    .pay-table-shell table { min-width: 800px; }
  }
`;

export default function AdminPaymentDashboard({ jobsReadyForPayment = [], processPayment }) {
  const [processingJobId, setProcessingJobId] = useState(null);
  const [search, setSearch]                   = useState('');
  const [processed, setProcessed]             = useState(new Set());

  const handlePay = async (id) => {
    setProcessingJobId(id);
    try {
      await processPayment(id);
      setProcessed(prev => new Set([...prev, id]));
    } finally {
      setProcessingJobId(null);
    }
  };

  const filtered = jobsReadyForPayment.filter(j =>
    (j.name    || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.service || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPending = filtered.reduce((a, j) => a + (Number(j.budget) || 0), 0);
  const platformCut  = Math.round(totalPending * 0.1);
  const craftsmanNet = totalPending - platformCut;

  const summaryCards = [
    {
      lbl: 'Pending Payouts',
      val: filtered.length,
      icon: <FaClock/>,
      accent: '#FFD700',
      glow: 'rgba(255,215,0,.08)',
      iconBg: 'rgba(255,215,0,.08)',
    },
    {
      lbl: 'Total to Disburse',
      val: `KSh ${totalPending.toLocaleString()}`,
      icon: <FaMoneyBillWave/>,
      accent: '#22c55e',
      glow: 'rgba(34,197,94,.06)',
      iconBg: 'rgba(34,197,94,.08)',
    },
    {
      lbl: 'Platform Revenue',
      val: `KSh ${platformCut.toLocaleString()}`,
      icon: <FaDollarSign/>,
      accent: '#3b82f6',
      glow: 'rgba(59,130,246,.06)',
      iconBg: 'rgba(59,130,246,.08)',
    },
    {
      lbl: 'Net to Craftsmen',
      val: `KSh ${craftsmanNet.toLocaleString()}`,
      icon: <FaMobile/>,
      accent: '#8b5cf6',
      glow: 'rgba(139,92,246,.06)',
      iconBg: 'rgba(139,92,246,.08)',
    },
  ];

  return (
    <div className="pay-wrap">
      <style>{STYLES}</style>

      {/* ── Summary Cards ── */}
      <div className="pay-summary-grid">
        {summaryCards.map((s, i) => (
          <div
            key={i}
            className="pay-stat-card"
            style={{
              '--card-accent':  s.accent,
              '--card-glow':    s.glow,
              '--card-icon-bg': s.iconBg,
            }}
          >
            <div className="card-icon">{s.icon}</div>
            <div className="card-label">{s.lbl}</div>
            <div className="card-val">{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="pay-search-bar">
        <FaSearch style={{ color:'#444', fontSize:'.9rem', flexShrink:0 }}/>
        <input
          placeholder="Search by client name or service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <span
            onClick={() => setSearch('')}
            style={{ color:'#555', cursor:'pointer', fontSize:'.8rem', flexShrink:0 }}
          >
            Clear
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="pay-table-shell">
        {filtered.length === 0 ? (
          <div className="pay-empty">
            <div className="icon-ring"><FaCheckCircle/></div>
            <h4>All Payments Cleared</h4>
            <p>{search ? 'No results match your search.' : 'No jobs are awaiting payment right now.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job #</th>
                <th>Client</th>
                <th>Service</th>
                <th>Total</th>
                <th>Platform 10%</th>
                <th>Net to Craftsman</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const total = Number(job.budget) || 0;
                const cut   = Math.round(total * 0.1);
                const net   = total - cut;
                const done  = processed.has(job.id);

                return (
                  <tr key={job.id}>
                    <td><span className="pay-job-id">#{job.id}</span></td>
                    <td><span className="pay-client-name">{job.name || '—'}</span></td>
                    <td><span className="pay-service-tag">{job.service || '—'}</span></td>
                    <td><span className="pay-amount-total">KSh {total.toLocaleString()}</span></td>
                    <td><span className="pay-amount-cut">KSh {cut.toLocaleString()}</span></td>
                    <td><span className="pay-amount-net">KSh {net.toLocaleString()}</span></td>
                    <td>
                      <span className="pay-phone">
                        {job.craftsman?.phone || job.craftsman_phone || '—'}
                      </span>
                    </td>
                    <td>
                      {done
                        ? <span className="pay-status-pill paid"><span className="dot"/>Paid</span>
                        : <span className="pay-status-pill awaiting"><span className="dot"/>Awaiting</span>
                      }
                    </td>
                    <td>
                      {done ? (
                        <div className="pay-btn-done">
                          <FaCheckCircle size={12}/> Sent
                        </div>
                      ) : (
                        <button
                          className="pay-btn-send"
                          disabled={processingJobId === job.id}
                          onClick={() => handlePay(job.id)}
                        >
                          {processingJobId === job.id ? (
                            <>
                              <span
                                style={{ width:13, height:13, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}
                              />
                              Processing…
                            </>
                          ) : (
                            <><FaMobile size={12}/> Send M-Pesa</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{
            padding: '.875rem 1.75rem',
            borderTop: '1px solid rgba(255,255,255,.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize:'.78rem', color:'#444', fontFamily:'DM Sans,sans-serif' }}>
              Showing {filtered.length} of {jobsReadyForPayment.length} job{jobsReadyForPayment.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize:'.78rem', color:'#333', fontFamily:'JetBrains Mono,monospace' }}>
              {processed.size} paid · {filtered.length - processed.size} pending
            </span>
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}