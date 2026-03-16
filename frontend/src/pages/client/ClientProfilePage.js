import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosClient";

const avi = name =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name||'C')}&background=ecfdf5&color=0e5c38&size=100&bold=true`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,700&family=Sora:wght@400;500;600;700&display=swap');

:root {
  --ink:    #1c1917;
  --gd:     #0e5c38;
  --gm:     #198754;
  --gl:     #ecfdf5;
  --gold:   #b45309;
  --cream:  #fafaf8;
  --white:  #ffffff;
  --border: #e7e4df;
  --muted:  #78716c;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Sora', sans-serif; background: var(--cream); color: var(--ink); }

@keyframes cp-spin { to { transform: rotate(360deg); } }
@keyframes cp-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

.cp-center {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px; background: var(--cream);
}
.cp-spinner {
  width: 44px; height: 44px;
  border: 3px solid var(--border); border-top-color: var(--gd);
  border-radius: 50%; animation: cp-spin .7s linear infinite;
}
.cp-spin-txt { font-size: .83rem; font-weight: 600; color: var(--muted); font-family: 'Sora', sans-serif; }

.cp-err-card {
  background: var(--white); border-radius: 14px; padding: 40px 32px;
  max-width: 420px; text-align: center;
  border: 1.5px solid var(--border); box-shadow: 0 2px 18px rgba(0,0,0,.06);
}
.cp-err-icon {
  width: 58px; height: 58px; border-radius: 50%;
  background: #fef2f2; border: 2px solid #fecaca;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; font-size: 1.3rem; color: #b91c1c;
}
.cp-err-title { font-family: 'Fraunces', serif; font-size: 1.35rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
.cp-err-sub   { font-size: .85rem; color: var(--muted); margin-bottom: 10px; }

.cp-page  { min-height: 100vh; background: var(--cream); padding: 40px 20px 60px; }
.cp-inner { max-width: 860px; margin: 0 auto; animation: cp-up .35s ease both; }

.cp-back {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: .79rem; font-weight: 700; color: var(--muted);
  text-decoration: none; margin-bottom: 24px; transition: color .15s;
}
.cp-back:hover { color: var(--gd); }

/* hero */
.cp-hero {
  background: var(--gd);
  border-radius: 16px; padding: 30px 30px; margin-bottom: 18px;
  position: relative; overflow: hidden;
}
.cp-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
}
.cp-hero::after {
  content: ''; position: absolute; top: -70px; right: -70px;
  width: 260px; height: 260px; border-radius: 50%;
  border: 55px solid rgba(180,83,9,.1); pointer-events: none;
}
.cp-hero-top {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
}
.cp-avi { width: 68px; height: 68px; border-radius: 50%; border: 3px solid rgba(251,191,36,.55); flex-shrink: 0; }
.cp-name { font-family: 'Fraunces', serif; font-size: clamp(1.3rem,3vw,1.8rem); font-weight: 800; color: #fff; margin-bottom: 5px; }
.cp-role {
  display: inline-block; background: rgba(180,83,9,.2); color: #fbbf24;
  border: 1px solid rgba(251,191,36,.35); border-radius: 3px; padding: 2px 9px;
  font-size: .61rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
}
.cp-email { font-size: .78rem; color: rgba(255,255,255,.55); margin-top: 4px; }

.cp-stats {
  position: relative; z-index: 1;
  display: flex; gap: 0;
  border-top: 1px solid rgba(255,255,255,.1); padding-top: 18px;
}
.cp-stat { flex: 1; text-align: center; padding: 0 14px; border-right: 1px solid rgba(255,255,255,.08); }
.cp-stat:last-child { border-right: none; }
.cp-stat-v { font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 800; color: #fbbf24; margin-bottom: 2px; }
.cp-stat-l { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.5); }

/* details grid */
.cp-dg { display: grid; grid-template-columns: repeat(auto-fill,minmax(194px,1fr)); gap: 11px; margin-bottom: 18px; }
.cp-di {
  display: flex; align-items: flex-start; gap: 11px;
  background: var(--white); border-radius: 11px; padding: 14px;
  border: 1.5px solid var(--border);
}
.cp-di-icon {
  width: 33px; height: 33px; border-radius: 8px; background: var(--gl);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cp-di-icon i { color: var(--gd); font-size: .8rem; }
.cp-di-lbl { font-size: .64rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 2px; }
.cp-di-val { font-size: .87rem; font-weight: 700; color: var(--ink); }

/* order history */
.cp-sec { background: var(--white); border-radius: 14px; border: 1.5px solid var(--border); padding: 24px; }
.cp-sec-title { font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 800; color: var(--ink); margin-bottom: 16px; }

.cp-empty { text-align: center; padding: 44px 20px; color: var(--muted); }
.cp-empty i { font-size: 2.4rem; opacity: .28; margin-bottom: 12px; display: block; }
.cp-empty p { font-size: .87rem; font-weight: 600; margin: 0 0 3px; }

.cp-orders { display: flex; flex-direction: column; gap: 0; }
.cp-order-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 0; border-bottom: 1px solid var(--border); gap: 12px; flex-wrap: wrap;
}
.cp-order-row:last-child { border-bottom: none; }
.cp-order-svc  { font-weight: 700; font-size: .9rem; color: var(--ink); margin-bottom: 2px; }
.cp-order-meta { font-size: .74rem; color: var(--muted); }

.cp-badge { display: inline-block; border-radius: 3px; padding: 3px 9px; font-size: .69rem; font-weight: 700; white-space: nowrap; }
.cp-bg  { background: var(--gl); color: var(--gd); }
.cp-bau { background: #fef3c7; color: #7c2d12; }
.cp-br  { background: #fef2f2; color: #b91c1c; }
.cp-bgr { background: #f3f4f6; color: #6b7280; }

@media (max-width: 600px) {
  .cp-hero { padding: 22px 18px; }
  .cp-stats { flex-direction: column; gap: 13px; }
  .cp-stat { border-right: none; padding: 0; text-align: left; }
  .cp-hero-top { flex-direction: column; text-align: center; }
}
`;

const ClientProfilePage = () => {
  const [client,  setClient]  = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('');
      try {
        const pr = await api.get('/me/');
        if (pr.data.role !== 'client') {
          setError('Access denied. Client account required.');
          setTimeout(() => navigate('/HireLogin'), 2000); return;
        }
        setClient(pr.data);
        const or = await api.get('/job-requests/');
        setOrders((or.data||[]).filter(o => {
          const id = pr.data.id;
          if (typeof o.client === 'number') return o.client === id;
          if (o.client?.id) return o.client.id === id;
          return o.client_id === id;
        }));
      } catch {
        setError('Could not load profile. Please log in again.');
        setTimeout(() => navigate('/HireLogin'), 2000);
      } finally { setLoading(false); }
    };
    run();
  }, [navigate]);

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="cp-center">
        <div className="cp-spinner"/>
        <p className="cp-spin-txt">Loading your profile…</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{CSS}</style>
      <div className="cp-center">
        <div className="cp-err-card">
          <div className="cp-err-icon"><i className="fas fa-exclamation-triangle"/></div>
          <h3 className="cp-err-title">Something went wrong</h3>
          <p className="cp-err-sub">{error}</p>
          <p style={{fontSize:'.78rem',color:'#9ca3af'}}>Redirecting to login…</p>
        </div>
      </div>
    </>
  );

  if (!client) return null;

  const statusClass = s => {
    if (!s) return 'cp-badge cp-bgr';
    const sl = s.toLowerCase();
    if (sl.includes('complet')||sl.includes('paid')||sl.includes('approv')) return 'cp-badge cp-bg';
    if (sl.includes('cancel')) return 'cp-badge cp-br';
    return 'cp-badge cp-bau';
  };

  const totalSpent   = orders.filter(o=>o.budget).reduce((a,o)=>a+Number(o.budget),0);
  const completedCnt = orders.filter(o=>/complet|paid/i.test(o.status||'')).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-page">
        <div className="cp-inner">
          <Link to="/hire" className="cp-back">
            <i className="fas fa-arrow-left"/>Back to dashboard
          </Link>

          {/* hero */}
          <div className="cp-hero">
            <div className="cp-hero-top">
              <img src={avi(client.full_name)} alt={client.full_name} className="cp-avi"/>
              <div>
                <h1 className="cp-name">{client.full_name||'Unnamed Client'}</h1>
                <span className="cp-role">Client Account</span>
                {client.email && <p className="cp-email">{client.email}</p>}
              </div>
            </div>
            <div className="cp-stats">
              {[
                {v:orders.length,                              l:'Total requests'},
                {v:completedCnt,                               l:'Completed'},
                {v:`KSh ${totalSpent.toLocaleString()}`,       l:'Total spent'},
              ].map((s,i)=>(
                <div className="cp-stat" key={i}>
                  <p className="cp-stat-v">{s.v}</p>
                  <p className="cp-stat-l">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* detail items */}
          <div className="cp-dg">
            {[
              {icon:'fas fa-envelope',       label:'Email',          val:client.email||'—'},
              {icon:'fas fa-phone',          label:'Phone',          val:client.phone||client.phone_number||'—'},
              {icon:'fas fa-id-badge',       label:'Account type',   val:'Client'},
              {icon:'fas fa-clipboard-list', label:'Total requests', val:orders.length},
            ].map((item,i)=>(
              <div className="cp-di" key={i}>
                <div className="cp-di-icon"><i className={item.icon}/></div>
                <div>
                  <p className="cp-di-lbl">{item.label}</p>
                  <p className="cp-di-val">{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* order history */}
          <div className="cp-sec">
            <h2 className="cp-sec-title">Order History</h2>
            {orders.length===0 ? (
              <div className="cp-empty">
                <i className="fas fa-clipboard-list"/>
                <p>No orders yet. Browse craftsmen and hire one to get started.</p>
              </div>
            ) : (
              <div className="cp-orders">
                {orders.map(order=>(
                  <div className="cp-order-row" key={order.id}>
                    <div>
                      <p className="cp-order-svc">{order.service}</p>
                      <p className="cp-order-meta">
                        {order.schedule && new Date(order.schedule).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}
                        {order.budget && ` · KSh ${Number(order.budget).toLocaleString()}`}
                      </p>
                    </div>
                    <span className={statusClass(order.status)}>{order.status||'—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientProfilePage;