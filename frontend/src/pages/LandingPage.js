import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import heroImage  from '../assets/craftOnline.jpg';
import heroBottom from '../assets/hero-bottom.svg';
import CoverFlow  from '../components/CoverFlow.js';
import c2         from '../assets/c2.png';
import c3         from '../assets/c3.png';
import bgImage    from '../assets/background.png';
import client1    from '../assets/68.png';
import client2    from '../assets/20.png';
import client3    from '../assets/33.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AOS from 'aos';
import 'aos/dist/aos.css';

const API_BASE_URL    = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
const MEDIA_URL       = process.env.REACT_APP_MEDIA_URL    || 'https://staging.kaakazini.com';
const FALLBACK_AVATARS = [client1, client2, client3];

const KENYA_LOCATIONS = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale',
  'Garissa','Kakamega','Nyeri','Meru','Machakos','Kilifi','Kisii','Kericho',
  'Embu','Migori','Homa Bay','Bungoma','Voi','Lamu','Isiolo','Nanyuki',
  'Naivasha','Mwingi','Kitui','Wajir','Mandera','Marsabit','Lodwar',
  'Kapenguria','Kabarnet','Bomet','Narok','Kajiado','Muranga','Nyahururu',
  'Nyandarua','Kirinyaga',
];

const imgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_URL}${path}`;
};
const PLACEHOLDER = 'https://placehold.co/400x200/e8f5e9/198754?text=No+Image';

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ rating, size = '' }) {
  const n = Number(rating) || 0;
  const full = Math.floor(n), half = n % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={`kk-stars ${size}`} aria-label={`${n} of 5 stars`}>
      {[...Array(full)].map((_,i)  => <i key={`f${i}`} className="fas fa-star"/>)}
      {half                         && <i className="fas fa-star-half-alt"/>}
      {[...Array(empty)].map((_,i) => <i key={`e${i}`} className="far fa-star"/>)}
    </span>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="col">
      <div className="kk-card" style={{pointerEvents:'none',opacity:0.7}}>
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

// ─── Craftsman Card ───────────────────────────────────────────────────────────
function CraftsmanCard({ service }) {
  const cover  = imgUrl(service.services?.[0]?.image || service.service_image);
  const avatar = imgUrl(service.profile_image || service.avatar);
  const id     = service.id || service.slug || '';
  const rating = Number(service.average_rating) || 0;

  return (
    <div className="kk-card kk-craftsman-card">
      <div className="kk-cc-cover">
        <img
          src={cover || PLACEHOLDER} alt={service.primary_service || 'Craftsman'}
          className="kk-cc-cover-img" loading="lazy"
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        <span className="kk-badge-trade">{service.primary_service}</span>
        {rating >= 4.5 && <span className="kk-badge-top">⭐ Top Rated</span>}
      </div>
      <div className="kk-cc-body">
        <div className="kk-cc-profile">
          {avatar
            ? <img src={avatar} alt={service.name} className="kk-cc-avatar" loading="lazy"
                onError={e => { e.target.style.display='none'; }}/>
            : <div className="kk-cc-avatar-fb" aria-hidden="true"><i className="fas fa-hard-hat"/></div>
          }
          <div style={{minWidth:0}}>
            <p className="kk-cc-name">{service.name || 'Craftsman'}</p>
            {service.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`}
                target="_blank" rel="noopener noreferrer" className="kk-cc-loc"
              >
                <i className="fas fa-map-marker-alt me-1"/>{service.location}
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
        {service.description && (
          <p className="kk-cc-desc">
            {service.description.length > 90 ? service.description.slice(0,90)+'…' : service.description}
          </p>
        )}
        {id
          ? 
          // <Link to={`/craftsmen/${id}`} className="kk-btn-green kk-cc-cta">
              {/* Hire Now <i className="fas fa-arrow-right ms-1"/> */}
            // </Link>
          : <span className="kk-btn-green kk-cc-cta kk-btn-muted">Unavailable</span>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [craftsmen,      setCraftsmen]      = useState([]);
  const [loadingCraft,   setLoadingCraft]   = useState(true);
  // search bar
  const [query,          setQuery]          = useState('');
  const [location,       setLocation]       = useState('');
  const [locSugs,        setLocSugs]        = useState([]);
  const [showSugs,       setShowSugs]       = useState(false);
  const [searched,       setSearched]       = useState(false);
  const [results,        setResults]        = useState([]);
  // reviews
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError,   setReviewsError]   = useState(false);
  // faq
  const [faqQ,   setFaqQ]   = useState('');
  const [faqSent,setFaqSent]= useState(false);
  const [faqBusy,setFaqBusy]= useState(false);
  // back-to-top
  const [showTop, setShowTop] = useState(false);

  const resultsRef = useRef(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { AOS.init({ duration: 750, once: true, offset: 50 }); }, []);

  // Fetch approved craftsmen — same logic as the working file
  useEffect(() => {
    axios.get(`${API_BASE_URL}/public-craftsman/`)
      .then(r => {
        setCraftsmen((r.data||[])
          .filter(i => i.status === 'approved' && i.primary_service)
          .map(i => ({...i, images: i.images||[]})));
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingCraft(false));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/reviews/public`)
      .then(r => setReviews((r.data||[]).filter(x=>x.comment&&x.rating).slice(0,6)))
      .catch(() => setReviewsError(true))
      .finally(() => setReviewsLoading(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const onLocInput = (v) => {
    setLocation(v);
    setLocSugs(v ? KENYA_LOCATIONS.filter(l => l.toLowerCase().startsWith(v.toLowerCase())) : []);
    setShowSugs(!!v);
  };

  const doSearch = (qOverride, locOverride) => {
    const q   = (qOverride   !== undefined ? qOverride   : query).trim().toLowerCase();
    const loc = (locOverride !== undefined ? locOverride : location).trim().toLowerCase();
    if (!q && !loc) return;
    setShowSugs(false);
    setSearched(true);
    setResults(craftsmen.filter(s => {
      const n = s.name?.toLowerCase()||'', sv = s.primary_service?.toLowerCase()||'', sl = s.location?.toLowerCase()||'';
      return (!q   || n.includes(q)   || sv.includes(q)   || sl.includes(q))
          && (!loc || sl.includes(loc));
    }));
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 60);
  };

  const clearSearch = () => { setQuery(''); setLocation(''); setSearched(false); setResults([]); };

  const sendFaq = async () => {
    if (!faqQ.trim()) return;
    setFaqBusy(true);
    try { await axios.post(`${API_BASE_URL}/contact/`, { question: faqQ }); } catch {}
    finally { setFaqBusy(false); setFaqSent(true); setFaqQ(''); }
  };

  const staticReviews = [
    { comment:"The carpenter I hired was extremely professional and delivered perfect work. Highly recommend!", rating:5,   reviewer:"Sarah M.", location:"Nairobi",  _i:0 },
    { comment:"The electrician was on time, safe, and affordable. Will definitely hire again through KaaKazini.", rating:5,   reviewer:"James K.", location:"Mombasa",  _i:1 },
    { comment:"The tailor made a beautiful custom outfit exactly how I described. Loved every detail!", rating:4.5, reviewer:"Linda O.", location:"Kisumu",   _i:2 },
  ];
  const shownReviews = (!reviewsLoading && !reviewsError && reviews.length) ? reviews : staticReviews;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes heroSlide{ 0%{transform:translateX(0)} 100%{transform:translateX(10px)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing{ 0%{box-shadow:0 0 0 0 rgba(25,135,84,.5)} 70%{box-shadow:0 0 0 10px rgba(25,135,84,0)} 100%{box-shadow:0 0 0 0 rgba(25,135,84,0)} }

        :root {
          --green:   #198754;
          --green-d: #145a32;
          --green-l: #e8f5e9;
          --gold:    #FFD700;
          --gold-l:  #FFF6CC;
        }

        body { background:var(--bg); color:var(--text); }
        .kk-stars { color:#FFD700; display:inline-flex; gap:2px; font-size:.82rem; }

        /* Buttons */
        .kk-btn-gold {
          display:inline-block; background:var(--gold); color:#1a1a2e;
          border:none; border-radius:10px; padding:13px 28px;
          font-weight:700; font-size:.93rem; text-decoration:none; cursor:pointer;
          transition:all .2s; box-shadow:0 4px 14px rgba(255,215,0,.35);
        }
        .kk-btn-gold:hover { filter:brightness(.9); color:#1a1a2e; transform:translateY(-2px); box-shadow:0 8px 22px rgba(255,215,0,.45); }
        .kk-btn-ghost {
          display:inline-block; background:transparent; color:#000;
          border:2px solid rgba(255,255,255,.75); border-radius:10px;
          padding:11px 26px; font-weight:700; font-size:.93rem;
          text-decoration:none; cursor:pointer; transition:all .2s;
        }
        .kk-btn-ghost:hover { background:rgba(255,255,255,.15); color:#fff; border-color:#fff; transform:translateY(-2px); }
        .kk-btn-green {
          display:block; text-align:center; background:var(--green); color:#fff;
          border:none; border-radius:10px; padding:11px 0;
          font-weight:700; font-size:.88rem; text-decoration:none; cursor:pointer;
          transition:background .18s,transform .14s; margin-top:auto;
        }
        .kk-btn-green:hover { background:var(--green-d); color:#fff; transform:translateY(-1px); }
        .kk-btn-muted { background:#e9e9e9 !important; color:var(--muted) !important; cursor:default !important; transform:none !important; }

        /* Cards */
        .kk-card {
          background:#fff; border-radius:12px; overflow:hidden;
          box-shadow:0 2px 16px rgba(0,0,0,.08); transition:transform .25s,box-shadow .25s;
          display:flex; flex-direction:column; height:100%;
        }
        .kk-card:hover { transform:translateY(-5px); box-shadow:0 8px 32px rgba(0,0,0,.13); }

        /* Skeleton */
        .kk-skel-cover  { height:168px; width:100%; }
        .kk-skel-line   { height:11px; border-radius:6px; }
        .kk-skel-circle { width:44px; height:44px; border-radius:50%; flex-shrink:0; }
        .kk-skel-btn    { height:38px; border-radius:10px; }
        .kk-skel-cover,.kk-skel-line,.kk-skel-circle,.kk-skel-btn {
          background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
          background-size:200% 100%; animation:shimmer 1.4s infinite;
        }

        /* Hero */
        .kk-hero {
          position:relative; height:80vh; min-height:500px;
          display:flex; align-items:center; justify-content:center;
          text-align:center; color:#fff; overflow:hidden; padding-top:100px;
        }
        .kk-hero-bg      { position:absolute; inset:0; background-size:cover; background-position:center; }
        .kk-hero-overlay { position:absolute; inset:0; background:linear-gradient(rgba(0,0,0,0.25),rgba(0,0,0,0.25)); }
        .kk-hero-content { position:relative; z-index:2; max-width:700px; padding:0 20px; }
        .kk-hero-title   { font-size:2.8rem; font-weight:700; line-height:1.2; animation:heroSlide 5s infinite alternate; }
        .kk-hero-sub     { font-size:1.4rem; font-weight:600; margin:14px 0 28px; }
        .kk-hero-btns    { display:flex; gap:14px; justify-content:center; align-items:center; flex-wrap:nowrap; }
        @media(max-width:576px){
          .kk-hero-title { font-size:2rem; }
          .kk-hero-btns  { gap:10px; }
          .kk-hero-btns a{ font-size:.88rem; padding:11px 18px; }
        }

        /* Stats */
        .kk-stats { background:#fff; padding:52px 0; }
        .kk-stat-item { text-align:center; padding:0 8px; }
        .kk-stat-circle {
          width:clamp(130px,17vw,164px); height:clamp(130px,17vw,164px);
          border-radius:50%; border:4px solid var(--gold);
          display:flex; flex-direction:column; justify-content:center; align-items:center;
          background:#fff; transition:transform .3s,box-shadow .3s; cursor:default; margin:0 auto;
        }
        .kk-stat-circle:hover { transform:translateY(-6px); box-shadow:0 14px 36px rgba(0,0,0,.11); }
        .kk-stat-icon  { font-size:1.4rem; color:#000; margin-bottom:3px; }
        .kk-stat-value { margin:0; font-weight:800; color:var(--gold); font-size:1.3rem; }
        .kk-stat-label { margin:0; font-size:.78rem; font-weight:600; color:#6c757d; }

        /* Search */
        .kk-search-section { background:#f8f9fa; padding:40px 0 0; }
        .kk-search-box {
          background:#fff; border-radius:14px; display:flex; align-items:stretch;
          box-shadow:0 4px 24px rgba(0,0,0,.10); overflow:visible; position:relative;
          max-width:720px; margin:0 auto;
        }
        .kk-sf        { display:flex; align-items:center; gap:8px; flex:1; padding:14px 18px; min-width:0; }
        .kk-sf-icon   { color:var(--green); font-size:.95rem; flex-shrink:0; }
        .kk-sf-icon-loc { color:#f59e0b; }
        .kk-sf-input  { border:none; outline:none; background:transparent; font-size:.95rem; color:#212529; font-weight:500; width:100%; min-width:0; }
        .kk-sf-input::placeholder { color:#bbb; font-weight:400; }
        .kk-sf-div    { width:1px; background:#e0e0e0; align-self:stretch; flex-shrink:0; margin:10px 0; }
        .kk-sf-btn {
          background:var(--green); color:#fff; border:none;
          border-radius:0 14px 14px 0; padding:0 28px;
          font-weight:700; font-size:.95rem; cursor:pointer;
          transition:background .18s; white-space:nowrap; flex-shrink:0;
        }
        .kk-sf-btn:hover:not(:disabled) { background:var(--green-d); }
        .kk-sf-btn:disabled { opacity:.4; cursor:not-allowed; }
        .kk-loc-wrap  { position:relative; flex:1; display:flex; align-items:center; gap:8px; min-width:0; padding:14px 18px 14px 0; }
        .kk-loc-dd {
          position:absolute; top:calc(100% + 4px); left:-18px; right:0;
          background:#fff; border:1.5px solid #e9ecef; border-radius:12px;
          list-style:none; padding:6px 0; margin:0; z-index:9999;
          box-shadow:0 8px 28px rgba(0,0,0,.11);
        }
        .kk-loc-dd li { padding:9px 16px; cursor:pointer; font-size:.88rem; color:#212529; display:flex; align-items:center; gap:8px; transition:background .1s; }
        .kk-loc-dd li i { color:var(--green); font-size:.78rem; }
        .kk-loc-dd li:hover { background:var(--green-l); }
        @media(max-width:600px){
          .kk-search-box { flex-direction:column; border-radius:14px; }
          .kk-sf         { padding:12px 16px; width:100%; }
          .kk-loc-wrap   { padding:12px 16px 12px 0; width:100%; }
          .kk-sf-div     { display:none; }
          .kk-sf-btn     { width:100%; border-radius:0 0 14px 14px; padding:14px; }
        }

        /* Search Results */
        .kk-results { background:#f8f9fa; padding:0 0 60px; }
        .kk-results-bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:22px 0 20px; border-bottom:1.5px solid #e4e4e4; margin-bottom:28px; }
        .kk-results-tag { background:var(--green-l); color:var(--green); border:1px solid #a5d6a7; border-radius:20px; padding:5px 18px; font-size:.84rem; font-weight:600; }
        .kk-clear-btn   { background:#fff; border:1.5px solid #e0e0e0; color:#6c757d; border-radius:20px; padding:5px 16px; font-size:.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .15s; }
        .kk-clear-btn:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }
        .kk-empty { text-align:center; padding:52px 20px; }
        .kk-empty-icon { font-size:3rem; margin-bottom:14px; display:block; }
        .kk-empty h5 { font-weight:700; color:#6c757d; }
        .kk-empty p  { color:#6c757d; font-size:.9rem; }

        /* Craftsman card */
        .kk-cc-cover    { position:relative; height:168px; overflow:hidden; flex-shrink:0; }
        .kk-cc-cover-img{ width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .kk-craftsman-card:hover .kk-cc-cover-img { transform:scale(1.05); }
        .kk-badge-trade { position:absolute; top:10px; left:10px; background:rgba(25,135,84,.88); color:#fff; border-radius:20px; padding:3px 11px; font-size:.7rem; font-weight:700; backdrop-filter:blur(4px); }
        .kk-badge-top   { position:absolute; top:10px; right:10px; background:rgba(255,215,0,.93); color:#1a1a2e; border-radius:20px; padding:3px 10px; font-size:.67rem; font-weight:800; }
        .kk-cc-body     { padding:16px; display:flex; flex-direction:column; gap:9px; flex:1; }
        .kk-cc-profile  { display:flex; align-items:center; gap:11px; }
        .kk-cc-avatar   { width:44px; height:44px; border-radius:50%; object-fit:cover; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-cc-avatar-fb{ width:44px; height:44px; border-radius:50%; background:var(--green-l); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:1.1rem; border:2.5px solid var(--gold); flex-shrink:0; }
        .kk-cc-name     { font-size:.93rem; font-weight:700; color:#212529; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .kk-cc-loc      { font-size:.75rem; color:var(--green); text-decoration:none; display:block; margin-top:1px; }
        .kk-cc-loc:hover{ text-decoration:underline; }
        .kk-cc-rating-row{ display:flex; align-items:center; gap:6px; }
        .kk-cc-rating-val{ font-size:.75rem; color:#6c757d; font-weight:600; }
        .kk-cc-desc     { font-size:.8rem; color:#6c757d; line-height:1.55; margin:0; flex:1; }
        .kk-cc-cta      { margin-top:auto; }

        /* Services section */
        .kk-services { background:whitesmoke; padding:72px 0; }

        /* About */
        .kk-about { background:#fff; padding:72px 0; }
        .kk-carousel-wrap { height:400px; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.1); }
        .kk-carousel-img  { width:100%; height:100%; object-fit:cover; display:block; }
        @media(max-width:768px){ .kk-carousel-wrap{height:240px} }

        /* How It Works */
        .kk-hiw { background:#fff; padding:72px 0; }
        .kk-hiw-steps { display:flex; justify-content:space-between; align-items:flex-start; position:relative; }
        .kk-hiw-steps::before { content:''; position:absolute; top:27px; left:15%; right:15%; height:2px; background:repeating-linear-gradient(to right,#dee2e6 0,#dee2e6 8px,transparent 8px,transparent 16px); }
        .kk-hiw-item { position:relative; z-index:1; text-align:center; flex:1; padding:0 16px; }
        .kk-hiw-item:hover .kk-hiw-icon { transform:scale(1.1); box-shadow:0 8px 24px rgba(25,135,84,.2); }
        .kk-hiw-icon-wrap { position:relative; display:inline-block; margin-bottom:16px; }
        .kk-hiw-num  { position:absolute; top:-10px; right:-10px; background:var(--gold); color:#1a1a2e; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:800; border:2px solid #fff; z-index:2; animation:pulseRing 2.5s infinite; }
        .kk-hiw-icon { width:56px; height:56px; border-radius:50%; background:#fff; color:var(--gold); display:flex; align-items:center; justify-content:center; font-size:1.7rem; box-shadow:0 4px 14px rgba(0,0,0,.09); transition:transform .3s,box-shadow .3s; }
        .kk-hiw-title{ font-weight:700; color:#212529; font-size:.97rem; margin-bottom:6px; }
        .kk-hiw-body { font-size:.85rem; color:#6c757d; line-height:1.65; }
        @media(max-width:768px){ .kk-hiw-steps{flex-direction:column;align-items:center;gap:32px} .kk-hiw-steps::before{display:none} }

        /* Hire CTA */
        .kk-hire { background:#f8f9fa; padding:72px 0; }
        .kk-hire-img-wrap { position:relative; min-height:300px; }
        .kk-hire-main { border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); width:100%; max-height:350px; object-fit:cover; display:block; }
        .kk-hire-f1   { position:absolute; top:-18px; right:-8px; width:44%; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); }
        .kk-hire-f2   { position:absolute; bottom:-18px; left:-8px; width:44%; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); }
        @media(max-width:768px){ .kk-hire-f1,.kk-hire-f2{ display:none; } }

        /* Testimonials */
        .kk-testi { background:#fff; padding:72px 0; overflow:hidden; }
        .kk-testi-track-wrap {
          overflow:hidden; position:relative;
          -webkit-mask:linear-gradient(to right,transparent 0%,#fff 8%,#fff 92%,transparent 100%);
          mask:linear-gradient(to right,transparent 0%,#fff 8%,#fff 92%,transparent 100%);
        }
        .kk-testi-track-wrap:hover .kk-testi-track { animation-play-state:paused; }
        .kk-testi-track { display:flex; gap:24px; width:max-content; animation:scrollTrack 32s linear infinite; }
        @keyframes scrollTrack { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .kk-testi-card { background:#fff; border-radius:12px; padding:24px; box-shadow:0 2px 16px rgba(0,0,0,.08); width:300px; flex-shrink:0; transition:transform .3s,box-shadow .3s; }
        .kk-testi-card:hover { transform:translateY(-5px); box-shadow:0 14px 40px rgba(255,215,0,.22); }
        .kk-testi-top     { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .kk-testi-avatar  { width:50px; height:50px; border-radius:50%; object-fit:cover; border:3px solid var(--gold); flex-shrink:0; }
        .kk-testi-name    { font-weight:700; color:#212529; margin:0 0 1px; font-size:.9rem; }
        .kk-testi-loc     { font-size:.73rem; color:#6c757d; margin:0 0 3px; }
        .kk-quote-icon    { font-size:1.8rem; color:#e0e0e0; display:block; margin-bottom:6px; }
        .kk-testi-comment { font-size:.85rem; color:#495057; font-style:italic; line-height:1.65; margin:0; }

        /* FAQ */
        .kk-faq { background:#f8f9fa; padding:72px 0; }
        .kk-faq-item { border:none !important; border-radius:12px !important; margin-bottom:10px; box-shadow:0 2px 12px rgba(0,0,0,.06); overflow:hidden; transition:transform .2s,box-shadow .2s; }
        .kk-faq-item:hover { transform:translateY(-2px); box-shadow:0 6px 22px rgba(0,0,0,.09); }
        .kk-faq-btn  { background:#fff !important; font-weight:600; font-size:.93rem; padding:17px 22px; border:none; }
        .accordion-button:not(.collapsed) { color:var(--green) !important; box-shadow:none !important; }
        .accordion-button::after          { background-image:none !important; content:"+"; font-size:1.35rem; font-weight:700; color:var(--green); }
        .accordion-button:not(.collapsed)::after { content:"−"; }
        .kk-faq-body { background:#fff; color:#6c757d; padding:4px 22px 20px; font-size:.88rem; line-height:1.75; }
        .kk-q-card   { background:#fff; border-radius:20px; padding:32px 26px; max-width:420px; margin:0 auto; box-shadow:0 2px 16px rgba(0,0,0,.08); }
        .kk-q-blob   { width:110px; height:96px; background:var(--gold); border-radius:40% 60% 50% 50%; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; transition:transform .3s; cursor:default; }
        .kk-q-blob:hover { transform:scale(1.06) rotate(-3deg); }
        .kk-q-mark   { font-size:3.4rem; font-weight:900; color:#fff; line-height:1; }
        .kk-q-area   { border-radius:10px; padding:12px 14px; border:1.5px solid #e9ecef; width:100%; resize:vertical; font-size:.9rem; transition:border-color .2s,box-shadow .2s; font-family:inherit; }
        .kk-q-area:focus { border-color:var(--green); box-shadow:0 0 0 3px rgba(25,135,84,.1); outline:none; }
        .kk-q-send   { background:var(--green); color:#fff; border:none; border-radius:10px; padding:12px; font-weight:700; font-size:.92rem; width:100%; margin-top:12px; cursor:pointer; transition:background .18s; }
        .kk-q-send:hover:not(:disabled) { background:var(--green-d); }
        .kk-q-send:disabled { opacity:.55; cursor:not-allowed; }
        .kk-q-success{ background:var(--green-l); color:var(--green); border-radius:10px; padding:14px; text-align:center; font-weight:600; font-size:.88rem; }

        /* Footer */
        .kk-footer   { background:#1a1a2e; color:#bbb; padding:52px 0 26px; }
        .kk-footer h5{ color:#fff; font-weight:700; font-size:.82rem; letter-spacing:.06em; text-transform:uppercase; margin-bottom:14px; }
        .kk-footer a { color:#bbb; text-decoration:none; font-size:.86rem; transition:color .15s; }
        .kk-footer a:hover { color:var(--gold); }
        .kk-footer p { font-size:.86rem; margin-bottom:6px; }
        .kk-footer-hr{ border-color:rgba(255,255,255,.08); margin:26px 0 18px; }
        .kk-footer-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:.8rem; }
        .kk-social a { font-size:1.1rem; color:#bbb; margin-right:14px; display:inline-block; transition:color .15s,transform .15s; }
        .kk-social a:hover { color:var(--gold); transform:translateY(-2px); }
        .kk-map-wrap { border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.3); }

        /* Back to top */
        .kk-back-top { position:fixed; bottom:24px; right:24px; width:44px; height:44px; border-radius:50%; background:var(--green); color:#fff; border:none; font-size:.9rem; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(25,135,84,.4); cursor:pointer; transition:all .2s; z-index:9999; opacity:0; pointer-events:none; }
        .kk-back-top.on { opacity:1; pointer-events:auto; }
        .kk-back-top:hover { background:var(--green-d); transform:translateY(-2px); }

        @media(max-width:576px){
          .kk-hero-btns { flex-direction:row; flex-wrap:nowrap; justify-content:center; }
          .kk-hero-btns a { font-size:.88rem; padding:11px 18px; }
        }
        @media(max-width:400px){
          .kk-hero-btns { flex-wrap:wrap; }
          .kk-hero-btns a { width:100%; text-align:center; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="kk-hero" id="top">
        <div className="kk-hero-bg" style={{backgroundImage:`url(${heroImage})`}} aria-hidden="true"/>
        <div className="kk-hero-overlay" aria-hidden="true"/>
        <div className="kk-hero-content">
          <h1 className="kk-hero-title">Empowering Local Craftsmen</h1>
          <p className="kk-hero-sub">Manage clients, showcase your work, and grow your trade — all in one platform.</p>
          <div className="kk-hero-btns">
            <Link to="/signup"    className="kk-btn-gold fw-bold">Become A Craftsman</Link>
            <Link to="/Hirelogin" className="kk-btn-gold fw-bold">Hire a Craftsman</Link>
          </div>
        </div>
      </section>

      <div style={{background:`url(${heroBottom}) no-repeat center center/cover`,height:'68px',width:'100%'}} aria-hidden="true"/>

      {/* ── STATS ── */}
      <section className="kk-stats" id="impact" aria-label="Platform statistics">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success display-6">Growing Kenya's Craft Economy</h2>
          </div>
          <div className="row justify-content-center g-4">
            {[
              {icon:'bi-people-fill',     value:'100+',label:'Active Craftsmen'},
              {icon:'bi-clipboard-check', value:'50+', label:'Jobs Completed'},
              {icon:'bi-emoji-smile',     value:'30+', label:'Happy Clients'},
              {icon:'bi-shop',            value:'100+',label:'Shops Connected'},
            ].map((s,i)=>(
              <div key={i} className="col-6 col-sm-3 kk-stat-item" data-aos="zoom-in" data-aos-delay={i*80}>
                <div className="kk-stat-circle">
                  <i className={`bi ${s.icon} kk-stat-icon`} aria-hidden="true"/>
                  <h3 className="kk-stat-value">{s.value}</h3>
                  <p className="kk-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="kk-search-section" aria-label="Search craftsmen">
        <div className="container">
          <div className="kk-search-box">
            <div className="kk-sf">
              <i className="fas fa-search kk-sf-icon" aria-hidden="true"/>
              <input
                type="search" className="kk-sf-input"
                placeholder="Search by trade, e.g. Plumber, Electrician…"
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key==='Enter' && doSearch()}
                aria-label="Search by trade"
              />
            </div>
            <div className="kk-sf-div" aria-hidden="true"/>
            <div className="kk-loc-wrap">
              <i className="fas fa-map-marker-alt kk-sf-icon kk-sf-icon-loc" aria-hidden="true"/>
              <input
                type="search" className="kk-sf-input"
                placeholder="County, e.g. Nairobi…"
                value={location} onChange={e => onLocInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && doSearch()}
                onBlur={() => setTimeout(() => setShowSugs(false), 180)}
                onFocus={() => location && setShowSugs(locSugs.length > 0)}
                autoComplete="off" aria-label="Filter by county"
              />
              {showSugs && locSugs.length > 0 && (
                <ul className="kk-loc-dd" role="listbox">
                  {locSugs.slice(0, 8).map((l, i) => (
                    <li key={i} role="option" onMouseDown={() => { setLocation(l); setShowSugs(false); }}>
                      <i className="fas fa-map-marker-alt"/>{l}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="kk-sf-btn" onClick={() => doSearch()}
              disabled={!query.trim() && !location.trim()}
              aria-label="Search craftsmen"
            >
              <i className="fas fa-search me-2"/>Search
            </button>
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS ── */}
      <div ref={resultsRef} style={{scrollMarginTop:'80px'}}/>
      {searched && (
        <section className="kk-results" aria-label="Search results" aria-live="polite">
          <div className="container">
            <div className="kk-results-bar">
              <span className="kk-results-tag">
                {results.length > 0
                  ? <><strong>{results.length}</strong> craftsman{results.length!==1?'en':''} found{query?` · "${query}"`:''}  {location?`in ${location}`:''}</>
                  : 'No results found'}
              </span>
              <button className="kk-clear-btn" onClick={clearSearch}>
                <i className="fas fa-times" aria-hidden="true"/>Clear search
              </button>
            </div>
            {loadingCraft ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {[1,2,3].map(i=><SkeletonCard key={i}/>)}
              </div>
            ) : results.length===0 ? (
              <div className="kk-empty">
                <span className="kk-empty-icon" role="img" aria-label="No results">🔍</span>
                <h5>No craftsmen match your search</h5>
                <p>Try a broader trade name, or a different county.</p>
                <button
                  className="kk-btn-green" onClick={clearSearch}
                  style={{display:'inline-block',width:'auto',padding:'10px 24px',borderRadius:'10px',marginTop:8}}
                >Browse all craftsmen</button>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {results.map((s,i)=>(
                  <div key={s.id||i} className="col"><CraftsmanCard service={s}/></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SERVICES — live craftsmen from API, same logic as working file ── */}
      <section className="kk-services" id="services" aria-label="Service categories">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success display-6">Explore Our Services</h2>
            <p className="text-muted fs-5">Discover skilled services offered by experienced craftsmen.</p>
          </div>

          <CoverFlow/>

          {/* ── Live craftsmen cards — exactly as in the working file ── */}
          {loadingCraft ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mt-3">
              {[...Array(6)].map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          ) : craftsmen.length === 0 ? (
            <div className="kk-empty mt-4">
              <span className="kk-empty-icon" role="img" aria-label="none">🔍</span>
              <h5>No craftsmen available yet</h5>
              <p>Check back soon — new craftsmen are joining every day.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mt-3">
              {craftsmen.map((service, idx) => {
                // Reuse the same image resolution logic from the working file
                const imageUrl =
                  service.services?.[0]?.image ||
                  service.service_image ||
                  null;
                const resolvedImg = imageUrl
                  ? (imageUrl.startsWith('http') ? imageUrl : `${MEDIA_URL}${imageUrl}`)
                  : PLACEHOLDER;
                return (
                  <div key={service.id || idx} className="col d-flex justify-content-center" data-aos="fade-up" data-aos-delay={(idx % 3) * 60}>
                    <div className="card border-0 shadow" style={{width:'18rem',borderRadius:'12px',overflow:'hidden'}}>
                      <div className="position-relative">
                        <img
                          src={resolvedImg}
                          alt={service.primary_service}
                          className="card-img-top"
                          style={{height:'220px', objectFit:'cover'}}
                          onError={e => { e.target.src = PLACEHOLDER; }}
                          loading="lazy"
                        />
                        {/* Service name overlay — same as working file */}
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center text-white overlay-svc"
                          style={{background:'rgba(0,0,0,0)', transition:'background .3s'}}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.5)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0)'}
                        >
                          <h5 className="fw-bold" style={{opacity:0,transition:'opacity .3s'}}
                            ref={el => {
                              if(el) {
                                el.parentElement.onmouseenter = () => el.style.opacity = 1;
                                el.parentElement.onmouseleave = () => el.style.opacity = 0;
                              }
                            }}
                          >{service.primary_service}</h5>
                        </div>
                        {/* Trade badge always visible */}
                        <span style={{position:'absolute',top:10,left:10,background:'rgba(25,135,84,.88)',color:'#fff',borderRadius:'20px',padding:'3px 11px',fontSize:'.7rem',fontWeight:700,backdropFilter:'blur(4px)'}}>
                          {service.primary_service}
                        </span>
                      </div>
                      <div className="card-body text-center">
                        <h5 className="fw-bold mb-1" style={{fontSize:'.95rem'}}>{service.name || 'Craftsman'}</h5>
                        {service.location && (
                          <p className="mb-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-success fw-bold text-decoration-none"
                              style={{fontSize:'.82rem'}}
                            >
                              <i className="fas fa-map-marker-alt me-1"/>{service.location}
                            </a>
                          </p>
                        )}
                        <Link
                          to={`/craftsmen/${service.id || service.slug || ''}`}
                          className="kk-btn-green"
                          style={{borderRadius:'8px',padding:'8px 0',fontSize:'.85rem'}}
                        >
                          {/* Hire Now <i className="fas fa-arrow-right ms-1"/> */}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-5" data-aos="fade-up">
            <a href="/craftsmen" className="kk-btn-gold" style={{borderRadius:'12px',padding:'14px 42px'}}>
              <i className="fas fa-th-list me-2"/>View Our Services
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="kk-hiw" id="how-it-works" aria-label="How KaaKazini works">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success display-6">How It Works</h2>
            <p className="text-muted">Get the right craftsman for your job in minutes</p>
          </div>
          <div className="kk-hiw-steps">
            {[
              {num:1,icon:'bi-search',            title:'Search',        body:'Type the trade you need and your county. Browse verified craftsmen instantly.'},
              {num:2,icon:'bi-person-check-fill', title:'Pick & Contact', body:'View profiles, ratings, and previous work. Choose the best fit and get in touch.'},
              {num:3,icon:'bi-star-fill',          title:'Review',        body:"Once the job's done, rate your craftsman to help others in your community."},
            ].map(({num,icon,title,body})=>(
              <div className="kk-hiw-item" key={num} data-aos="fade-up" data-aos-delay={num*100}>
                <div className="kk-hiw-icon-wrap">
                  <span className="kk-hiw-num" aria-hidden="true">{num}</span>
                  <div className="kk-hiw-icon" aria-hidden="true"><i className={`bi ${icon}`}/></div>
                </div>
                <h3 className="kk-hiw-title">{title}</h3>
                <p className="kk-hiw-body">{body}</p>
              </div>
            ))}
          </div>
          {/* <div className="text-center mt-5" data-aos="fade-up"> */}
            {/* <Link to="/Hirelogin" className="kk-btn-gold" style={{borderRadius:'10px',padding:'14px 36px'}}>
              <i className="fas fa-hard-hat me-2"/>Start Hiring Now
            </Link> */}
          {/* </div> */}
        </div>
      </section>

      {/* ── HIRE CTA ── */}
      <section className="kk-hire" aria-label="Hire craftsmen">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-md-6" data-aos="fade-right">
              <h2 className="fw-bold display-6" style={{color:'#198754'}}>Hire Skilled Craftsmen Effortlessly</h2>
              <p style={{color:'#6c757d',fontSize:'1rem',lineHeight:'1.8',marginTop:'12px'}}>
                We connect you with verified, background-checked artisans across plumbing, electrical, carpentry, painting, tiling, and more — right in your county.
              </p>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginTop:'20px'}}>
                <Link to="/Hirelogin" className="kk-btn-gold" style={{borderRadius:'10px'}}>
                  <i className="fas fa-hard-hat me-2"/>Hire a Craftsman
                </Link>
                <Link to="/signup" className="kk-btn-ghost" style={{borderRadius:'10px',background:'transparent',color:'var(--green)',border:'2px solid var(--green)'}}>
                  Register as Craftsman
                </Link>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="kk-hire-img-wrap">
                <img src="https://couplingz.com/wp-content/uploads/2025/01/Couplingz-Plumbers-12.jpg" className="kk-hire-main" alt="Skilled plumber at work" loading="lazy"/>
                <img src="https://www.wilsonmclain.com/wp-content/uploads/2013/03/2-resized.png" className="kk-hire-f1" alt="Professional tools" loading="lazy"/>
                <img src={c3} className="kk-hire-f2" alt="Carpentry" loading="lazy"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="kk-about" id="about" aria-label="About KaaKazini">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success display-6">About KaaKazini</h2>
            <p className="text-muted">Empowering local craftsmen to grow, showcase their work, and reach clients across Kenya.</p>
          </div>
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <p style={{fontSize:'1.02rem',lineHeight:'1.85',color:'#4a5568'}}>
                At KaaKazini, we are passionate about connecting skilled local craftsmen with clients who need them.
                Our platform makes it easy to find, vet, and hire the right person for any job — whether it's fixing
                a pipe, building furniture, or tailoring a custom outfit.
              </p>
              <p style={{fontSize:'1.02rem',lineHeight:'1.85',color:'#4a5568'}}>
                Every craftsman on our platform is manually reviewed and approved, so you can hire with confidence.
                From Nairobi to Kisumu, we're building a more connected Kenya — one skilled job at a time.
              </p>
              <Link to="/Hirelogin" className="kk-btn-gold mt-3" style={{borderRadius:'10px'}}>Start Hiring</Link>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div id="aboutCarousel" className="carousel slide kk-carousel-wrap" data-bs-ride="carousel" data-bs-interval="3500">
                <div className="carousel-inner h-100">
                  {[
                    {src:'https://www.ariseiip.com/wp-content/uploads/2022/06/textile.png', alt:'Textile craftsmanship'},
                    {src:c2, alt:'Craftsman at work'},
                    {src:c3, alt:'Carpentry craftsmanship'},
                  ].map((img,i)=>(
                    <div key={i} className={`carousel-item h-100 ${i===0?'active':''}`}>
                      <img src={img.src} className="kk-carousel-img" alt={img.alt} loading="lazy"/>
                    </div>
                  ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#aboutCarousel" data-bs-slide="prev" aria-label="Previous"><span className="carousel-control-prev-icon" aria-hidden="true"/></button>
                <button className="carousel-control-next" type="button" data-bs-target="#aboutCarousel" data-bs-slide="next" aria-label="Next"><span className="carousel-control-next-icon" aria-hidden="true"/></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="kk-testi" aria-label="Client testimonials">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success display-5">What Our Clients Say</h2>
            <p className="text-muted">Real feedback from people who hired through KaaKazini</p>
          </div>
        </div>
        {reviewsLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading…</span></div>
          </div>
        ) : (
          <div className="kk-testi-track-wrap" style={{backgroundImage:`url(${bgImage})`,backgroundRepeat:'repeat',backgroundSize:'200px',padding:'32px 0'}}>
            <div className="kk-testi-track">
              {[...shownReviews, ...shownReviews].map((r, i) => (
                <div className="kk-testi-card" key={i}>
                  <div className="kk-testi-top">
                    <img
                      src={FALLBACK_AVATARS[(r._i !== undefined ? r._i : i % shownReviews.length) % 3]}
                      alt={r.reviewer || 'Client'} className="kk-testi-avatar" loading="lazy"
                    />
                    <div>
                      <p className="kk-testi-name">{r.reviewer || 'Anonymous'}</p>
                      {r.location && <p className="kk-testi-loc"><i className="fas fa-map-marker-alt me-1"/>{r.location}</p>}
                      <StarRating rating={Number(r.rating)}/>
                    </div>
                  </div>
                  <i className="bi bi-quote kk-quote-icon" aria-hidden="true"/>
                  <p className="kk-testi-comment">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="kk-faq" id="faq" aria-label="Frequently asked questions">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-success">Frequently Asked Questions</h2>
          </div>
          <div className="row align-items-start g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="accordion" id="faqAcc">
                {[
                  {q:'How do I hire a craftsman?',                  a:"Click 'Hire a Craftsman', create a free account, and post your project. Craftsmen will respond with quotes."},
                  {q:'Is there a cost to join as a craftsman?',     a:'No — joining is completely free. We only charge a small commission on completed jobs.'},
                  {q:'Can I trust the craftsmen on your platform?', a:'Yes. We manually review every craftsman profile and only approve those with verified, complete information.'},
                  {q:'How do I leave a review after a job?',        a:'Visit your dashboard after the project is complete and rate your craftsman based on your experience.'},
                  {q:'Are all craftsmen local to my county?',       a:'Yes. We match you with skilled craftsmen in your own county for fast, reliable service.'},
                ].map((f,i)=>(
                  <div className="accordion-item kk-faq-item" key={i} data-aos="fade-up" data-aos-delay={i*55}>
                    <h2 className="accordion-header" id={`fh${i}`}>
                      <button
                        className={`accordion-button kk-faq-btn ${i!==0?'collapsed':''}`}
                        type="button" data-bs-toggle="collapse"
                        data-bs-target={`#fc${i}`}
                        aria-expanded={i===0?'true':'false'} aria-controls={`fc${i}`}
                      >{f.q}</button>
                    </h2>
                    <div id={`fc${i}`} className={`accordion-collapse collapse ${i===0?'show':''}`}
                      aria-labelledby={`fh${i}`} data-bs-parent="#faqAcc">
                      <div className="kk-faq-body">{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="kk-q-card">
                <div className="kk-q-blob" aria-hidden="true"><span className="kk-q-mark">?</span></div>
                <h4 style={{fontWeight:800,marginBottom:'6px',textAlign:'center'}}>Still have a question?</h4>
                <p style={{color:'#6c757d',fontSize:'.88rem',textAlign:'center',marginBottom:'20px'}}>Send it to us — we'll reply within 24 hours.</p>
                {faqSent ? (
                  <div className="kk-q-success" role="alert">
                    <i className="fas fa-check-circle me-2"/>Thanks! We'll get back to you soon.
                  </div>
                ) : (
                  <>
                    <textarea
                      className="kk-q-area" rows={3}
                      placeholder="Type your question here…"
                      value={faqQ} onChange={e=>setFaqQ(e.target.value)}
                      aria-label="Your question"
                    />
                    <button className="kk-q-send" onClick={sendFaq} disabled={faqBusy || !faqQ.trim()}>
                      {faqBusy
                        ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"/>Sending…</>
                        : 'Send Question'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="kk-footer" role="contentinfo">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h5>Quick Links</h5>
              <ul className="list-unstyled" style={{lineHeight:'2.1'}}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/HireSignUp">Hire a Craftsman</Link></li>
                <li><Link to="/signup">Become a Craftsman</Link></li>
                <li><a href="#services">Browse Services</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5>Contact Us</h5>
              <p><i className="fas fa-map-marker-alt me-2" style={{color:'var(--gold)'}}/>Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2" style={{color:'var(--gold)'}}/>support@kaakazini.com</p>
              <p><i className="fas fa-phone me-2" style={{color:'var(--gold)'}}/>+254 700 000 000</p>
              <div className="kk-social mt-3">
                <h5>Follow Us</h5>
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"/></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"/></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"/></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"/></a>
              </div>
            </div>
            <div className="col-lg-5">
              <h5>Find Us</h5>
              <div className="kk-map-wrap">
                <iframe
                  title="KaaKazini — Kisumu, Kenya"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%" height="220" style={{border:0,display:'block'}}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
          <hr className="kk-footer-hr"/>
          <div className="kk-footer-bottom">
            <p style={{margin:0}}>© {new Date().getFullYear()} <strong style={{color:'#fff'}}>KaaKazini</strong>. All rights reserved.</p>
            <a href="#top" style={{color:'var(--gold)',fontWeight:600}}>
              Back to top <i className="fas fa-arrow-up ms-1" aria-hidden="true"/>
            </a>
          </div>
        </div>
      </footer>

      <button
        className={`kk-back-top ${showTop?'on':''}`}
        onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
        aria-label="Back to top"
      >
        <i className="fas fa-arrow-up" aria-hidden="true"/>
      </button>
    </>
  );
}
