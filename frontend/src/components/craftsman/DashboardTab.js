import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  FaBriefcase, FaHardHat, FaStar, FaMoneyBillWave,
  FaArrowUp, FaArrowDown, FaFire, FaClock,
  FaCheckCircle, FaChartLine, FaMapMarkerAlt,
} from "react-icons/fa";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

// ─── Animated count-up number ──────────────────────────────────────────────
function CountUp({ value, duration = 1200, prefix = "", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const tick = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(target * ease);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

// ─── Sparkline bar chart (last 7 jobs earnings trend) ─────────────────────
function SparkBars({ values = [], color = "#22c55e" }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          background: i === values.length - 1 ? color : color + "55",
          height: `${Math.max((v / max) * 100, 8)}%`,
          transition: `height .6s cubic-bezier(.34,1.56,.64,1) ${i * 40}ms`,
        }}/>
      ))}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    completed:    { bg: "#d1fae5", color: "#065f46", label: "Completed",   dot: "#22c55e" },
    paid:         { bg: "#d1fae5", color: "#065f46", label: "Paid",        dot: "#22c55e" },
    inprogress:   { bg: "#fef3c7", color: "#92400e", label: "In Progress", dot: "#f59e0b" },
    accepted:     { bg: "#dbeafe", color: "#1e40af", label: "Accepted",    dot: "#3b82f6" },
    quoteapproved:{ bg: "#dbeafe", color: "#1e40af", label: "Approved",    dot: "#3b82f6" },
    pending:      { bg: "#f3f4f6", color: "#6b7280", label: "Pending",     dot: "#9ca3af" },
    assigned:     { bg: "#f3f4f6", color: "#6b7280", label: "Assigned",    dot: "#9ca3af" },
    rejected:     { bg: "#fee2e2", color: "#991b1b", label: "Rejected",    dot: "#ef4444" },
  }[(status||"").toLowerCase().replace(/[_\s]/g,"")] || { bg:"#f3f4f6", color:"#6b7280", label: status, dot:"#9ca3af" };

  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: 50,
      fontSize: ".72rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }}/>
      {cfg.label}
    </span>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#fbbf24" : "#e5e7eb", fontSize: ".8rem" }}>★</span>
      ))}
    </span>
  );
}

// ─── Main DashboardTab ─────────────────────────────────────────────────────
function DashboardTab({ craftsman = {}, jobs = [] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const norm = s => (s||"").toLowerCase().replace(/[_\s]/g,"");
    const done       = jobs.filter(j => ["completed","paid"].includes(norm(j.status)));
    const active     = jobs.filter(j => ["inprogress","accepted","quoteapproved","quotesubmitted"].includes(norm(j.status)));
    const pending    = jobs.filter(j => ["pending","assigned"].includes(norm(j.status)));
    const ratings    = jobs.map(j => j.rating).filter(r => r != null);
    const avgRating  = ratings.length ? (ratings.reduce((a,b) => a+b, 0)/ratings.length) : (craftsman.avg_rating || 0);
    const earnings   = done.reduce((s, j) => s + (j.payment || j.amount || j.budget || 0), 0);
    const thisMonth  = done.filter(j => {
      const d = new Date(j.completed_at || j.updated_at || 0);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    });
    const monthEarnings = thisMonth.reduce((s, j) => s + (j.payment || j.amount || j.budget || 0), 0);

    // Sparkline: last 8 weeks of earnings (dummy fallback if no dates)
    const sparkValues = done.length >= 2
      ? Array.from({length:8}, (_,i) => {
          const w = done.filter(j => {
            const d = new Date(j.completed_at || j.updated_at || 0);
            const weeksAgo = Math.floor((Date.now() - d) / (7*24*3600*1000));
            return weeksAgo === 7-i;
          });
          return w.reduce((s,j) => s + (j.payment || j.amount || j.budget || 0), 0);
        })
      : [1200,2400,1800,3200,2800,4100,3600,monthEarnings||4800];

    return { done: done.length, active: active.length, pending: pending.length, avgRating: parseFloat(avgRating).toFixed(1), earnings, monthEarnings, sparkValues, recentJobs: [...jobs].slice(0,5) };
  }, [jobs, craftsman]);

  const profileUrl = getFullImageUrl(craftsman.profile_url);
  const greeting   = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');

        .db-wrap * { box-sizing: border-box; }
        .db-wrap { font-family: 'Outfit', sans-serif; color: #1f2937; }

        /* Staggered entrance */
        .db-enter { opacity: 0; transform: translateY(22px); transition: opacity .55s ease, transform .55s cubic-bezier(.34,1.3,.64,1); }
        .db-enter.show { opacity: 1; transform: translateY(0); }

        /* Hero */
        .db-hero {
          background: linear-gradient(135deg, #fbbf24 0%, #22c55e 100%);
          border-radius: 20px; padding: 2rem 2.5rem;
          display: flex; align-items: center; gap: 1.5rem;
          position: relative; overflow: hidden; margin-bottom: 1.75rem;
        }
        .db-hero::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px; border-radius: 50%;
          background: rgba(255,255,255,.12);
        }
        .db-hero::after {
          content: ''; position: absolute; bottom: -60px; right: 80px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(255,255,255,.08);
        }
        .db-hero-avatar {
          width: 72px; height: 72px; border-radius: 18px;
          border: 3px solid rgba(255,255,255,.6);
          object-fit: cover; flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
        }
        .db-hero-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 18px;
          background: rgba(255,255,255,.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; flex-shrink: 0;
          border: 3px solid rgba(255,255,255,.5);
        }
        .db-hero-text { position: relative; z-index: 1; }
        .db-hero-greeting { font-size: .875rem; font-weight: 600; color: rgba(31,41,55,.75); margin: 0; }
        .db-hero-name { font-size: 1.75rem; font-weight: 900; color: #1f2937; margin: 0; line-height: 1.15; }
        .db-hero-meta { margin-top: .375rem; display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
        .db-hero-badge {
          background: rgba(255,255,255,.35); color: #1f2937;
          padding: 3px 12px; border-radius: 50px; font-size: .78rem; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
          backdrop-filter: blur(4px);
        }

        /* Stat cards grid */
        .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.75rem; }

        .db-stat {
          background: white; border-radius: 18px;
          padding: 1.5rem 1.5rem 1.25rem;
          border: 2px solid #f3f4f6;
          box-shadow: 0 4px 20px rgba(0,0,0,.04);
          position: relative; overflow: hidden;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          cursor: default;
        }
        .db-stat:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.09); border-color: #d1d5db; }
        .db-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 18px 18px 0 0;
        }
        .db-stat.green::before  { background: linear-gradient(90deg, #fbbf24, #22c55e); }
        .db-stat.amber::before  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .db-stat.blue::before   { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
        .db-stat.teal::before   { background: linear-gradient(90deg, #22c55e, #14b8a6); }

        .db-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; margin-bottom: .875rem; flex-shrink: 0;
        }
        .db-stat-icon.green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #16a34a; }
        .db-stat-icon.amber { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #d97706; }
        .db-stat-icon.blue  { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #2563eb; }
        .db-stat-icon.teal  { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); color: #0f766e; }

        .db-stat-label { font-size: .72rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .8px; margin-bottom: .25rem; }
        .db-stat-value { font-size: 2rem; font-weight: 900; color: #111827; line-height: 1; margin-bottom: .25rem; }
        .db-stat-sub   { font-size: .78rem; color: #6b7280; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: .25rem; }
        .db-stat-up   { color: #16a34a; display: inline-flex; align-items: center; gap: 3px; font-weight: 700; }
        .db-stat-down { color: #ef4444; display: inline-flex; align-items: center; gap: 3px; font-weight: 700; }

        /* Two column bottom section */
        .db-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 768px) { .db-bottom { grid-template-columns: 1fr; } }

        /* Panel */
        .db-panel {
          background: white; border-radius: 18px;
          border: 2px solid #f3f4f6;
          box-shadow: 0 4px 20px rgba(0,0,0,.04);
          overflow: hidden;
        }
        .db-panel-head {
          padding: 1.125rem 1.5rem;
          border-bottom: 2px solid #f9fafb;
          display: flex; align-items: center; justify-content: space-between;
        }
        .db-panel-title { font-size: .78rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: .8px; display: flex; align-items: center; gap: 6px; }
        .db-panel-body  { padding: 1.25rem 1.5rem; }

        /* Earnings chart panel */
        .db-earnings-chart { padding: 1.25rem 1.5rem 1rem; }
        .db-earnings-hero {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 1rem;
        }
        .db-earnings-big { font-size: 2.25rem; font-weight: 900; color: #111827; line-height: 1; }
        .db-earnings-label { font-size: .75rem; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .db-earnings-tag {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          color: #15803d; border: 1.5px solid #86efac;
          padding: 4px 12px; border-radius: 50px;
          font-size: .78rem; font-weight: 800;
          display: inline-flex; align-items: center; gap: 4px;
        }

        /* Recent jobs */
        .db-job-row {
          display: flex; align-items: center; gap: .875rem;
          padding: .75rem 0; border-bottom: 1px solid #f9fafb;
          transition: background .15s;
        }
        .db-job-row:last-child { border-bottom: none; padding-bottom: 0; }
        .db-job-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          color: #16a34a; display: flex; align-items: center;
          justify-content: center; font-size: .875rem; flex-shrink: 0;
        }
        .db-job-name { font-weight: 700; font-size: .9rem; color: #1f2937; margin: 0; }
        .db-job-meta { font-size: .75rem; color: #9ca3af; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .db-job-amount { font-weight: 800; font-size: .9rem; color: #16a34a; white-space: nowrap; }

        /* Quick stats row */
        .db-quick { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: 1rem; }
        .db-quick-item {
          flex: 1; min-width: 80px; text-align: center;
          background: #f9fafb; border-radius: 12px; padding: .75rem .5rem;
          border: 1.5px solid #f3f4f6;
        }
        .db-quick-val   { font-size: 1.375rem; font-weight: 900; color: #111827; }
        .db-quick-label { font-size: .68rem; color: #9ca3af; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: .5px; }

        /* Tip banner */
        .db-tip {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fde68a; border-radius: 14px;
          padding: 1rem 1.25rem; margin-top: 1.25rem;
          display: flex; align-items: flex-start; gap: 10px;
          font-size: .875rem; color: #92400e; line-height: 1.5;
        }
        .db-tip-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: -1px; }

        /* Responsive */
        @media (max-width: 600px) {
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-hero  { padding: 1.5rem; }
          .db-hero-name { font-size: 1.35rem; }
          .db-stat-value { font-size: 1.625rem; }
        }
        @media (max-width: 400px) {
          .db-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-wrap">

        {/* ── Hero welcome banner ── */}
        <div className={`db-enter ${visible ? "show" : ""}`} style={{ transitionDelay: "0ms" }}>
          <div className="db-hero">
            {profileUrl
              ? <img src={profileUrl} className="db-hero-avatar" alt="Profile"/>
              : <div className="db-hero-avatar-placeholder">👷</div>
            }
            <div className="db-hero-text">
              <p className="db-hero-greeting">{greeting()},</p>
              <h2 className="db-hero-name">{craftsman.full_name || craftsman.name || "Craftsman"}</h2>
              <div className="db-hero-meta">
                {craftsman.profession && (
                  <span className="db-hero-badge"><FaHardHat size={11}/>{craftsman.profession}</span>
                )}
                {craftsman.location && (
                  <span className="db-hero-badge"><FaMapMarkerAlt size={11}/>{craftsman.location}</span>
                )}
                {craftsman.status === "approved" && (
                  <span className="db-hero-badge"><FaCheckCircle size={11}/> Verified</span>
                )}
                {stats.active > 0 && (
                  <span className="db-hero-badge"><FaFire size={11}/> {stats.active} active</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="db-stats">
          {[
            {
              delay: 80, color: "green",
              icon:  <FaCheckCircle/>,
              label: "Jobs Completed",
              value: stats.done,
              sub:   stats.pending > 0 ? `${stats.pending} pending` : "All caught up!",
              subColor: stats.pending > 0 ? "#f59e0b" : "#16a34a",
            },
            {
              delay: 140, color: "amber",
              icon:  <FaBriefcase/>,
              label: "Active Jobs",
              value: stats.active,
              sub:   stats.active > 0 ? "Keep going " : "No active jobs",
              subColor: "#6b7280",
            },
            {
              delay: 200, color: "blue",
              icon:  <FaStar/>,
              label: "Avg Rating",
              value: stats.avgRating,
              isRating: true,
              sub:   stats.avgRating >= 4.5 ? "Excellent!" : stats.avgRating >= 4 ? "Very Good" : "Keep improving",
              subColor: stats.avgRating >= 4.5 ? "#16a34a" : "#6b7280",
            },
            {
              delay: 260, color: "teal",
              icon:  <FaMoneyBillWave/>,
              label: "Total Earnings",
              value: stats.earnings,
              prefix: "KSh ",
              sub:   `KSh ${stats.monthEarnings.toLocaleString()} this month`,
              subColor: "#0f766e",
            },
          ].map((s, i) => (
            <div key={i}
              className={`db-enter db-stat ${s.color} ${visible ? "show" : ""}`}
              style={{ transitionDelay: `${s.delay}ms` }}>
              <div className={`db-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="db-stat-label">{s.label}</div>
              <div className="db-stat-value">
                {visible
                  ? s.isRating
                    ? <><CountUp value={s.value} decimals={1}/> <span style={{fontSize:"1rem", color:"#fbbf24"}}>★</span></>
                    : <CountUp value={s.value} prefix={s.prefix||""} duration={1400}/>
                  : s.prefix ? `${s.prefix}0` : "0"
                }
              </div>
              <div className="db-stat-sub" style={{ color: s.subColor }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom panels ── */}
        <div className={`db-bottom db-enter ${visible ? "show" : ""}`} style={{ transitionDelay: "320ms" }}>

          {/* Earnings chart panel */}
          <div className="db-panel">
            <div className="db-panel-head">
              <div className="db-panel-title"><FaChartLine size={11}/> Earnings Trend</div>
              <span style={{ fontSize: ".72rem", color: "#9ca3af", fontWeight: 600 }}>Last 8 weeks</span>
            </div>
            <div className="db-earnings-chart">
              <div className="db-earnings-hero">
                <div>
                  <div className="db-earnings-big">
                    {visible ? <CountUp value={stats.earnings} prefix="KSh " duration={1600}/> : "KSh 0"}
                  </div>
                  <div className="db-earnings-label">Total lifetime earnings</div>
                </div>
                <div className="db-earnings-tag">
                  <FaArrowUp size={10}/>
                  This month: KSh {stats.monthEarnings.toLocaleString()}
                </div>
              </div>
              <SparkBars values={stats.sparkValues} color="#22c55e"/>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: ".65rem", color: "#d1d5db" }}>8 wks ago</span>
                <span style={{ fontSize: ".65rem", color: "#d1d5db" }}>This week</span>
              </div>
            </div>

            {/* Quick counts */}
            <div style={{ padding: "0 1.5rem 1.25rem" }}>
              <div className="db-quick">
                <div className="db-quick-item">
                  <div className="db-quick-val" style={{ color: "#22c55e" }}>{stats.done}</div>
                  <div className="db-quick-label">Done</div>
                </div>
                <div className="db-quick-item">
                  <div className="db-quick-val" style={{ color: "#f59e0b" }}>{stats.active}</div>
                  <div className="db-quick-label">Active</div>
                </div>
                <div className="db-quick-item">
                  <div className="db-quick-val" style={{ color: "#9ca3af" }}>{stats.pending}</div>
                  <div className="db-quick-label">Pending</div>
                </div>
                <div className="db-quick-item">
                  <div className="db-quick-val" style={{ color: "#fbbf24" }}>{parseFloat(stats.avgRating).toFixed(1)}</div>
                  <div className="db-quick-label">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent jobs panel */}
          <div className="db-panel">
            <div className="db-panel-head">
              <div className="db-panel-title"><FaClock size={11}/> Recent Jobs</div>
              {stats.recentJobs.length > 0 && (
                <span style={{ fontSize: ".72rem", color: "#9ca3af", fontWeight: 600 }}>
                  {stats.recentJobs.length} shown
                </span>
              )}
            </div>
            <div className="db-panel-body" style={{ padding: "0.5rem 1.5rem 1.25rem" }}>
              {stats.recentJobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                  <FaBriefcase size={36} style={{ opacity: .15, display: "block", margin: "0 auto 1rem" }}/>
                  <p style={{ fontWeight: 700, color: "#374151", margin: 0 }}>No jobs yet</p>
                  <p style={{ fontSize: ".875rem", margin: ".25rem 0 0" }}>Jobs assigned to you will appear here</p>
                </div>
              ) : (
                stats.recentJobs.map((job, i) => (
                  <div key={job.id || i} className="db-job-row">
                    <div className="db-job-icon"><FaHardHat/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="db-job-name">{job.service || job.title || "Job"}</p>
                      <div className="db-job-meta">
                        {job.location && <><FaMapMarkerAlt size={10}/>{job.location}</>}
                        {job.rating && <><Stars rating={job.rating}/></>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <StatusPill status={job.status}/>
                      {(job.payment || job.amount || job.budget) ? (
                        <span className="db-job-amount">
                          KSh {(job.payment || job.amount || job.budget).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}

              {/* Tip */}
              {stats.done === 0 && (
                <div className="db-tip">
                  <span className="db-tip-icon"></span>
                  <span>
                    <strong>Complete your profile</strong> to start receiving job requests.
                    Add your services, skills, and work photos to get noticed by clients.
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default DashboardTab;
