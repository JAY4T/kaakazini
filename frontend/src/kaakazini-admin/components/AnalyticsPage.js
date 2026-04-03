import React, { useMemo } from 'react';
import { FaChartBar, FaChartLine, FaUsers, FaCheckCircle, FaBriefcase, FaDollarSign } from 'react-icons/fa';

const CARD = { background:'#141414', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' };
const TITLE = { fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'.95rem', color:'#f0f0f0', marginBottom:'.875rem', display:'flex', alignItems:'center', gap:8 };

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:'.8rem', color:'#888' }}>{label}</span>
        <span style={{ fontSize:'.8rem', fontWeight:700, color:'#f0f0f0' }}>{value}</span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .6s ease' }}/>
      </div>
    </div>
  );
}

export default function AnalyticsPage({ jobs = [], craftsmen = [] }) {
  const metrics = useMemo(() => {
    const paid      = jobs.filter(j => /paid/i.test(j.status || ''));
    const completed = jobs.filter(j => /complet/i.test(j.status || ''));
    const pending   = jobs.filter(j => /pending/i.test(j.status || ''));
    const revenue   = paid.reduce((a, j) => a + (Number(j.budget) || 0), 0);

    // Jobs by service
    const byService = {};
    jobs.forEach(j => { if (j.service) byService[j.service] = (byService[j.service] || 0) + 1; });
    const topServices = Object.entries(byService).sort((a,b) => b[1]-a[1]).slice(0,6);
    const maxSvc = topServices[0]?.[1] || 1;

    // Jobs by location
    const byLocation = {};
    jobs.forEach(j => { if (j.location) byLocation[j.location] = (byLocation[j.location] || 0) + 1; });
    const topLocations = Object.entries(byLocation).sort((a,b) => b[1]-a[1]).slice(0,5);
    const maxLoc = topLocations[0]?.[1] || 1;

    // Craftsmen by profession
    const byProf = {};
    craftsmen.forEach(c => { if (c.profession) byProf[c.profession] = (byProf[c.profession] || 0) + 1; });
    const topProf = Object.entries(byProf).sort((a,b) => b[1]-a[1]).slice(0,5);
    const maxProf = topProf[0]?.[1] || 1;

    const completionRate = jobs.length > 0 ? Math.round((completed.length / jobs.length) * 100) : 0;
    const paymentRate    = completed.length > 0 ? Math.round((paid.length / completed.length) * 100) : 0;
    const avgJobValue    = paid.length > 0 ? Math.round(revenue / paid.length) : 0;

    return { paid, completed, pending, revenue, topServices, maxSvc, topLocations, maxLoc, topProf, maxProf, completionRate, paymentRate, avgJobValue };
  }, [jobs, craftsmen]);

  const KPI = [
    { lbl:'Completion Rate', val:`${metrics.completionRate}%`, sub:'of all jobs', color:'#22c55e', icon:<FaCheckCircle/> },
    { lbl:'Payment Rate',    val:`${metrics.paymentRate}%`,    sub:'of completed jobs', color:'#FFD700', icon:<FaDollarSign/> },
    { lbl:'Avg Job Value',   val:`KSh ${metrics.avgJobValue.toLocaleString()}`, sub:'per paid job', color:'#3b82f6', icon:<FaBriefcase/> },
    { lbl:'Active Craftsmen',val:craftsmen.filter(c=>c.is_active).length, sub:'on platform', color:'#8b5cf6', icon:<FaUsers/> },
  ];

  const COLORS = ['#FFD700','#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444'];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {KPI.map((k,i) => (
          <div key={i} style={CARD}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:'.72rem', color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{k.lbl}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.75rem', fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'.72rem', color:'#555', marginTop:5 }}>{k.sub}</div>
              </div>
              <div style={{ width:42, height:42, borderRadius:11, background:`${k.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:k.color, fontSize:'.9rem' }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Jobs by Service */}
        <div className="col-12 col-lg-6">
          <div style={CARD}>
            <div style={TITLE}><FaChartBar style={{ color:'#FFD700' }}/> Jobs by Service</div>
            {metrics.topServices.length === 0 ? (
              <p style={{ color:'#444', fontSize:'.84rem' }}>No job data yet.</p>
            ) : metrics.topServices.map(([svc, cnt], i) => (
              <MiniBar key={i} label={svc} value={cnt} max={metrics.maxSvc} color={COLORS[i % COLORS.length]}/>
            ))}
          </div>
        </div>

        {/* Jobs by Location */}
        <div className="col-12 col-lg-6">
          <div style={CARD}>
            <div style={TITLE}><FaChartBar style={{ color:'#22c55e' }}/> Jobs by Location</div>
            {metrics.topLocations.length === 0 ? (
              <p style={{ color:'#444', fontSize:'.84rem' }}>No location data yet.</p>
            ) : metrics.topLocations.map(([loc, cnt], i) => (
              <MiniBar key={i} label={loc.charAt(0).toUpperCase() + loc.slice(1)} value={cnt} max={metrics.maxLoc} color={COLORS[i % COLORS.length]}/>
            ))}
          </div>
        </div>

        {/* Craftsmen by Profession */}
        <div className="col-12 col-lg-6">
          <div style={CARD}>
            <div style={TITLE}><FaUsers style={{ color:'#8b5cf6' }}/> Craftsmen by Profession</div>
            {metrics.topProf.length === 0 ? (
              <p style={{ color:'#444', fontSize:'.84rem' }}>No craftsmen data yet.</p>
            ) : metrics.topProf.map(([prof, cnt], i) => (
              <MiniBar key={i} label={prof} value={cnt} max={metrics.maxProf} color={COLORS[i % COLORS.length]}/>
            ))}
          </div>
        </div>

        {/* Job Status Breakdown */}
        <div className="col-12 col-lg-6">
          <div style={CARD}>
            <div style={TITLE}><FaChartLine style={{ color:'#3b82f6' }}/> Job Status Breakdown</div>
            {[
              { lbl:'Paid & Closed',    val:metrics.paid.length,      color:'#22c55e' },
              { lbl:'Completed',        val:metrics.completed.length,  color:'#3b82f6' },
              { lbl:'Pending',          val:metrics.pending.length,    color:'#FFD700' },
              { lbl:'Other / In Progress', val:jobs.length - metrics.paid.length - metrics.completed.length - metrics.pending.length, color:'#8b5cf6' },
            ].map((s,i) => (
              <MiniBar key={i} label={s.lbl} value={s.val} max={Math.max(jobs.length, 1)} color={s.color}/>
            ))}
            <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', marginTop:12, paddingTop:10, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'.8rem', color:'#666' }}>Total Revenue Processed</span>
              <span style={{ fontSize:'.88rem', fontWeight:800, color:'#22c55e' }}>KSh {metrics.revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
