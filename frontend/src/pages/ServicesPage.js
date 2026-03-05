import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
const MEDIA_URL    = process.env.REACT_APP_MEDIA_URL    || 'https://staging.kaakazini.com';

const CATEGORIES = [
  { label:'All',        icon:'bi-grid-fill' },
  { label:'Plumbing',   icon:'bi-droplet-fill' },
  { label:'Electrical', icon:'bi-lightning-charge-fill' },
  { label:'Carpentry',  icon:'bi-tools' },
  { label:'Painting',   icon:'bi-brush-fill' },
  { label:'Tiling',     icon:'bi-grid' },
  { label:'Masonry',    icon:'bi-bricks' },
  { label:'Metalwork',  icon:'bi-hammer' },
  { label:'Textile',    icon:'bi-scissors' },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_URL}${path}`;
};
const PLACEHOLDER = 'https://placehold.co/400x260/e8f5e9/198754?text=KaaKazini';

function StarRating({ rating }) {
  const n = Number(rating) || 0;
  const full = Math.floor(n), half = n % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="kk-stars" aria-label={`${n} of 5 stars`}>
      {[...Array(full)].map((_,i)  => <i key={`f${i}`} className="fas fa-star"/>)}
      {half                         && <i className="fas fa-star-half-alt"/>}
      {[...Array(empty)].map((_,i) => <i key={`e${i}`} className="far fa-star"/>)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="col">
      <div className="kk-card" style={{pointerEvents:'none',opacity:.7}}>
        <div className="kk-skel-cover"/>
        <div className="kk-cc-body" style={{gap:10}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div className="kk-skel-circle"/>
            <div style={{flex:1}}>
              <div className="kk-skel-line" style={{width:'65%'}}/>
              <div className="kk-skel-line" style={{width:'40%',marginTop:6}}/>
            </div>
          </div>
          <div className="kk-skel-line" style={{width:'90%'}}/>
          <div className="kk-skel-line" style={{width:'70%'}}/>
          <div className="kk-skel-btn"/>
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

  useEffect(() => { AOS.init({ duration: 750, once: true, offset: 50 }); }, []);

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive: true });
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
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(25,135,84,.5)} 70%{box-shadow:0 0 0 10px rgba(25,135,84,0)} 100%{box-shadow:0 0 0 0 rgba(25,135,84,0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.35)} }

         :root {
  --green:    #198754;
  --green-d:  #145a32;
  --green-l:  #e8f5e9;

  /* PURE YELLOW */
  --gold:     #FFD700;   /* pure yellow */
  --gold-l:   #FFFACD;   /* light yellow */

  --bg:       #f5f5f5;
  --white:    #ffffff;
  --text:     #1a1a2e;
  --muted:    #6c757d;
}


        body { background:var(--bg); color:var(--text); }
        .kk-stars { color:#e6ac00; display:inline-flex; gap:2px; font-size:.82rem; }

        /* ── Buttons (exact landing page) ── */
        .kk-btn-gold {
          display:inline-block; background:var(--gold); color:var(--text);
          border:none; border-radius:10px; padding:13px 28px;
          font-weight:700; font-size:.93rem; text-decoration:none; cursor:pointer;
          transition:all .2s; box-shadow:0 4px 14px rgba(230,172,0,.35);
        }
        .kk-btn-gold:hover { filter:brightness(.9); color:var(--text); transform:translateY(-2px); box-shadow:0 8px 22px rgba(230,172,0,.45); }
        .kk-btn-ghost {
          display:inline-block; background:transparent; color:var(--green);
          border:2px solid var(--green); border-radius:10px;
          padding:11px 26px; font-weight:700; font-size:.93rem;
          text-decoration:none; cursor:pointer; transition:all .2s;
        }
        .kk-btn-ghost:hover { background:var(--green); color:#fff; transform:translateY(-2px); }
        .kk-btn-green {
          display:block; text-align:center; background:var(--green); color:#fff;
          border:none; border-radius:10px; padding:11px 0;
          font-weight:700; font-size:.88rem; text-decoration:none; cursor:pointer;
          transition:background .18s,transform .14s; margin-top:auto;
        }
        .kk-btn-green:hover { background:var(--green-d); color:#fff; transform:translateY(-1px); }
        .kk-btn-muted { background:#e9e9e9 !important; color:var(--muted) !important; cursor:default !important; transform:none !important; }

        /* ── Cards (exact landing page) ── */
        .kk-card {
          background:var(--white); border-radius:var(--r); overflow:hidden;
          box-shadow:var(--shadow); transition:transform .25s,box-shadow .25s;
          display:flex; flex-direction:column; height:100%;
        }
        .kk-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-h); }

        /* ── Skeleton ── */
        .kk-skel-cover  { height:200px; width:100%; }
        .kk-skel-line   { height:11px; border-radius:6px; }
        .kk-skel-circle { width:44px; height:44px; border-radius:50%; flex-shrink:0; }
        .kk-skel-btn    { height:38px; border-radius:10px; }
        .kk-skel-cover,.kk-skel-line,.kk-skel-circle,.kk-skel-btn {
          background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size:200% 100%; animation:shimmer 1.4s infinite;
        }

        /* ══════════ HERO — amber/gold bg ══════════ */
        .sv-hero {
  background: #FFD700;  /* pure KaaKazini logo yellow */
  padding: 110px 0 72px;
  position: relative;
  overflow: hidden;
  border-bottom: none;
}

        /* white dot-grid texture */
        .sv-hero::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:radial-gradient(circle, rgba(255,255,255,.25) 1px, transparent 1px);
          background-size:28px 28px; opacity:1;
        }
        .sv-hero-glow {
          position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.18) 0%,transparent 70%);
          right:-100px; top:-100px; pointer-events:none;
        }
        .sv-hero-glow2 {
          position:absolute; width:380px; height:380px; border-radius:50%;
          background:radial-gradient(circle,rgba(245,122,0,.25) 0%,transparent 70%);
          left:-80px; bottom:-60px; pointer-events:none;
        }
        .sv-hero-content { position:relative; z-index:2; }

        .sv-hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.28); border:1.5px solid rgba(255,255,255,.55);
          backdrop-filter:blur(8px); border-radius:50px;
          padding:6px 16px; font-size:.78rem; font-weight:700; color:#7c3b00;
          margin-bottom:20px;
        }
        .sv-hero-badge .dot { width:8px; height:8px; border-radius:50%; background:#7c3b00; animation:livePulse 1.6s infinite; display:inline-block; }
        .sv-hero-title { font-size:clamp(2rem,4.5vw,3rem); font-weight:800; color:#1c0a00; line-height:1.15; margin:0 0 16px; }
        .sv-hero-title span { color:#fff; text-shadow:0 2px 8px rgba(0,0,0,.15); }
        .sv-hero-sub   { font-size:1.05rem; color:rgba(60,20,0,.75); line-height:1.8; margin:0 0 32px; max-width:480px; }
        .sv-hero-btns  { display:flex; gap:14px; flex-wrap:wrap; align-items:center; }

        /* stats strip */
        .sv-hero-stats {
          display:flex; gap:0; margin-top:40px;
          border:1.5px solid rgba(255,255,255,.45); border-radius:14px;
          background:rgba(255,255,255,.22); backdrop-filter:blur(8px);
          overflow:hidden; max-width:460px;
        }
        .sv-hs-item { flex:1; text-align:center; padding:15px 8px; border-right:1.5px solid rgba(255,255,255,.35); }
        .sv-hs-item:last-child { border-right:none; }
        .sv-hs-val  { font-size:1.25rem; font-weight:800; color:#fff; display:block; line-height:1; text-shadow:0 1px 4px rgba(0,0,0,.15); }
        .sv-hs-lbl  { font-size:.67rem; color:rgba(60,20,0,.65); font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-top:4px; display:block; }

        /* hero image */
        .sv-hero-img-col { position:relative; display:flex; justify-content:center; }
        .sv-hero-img-main {
          width:100%; max-width:430px; height:350px; object-fit:cover;
          border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.2); display:block;
          border:4px solid rgba(255,255,255,.5);
        }
        .sv-hero-float-card {
          position:absolute; bottom:-18px; left:0;
          background:var(--white); border-radius:14px; padding:13px 18px;
          box-shadow:0 8px 28px rgba(0,0,0,.14);
          display:flex; align-items:center; gap:12px; min-width:210px;
          border-left:4px solid var(--green);
        }
        .sv-hero-float-icon { width:38px; height:38px; border-radius:50%; background:var(--green-l); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:.95rem; flex-shrink:0; }
        .sv-hero-float-text { font-size:.78rem; font-weight:700; color:var(--text); line-height:1.3; display:block; }
        .sv-hero-float-sub  { font-size:.69rem; color:var(--muted); display:block; }

        /* ══════════ FILTER BAR — white ══════════ */
        .sv-filter {
          background:var(--white); padding:18px 0;
          position:sticky; top:0; z-index:200;
          box-shadow:0 2px 16px rgba(0,0,0,.07);
          border-bottom:2px solid var(--green-l);
        }
        .sv-cats { display:flex; gap:8px; flex-wrap:wrap; }
        .sv-cat-btn {
          display:inline-flex; align-items:center; gap:6px;
          border:1.5px solid #dee2e6; background:var(--white); color:var(--muted);
          border-radius:50px; padding:7px 16px; font-size:.8rem; font-weight:600;
          cursor:pointer; transition:all .18s; white-space:nowrap;
        }
        .sv-cat-btn i { font-size:.75rem; }
        .sv-cat-btn:hover { border-color:var(--green); color:var(--green); background:var(--green-l); }
        .sv-cat-btn.active { background:var(--green); border-color:var(--green); color:#fff; box-shadow:0 4px 12px rgba(25,135,84,.28); }
        .sv-search-wrap { position:relative; min-width:240px; }
        .sv-search-wrap i { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:.85rem; pointer-events:none; }
        .sv-search {
          border:1.5px solid #dee2e6; border-radius:50px; padding:9px 14px 9px 38px;
          font-size:.85rem; width:100%; outline:none; transition:border-color .18s,box-shadow .18s; background:var(--white);
        }
        .sv-search:focus { border-color:var(--green); box-shadow:0 0 0 3px rgba(25,135,84,.1); }

        /* ══════════ RESULTS ══════════ */
        .sv-section { background:var(--bg); padding:52px 0 72px; }
        .sv-results-bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:28px; }
        .sv-results-tag { background:var(--green-l); color:var(--green); border:1px solid #a5d6a7; border-radius:20px; padding:5px 18px; font-size:.84rem; font-weight:600; }
        .sv-clear-btn   { background:var(--white); border:1.5px solid #e0e0e0; color:var(--muted); border-radius:20px; padding:5px 16px; font-size:.82rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .15s; }
        .sv-clear-btn:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }

        /* ── Craftsman card body — exact landing page ── */
        .kk-cc-cover      { position:relative; height:200px; overflow:hidden; flex-shrink:0; }
        .kk-cc-cover-img  { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .kk-card:hover .kk-cc-cover-img { transform:scale(1.05); }
        .kk-badge-trade   { position:absolute; top:10px; left:10px; background:rgba(25,135,84,.88); color:#fff; border-radius:20px; padding:3px 11px; font-size:.7rem; font-weight:700; backdrop-filter:blur(4px); }
        .kk-badge-top     { position:absolute; top:10px; right:10px; background:rgba(230,172,0,.93); color:#1a1a2e; border-radius:20px; padding:3px 10px; font-size:.67rem; font-weight:800; }
        .kk-cc-body       { padding:16px; display:flex; flex-direction:column; gap:9px; flex:1; }
        .kk-cc-profile    { display:flex; align-items:center; gap:11px; }
        .kk-cc-avatar     { width:44px; height:44px; border-radius:50%; object-fit:cover; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-cc-avatar-fb  { width:44px; height:44px; border-radius:50%; background:var(--green-l); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:1.1rem; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-cc-name       { font-size:.93rem; font-weight:700; color:var(--text); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .kk-cc-loc        { font-size:.75rem; color:var(--green); text-decoration:none; display:block; margin-top:1px; }
        .kk-cc-loc:hover  { text-decoration:underline; }
        .kk-cc-rating-row { display:flex; align-items:center; gap:6px; }
        .kk-cc-rating-val { font-size:.75rem; color:var(--muted); font-weight:600; }
        .kk-cc-desc       { font-size:.8rem; color:var(--muted); line-height:1.55; margin:0; flex:1; }
        .kk-cc-cta        { margin-top:auto; }

        /* ══════════ EMPTY ══════════ */
        .kk-empty { text-align:center; padding:64px 20px; }
        .kk-empty-icon { font-size:3.5rem; margin-bottom:16px; display:block; }
        .kk-empty h5 { font-weight:700; color:var(--muted); }
        .kk-empty p  { color:var(--muted); font-size:.9rem; }

        /* ══════════ HOW IT WORKS — white ══════════ */
        .sv-hiw { background:var(--white); padding:72px 0; }
        .kk-hiw-steps { display:flex; justify-content:space-between; align-items:flex-start; position:relative; }
        .kk-hiw-steps::before { content:''; position:absolute; top:27px; left:15%; right:15%; height:2px; background:repeating-linear-gradient(to right,#dee2e6 0,#dee2e6 8px,transparent 8px,transparent 16px); }
        .kk-hiw-item { position:relative; z-index:1; text-align:center; flex:1; padding:0 16px; }
        .kk-hiw-item:hover .kk-hiw-icon { transform:scale(1.1); box-shadow:0 8px 24px rgba(25,135,84,.2); }
        .kk-hiw-icon-wrap { position:relative; display:inline-block; margin-bottom:16px; }
        .kk-hiw-num  { position:absolute; top:-10px; right:-10px; background:var(--gold); color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:800; border:2px solid #fff; z-index:2; animation:pulseRing 2.5s infinite; }
        .kk-hiw-icon { width:56px; height:56px; border-radius:50%; background:var(--white); color:var(--gold); display:flex; align-items:center; justify-content:center; font-size:1.7rem; box-shadow:0 4px 14px rgba(0,0,0,.09); transition:transform .3s,box-shadow .3s; }
        .kk-hiw-title{ font-weight:700; color:var(--text); font-size:.97rem; margin-bottom:6px; }
        .kk-hiw-body { font-size:.85rem; color:var(--muted); line-height:1.65; }
        @media(max-width:768px){ .kk-hiw-steps{flex-direction:column;align-items:center;gap:32px} .kk-hiw-steps::before{display:none} }

        /* ══════════ CTA — white card, accent top-line ══════════ */
        .sv-cta { background:var(--bg); padding:72px 0; }
        .sv-cta-inner {
          background:var(--white); border-radius:20px;
          padding:60px 52px; position:relative; overflow:hidden;
          border:2px solid var(--green-l);
          box-shadow:0 8px 40px rgba(25,135,84,.08);
        }
        /* green-to-gold accent top bar */
        .sv-cta-inner::after {
          content:''; position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(to right,var(--green),var(--gold));
          border-radius:20px 20px 0 0;
        }
        .sv-cta-title { font-size:clamp(1.6rem,3.5vw,2.3rem); font-weight:800; color:var(--text); line-height:1.2; }
        .sv-cta-sub   { font-size:1rem; color:var(--muted); line-height:1.8; margin-top:14px; max-width:500px; }
        .sv-cta-btns  { display:flex; gap:14px; flex-wrap:wrap; margin-top:28px; }
        .sv-cta-img   {
          width:100%; max-width:380px; border-radius:16px;
          box-shadow:0 12px 40px rgba(0,0,0,.1); object-fit:cover; height:260px; display:block;
          border:3px solid var(--green-l);
        }

        /* ══════════ BACK TO TOP ══════════ */
        .kk-back-top { position:fixed; bottom:24px; right:24px; width:44px; height:44px; border-radius:50%; background:var(--green); color:#fff; border:none; font-size:.9rem; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(25,135,84,.4); cursor:pointer; transition:all .2s; z-index:9999; opacity:0; pointer-events:none; }
        .kk-back-top.on { opacity:1; pointer-events:auto; }
        .kk-back-top:hover { background:var(--green-d); transform:translateY(-2px); }

        @media(max-width:768px){
          .sv-hero { padding:90px 0 64px; }
          .sv-hero-img-main { height:250px; }
          .sv-hero-float-card { display:none; }
          .sv-cta-inner { padding:36px 24px; }
          .sv-hero-stats { max-width:100%; }
        }
        @media(max-width:576px){
          .sv-hero-btns { flex-direction:column; align-items:flex-start; }
          .sv-cats { gap:6px; }
          .sv-cta-btns { flex-direction:column; }
        }
      `}</style>

      {/* ╔══════════════════════════════════════╗
          ║  HERO                                 ║
          ╚══════════════════════════════════════╝ */}
      <section className="sv-hero" id="top">
        <div className="sv-hero-glow"  aria-hidden="true"/>
        <div className="sv-hero-glow2" aria-hidden="true"/>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 sv-hero-content" data-aos="fade-right">
              <div className="sv-hero-badge">
                <span className="dot" aria-hidden="true"/>
                Verified Craftsmen · Kenya
              </div>
              <h1 className="sv-hero-title">
                Find the Right<br/><span>Craftsman</span> for Any Job
              </h1>
              <p className="sv-hero-sub">
                Browse hundreds of skilled, background-checked artisans across plumbing, electrical, carpentry, tiling, and more — all within your county.
              </p>
              <div className="sv-hero-btns">
                <Link to="/Hirelogin" className="kk-btn-gold fw-bold" style={{background:'#fff',color:'#7c3b00',boxShadow:'0 4px 16px rgba(0,0,0,.15)'}}>
                  <i className="fas fa-hard-hat me-2"/>Hire a Craftsman
                </Link>
                <Link to="/signup" className="kk-btn-ghost fw-bold" style={{borderColor:'rgba(255,255,255,.7)',color:'#1c0a00'}}>
                  Become a Craftsman
                </Link>
              </div>
              <div className="sv-hero-stats" data-aos="fade-up" data-aos-delay="80">
                {[
                  { val:'100+', lbl:'Craftsmen'  },
                  { val:'8',    lbl:'Trades'      },
                  { val:'40+',  lbl:'Counties'    },
                  { val:'50+',  lbl:'Jobs Done'   },
                ].map((s,i) => (
                  <div className="sv-hs-item" key={i}>
                    <span className="sv-hs-val">{s.val}</span>
                    <span className="sv-hs-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6 sv-hero-img-col" data-aos="fade-left">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80"
                alt="Skilled craftsman at work" className="sv-hero-img-main"
              />
              <div className="sv-hero-float-card">
                <div className="sv-hero-float-icon"><i className="bi bi-shield-check-fill"/></div>
                <div>
                  <span className="sv-hero-float-text">All Craftsmen Verified</span>
                  <span className="sv-hero-float-sub">Manually reviewed &amp; approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║  FILTER BAR                           ║
          ╚══════════════════════════════════════╝ */}
      <div className="sv-filter" role="navigation" aria-label="Filter craftsmen">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="sv-cats" role="group" aria-label="Category filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  className={`sv-cat-btn ${active === cat.label ? 'active' : ''}`}
                  onClick={() => setActive(cat.label)}
                  aria-pressed={active === cat.label}
                >
                  <i className={`bi ${cat.icon}`} aria-hidden="true"/>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="sv-search-wrap">
              <i className="fas fa-search" aria-hidden="true"/>
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

      {/* ╔══════════════════════════════════════╗
          ║  CRAFTSMEN GRID                       ║
          ╚══════════════════════════════════════╝ */}
      <section className="sv-section" aria-label="Craftsmen listings" aria-live="polite">
        <div className="container">
          {!loading && (
            <div className="sv-results-bar">
              <span className="sv-results-tag">
                <strong>{filtered.length}</strong> craftsman{filtered.length !== 1 ? 'en' : ''} found
                {active !== 'All' && <> · <strong>{active}</strong></>}
                {search && <> · "{search}"</>}
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
            <div className="kk-empty">
              <span className="kk-empty-icon" role="img" aria-label="No results">🔍</span>
              <h5>No craftsmen found</h5>
              <p>Try a different category or clear your search.</p>
              <button
                className="kk-btn-green"
                style={{display:'inline-block',width:'auto',padding:'10px 24px',borderRadius:'10px',marginTop:8}}
                onClick={() => { setActive('All'); setSearch(''); }}
              >
                Browse all craftsmen
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {filtered.map((s, i) => {
                const cover  = getImageUrl(s.services?.[0]?.image || s.service_image);
                const avatar = getImageUrl(s.profile_image || s.avatar);
                const rating = Number(s.average_rating) || 0;
                const id     = s.id || s.slug || '';
                return (
                  <div className="col" key={s.id || i} data-aos="fade-up" data-aos-delay={(i % 4) * 50}>
                    <div className="kk-card">
                      <div className="kk-cc-cover">
                        <img
                          src={cover || PLACEHOLDER} alt={s.primary_service || 'Craftsman'}
                          className="kk-cc-cover-img" loading="lazy"
                          onError={e => { e.target.src = PLACEHOLDER; }}
                        />
                        <span className="kk-badge-trade">{s.primary_service}</span>
                        {rating >= 4.5 && <span className="kk-badge-top">⭐ Top Rated</span>}
                      </div>
                      <div className="kk-cc-body">
                        <div className="kk-cc-profile">
                          {avatar
                            ? <img src={avatar} alt={s.name} className="kk-cc-avatar" loading="lazy"
                                onError={e=>{e.target.style.display='none'}}/>
                            : <div className="kk-cc-avatar-fb" aria-hidden="true"><i className="fas fa-hard-hat"/></div>
                          }
                          <div style={{minWidth:0}}>
                            <p className="kk-cc-name">{s.name || 'Craftsman'}</p>
                            {s.location && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.location)}`}
                                target="_blank" rel="noopener noreferrer" className="kk-cc-loc"
                              >
                                <i className="fas fa-map-marker-alt me-1"/>{s.location}
                              </a>
                            )}
                          </div>
                        </div>
                        {rating > 0 && (
                          <div className="kk-cc-rating-row">
                            <StarRating rating={rating}/>
                            <span className="kk-cc-rating-val">{rating.toFixed(1)}</span>
                          </div>
                        )}
                        {s.description && (
                          <p className="kk-cc-desc">
                            {s.description.length > 90 ? s.description.slice(0,90)+'…' : s.description}
                          </p>
                        )}
                        {id
                          ? <Link to={`/craftsmen/${id}`} className="kk-btn-green kk-cc-cta">
                              View Profile &amp; Hire <i className="fas fa-arrow-right ms-1"/>
                            </Link>
                          : <span className="kk-btn-green kk-cc-cta kk-btn-muted">Unavailable</span>
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

      {/* ╔══════════════════════════════════════╗
          ║  HOW IT WORKS                         ║
          ╚══════════════════════════════════════╝ */}
      <section className="sv-hiw" aria-label="How hiring works">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold display-6" style={{color:'var(--green)'}}>How Hiring Works</h2>
            <p style={{color:'var(--muted)'}}>Three simple steps to get the job done right</p>
          </div>
          <div className="kk-hiw-steps">
            {[
              { num:1, icon:'bi-search',            title:'Search & Filter', body:'Filter by trade and county. Browse verified craftsmen with real ratings.' },
              { num:2, icon:'bi-person-check-fill', title:'View & Hire',     body:'Check portfolio, ratings, and past work. Click Hire Now to get started.' },
              { num:3, icon:'bi-star-fill',          title:'Review & Rate',  body:'After the job, rate your craftsman. Help others in Kenya find the best.' },
            ].map(({ num, icon, title, body }) => (
              <div className="kk-hiw-item" key={num} data-aos="fade-up" data-aos-delay={num * 100}>
                <div className="kk-hiw-icon-wrap">
                  <span className="kk-hiw-num" aria-hidden="true">{num}</span>
                  <div className="kk-hiw-icon" aria-hidden="true"><i className={`bi ${icon}`}/></div>
                </div>
                <h3 className="kk-hiw-title">{title}</h3>
                <p className="kk-hiw-body">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5" data-aos="fade-up">
            <Link to="/Hirelogin" className="kk-btn-gold" style={{borderRadius:'10px',padding:'14px 36px'}}>
              <i className="fas fa-hard-hat me-2"/>Start Hiring Now
            </Link>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║  CTA                                  ║
          ╚══════════════════════════════════════╝ */}
      <section className="sv-cta" aria-label="Join as craftsman">
        <div className="container">
          <div className="sv-cta-inner" data-aos="fade-up">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="sv-cta-title">Are You a Skilled Craftsman?</h2>
                <p className="sv-cta-sub">
                  Join KaaKazini for free. Create your profile, showcase your work, and start receiving hire requests from clients across Kenya. Get paid securely after every job.
                </p>
                <div className="sv-cta-btns">
                  <Link to="/signup"    className="kk-btn-gold"><i className="fas fa-user-plus me-2"/>Join as Craftsman</Link>
                  <Link to="/Hirelogin" className="kk-btn-ghost"><i className="fas fa-hard-hat me-2"/>Hire a Craftsman</Link>
                </div>
              </div>
              <div className="col-lg-6 text-center" data-aos="fade-left">
                <img
                  src="https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=700&q=80"
                  alt="Craftsman building" className="sv-cta-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        className={`kk-back-top ${showTop ? 'on' : ''}`}
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
        aria-label="Back to top"
      >
        <i className="fas fa-arrow-up" aria-hidden="true"/>
      </button>
    </>
  );
}
