import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://staging.kaakazini.com/api";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Sora:wght@400;500;600;700&display=swap');

:root {
  --ink:    #1c1917;
  --gd:     #0e5c38;
  --gm:     #198754;
  --gl:     #ecfdf5;
  --gold:   #b45309;
  --gold-l: #fef3c7;
  --cream:  #fafaf8;
  --white:  #ffffff;
  --border: #e7e4df;
  --muted:  #78716c;
}

@keyframes cpt-spin { to { transform: rotate(360deg); } }
@keyframes cpt-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

.cpt { font-family: 'Sora', sans-serif; color: var(--ink); animation: cpt-up .3s ease both; }

.cpt-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 56px 20px; gap: 13px;
}
.cpt-spinner {
  width: 38px; height: 38px;
  border: 3px solid var(--border); border-top-color: var(--gd);
  border-radius: 50%; animation: cpt-spin .7s linear infinite;
}
.cpt-spin-txt { font-size: .81rem; font-weight: 600; color: var(--muted); }

.cpt-err {
  background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 9px;
  padding: 13px 16px; font-size: .8rem; color: #b91c1c;
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.cpt-retry {
  background: none; border: 1.5px solid #fecaca; border-radius: 6px;
  color: #b91c1c; font-size: .75rem; font-weight: 700;
  padding: 4px 11px; cursor: pointer; font-family: 'Sora', sans-serif;
  transition: all .14s; margin-left: auto; flex-shrink: 0;
}
.cpt-retry:hover { background: #b91c1c; color: #fff; }

/* stats */
.cpt-stats {
  display: grid; grid-template-columns: repeat(auto-fit,minmax(136px,1fr));
  gap: 11px; margin-bottom: 20px;
}
.cpt-stat {
  background: var(--white); border-radius: 10px; padding: 15px 13px;
  border: 1.5px solid var(--border); text-align: center;
}
.cpt-stat-v {
  font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 800;
  color: var(--gd); margin-bottom: 3px; display: block;
}
.cpt-stat-l {
  font-size: .64rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--muted);
}

/* table */
.cpt-tbl-wrap { border-radius: 10px; border: 1.5px solid var(--border); overflow: hidden; }
.cpt-tbl { width: 100%; border-collapse: collapse; min-width: 520px; }
.cpt-tbl th {
  background: #f8f7f4; font-size: .66rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .07em; color: var(--muted);
  padding: 10px 13px; text-align: left; border-bottom: 1.5px solid var(--border);
  white-space: nowrap;
}
.cpt-tbl td {
  padding: 13px 13px; border-bottom: 1px solid var(--border);
  font-size: .83rem; vertical-align: middle;
}
.cpt-tbl tr:last-child td { border-bottom: none; }
.cpt-tbl tbody tr:hover   { background: #faf9f6; }

.cpt-breakdown { display: flex; flex-direction: column; gap: 2px; }
.cpt-total { font-weight: 700; font-size: .85rem; color: var(--ink); }
.cpt-fee   { font-size: .71rem; color: var(--muted); }
.cpt-net   { font-size: .79rem; font-weight: 700; color: var(--gd); }

.cpt-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 3px; padding: 3px 9px; font-size: .69rem; font-weight: 700; white-space: nowrap; }
.cpt-paid    { background: var(--gl);    color: var(--gd); }
.cpt-pending { background: var(--gold-l); color: #7c2d12; }
.cpt-cancel  { background: #fef2f2;       color: #b91c1c; }
.cpt-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

.cpt-empty {
  text-align: center; padding: 52px 20px; color: var(--muted);
  background: var(--white); border-radius: 10px; border: 1.5px solid var(--border);
}
.cpt-empty i { font-size: 2.4rem; opacity: .27; margin-bottom: 12px; display: block; }
.cpt-empty p { font-size: .87rem; font-weight: 600; margin: 0 0 3px; }
.cpt-empty small { font-size: .75rem; opacity: .74; }

@media (max-width: 480px) {
  .cpt-stats { grid-template-columns: 1fr 1fr; }
}
`;

export default function ClientPaymentTab({ clientId }) {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchPayments = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get(`${BASE_URL}/payments/`, { withCredentials: true });
      setPayments((data||[]).filter(p => p.client===clientId || p.client?.id===clientId));
    } catch {
      setError('Could not load payment records. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (clientId) fetchPayments(); }, [clientId]); // eslint-disable-line

  const totalPaid  = payments.filter(p=>p.status==='paid').reduce((a,p)=>a+Number(p.amount||0),0);
  const totalAll   = payments.reduce((a,p)=>a+Number(p.amount||0),0);
  const pendingCnt = payments.filter(p=>p.status==='pending').length;

  const badgeCls = s => {
    if (s==='paid')    return 'cpt-badge cpt-paid';
    if (s==='pending') return 'cpt-badge cpt-pending';
    return 'cpt-badge cpt-cancel';
  };
  const badgeLbl = s => {
    if (s==='paid')    return 'Paid to craftsman';
    if (s==='pending') return 'Awaiting payment';
    return 'Cancelled';
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cpt">

        {loading && (
          <div className="cpt-loading">
            <div className="cpt-spinner"/>
            <p className="cpt-spin-txt">Loading payments…</p>
          </div>
        )}

        {!loading && error && (
          <div className="cpt-err">
            <i className="fas fa-exclamation-circle"/>
            {error}
            <button className="cpt-retry" onClick={fetchPayments}>Retry</button>
          </div>
        )}

        {!loading && !error && payments.length===0 && (
          <div className="cpt-empty">
            <i className="fas fa-receipt"/>
            <p>No payment records yet.</p>
            <small>Payments appear here after a job is completed and paid.</small>
          </div>
        )}

        {!loading && !error && payments.length>0 && (
          <>
            <div className="cpt-stats">
              {[
                {v:payments.length,                                 l:'Transactions'},
                {v:`KSh ${totalPaid.toLocaleString()}`,             l:'Amount paid'},
                {v:`KSh ${(totalAll-totalPaid).toLocaleString()}`,  l:'Pending'},
                {v:pendingCnt,                                       l:'Awaiting payment'},
              ].map((s,i)=>(
                <div className="cpt-stat" key={i}>
                  <span className="cpt-stat-v">{s.v}</span>
                  <span className="cpt-stat-l">{s.l}</span>
                </div>
              ))}
            </div>

            <div className="cpt-tbl-wrap">
              <table className="cpt-tbl">
                <thead>
                  <tr>
                    <th>Job / Service</th>
                    <th>Breakdown</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(pay=>{
                    const total = Number(pay.amount)||0;
                    const fee   = Math.round(total*.1);
                    const net   = total-fee;
                    return (
                      <tr key={pay.id}>
                        <td><strong>{pay.job?.service||'—'}</strong></td>
                        <td>
                          <div className="cpt-breakdown">
                            <span className="cpt-total">KSh {total.toLocaleString()}</span>
                            <span className="cpt-fee">Platform fee: KSh {fee.toLocaleString()}</span>
                            <span className="cpt-net">Craftsman gets: KSh {net.toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <span className={badgeCls(pay.status)}>
                            <span className="cpt-dot"/>
                            {badgeLbl(pay.status)}
                          </span>
                        </td>
                        <td style={{fontSize:'.77rem',color:'var(--muted)',whiteSpace:'nowrap'}}>
                          {pay.created_at
                            ? new Date(pay.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </>
  );
}