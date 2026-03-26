import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
const MEDIA_URL    = process.env.REACT_APP_MEDIA_URL    || 'https://staging.kaakazini.com';

const CATEGORIES = [
  { label:'All',        icon:'fas fa-th' },
  { label:'Plumbing',   icon:'fas fa-tint' },
  { label:'Electrical', icon:'fas fa-bolt' },
  { label:'Carpentry',  icon:'fas fa-tools' },
  { label:'Painting',   icon:'fas fa-paint-brush' },
  { label:'Tiling',     icon:'fas fa-border-all' },
  { label:'Masonry',    icon:'fas fa-grip-horizontal' },
  { label:'Metalwork',  icon:'fas fa-hammer' },
  { label:'Textile',    icon:'fas fa-cut' },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_URL}${path}`;
};

// ─── Resolve the best cover image from a craftsman object ─────────────────────
// Priority: first gallery image → service-level image → service_image field
const getCoverImage = (s) =>
  getImageUrl(
    s.gallery_images?.[0]?.image_url ||
    s.services?.[0]?.image_url       ||
    s.services?.[0]?.image           ||
    s.service_image                   ||
    null
  );

const PLACEHOLDER = 'https://placehold.co/400x260/e8f5e9/198754?text=KaaKazini';

function StarRating({ rating }) {
  const n = Number(rating) || 0;
  const full = Math.floor(n), half = n % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="kk-stars" aria-label={`${n} of 5 stars`}>
      {[...Array(full)].map((_,i)  => <i key={`f${i}`} className="fas fa-star"/>)}
      {half && <i className="fas fa-star-half-alt"/>}
      {[...Array(empty)].map((_,i) => <i key={`e${i}`} className="far fa-star"/>)}
    </span>
  );
}

function SkeletonCard() {
  const s = {background:'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'};
  return (
    <div className="col">
      <div style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #ede9e2',opacity:.7}}>
        <div style={{height:200,...s}}/>
        <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:44,height:44,borderRadius:'50%',flexShrink:0,...s}}/>
            <div style={{flex:1}}>
              <div style={{height:11,width:'65%',borderRadius:6,...s}}/>
              <div style={{height:9,width:'40%',borderRadius:6,marginTop:6,...s}}/>
            </div>
          </div>
          <div style={{height:9,borderRadius:6,...s}}/>
          <div style={{height:36,borderRadius:10,marginTop:4,...s}}/>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [showTop,  setShowTop]  = useState(false);

  useEffect(() => { AOS.init({ duration:750, once:true, offset:50 }); }, []);
  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/public-craftsman/`)
      .then(r => {
        const data = (r.data || []).filter(s => s.status === 'approved' && s.primary_service);
        setServices(data); setFiltered(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let out = services;
    if (active !== 'All') out = out.filter(s => s.primary_service === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.full_name?.toLowerCase().includes(q) ||
        s.primary_service?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(out);
  }, [active, search, services]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes floatUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(255,215,0,.9)} 70%{box-shadow:0 0 0 16px rgba(255,215,0,0)} 100%{box-shadow:0 0 0 0 rgba(255,215,0,0)} }
        @keyframes pulseDot  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }

        :root {
          --green:   #198754;
          --green-d: #145a32;
          --green-l: #e8f5e9;
          --gold:    #FFD700;
          --gold-d:  #e6ac00;
          --gold-l:  #fffbea;
          --bg:      #faf9f6;
          --white:   #ffffff;
          --text:    #1a1a2e;
          --muted:   #6c757d;
          --border:  #ede9e2;
        }
        * { box-sizing:border-box; }
        body { background:var(--bg); font-family:'DM Sans',sans-serif; color:var(--text); }
        .kk-stars { color:var(--gold); display:inline-flex; gap:2px; font-size:.82rem; }

        .kk-btn-gold {
          display:inline-flex; align-items:center; gap:7px;
          background:var(--gold); color:#1a1a2e; border:none; border-radius:12px;
          padding:14px 28px; font-weight:700; font-size:.93rem; text-decoration:none;
          cursor:pointer; transition:all .2s; box-shadow:0 4px 18px rgba(255,215,0,.35);
          font-family:'DM Sans',sans-serif;
        }
        .kk-btn-gold:hover { background:var(--gold-d); color:#1a1a2e; transform:translateY(-2px); box-shadow:0 8px 28px rgba(255,215,0,.45); }
        .kk-btn-hire-sm {
          display:block; text-align:center; background:var(--green); color:#fff;
          border:none; border-radius:10px; padding:11px 0; font-weight:700; font-size:.86rem;
          text-decoration:none; cursor:pointer; transition:all .18s; margin-top:auto;
          font-family:'DM Sans',sans-serif;
        }
        .kk-btn-hire-sm:hover { background:var(--green-d); color:#fff; transform:translateY(-1px); }
        .kk-btn-muted { background:#e4e4e4!important; color:#aaa!important; cursor:default!important; transform:none!important; }

        .kk-section-label {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--green-l); border:1.5px solid #c8e6c9; border-radius:50px;
          padding:5px 16px; font-size:.72rem; font-weight:700; color:var(--green);
          letter-spacing:.07em; text-transform:uppercase; margin-bottom:12px;
        }
        .kk-section-title { font-family:'Playfair Display',serif; font-size:clamp(1.7rem,3.5vw,2.4rem); font-weight:800; color:var(--text); margin:0 0 10px; }
        .kk-section-sub   { font-size:.95rem; color:var(--muted); line-height:1.75; margin:0; }

        .kk-card {
          background:#fff; border-radius:14px; overflow:hidden;
          box-shadow:0 2px 16px rgba(0,0,0,.07);
          transition:transform .25s,box-shadow .25s,border-color .2s;
          display:flex; flex-direction:column; height:100%;
          border:1.5px solid var(--border); position:relative;
        }
        .kk-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(to right,var(--green),var(--gold));
          transform:scaleX(0); transform-origin:left; transition:transform .3s; z-index:1;
        }
        .kk-card:hover { transform:translateY(-5px); box-shadow:0 12px 36px rgba(0,0,0,.12); border-color:#c8e6c9; }
        .kk-card:hover::before { transform:scaleX(1); }
        .kk-card-cover { position:relative; height:200px; overflow:hidden; flex-shrink:0; }
        .kk-card-img   { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .kk-card:hover .kk-card-img { transform:scale(1.06); }
        .kk-badge-trade { position:absolute; top:10px; left:10px; background:rgba(25,135,84,.88); color:#fff; border-radius:20px; padding:3px 11px; font-size:.7rem; font-weight:700; backdrop-filter:blur(4px); }
        .kk-badge-top   { position:absolute; top:10px; right:10px; background:rgba(255,215,0,.93); color:#1a1a2e; border-radius:20px; padding:3px 10px; font-size:.67rem; font-weight:800; }
        .kk-card-body   { padding:16px; display:flex; flex-direction:column; gap:9px; flex:1; }
        .kk-card-profile { display:flex; align-items:center; gap:10px; }
        .kk-avatar    { width:44px; height:44px; border-radius:50%; object-fit:cover; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-avatar-fb { width:44px; height:44px; border-radius:50%; background:var(--green-l); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:1.1rem; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-card-name { font-size:.93rem; font-weight:700; color:var(--text); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .kk-card-loc  { font-size:.74rem; color:var(--green); display:block; margin-top:1px; }
        .kk-card-desc { font-size:.78rem; color:var(--muted); line-height:1.55; margin:0; flex:1; }

        .sv-hero {
          background:linear-gradient(135deg,#0d3d21 0%,#145a32 45%,#198754 100%);
          padding:90px 0 64px; position:relative; overflow:hidden;
        }
        .sv-hero-pattern {
          position:absolute; inset:0; opacity:.07;
          background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .sv-hero-glow {
          position:absolute; width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle,rgba(255,215,0,.1) 0%,transparent 70%);
          right:-150px; top:-180px; pointer-events:none;
        }
        .sv-hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.2);
          border-radius:50px; padding:6px 16px; font-size:.75rem; font-weight:700;
          color:rgba(255,255,255,.9); letter-spacing:.07em; text-transform:uppercase; margin-bottom:18px;
        }
        .sv-eyebrow-dot { width:7px; height:7px; border-radius:50%; background:var(--gold); animation:pulseDot 1.6s infinite; display:inline-block; }
        .sv-hero-title  { font-family:'Playfair Display',serif; font-size:clamp(2rem,4.5vw,3rem); font-weight:800; color:#fff; line-height:1.15; margin:0 0 14px; }
        .sv-hero-title em { font-style:normal; color:var(--gold); }
        .sv-hero-sub    { font-size:1rem; color:rgba(255,255,255,.8); line-height:1.8; max-width:540px; margin:0 0 28px; }
        .sv-hero-btns   { display:flex; gap:14px; flex-wrap:wrap; }
        .sv-btn-outline {
          display:inline-flex; align-items:center; gap:7px;
          background:transparent; color:#fff; border:2px solid rgba(255,255,255,.7);
          border-radius:12px; padding:12px 24px; font-weight:700; font-size:.93rem;
          text-decoration:none; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .sv-btn-outline:hover { background:rgba(255,255,255,.15); color:#fff; border-color:#fff; transform:translateY(-2px); }
        .sv-stat-pill {
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          border-radius:50px; padding:7px 16px;
          display:inline-flex; align-items:center; gap:8px;
          font-size:.78rem; font-weight:600; color:rgba(255,255,255,.85);
        }
        .sv-stat-pill i { color:var(--gold); }

        .sv-filter {
          background:var(--white); padding:16px 0;
          position:sticky; top:0; z-index:200;
          box-shadow:0 2px 16px rgba(0,0,0,.07);
          border-bottom:2px solid var(--green-l);
        }
        .sv-cats { display:flex; gap:8px; flex-wrap:wrap; flex:1; }
        .sv-cat-btn {
          display:inline-flex; align-items:center; gap:6px;
          border:1.5px solid var(--border); background:var(--white); color:var(--muted);
          border-radius:50px; padding:7px 16px; font-size:.78rem; font-weight:600;
          cursor:pointer; transition:all .18s; white-space:nowrap; font-family:'DM Sans',sans-serif;
        }
        .sv-cat-btn i { font-size:.72rem; }
        .sv-cat-btn:hover  { border-color:var(--green); color:var(--green); background:var(--green-l); }
        .sv-cat-btn.active { background:var(--green); border-color:var(--green); color:#fff; box-shadow:0 4px 12px rgba(25,135,84,.28); }
        .sv-search-wrap { position:relative; min-width:240px; }
        .sv-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:.85rem; pointer-events:none; }
        .sv-search {
          border:1.5px solid var(--border); border-radius:50px;
          padding:9px 14px 9px 38px; font-size:.85rem; width:100%;
          outline:none; transition:border-color .18s,box-shadow .18s;
          background:var(--white); font-family:'DM Sans',sans-serif;
        }
        .sv-search:focus { border-color:var(--green); box-shadow:0 0 0 3px rgba(25,135,84,.1); }

        .sv-section { background:var(--bg); padding:52px 0 72px; }
        .sv-results-bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:28px; }
        .sv-results-tag { background:var(--green-l); color:var(--green); border:1px solid #a5d6a7; border-radius:20px; padding:5px 18px; font-size:.84rem; font-weight:600; }
        .sv-clear-btn { background:var(--white); border:1.5px solid #e0e0e0; color:var(--muted); border-radius:20px; padding:5px 16px; font-size:.82rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .15s; font-family:'DM Sans',sans-serif; }
        .sv-clear-btn:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }

        .sv-hiw { background:var(--white); padding:80px 0; border-top:1px solid var(--border); }
        .sv-hiw-steps { display:flex; justify-content:space-between; align-items:flex-start; position:relative; gap:0; }
        .sv-hiw-steps::before { content:''; position:absolute; top:52px; left:calc(12.5% + 10px); right:calc(12.5% + 10px); height:2px; background:repeating-linear-gradient(to right,#d4d4d4 0,#d4d4d4 10px,transparent 10px,transparent 20px); }
        .sv-hiw-item { flex:1; text-align:center; padding:0 12px; position:relative; z-index:1; }
        .sv-hiw-icon-wrap { position:relative; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px; }
        .sv-hiw-circle { width:104px; height:104px; border-radius:50%; background:#fff; border:3px solid var(--gold); display:flex; align-items:center; justify-content:center; font-size:2.2rem; color:#1a1a2e; box-shadow:0 8px 28px rgba(255,215,0,.22); transition:transform .3s,box-shadow .3s; }
        .sv-hiw-item:hover .sv-hiw-circle { transform:translateY(-5px); box-shadow:0 16px 40px rgba(255,215,0,.42); }
        .sv-hiw-num { position:absolute; top:-6px; right:-6px; width:28px; height:28px; border-radius:50%; background:var(--gold); color:#1a1a2e; display:flex; align-items:center; justify-content:center; font-size:.78rem; font-weight:800; border:2px solid #fff; animation:pulseRing 2.2s ease-in-out infinite; }
        .sv-hiw-title { font-weight:700; color:var(--text); font-size:1rem; margin:0 0 8px; }
        .sv-hiw-body  { font-size:.86rem; color:var(--muted); line-height:1.7; max-width:200px; margin:0 auto; }
        @media(max-width:768px){ .sv-hiw-steps { flex-direction:column; align-items:center; gap:40px; } .sv-hiw-steps::before { display:none; } .sv-hiw-item { max-width:280px; } }

        .sv-stats-section { background:var(--white); padding:72px 0; border-top:1px solid var(--border); }
        .sv-stat-circle { width:clamp(140px,17vw,168px); height:clamp(140px,17vw,168px); border-radius:50%; background:#fff; border:4px solid var(--gold); box-shadow:0 6px 28px rgba(0,0,0,.08); display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 auto; cursor:default; transition:transform .3s,box-shadow .3s; }
        .sv-stat-circle:hover { transform:translateY(-8px); box-shadow:0 18px 44px rgba(255,215,0,.28); }
        .sv-stat-icon  { font-size:1.5rem; color:var(--green); margin-bottom:4px; }
        .sv-stat-value { font-family:'Playfair Display',serif; font-size:1.55rem; font-weight:800; color:var(--gold); margin:0; line-height:1; }
        .sv-stat-label { font-size:.72rem; font-weight:700; color:var(--muted); margin:5px 0 0; text-transform:uppercase; letter-spacing:.05em; }

        .sv-cta { background:var(--bg); padding:72px 0; }
        .sv-cta-inner { background:var(--white); border-radius:20px; padding:56px 48px; position:relative; overflow:hidden; border:2px solid var(--green-l); box-shadow:0 8px 40px rgba(25,135,84,.08); }
        .sv-cta-inner::after { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(to right,var(--green),var(--gold)); border-radius:20px 20px 0 0; }
        .sv-cta-title { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,3.5vw,2.3rem); font-weight:800; color:var(--text); line-height:1.2; margin:0 0 14px; }
        .sv-cta-sub   { font-size:1rem; color:var(--muted); line-height:1.8; max-width:500px; }
        .sv-cta-img   { width:100%; max-width:380px; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,.1); object-fit:cover; height:260px; display:block; border:3px solid var(--green-l); }

        .sv-empty { text-align:center; padding:72px 24px; background:var(--white); border-radius:16px; border:1.5px solid var(--border); }
        .sv-empty-icon { font-size:3.5rem; display:block; margin-bottom:16px; }
        .sv-empty h5   { font-family:'Playfair Display',serif; font-size:1.25rem; color:var(--text); font-weight:700; margin-bottom:8px; }
        .sv-empty p    { color:var(--muted); font-size:.93rem; }

        .sv-footer { background:#1a1a2e; color:#bbb; padding:52px 0 26px; font-family:'DM Sans',sans-serif; }
        .sv-footer h5 { color:#fff; font-weight:700; font-size:.8rem; letter-spacing:.08em; text-transform:uppercase; margin-bottom:14px; }
        .sv-footer a  { color:#bbb; text-decoration:none; font-size:.85rem; transition:color .15s; }
        .sv-footer a:hover { color:var(--gold); }
        .sv-footer p  { font-size:.85rem; margin-bottom:6px; }
        .sv-footer-hr { border-color:rgba(255,255,255,.08); margin:26px 0 18px; }
        .sv-social a  { font-size:1rem; color:#bbb; margin-right:14px; display:inline-block; transition:color .15s,transform .15s; }
        .sv-social a:hover { color:var(--gold); transform:translateY(-2px); }

        .kk-back-top { position:fixed; bottom:24px; right:24px; width:44px; height:44px; border-radius:50%; background:var(--green); color:#fff; border:none; font-size:.9rem; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(25,135,84,.4); cursor:pointer; transition:all .2s; z-index:9999; opacity:0; pointer-events:none; }
        .kk-back-top.on { opacity:1; pointer-events:auto; }
        .kk-back-top:hover { background:var(--green-d); transform:translateY(-2px); }

        @media(max-width:768px){ .sv-hero { padding:70px 0 52px; } .sv-cta-inner { padding:36px 24px; } .sv-hero-btns { flex-direction:column; align-items:flex-start; } }
        @media(max-width:576px){ .sv-cats { gap:6px; } .sv-filter .d-flex { flex-direction:column; align-items:stretch; } .sv-search-wrap { width:100%; } }
      `}</style>

      <section className="sv-hero" id="top">
        <div className="sv-hero-pattern" aria-hidden="true"/>
        <div className="sv-hero-glow"    aria-hidden="true"/>
        <div className="container">
          <div style={{position:'relative',zIndex:2,maxWidth:640,animation:'floatUp .9s ease both'}}>
            <div className="sv-hero-eyebrow">
              <span className="sv-eyebrow-dot" aria-hidden="true"/>
              Verified Craftsmen · 40+ Kenya Counties
            </div>
            <h1 className="sv-hero-title">
              All Trades. Every County.<br/><em>One Platform.</em>
            </h1>
            <p className="sv-hero-sub">
              Find verified plumbers, electricians, carpenters, tailors and more — across 40+ counties in Kenya. Browse real portfolios, read client reviews, and hire directly. No middlemen.
            </p>
            <div className="sv-hero-btns">
              <Link to="/craftsmen" className="kk-btn-gold">
                <i className="fas fa-search"/>Find a Craftsman
              </Link>
              <Link to="/signup" className="sv-btn-outline">
                <i className="fas fa-user-plus"/>Join as Craftsman — Free
              </Link>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              {[
                {icon:'fas fa-hard-hat',       label:'100+ Craftsmen'},
                {icon:'fas fa-map-marker-alt',  label:'40+ Counties'},
                {icon:'fas fa-shield-alt',      label:'All Verified'},
                {icon:'fas fa-star',            label:'Rated & Reviewed'},
              ].map((s,i) => (
                <span className="sv-stat-pill" key={i}>
                  <i className={s.icon} aria-hidden="true"/>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sv-filter" role="navigation" aria-label="Filter by trade">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="sv-cats" role="group" aria-label="Trade filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  className={`sv-cat-btn ${active === cat.label ? 'active' : ''}`}
                  onClick={() => setActive(cat.label)}
                  aria-pressed={active === cat.label}
                >
                  <i className={cat.icon} aria-hidden="true"/>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="sv-search-wrap">
              <i className="fas fa-search sv-search-icon" aria-hidden="true"/>
              <input
                className="sv-search"
                placeholder="Search name, trade, location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search craftsmen"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="sv-section" aria-label="Craftsmen listings" aria-live="polite">
        <div className="container">
          {!loading && (
            <div className="sv-results-bar">
              <span className="sv-results-tag">
                <strong>{filtered.length}</strong> craftsman{filtered.length !== 1 ? 'en' : ''} available in Kenya
                {active !== 'All' && <> · <strong>{active}</strong></>}
                {search && <> · &ldquo;{search}&rdquo;</>}
              </span>
              {(active !== 'All' || search) && (
                <button className="sv-clear-btn" onClick={() => { setActive('All'); setSearch(''); }}>
                  <i className="fas fa-times" aria-hidden="true"/> Clear filters
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {[...Array(8)].map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sv-empty">
              <span className="sv-empty-icon" role="img" aria-label="No results">🔍</span>
              <h5>No craftsmen found</h5>
              <p>Try a different category or clear your search.</p>
              <button
                onClick={() => { setActive('All'); setSearch(''); }}
                style={{marginTop:16,background:'var(--green)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}
              >
                Show All Craftsmen
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {filtered.map((s, i) => {
                // ✅ FIXED: reads gallery_images[0].image_url (real backend field)
                const cover  = getCoverImage(s);
                const avatar = getImageUrl(s.profile_url || s.profile || s.profile_image || s.avatar);
                const rating = Number(s.average_rating) || 0;
                const id     = s.slug || s.id || '';
                const name   = s.full_name || s.name || 'Craftsman';
                return (
                  <div className="col" key={s.id || i} data-aos="fade-up" data-aos-delay={(i % 4) * 50}>
                    <div className="kk-card">
                      <div className="kk-card-cover">
                        <img
                          src={cover || PLACEHOLDER} alt={s.primary_service || 'Craftsman'}
                          className="kk-card-img" loading="lazy"
                          onError={e => { e.target.src = PLACEHOLDER; }}
                        />
                        <span className="kk-badge-trade">{s.primary_service}</span>
                        {rating >= 4.5 && <span className="kk-badge-top">⭐ Top Rated</span>}
                      </div>
                      <div className="kk-card-body">
                        <div className="kk-card-profile">
                          {avatar
                            ? <img src={avatar} alt={name} className="kk-avatar" loading="lazy"
                                onError={e => { e.target.style.display='none'; }}/>
                            : <div className="kk-avatar-fb" aria-hidden="true"><i className="fas fa-hard-hat"/></div>
                          }
                          <div style={{minWidth:0}}>
                            <p className="kk-card-name">{name}</p>
                            {s.location && (
                              <span className="kk-card-loc">
                                <i className="fas fa-map-marker-alt me-1"/>{s.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {rating > 0 && (
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <StarRating rating={rating}/>
                            <span style={{fontSize:'.75rem',color:'var(--muted)',fontWeight:600}}>{rating.toFixed(1)}</span>
                          </div>
                        )}
                        {s.description && (
                          <p className="kk-card-desc">
                            {s.description.length > 90 ? s.description.slice(0,90)+'…' : s.description}
                          </p>
                        )}
                        {id
                          ? <Link to={`/craftsmen/${id}`} className="kk-btn-hire-sm">
                              View Profile &amp; Hire <i className="fas fa-arrow-right ms-1"/>
                            </Link>
                          : <span className="kk-btn-hire-sm kk-btn-muted">Unavailable</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="sv-hiw" aria-label="How hiring works">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            {/* <div className="kk-section-label"><i className="fas fa-info-circle me-1"/>Simple Process</div> */}
            <h2 className="kk-section-title">How It Works</h2>
            <p className="kk-section-sub">Get the right craftsman for your job in 4 easy steps</p>
          </div>
          <div className="sv-hiw-steps">
            {[
              { n:1, icon:'fas fa-search',      title:'Search a Trade',     body:'Filter by trade category and county. Browse verified craftsmen with real ratings.' },
              { n:2, icon:'fas fa-user-circle', title:'View Their Profile', body:'Check portfolio photos, past client reviews, and direct contact details.' },
              { n:3, icon:'fas fa-hard-hat',    title:'Hire Them',          body:'Click Hire Now on their profile page. Agree on the job and price directly.' },
              { n:4, icon:'fas fa-star',        title:'Rate & Review',      body:'After the job, leave a review so other Kenyans can find the best craftsmen.' },
            ].map(({n,icon,title,body}) => (
              <div className="sv-hiw-item" key={n} data-aos="fade-up" data-aos-delay={n*90}>
                <div className="sv-hiw-icon-wrap">
                  <div className="sv-hiw-circle"><i className={icon}/></div>
                  <span className="sv-hiw-num">{n}</span>
                </div>
                <h3 className="sv-hiw-title">{title}</h3>
                <p className="sv-hiw-body">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5" data-aos="fade-up">
            <Link to="/craftsmen" className="kk-btn-gold" style={{borderRadius:12,padding:'14px 42px'}}>
              <i className="fas fa-search me-2"/>Start Browsing Craftsmen
            </Link>
          </div>
        </div>
      </section>

      <section className="sv-stats-section" aria-label="Platform stats">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="kk-section-title">Growing Kenya's Craft Economy</h2>
            <p className="kk-section-sub">Real numbers from real craftsmen and happy clients</p>
          </div>
          <div className="row justify-content-center g-4">
            {[
              {icon:'fas fa-hard-hat',       value:'100+', label:'Active Craftsmen'},
              {icon:'fas fa-clipboard-check',value:'50+',  label:'Jobs Completed'},
              {icon:'fas fa-smile',          value:'30+',  label:'Happy Clients'},
              {icon:'fas fa-tools',          value:'8+',   label:'Trades Available'},
            ].map((s,i) => (
              <div key={i} className="col-6 col-sm-3 text-center" data-aos="zoom-in" data-aos-delay={i*80}>
                <div className="sv-stat-circle">
                  <i className={`${s.icon} sv-stat-icon`} aria-hidden="true"/>
                  <h3 className="sv-stat-value">{s.value}</h3>
                  <p className="sv-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sv-cta" aria-label="Join as craftsman">
        <div className="container">
          <div className="sv-cta-inner" data-aos="fade-up">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                {/* <div className="kk-section-label mb-3"><i className="fas fa-hard-hat me-1"/>For Craftsmen</div> */}
                <h2 className="sv-cta-title">Are You a Skilled Craftsman?<br/>Get Hired on KaaKazini — Free</h2>
                <p className="sv-cta-sub">
                  Register your profile in minutes. Our team reviews and approves every craftsman before they go live. Once approved, clients across Kenya will find you, contact you, and hire you — directly.
                </p>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:28}}>
                  <Link to="/signup" className="kk-btn-gold" style={{borderRadius:11}}>
                    <i className="fas fa-user-plus me-1"/>Register Free
                  </Link>
                  <Link to="/craftsmen" style={{
                    display:'inline-flex',alignItems:'center',gap:7,
                    background:'transparent',color:'var(--green)',
                    border:'2px solid var(--green)',borderRadius:11,
                    padding:'12px 22px',fontWeight:700,fontSize:'.9rem',
                    textDecoration:'none',transition:'all .2s',fontFamily:"'DM Sans',sans-serif"
                  }}>
                    <i className="fas fa-search"/>Browse Craftsmen
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 text-center" data-aos="fade-left">
                <img
                  src="https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=700&q=80"
                  alt="Craftsman at work" className="sv-cta-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="sv-footer" role="contentinfo">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h5>Quick Links</h5>
              <ul className="list-unstyled" style={{lineHeight:'2.2'}}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/craftsmen">Browse Craftsmen</Link></li>
                <li><Link to="/signup">Become a Craftsman</Link></li>
                <li><Link to="/HireLogin">Hire a Craftsman</Link></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5>Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2" style={{color:'var(--gold)'}}/>Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2" style={{color:'var(--gold)'}}/>support@kaakazini.com</p>
              <p><i className="fas fa-phone me-2" style={{color:'var(--gold)'}}/>+254 700 000 000</p>
              <div className="sv-social mt-3">
                <h5>Follow Us</h5>
                {[['fab fa-facebook-f','Facebook'],['fab fa-twitter','Twitter'],['fab fa-instagram','Instagram'],['fab fa-linkedin-in','LinkedIn']].map(([icon,lbl]) => (
                  <a key={lbl} href="#" aria-label={lbl}><i className={icon}/></a>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <h5>Find Us</h5>
              <div style={{borderRadius:12,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.3)'}}>
                <iframe
                  title="KaaKazini — Kisumu"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%" height="200" style={{border:0,display:'block'}}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
          <hr className="sv-footer-hr"/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,fontSize:'.8rem'}}>
            <p style={{margin:0}}>© {new Date().getFullYear()} <strong style={{color:'#fff'}}>KaaKazini</strong>. All rights reserved.</p>
            <a href="#top" style={{color:'var(--gold)',fontWeight:600}}>Back to top <i className="fas fa-arrow-up ms-1"/></a>
          </div>
        </div>
      </footer>

      <button
        className={`kk-back-top ${showTop ? 'on' : ''}`}
        onClick={() => window.scrollTo({top:0,behavior:'smooth'})}
        aria-label="Back to top"
      >
        <i className="fas fa-arrow-up" aria-hidden="true"/>
      </button>
    </>
  );
}
