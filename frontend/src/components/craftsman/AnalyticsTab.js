import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FaMoneyBillWave, FaCheckCircle, FaStar, FaClock,
  FaArrowUp, FaArrowDown, FaFire, FaTrophy,
  FaBriefcase, FaChartLine, FaChartPie, FaChartBar,
} from "react-icons/fa";

// ─── Animated count-up ────────────────────────────────────────────────────────
function CountUp({ to, duration = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const start = useRef(null);
  useEffect(() => {
    const target = parseFloat(to) || 0;
    start.current = null;
    const tick = (ts) => {
      if (!start.current) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  const fmt = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <>{prefix}{fmt}{suffix}</>;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a2332", border: "1px solid rgba(34,197,94,.3)",
      borderRadius: 12, padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <p style={{ color: "#86efac", fontSize: ".72rem", fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: .5 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "white", fontSize: ".875rem", fontWeight: 700, margin: "2px 0" }}>
          <span style={{ color: p.color, marginRight: 6 }}>●</span>
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHead = ({ icon, title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ color: "#22c55e", fontSize: ".9rem" }}>{icon}</span>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>{title}</h3>
      </div>
      {sub && <p style={{ margin: 0, fontSize: ".75rem", color: "#64748b" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Range selector ───────────────────────────────────────────────────────────
const RangePill = ({ options, value, onChange }) => (
  <div style={{ display: "flex", background: "#0f172a", borderRadius: 10, padding: 3, gap: 2 }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} style={{
        padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
        fontWeight: 700, fontSize: ".72rem", fontFamily: "'Outfit', sans-serif",
        background: value === o ? "linear-gradient(135deg,#fbbf24,#22c55e)" : "transparent",
        color: value === o ? "#1f2937" : "#64748b",
        transition: "all .2s",
      }}>{o}</button>
    ))}
  </div>
);

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, prefix, suffix, decimals, change, changeLabel, delay, accent = "#22c55e" }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  const positive = parseFloat(change) >= 0;

  return (
    <div className={`an-kpi an-enter ${show ? "an-show" : ""}`} style={{ "--delay": `${delay}ms`, "--accent": accent }}>
      <div className="an-kpi-top">
        <div className="an-kpi-icon" style={{ background: accent + "18", color: accent }}>{icon}</div>
        <div className={`an-kpi-change ${positive ? "pos" : "neg"}`}>
          {positive ? <FaArrowUp size={9}/> : <FaArrowDown size={9}/>}
          {Math.abs(parseFloat(change) || 0)}%
        </div>
      </div>
      <div className="an-kpi-val">
        {show ? <CountUp to={value} prefix={prefix} suffix={suffix} decimals={decimals}/> : `${prefix||""}0`}
      </div>
      <div className="an-kpi-label">{label}</div>
      <div className="an-kpi-sublabel">{changeLabel}</div>
    </div>
  );
};

// ─── Main AnalyticsTab ────────────────────────────────────────────────────────
function AnalyticsTab({ craftsman = {}, jobs = [] }) {
  const [range, setRange] = useState("3M");
  const [show, setShow]   = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); }, []);

  const norm = s => (s || "").toLowerCase().replace(/[_\s]/g, "");

  const analytics = useMemo(() => {
    const done    = jobs.filter(j => ["completed","paid"].includes(norm(j.status)));
    const active  = jobs.filter(j => ["inprogress","accepted","quoteapproved"].includes(norm(j.status)));
    const ratings = jobs.map(j => j.rating).filter(r => r != null);
    const avgRating = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : craftsman.avg_rating || 0;
    const totalEarnings = done.reduce((s,j) => s+(j.payment||j.amount||j.budget||0), 0);

    // Monthly earnings for area chart (last 12 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const monthJobs = done.filter(j => {
        const jd = new Date(j.completed_at || j.updated_at || 0);
        return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
      });
      return {
        month: label,
        earnings: monthJobs.reduce((s,j) => s+(j.payment||j.amount||j.budget||0), 0),
        jobs: monthJobs.length,
      };
    });

    // Fallback demo data if no real data
    const hasDates = done.some(j => j.completed_at || j.updated_at);
    const earningsData = hasDates ? monthlyData : [
      {month:"Jan",earnings:12000,jobs:3},{month:"Feb",earnings:18500,jobs:4},
      {month:"Mar",earnings:15000,jobs:3},{month:"Apr",earnings:22000,jobs:5},
      {month:"May",earnings:28000,jobs:6},{month:"Jun",earnings:24000,jobs:5},
      {month:"Jul",earnings:31000,jobs:7},{month:"Aug",earnings:27000,jobs:6},
      {month:"Sep",earnings:35000,jobs:8},{month:"Oct",earnings:29000,jobs:6},
      {month:"Nov",earnings:38000,jobs:9},{month:"Dec",earnings:42000,jobs:9},
    ];

    // Filter by range
    const rangeMap = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };
    const months = rangeMap[range] || 3;
    const filteredEarnings = earningsData.slice(-months);

    // Service breakdown for pie (or demo)
    const serviceMap = {};
    jobs.forEach(j => {
      const svc = j.service || "Other";
      serviceMap[svc] = (serviceMap[svc] || 0) + 1;
    });
    const serviceData = Object.entries(serviceMap).length > 0
      ? Object.entries(serviceMap).map(([name, value]) => ({ name, value })).slice(0, 5)
      : [
          { name: "Electrical", value: 12 },
          { name: "Plumbing",   value:  7 },
          { name: "Carpentry",  value:  5 },
          { name: "Painting",   value:  4 },
          { name: "Other",      value:  2 },
        ];

    // Day-of-week bar chart
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dayMap = Array(7).fill(0);
    done.forEach(j => {
      const d = new Date(j.completed_at || j.updated_at || 0);
      if (d.getFullYear() > 2000) dayMap[d.getDay()]++;
    });
    const dayData = dayNames.map((d, i) => ({ day: d, jobs: dayMap[i] }));
    const hasRealDays = dayMap.some(v => v > 0);
    const displayDayData = hasRealDays ? dayData
      : [{day:"Sun",jobs:1},{day:"Mon",jobs:4},{day:"Tue",jobs:6},{day:"Wed",jobs:5},{day:"Thu",jobs:7},{day:"Fri",jobs:8},{day:"Sat",jobs:3}];

    // Rating distribution
    const ratingBuckets = [5,4,3,2,1].map(r => ({
      stars: r,
      count: ratings.filter(v => Math.round(v) === r).length,
      label: `${r} ★`,
    }));

    // Last month vs prev month change
    const thisMonthEarnings = filteredEarnings[filteredEarnings.length-1]?.earnings || 0;
    const prevMonthEarnings = filteredEarnings[filteredEarnings.length-2]?.earnings || 0;
    const earningsChange = prevMonthEarnings > 0
      ? (((thisMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100).toFixed(0)
      : "+0";

    return {
      done: done.length, active: active.length,
      avgRating: parseFloat(avgRating).toFixed(1),
      totalEarnings, earningsChange,
      filteredEarnings, serviceData, displayDayData, ratingBuckets,
      topService: serviceData[0]?.name || "N/A",
      completionRate: jobs.length > 0 ? Math.round((done.length / jobs.length) * 100) : 0,
    };
  }, [jobs, craftsman, range, norm]);

  const PIE_COLORS = ["#22c55e","#fbbf24","#16a34a","#86efac","#d1fae5"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        .an-wrap {
          font-family: 'Outfit', sans-serif;
          background: #0d1520;
          border-radius: 20px;
          padding: 2rem;
          min-height: 600px;
          position: relative;
          overflow: hidden;
        }
        /* Subtle grid texture */
        .an-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(34,197,94,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Enter animations */
        .an-enter { opacity: 0; transform: translateY(18px); transition: opacity .5s ease, transform .5s cubic-bezier(.34,1.3,.64,1); transition-delay: var(--delay, 0ms); }
        .an-show  { opacity: 1; transform: translateY(0); }

        /* KPI cards */
        .an-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; position: relative; z-index: 1; }
        .an-kpi {
          background: linear-gradient(135deg, #141f2e 0%, #0f1824 100%);
          border: 1px solid rgba(34,197,94,.12);
          border-radius: 16px; padding: 1.25rem;
          position: relative; overflow: hidden;
          transition: transform .25s, border-color .25s, box-shadow .25s;
        }
        .an-kpi:hover { transform: translateY(-3px); border-color: var(--accent, #22c55e); box-shadow: 0 8px 32px rgba(34,197,94,.1); }
        .an-kpi::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--accent, #22c55e), transparent);
        }
        .an-kpi-top   { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .75rem; }
        .an-kpi-icon  { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: .9rem; }
        .an-kpi-change{ font-size: .72rem; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 50px; }
        .an-kpi-change.pos { background: rgba(34,197,94,.15); color: #22c55e; }
        .an-kpi-change.neg { background: rgba(239,68,68,.15);  color: #f87171; }
        .an-kpi-val   { font-size: 1.875rem; font-weight: 900; color: #f1f5f9; line-height: 1; margin-bottom: 3px; }
        .an-kpi-label { font-size: .78rem; font-weight: 700; color: #94a3b8; margin-bottom: 2px; }
        .an-kpi-sublabel { font-size: .68rem; color: #475569; }

        /* Chart panels */
        .an-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; position: relative; z-index: 1; }
        .an-panels-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; position: relative; z-index: 1; }
        @media (max-width: 900px) { .an-panels { grid-template-columns: 1fr; } .an-panels-3 { grid-template-columns: 1fr; } }

        .an-panel {
          background: linear-gradient(135deg, #141f2e 0%, #0f1824 100%);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px; padding: 1.375rem;
          transition: border-color .25s;
        }
        .an-panel:hover { border-color: rgba(34,197,94,.2); }
        .an-panel.full  { grid-column: 1 / -1; }

        /* Rating bars */
        .an-rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .an-rating-bar-bg { flex: 1; background: rgba(255,255,255,.06); border-radius: 4px; height: 8px; overflow: hidden; }
        .an-rating-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #fbbf24, #22c55e); transition: width .8s cubic-bezier(.34,1.3,.64,1); }

        /* Top service badge */
        .an-top-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #fbbf24, #22c55e);
          color: #1f2937; padding: 4px 12px; border-radius: 50px;
          font-size: .75rem; font-weight: 800;
        }
      `}</style>

      <div className="an-wrap">

        {/* ── Header row ── */}
        <div className={`an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"0ms", display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem", position:"relative", zIndex:1 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.375rem", color: "#f1f5f9", display:"flex", alignItems:"center", gap: 8 }}>
              <FaChartLine style={{ color:"#22c55e" }}/> Analytics
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: ".8rem", color: "#64748b" }}>
              Your performance, earnings & job breakdown
            </p>
          </div>
          <RangePill options={["1M","3M","6M","1Y"]} value={range} onChange={setRange}/>
        </div>

        {/* ── KPI Cards ── */}
        <div className="an-kpis">
          <KpiCard icon={<FaMoneyBillWave/>}  label="Total Earnings"      value={analytics.totalEarnings}    prefix="KSh " decimals={0} change={analytics.earningsChange} changeLabel="vs last period" delay={60}  accent="#22c55e"/>
          <KpiCard icon={<FaCheckCircle/>}    label="Jobs Completed"      value={analytics.done}             decimals={0}  change="+12"                                    changeLabel="vs last period" delay={120} accent="#16a34a"/>
          <KpiCard icon={<FaStar/>}           label="Avg Rating"          value={analytics.avgRating}        decimals={1}  suffix="★"  change="+0.2"                      changeLabel="since last month" delay={180} accent="#fbbf24"/>
          <KpiCard icon={<FaFire/>}           label="Completion Rate"     value={analytics.completionRate}   suffix="%"    decimals={0} change="+5"                        changeLabel="acceptance rate" delay={240} accent="#f59e0b"/>
        </div>

        {/* ── Main earnings area chart ── */}
        <div className={`an-panel an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"280ms", marginBottom:"1rem", position:"relative", zIndex:1 }}>
          <SectionHead
            icon={<FaChartLine/>}
            title="Earnings Over Time"
            sub={`KSh ${analytics.totalEarnings.toLocaleString()} lifetime · ${analytics.filteredEarnings.length} months shown`}
            action={
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className="an-top-badge"><FaTrophy size={10}/> Top: {analytics.topService}</div>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.filteredEarnings} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11, fontFamily:"Outfit" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#64748b", fontSize:10, fontFamily:"Outfit" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v}/>
              <Tooltip content={<ChartTooltip prefix="KSh "/>}/>
              <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} activeDot={{ r:5, fill:"#22c55e", strokeWidth:0 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Middle row: Bar chart + Pie ── */}
        <div className="an-panels">

          {/* Jobs by day of week */}
          <div className={`an-panel an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"340ms" }}>
            <SectionHead icon={<FaChartBar/>} title="Busiest Days" sub="Jobs completed by day"/>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.displayDayData} margin={{ top:5, right:5, left:-20, bottom:0 }} barSize={22}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#fbbf24"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={true} vertical={false}/>
                <XAxis dataKey="day" tick={{ fill:"#64748b", fontSize:11, fontFamily:"Outfit" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#64748b", fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip suffix=" jobs"/>}/>
                <Bar dataKey="jobs" fill="url(#barGrad)" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service breakdown pie */}
          <div className={`an-panel an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"400ms" }}>
            <SectionHead icon={<FaChartPie/>} title="Services Breakdown" sub="Jobs by service type"/>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={analytics.serviceData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {analytics.serviceData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix=" jobs"/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {analytics.serviceData.map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                    <span style={{ flex:1, fontSize:".78rem", color:"#94a3b8", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
                    <span style={{ fontSize:".78rem", fontWeight:800, color:"#f1f5f9" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Rating dist + Jobs vs earnings dual ── */}
        <div className="an-panels" style={{ marginTop:"1rem" }}>

          {/* Rating distribution */}
          <div className={`an-panel an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"460ms" }}>
            <SectionHead icon={<FaStar/>} title="Rating Distribution" sub={`Avg: ${analytics.avgRating} ★ from ${jobs.filter(j=>j.rating).length} reviews`}/>
            <div style={{ marginTop: ".25rem" }}>
              {analytics.ratingBuckets.map((b, i) => {
                const max = Math.max(...analytics.ratingBuckets.map(x=>x.count), 1);
                const pct = (b.count / max) * 100;
                return (
                  <div key={i} className="an-rating-row">
                    <span style={{ fontSize:".78rem", color:"#fbbf24", fontWeight:700, width:28 }}>{b.label}</span>
                    <div className="an-rating-bar-bg">
                      <div className="an-rating-bar-fill" style={{ width: show ? `${pct}%` : "0%" }}/>
                    </div>
                    <span style={{ fontSize:".72rem", color:"#64748b", fontWeight:700, width:18, textAlign:"right" }}>{b.count}</span>
                  </div>
                );
              })}
            </div>
            {/* Overall rating big number */}
            <div style={{ marginTop:"1rem", textAlign:"center", background:"rgba(34,197,94,.07)", borderRadius:12, padding:".75rem" }}>
              <div style={{ fontSize:"2.5rem", fontWeight:900, color:"#22c55e", lineHeight:1 }}>{analytics.avgRating}</div>
              <div style={{ fontSize:".72rem", color:"#64748b", fontWeight:600, marginTop:3 }}>Average rating</div>
              <div style={{ color:"#fbbf24", fontSize:"1rem", marginTop:4, letterSpacing:3 }}>
                {"★".repeat(Math.round(parseFloat(analytics.avgRating)))}{"☆".repeat(5-Math.round(parseFloat(analytics.avgRating)))}
              </div>
            </div>
          </div>

          {/* Jobs count over time */}
          <div className={`an-panel an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"520ms" }}>
            <SectionHead icon={<FaBriefcase/>} title="Jobs Over Time" sub="Number of completed jobs per month"/>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.filteredEarnings} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="jobCountGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11, fontFamily:"Outfit" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#64748b", fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<ChartTooltip suffix=" jobs"/>}/>
                <Area type="monotone" dataKey="jobs" stroke="#fbbf24" strokeWidth={2.5} fill="url(#jobCountGrad)" dot={false} activeDot={{ r:5, fill:"#fbbf24", strokeWidth:0 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ── Footer insight strip ── */}
        <div className={`an-enter ${show ? "an-show" : ""}`} style={{ "--delay":"580ms", display:"flex", gap:"1rem", marginTop:"1rem", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          {[
            { icon:"🏆", label:"Top Service",     val: analytics.topService,                    color:"#fbbf24" },
            { icon:"📈", label:"Completion Rate", val: `${analytics.completionRate}%`,           color:"#22c55e" },
            { icon:"⚡", label:"Active Jobs",     val: analytics.active,                         color:"#16a34a" },
            { icon:"💼", label:"Total Jobs",       val: jobs.length,                              color:"#86efac" },
          ].map((item, i) => (
            <div key={i} style={{
              flex:1, minWidth:120,
              background:"linear-gradient(135deg,#141f2e,#0f1824)",
              border:"1px solid rgba(255,255,255,.06)",
              borderRadius:14, padding:".875rem",
              display:"flex", alignItems:"center", gap:10,
              transition:"border-color .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(34,197,94,.25)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}
            >
              <span style={{ fontSize:"1.25rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontSize:".68rem", color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>{item.label}</div>
                <div style={{ fontSize:"1.125rem", fontWeight:900, color:item.color }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

export default AnalyticsTab;
