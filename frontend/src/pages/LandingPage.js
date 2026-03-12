import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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

const API_BASE_URL     = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
const MEDIA_URL        = process.env.REACT_APP_MEDIA_URL    || 'https://staging.kaakazini.com';
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
const PLACEHOLDER = 'https://placehold.co/400x220/e8f5e9/198754?text=No+Image';

function StarRating({ rating }) {
  const n = Number(rating) || 0;
  const full = Math.floor(n), half = n % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="kk-stars" aria-label={`${n} stars`}>
      {[...Array(full)].map((_,i)  => <i key={`f${i}`} className="fas fa-star"/>)}
      {half && <i className="fas fa-star-half-alt"/>}
      {[...Array(empty)].map((_,i) => <i key={`e${i}`} className="far fa-star"/>)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="col">
      <div style={{background:'#fff',borderRadius:14,overflow:'hidden',opacity:.7,border:'1.5px solid #eee'}}>
        <div className="kk-skel" style={{height:200}}/>
        <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div className="kk-skel" style={{width:42,height:42,borderRadius:'50%',flexShrink:0}}/>
            <div style={{flex:1}}>
              <div className="kk-skel" style={{height:11,width:'65%',borderRadius:6}}/>
              <div className="kk-skel" style={{height:9,width:'40%',borderRadius:6,marginTop:6}}/>
            </div>
          </div>
          <div className="kk-skel" style={{height:9,borderRadius:6}}/>
          <div className="kk-skel" style={{height:36,borderRadius:10,marginTop:4}}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Craftsman Search Result Card ─── */
function CraftsmanCard({ service }) {
  const cover  = imgUrl(service.services?.[0]?.image || service.service_image);
  const avatar = imgUrl(service.profile_image || service.avatar);
  const id     = service.slug || service.id || '';
  const rating = Number(service.average_rating) || 0;
  const name   = service.name || 'Craftsman';
  return (
    <div className="kk-card">
      <div className="kk-card-cover">
        <img src={cover || PLACEHOLDER} alt={name} className="kk-card-img" loading="lazy"
          onError={e=>{ e.target.src=PLACEHOLDER; }}/>
        <span className="kk-badge-trade">{service.primary_service}</span>
        {rating >= 4.5 && <span className="kk-badge-top">⭐ Top Rated</span>}
      </div>
      <div className="kk-card-body">
        <div className="kk-card-profile">
          {avatar
            ? <img src={avatar} alt={name} className="kk-avatar" loading="lazy"
                onError={e=>{ e.target.src = cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8f5e9&color=198754&size=88`; }}/>
            : <img src={cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8f5e9&color=198754&size=88`}
                alt={name} className="kk-avatar" loading="lazy"
                onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8f5e9&color=198754&size=88`; }}/>
          }
          <div style={{minWidth:0}}>
            <p className="kk-card-name">{name}</p>
            {service.location && (
              <span className="kk-card-loc">
                <i className="fas fa-map-marker-alt me-1"/>{service.location}
              </span>
            )}
          </div>
        </div>
        {rating > 0 && (
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <StarRating rating={rating}/>
            <span style={{fontSize:'.75rem',color:'#6c757d',fontWeight:600}}>{rating.toFixed(1)}</span>
          </div>
        )}
        {service.description && (
          <p className="kk-card-desc">
            {service.description.length > 80 ? service.description.slice(0,80)+'…' : service.description}
          </p>
        )}
        {id
          ? <Link to={`/craftsmen/${id}`} className="kk-btn-hire-sm">
              View Profile &amp; Hire
            </Link>
          : <span className="kk-btn-hire-sm kk-btn-muted">Unavailable</span>
        }
      </div>
    </div>
  );
}

/* ─── Service Group Modal ─── */
function ServiceModal({ isOpen, onClose, serviceName, craftsmen, coverImg, navigate }) {
  const panelRef = useRef(null);
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  return (
    <div className="kk-modal-backdrop" onClick={e=>{ if(panelRef.current && !panelRef.current.contains(e.target)) onClose(); }}
      role="dialog" aria-modal="true" aria-label={`${serviceName} craftsmen`}>
      <div className="kk-modal-panel" ref={panelRef}>
        {/* Hero */}
        <div className="kk-modal-hero">
          <img src={coverImg || PLACEHOLDER} alt={serviceName} className="kk-modal-hero-img"
            onError={e=>{e.target.src=PLACEHOLDER;}}/>
          <div className="kk-modal-hero-overlay"/>
          <div className="kk-modal-hero-content">
            <span className="kk-modal-badge"><i className="fas fa-hard-hat me-2"/>{serviceName}</span>
            <h2 className="kk-modal-title">{serviceName} Craftsmen in Kenya</h2>
            <p className="kk-modal-sub">{craftsmen.length} verified professional{craftsmen.length!==1?'s':''} available — click any card to hire</p>
          </div>
          <button className="kk-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"/>
          </button>
        </div>
        {/* Grid */}
        <div className="kk-modal-body">
          {craftsmen.length === 0 ? (
            <div style={{textAlign:'center',padding:'48px 20px',color:'#6c757d'}}>
              <div style={{fontSize:'2.5rem',marginBottom:12}}>🔍</div>
              <p style={{fontWeight:600}}>No craftsmen available here yet — check back soon.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {craftsmen.map((c, idx) => {
                const img = c.services?.[0]?.image || c.service_image;
                const src = img ? (img.startsWith('http') ? img : `${MEDIA_URL}${img}`) : PLACEHOLDER;
                const av  = imgUrl(c.profile_image || c.avatar);
                const cId = c.slug || c.id || '';
                const nm  = c.name || 'Craftsman';
                const rt  = Number(c.average_rating) || 0;
                const getLabel = sv => typeof sv==='string' ? sv : sv?.name||sv?.title||'';
                return (
                  <div key={c.id||idx} className="col">
                    <div className="kk-modal-card">
                      <div className="kk-modal-card-cover">
                        <img src={src} alt={c.primary_service} loading="lazy" className="kk-modal-card-img"
                          onError={e=>{e.target.src=PLACEHOLDER;}}/>
                        {rt>=4.5 && <span className="kk-badge-top" style={{top:8,right:8}}>⭐ Top Rated</span>}
                      </div>
                      <div className="kk-modal-card-body">
                        <div className="kk-card-profile">
                          {av
                            ? <img src={av} alt={nm} className="kk-avatar" loading="lazy"
                                onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=e8f5e9&color=198754&size=88`; }}/>
                            : <img src={src!==PLACEHOLDER ? src : `https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=e8f5e9&color=198754&size=88`}
                                alt={nm} className="kk-avatar" loading="lazy"
                                onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=e8f5e9&color=198754&size=88`; }}/>
                          }
                          <div style={{minWidth:0}}>
                            <p className="kk-card-name">{nm}</p>
                            {c.location && <span className="kk-card-loc"><i className="fas fa-map-marker-alt me-1"/>{c.location}</span>}
                          </div>
                        </div>
                        {rt>0 && <div style={{display:'flex',alignItems:'center',gap:5,marginTop:4}}><StarRating rating={rt}/><span style={{fontSize:'.72rem',color:'#6c757d',fontWeight:600}}>{rt.toFixed(1)}</span></div>}
                        {c.description && <p className="kk-card-desc">{c.description.length>90?c.description.slice(0,90)+'…':c.description}</p>}
                        {c.services?.length>0 && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
                            {c.services.slice(0,3).map((sv,si)=>{ const l=getLabel(sv); return l?<span key={si} className="kk-sub-tag">{l}</span>:null; })}
                          </div>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="kk-phone-pill" onClick={e=>e.stopPropagation()}>
                            <i className="fas fa-phone me-1"/>{c.phone}
                          </a>
                        )}
                        {cId ? (
                          <div style={{display:'flex',gap:7,marginTop:'auto'}}>
                            <button className="kk-modal-btn-outline" onClick={()=>{ onClose(); setTimeout(()=>navigate(`/craftsmen/${cId}`),50); }}>
                              <i className="fas fa-user me-1"/>Profile
                            </button>
                            <button className="kk-modal-btn-hire" onClick={()=>{ onClose(); setTimeout(()=>navigate('/HireLogin'),50); }}>
                              <i className="fas fa-hard-hat me-1"/>Hire {nm.split(' ')[0]}
                            </button>
                          </div>
                        ) : <span className="kk-btn-hire-sm kk-btn-muted">Unavailable</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [craftsmen,      setCraftsmen]      = useState([]);
  const [loadingCraft,   setLoadingCraft]   = useState(true);
  const [query,          setQuery]          = useState('');
  const [location,       setLocation]       = useState('');
  const [locSugs,        setLocSugs]        = useState([]);
  const [showSugs,       setShowSugs]       = useState(false);
  const [searched,       setSearched]       = useState(false);
  const [results,        setResults]        = useState([]);
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError,   setReviewsError]   = useState(false);
  const [faqQ,    setFaqQ]    = useState('');
  const [faqSent, setFaqSent] = useState(false);
  const [faqBusy, setFaqBusy] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalSvcName, setModalSvcName] = useState('');
  const [modalList,    setModalList]    = useState([]);
  const [modalCover,   setModalCover]   = useState('');
  const resultsRef = useRef(null);

  useEffect(() => { const fn = ()=>setShowTop(window.scrollY>500); window.addEventListener('scroll',fn,{passive:true}); return ()=>window.removeEventListener('scroll',fn); },[]);
  useEffect(() => { AOS.init({ duration:700, once:true, offset:40 }); },[]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/public-craftsman/`)
      .then(r => setCraftsmen((r.data||[]).filter(i=>i.status==='approved'&&i.primary_service).map(i=>({...i,images:i.images||[]}))))
      .catch(console.error)
      .finally(()=>setLoadingCraft(false));
  },[]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/reviews/public`)
      .then(r => {
        const raw = (r.data || []).filter(x => (x.comment || x.review || x.body) && x.rating);
        const normalized = raw.slice(0, 12).map((x, idx) => ({
          comment:          x.comment || x.review || x.body || '',
          rating:           x.rating,
          reviewer:         x.reviewer || x.client_name || x.reviewed_by || x.user?.name || x.user?.username || 'Client',
          craftsman_name:   x.craftsman_name || x.craftsman?.name || x.artisan_name || '',
          craftsman_image:  x.craftsman?.profile_image || x.craftsman?.avatar || x.craftsman_image || x.craftsman_avatar || '',
          trade:            x.trade || x.service || x.craftsman?.primary_service || x.craftsman?.trade || '',
          location:         x.location || x.craftsman?.location || '',
          _i:               idx % 3,
        }));
        setReviews(normalized);
      })
      .catch(() => setReviewsError(true))
      .finally(() => setReviewsLoading(false));
  },[]);

  useEffect(() => { if(!loadingCraft&&searched) doSearch(); },[loadingCraft]); // eslint-disable-line

  const onLocInput = v => {
    setLocation(v);
    if(!v.trim()){setLocSugs([]);setShowSugs(false);}
    else{ const m=KENYA_LOCATIONS.filter(l=>l.toLowerCase().includes(v.toLowerCase())); setLocSugs(m); setShowSugs(m.length>0); }
  };

  const doSearch = (qOv, lOv) => {
    const q   = (qOv  !== undefined ? qOv   : query).trim().toLowerCase();
    const loc = (lOv  !== undefined ? lOv   : location).trim().toLowerCase();
    if (!q && !loc) return;
    setShowSugs(false); setSearched(true);
    if (loadingCraft) {
      setResults([]);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 60);
      return;
    }
    const out = craftsmen.filter(s => {
      const n   = (s.name             || '').toLowerCase();
      const sv  = (s.primary_service  || '').toLowerCase();
      const lo  = (s.location         || '').toLowerCase();
      const de  = (s.description      || '').toLowerCase();
      const sub = (s.services || []).map(x => typeof x === 'string' ? x : (x?.name || x?.title || '')).join(' ').toLowerCase();
      const matchQ   = !q   || n.includes(q) || sv.includes(q) || lo.includes(q) || de.includes(q) || sub.includes(q);
      const matchLoc = !loc || lo.includes(loc);
      return matchQ && matchLoc;
    });
    setResults(out);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 60);
  };

  const clearSearch = ()=>{setQuery('');setLocation('');setSearched(false);setResults([]);};

  const sendFaq = async()=>{
    if(!faqQ.trim()) return;
    setFaqBusy(true);
    try{await axios.post(`${API_BASE_URL}/contact/`,{question:faqQ});}catch{}
    finally{setFaqBusy(false);setFaqSent(true);setFaqQ('');}
  };

  const grouped = craftsmen.reduce((acc,c)=>{ const s=c.primary_service; if(!s)return acc; if(!acc[s])acc[s]=[]; acc[s].push(c); return acc; },{});

  const openModal = (svcName, cover) => { setModalSvcName(svcName); setModalList(grouped[svcName]||[]); setModalCover(cover); setModalOpen(true); };
  const closeModal = ()=>{ setModalOpen(false); setModalSvcName(''); setModalList([]); setModalCover(''); };

  const staticReviews = [
    {comment:"The carpenter was professional, on time and the work was perfect. My furniture looks amazing!",rating:5,reviewer:"Sarah M.",craftsman_name:"James Odhiambo",craftsman_image:'',trade:"Carpentry",location:"Nairobi",_i:0},
    {comment:"My electrician fixed everything safely and charged a fair price. Would absolutely hire again.",rating:5,reviewer:"Kevin O.",craftsman_name:"Peter Mwangi",craftsman_image:'',trade:"Electrical",location:"Mombasa",_i:1},
    {comment:"The tailor made my custom outfit exactly as I described. Very pleased with the quality.",rating:4.5,reviewer:"Linda A.",craftsman_name:"Grace Wanjiku",craftsman_image:'',trade:"Tailoring",location:"Kisumu",_i:2},
  ];
  const shownReviews = (!reviewsLoading && !reviewsError && reviews.length) ? reviews : staticReviews;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes heroSlide { 0%{transform:scale(1)} 100%{transform:scale(1.04)} }
        @keyframes scrollTrack { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(255,215,0,.7)} 70%{box-shadow:0 0 0 14px rgba(255,215,0,0)} 100%{box-shadow:0 0 0 0 rgba(255,215,0,0)} }
        @keyframes modalIn   { from{opacity:0;transform:translateY(48px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes floatUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

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
        }
        *{box-sizing:border-box;}
        body{background:var(--bg);font-family:'DM Sans',sans-serif;color:var(--text);}

        /* ── Shimmer ── */
        .kk-skel{background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        .kk-stars{color:var(--gold);display:inline-flex;gap:2px;font-size:.82rem;}

        /* ══════════════════════════════
           HERO
        ══════════════════════════════ */
        .kk-hero{
          position:relative;height:88vh;min-height:560px;
          display:flex;align-items:center;justify-content:center;
          text-align:center;color:#fff;overflow:hidden;
        }
        .kk-hero-bg{
          position:absolute;inset:0;
          background-size:cover;background-position:center;
          animation:heroSlide 14s ease-in-out infinite alternate;
        }
        .kk-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.18) 0%,rgba(0,0,0,.42) 100%);}
        .kk-hero-content{position:relative;z-index:2;max-width:780px;padding:0 24px;animation:floatUp .9s ease both;}
        .kk-hero-eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(255,215,0,.18);border:1.5px solid rgba(255,215,0,.5);
          border-radius:50px;padding:6px 18px;
          font-size:.75rem;font-weight:700;color:var(--gold);
          letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px;
        }
        .kk-hero-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);display:inline-block;}
        .kk-hero-title{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,3.6rem);font-weight:800;line-height:1.15;margin:0 0 16px;}
        .kk-hero-sub{font-size:1.1rem;font-weight:400;margin:0 0 32px;color:rgba(255,255,255,.88);line-height:1.8;max-width:560px;margin-left:auto;margin-right:auto;}
        .kk-hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
        .kk-hero-scroll{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;color:rgba(255,255,255,.6);font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;z-index:2;}
        .kk-hero-scroll-line{width:1px;height:36px;background:rgba(255,255,255,.3);}

        /* ── Buttons ── */
        .kk-btn-gold{display:inline-flex;align-items:center;gap:7px;background:var(--gold);color:#1a1a2e;border:none;border-radius:12px;padding:14px 28px;font-weight:700;font-size:.93rem;text-decoration:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(255,215,0,.35);}
        .kk-btn-gold:hover{background:var(--gold-d);color:#1a1a2e;transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,215,0,.45);}
        .kk-btn-green-outline{display:inline-flex;align-items:center;gap:7px;background:var(--gold);color:#1a1a2e;border:2px solid var(--gold);border-radius:12px;padding:12px 26px;font-weight:700;font-size:.93rem;text-decoration:none;cursor:pointer;transition:all .2s;}
        .kk-btn-green-outline:hover{background:var(--gold-d);color:#1a1a2e;border-color:var(--gold-d);transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,215,0,.45);}
        .kk-btn-hire-sm{display:block;text-align:center;background:var(--green);color:#fff;border:none;border-radius:10px;padding:11px 0;font-weight:700;font-size:.86rem;text-decoration:none;cursor:pointer;transition:all .18s;margin-top:auto;}
        .kk-btn-hire-sm:hover{background:var(--green-d);color:#fff;transform:translateY(-1px);}
        .kk-btn-muted{background:#e4e4e4!important;color:#aaa!important;cursor:default!important;transform:none!important;}

        /* ══════════════════════════════
           HOW IT WORKS — white section, large icon circles
           connecting dashed line, kaakazini.com style
        ══════════════════════════════ */
        .kk-hiw{background:var(--gold-l);padding:80px 0;border-top:3px solid rgba(255,215,0,.3);border-bottom:3px solid rgba(255,215,0,.3);}
        .kk-hiw-steps{
          display:flex;justify-content:space-between;
          align-items:flex-start;position:relative;
          gap:0;
        }
        /* dashed connector line */
        .kk-hiw-steps::before{
          content:'';position:absolute;
          top:52px;left:calc(12.5% + 10px);right:calc(12.5% + 10px);
          height:2px;
          background:repeating-linear-gradient(to right,rgba(255,215,0,.6) 0,rgba(255,215,0,.6) 10px,transparent 10px,transparent 20px);
        }
        .kk-hiw-item{
          flex:1;text-align:center;padding:0 12px;
          position:relative;z-index:1;
        }
        .kk-hiw-icon-wrap{
          position:relative;display:inline-flex;
          align-items:center;justify-content:center;
          margin-bottom:20px;
        }
        /* white circle, gold border, dark icon */
        .kk-hiw-circle{
          width:104px;height:104px;border-radius:50%;
          background:#fff;
          border:3px solid var(--gold);
          display:flex;align-items:center;justify-content:center;
          font-size:2.2rem;color:#1a1a2e;
          box-shadow:0 8px 28px rgba(255,215,0,.22);
          transition:transform .3s,box-shadow .3s;
        }
        .kk-hiw-item:hover .kk-hiw-circle{transform:translateY(-5px);box-shadow:0 16px 48px rgba(255,215,0,.42);}
        /* gold step number badge */
        .kk-hiw-num{
          position:absolute;top:-6px;right:-6px;
          width:28px;height:28px;border-radius:50%;
          background:var(--gold);color:#1a1a2e;
          display:flex;align-items:center;justify-content:center;
          font-size:.78rem;font-weight:800;
          border:2px solid #fff;
          animation:pulseRing 2.2s infinite;
        }
        .kk-hiw-title{font-weight:700;color:var(--text);font-size:1rem;margin:0 0 8px;}
        .kk-hiw-body{font-size:.86rem;color:var(--muted);line-height:1.7;max-width:200px;margin:0 auto;}
        @media(max-width:768px){
          .kk-hiw-steps{flex-direction:column;align-items:center;gap:40px;}
          .kk-hiw-steps::before{display:none;}
          .kk-hiw-item{max-width:280px;}
        }

        /* ══════════════════════════════
           STATS — white background, circles with gold border
           matching kaakazini.com style
        ══════════════════════════════ */
        .kk-stats{
          background:#fff;
          padding:72px 0;
        }
        .kk-stat-item{text-align:center;}
        .kk-stat-circle{
          width:clamp(145px,18vw,175px);height:clamp(145px,18vw,175px);
          border-radius:50%;
          background:#fff;
          border:4px solid var(--gold);
          box-shadow:0 6px 28px rgba(0,0,0,.08);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          margin:0 auto;cursor:default;
          transition:transform .3s,box-shadow .3s;
        }
        .kk-stat-circle:hover{transform:translateY(-8px);box-shadow:0 18px 44px rgba(255,215,0,.28);}
        .kk-stat-icon{font-size:1.5rem;color:var(--green);margin-bottom:4px;}
        .kk-stat-value{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:800;color:var(--gold);margin:0;line-height:1;}
        .kk-stat-label{font-size:.72rem;font-weight:700;color:var(--muted);margin:5px 0 0;text-transform:uppercase;letter-spacing:.05em;}
        .kk-stats-title{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;color:var(--text);}
        .kk-stats-sub{color:var(--muted);font-size:.95rem;}

        /* ══════════════════════════════
           SEARCH SECTION
        ══════════════════════════════ */
        .kk-search-section{background:var(--green-d);padding:52px 0 56px;}
        .kk-search-heading{color:#fff;font-family:'Playfair Display',serif;font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 6px;}
        .kk-search-sub{color:rgba(255,255,255,.75);font-size:.93rem;margin:0 0 28px;}
        .kk-search-box{
          background:#fff;border-radius:16px;
          display:flex;align-items:stretch;
          box-shadow:0 8px 40px rgba(0,0,0,.28);
          max-width:780px;margin:0 auto;
          border:3px solid rgba(255,215,0,.35);
          overflow:visible;position:relative;
        }
        .kk-sf{display:flex;align-items:center;gap:8px;flex:1;padding:14px 18px;min-width:0;}
        .kk-sf-icon{color:var(--green);font-size:.95rem;flex-shrink:0;}
        .kk-sf-icon-loc{color:#f59e0b;}
        .kk-sf-input{border:none;outline:none;background:transparent;font-size:.95rem;color:var(--text);font-weight:500;width:100%;min-width:0;font-family:'DM Sans',sans-serif;}
        .kk-sf-input::placeholder{color:#bbb;font-weight:400;}
        .kk-sf-div{width:1px;background:#e0e0e0;align-self:stretch;flex-shrink:0;margin:10px 0;}
        .kk-loc-wrap{position:relative;flex:1;display:flex;align-items:center;gap:8px;min-width:0;padding:14px 18px 14px 0;}
        .kk-loc-dd{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1.5px solid #e0e0e0;border-radius:12px;list-style:none;padding:6px 0;margin:0;z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,.12);}
        .kk-loc-dd li{padding:9px 16px;cursor:pointer;font-size:.88rem;display:flex;align-items:center;gap:8px;transition:background .1s;}
        .kk-loc-dd li i{color:var(--green);font-size:.78rem;}
        .kk-loc-dd li:hover{background:var(--green-l);}
        .kk-sf-btn{background:var(--gold);color:#1a1a2e;border:none;border-radius:0 12px 12px 0;padding:0 32px;font-weight:700;font-size:.95rem;cursor:pointer;transition:background .18s;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;}
        .kk-sf-btn:hover:not(:disabled){background:var(--gold-d);}
        .kk-sf-btn:disabled{opacity:.4;cursor:not-allowed;}
        .kk-search-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.85);border:1.5px solid rgba(255,255,255,.3);border-radius:30px;padding:8px 20px;font-size:.82rem;font-weight:600;text-decoration:none;transition:all .2s;margin-top:16px;}
        .kk-search-pill:hover{background:rgba(255,255,255,.22);color:#fff;transform:translateY(-2px);}
        @media(max-width:600px){
          .kk-search-box{flex-direction:column;border-radius:14px;}
          .kk-sf{padding:12px 16px;width:100%;}
          .kk-loc-wrap{padding:12px 16px;width:100%;border-top:1px solid #f0f0f0;}
          .kk-sf-div{display:none;}
          .kk-sf-btn{width:100%;border-radius:0 0 12px 12px;padding:14px;}
        }

        /* ══════════════════════════════
           SEARCH RESULTS
        ══════════════════════════════ */
        .kk-results-section{background:#f5f5f0;padding:0 0 60px;}
        .kk-results-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:22px 0 20px;border-bottom:1.5px solid #e4e4e4;margin-bottom:28px;}
        .kk-results-tag{background:var(--green-l);color:var(--green);border:1px solid #a5d6a7;border-radius:20px;padding:5px 18px;font-size:.84rem;font-weight:600;}
        .kk-clear-btn{background:#fff;border:1.5px solid #e0e0e0;color:var(--muted);border-radius:20px;padding:5px 16px;font-size:.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s;}
        .kk-clear-btn:hover{background:#fee2e2;color:#dc2626;border-color:#fca5a5;}

        /* ══════════════════════════════
           CARDS
        ══════════════════════════════ */
        .kk-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);transition:transform .25s,box-shadow .25s,border-color .2s;display:flex;flex-direction:column;height:100%;border:1.5px solid #ede9e2;position:relative;}
        .kk-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(to right,var(--green),var(--gold));transform:scaleX(0);transform-origin:left;transition:transform .3s;z-index:1;}
        .kk-card:hover{transform:translateY(-5px);box-shadow:0 12px 36px rgba(0,0,0,.12);border-color:#c8e6c9;}
        .kk-card:hover::before{transform:scaleX(1);}
        .kk-card-cover{position:relative;height:200px;overflow:hidden;flex-shrink:0;}
        .kk-card-img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .kk-card:hover .kk-card-img{transform:scale(1.06);}
        .kk-badge-trade{position:absolute;top:10px;left:10px;background:rgba(25,135,84,.88);color:#fff;border-radius:20px;padding:3px 11px;font-size:.7rem;font-weight:700;backdrop-filter:blur(4px);}
        .kk-badge-top{position:absolute;top:10px;right:10px;background:rgba(255,215,0,.93);color:#1a1a2e;border-radius:20px;padding:3px 10px;font-size:.67rem;font-weight:800;}
        .kk-card-body{padding:16px;display:flex;flex-direction:column;gap:9px;flex:1;}
        .kk-card-profile{display:flex;align-items:center;gap:10px;}
        .kk-avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2.5px solid var(--gold);flex-shrink:0;}
        .kk-avatar-fb{width:44px;height:44px;border-radius:50%;background:var(--green-l);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2.5px solid var(--gold);flex-shrink:0;}
        .kk-card-name{font-size:.93rem;font-weight:700;color:var(--text);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .kk-card-loc{font-size:.74rem;color:var(--green);display:block;margin-top:1px;}
        .kk-card-desc{font-size:.78rem;color:var(--muted);line-height:1.55;margin:0;flex:1;}
        .kk-sub-tag{background:var(--green-l);color:var(--green);border-radius:20px;padding:2px 9px;font-size:.69rem;font-weight:600;}
        .kk-phone-pill{display:inline-flex;align-items:center;background:#f1f3f5;color:#495057;border-radius:20px;padding:4px 12px;font-size:.74rem;font-weight:600;text-decoration:none;transition:all .15s;width:fit-content;margin-top:2px;}
        .kk-phone-pill:hover{background:var(--green);color:#fff;}



        /* ══════════════════════════════
           SERVICES / TRADES SECTION
        ══════════════════════════════ */
        .kk-services{background:#f5f5f0;padding:72px 0;}
        .kk-svc-card{width:100%;cursor:pointer;border-radius:14px;outline:none;background:none;border:none;padding:0;display:block;}
        .kk-svc-card:focus-visible .kk-svc-inner{outline:3px solid var(--green);outline-offset:3px;}
        .kk-svc-inner{border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);transition:transform .25s,box-shadow .25s;background:#fff;border:1.5px solid #ede9e2;}
        .kk-svc-card:hover .kk-svc-inner,.kk-svc-card:focus-visible .kk-svc-inner{transform:translateY(-6px);box-shadow:0 14px 36px rgba(0,0,0,.14);}
        .kk-svc-img-wrap{position:relative;height:220px;overflow:hidden;}
        .kk-svc-img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .kk-svc-card:hover .kk-svc-img,.kk-svc-card:focus-visible .kk-svc-img{transform:scale(1.06);}
        .kk-svc-overlay{position:absolute;inset:0;background:rgba(25,135,84,0);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:background .25s;pointer-events:none;}
        .kk-svc-card:hover .kk-svc-overlay,.kk-svc-card:focus-visible .kk-svc-overlay{background:rgba(25,135,84,.62);}
        .kk-svc-overlay-label{opacity:0;transform:translateY(10px);transition:opacity .2s,transform .2s;background:rgba(0,0,0,.3);color:#fff;border-radius:20px;padding:7px 18px;font-size:.85rem;font-weight:700;display:flex;align-items:center;gap:6px;}
        .kk-svc-overlay-count{opacity:0;transform:translateY(10px);transition:opacity .2s .06s,transform .2s .06s;background:var(--gold);color:#1a1a2e;border-radius:20px;padding:3px 14px;font-size:.75rem;font-weight:800;}
        .kk-svc-card:hover .kk-svc-overlay-label,.kk-svc-card:hover .kk-svc-overlay-count,.kk-svc-card:focus-visible .kk-svc-overlay-label,.kk-svc-card:focus-visible .kk-svc-overlay-count{opacity:1;transform:translateY(0);}
        .kk-svc-body{padding:16px;text-align:center;}
        .kk-svc-name{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--text);margin:0 0 4px;}
        .kk-svc-loc{font-size:.8rem;color:var(--green);font-weight:600;display:block;margin-bottom:10px;}
        .kk-svc-cta{background:var(--green);color:#fff;border-radius:8px;padding:9px 0;font-size:.82rem;font-weight:700;text-align:center;transition:background .18s;}
        .kk-svc-card:hover .kk-svc-cta,.kk-svc-card:focus-visible .kk-svc-cta{background:var(--green-d);}

        /* ── Service cards scroll track (like reviews) ── */
        .kk-svc-track-wrap{
          overflow:hidden;position:relative;margin:0 -12px;padding:20px 0 24px;
          -webkit-mask:linear-gradient(to right,transparent 0%,#f5f5f0 7%,#f5f5f0 93%,transparent 100%);
          mask:linear-gradient(to right,transparent 0%,#f5f5f0 7%,#f5f5f0 93%,transparent 100%);
        }
        .kk-svc-track-wrap:hover .kk-svc-track{animation-play-state:paused;}
        .kk-svc-track{display:flex;gap:22px;width:max-content;animation:scrollTrack 40s linear infinite;padding:0 12px;}
        .kk-svc-track-item{width:280px;flex-shrink:0;}

        /* ══════════════════════════════
           MODAL
        ══════════════════════════════ */
        .kk-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.65);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease;padding:0;}
        @media(min-width:768px){.kk-modal-backdrop{align-items:center;padding:20px;}}
        .kk-modal-panel{background:#f4f6f8;border-radius:22px 22px 0 0;width:100%;max-width:1140px;max-height:92vh;display:flex;flex-direction:column;animation:modalIn .3s cubic-bezier(.34,1.4,.64,1);overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.25);}
        @media(min-width:768px){.kk-modal-panel{border-radius:20px;max-height:90vh;}}
        .kk-modal-hero{position:relative;height:175px;flex-shrink:0;overflow:hidden;}
        @media(min-width:768px){.kk-modal-hero{height:210px;}}
        .kk-modal-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
        .kk-modal-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.05) 0%,rgba(0,0,0,.72) 100%);}
        .kk-modal-hero-content{position:absolute;bottom:0;left:0;right:0;padding:18px 22px;display:flex;flex-direction:column;gap:6px;}
        .kk-modal-badge{display:inline-flex;align-items:center;background:var(--gold);color:#1a1a2e;border-radius:20px;padding:3px 13px;font-size:.72rem;font-weight:800;width:fit-content;}
        .kk-modal-title{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,3vw,1.9rem);font-weight:800;color:#fff;margin:0;}
        .kk-modal-sub{font-size:.82rem;color:rgba(255,255,255,.82);margin:0;}
        .kk-modal-close{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);backdrop-filter:blur(6px);border:1.5px solid rgba(255,255,255,.35);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.88rem;cursor:pointer;transition:all .15s;z-index:2;}
        .kk-modal-close:hover{background:rgba(220,38,38,.85);border-color:transparent;}
        .kk-modal-body{overflow-y:auto;padding:24px;flex:1;min-height:0;}
        .kk-modal-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);transition:transform .25s,box-shadow .25s;display:flex;flex-direction:column;height:100%;}
        .kk-modal-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,.12);}
        .kk-modal-card-cover{position:relative;height:150px;overflow:hidden;flex-shrink:0;}
        .kk-modal-card-img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .kk-modal-card:hover .kk-modal-card-img{transform:scale(1.06);}
        .kk-modal-card-body{padding:14px;display:flex;flex-direction:column;gap:8px;flex:1;}
        .kk-modal-btn-outline{flex:1;text-align:center;background:var(--green-l);color:var(--green);border:1.5px solid var(--green);border-radius:9px;padding:9px 0;font-weight:700;font-size:.8rem;text-decoration:none;transition:all .18s;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .kk-modal-btn-outline:hover{background:var(--green);color:#fff;}
        .kk-modal-btn-hire{flex:1;text-align:center;background:var(--green);color:#fff;border:none;border-radius:9px;padding:9px 0;font-weight:700;font-size:.8rem;text-decoration:none;transition:background .18s;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .kk-modal-btn-hire:hover{background:var(--green-d);color:#fff;}

        /* ══════════════════════════════
           ABOUT
        ══════════════════════════════ */
        .kk-about{background:var(--white);padding:72px 0;}
        .kk-carousel-wrap{height:400px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.1);}
        .kk-carousel-img{width:100%;height:100%;object-fit:cover;display:block;}
        @media(max-width:768px){.kk-carousel-wrap{height:240px;}}

        /* ══════════════════════════════
           HIRE CTA
        ══════════════════════════════ */
        .kk-hire{background:#f5f5f0;padding:72px 0;}
        .kk-hire-img-wrap{position:relative;min-height:300px;}
        .kk-hire-main{border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,.1);width:100%;max-height:360px;object-fit:cover;display:block;}
        .kk-hire-f1{position:absolute;top:-18px;right:-8px;width:44%;border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,.1);}
        .kk-hire-f2{position:absolute;bottom:-18px;left:-8px;width:44%;border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,.1);}
        @media(max-width:768px){.kk-hire-f1,.kk-hire-f2{display:none;}}

        /* ══════════════════════════════
           TESTIMONIALS
        ══════════════════════════════ */
        .kk-testi{background:var(--white);padding:72px 0;overflow:hidden;}
        .kk-testi-track-wrap{overflow:hidden;position:relative;-webkit-mask:linear-gradient(to right,transparent 0%,#fff 8%,#fff 92%,transparent 100%);mask:linear-gradient(to right,transparent 0%,#fff 8%,#fff 92%,transparent 100%);}
        .kk-testi-track-wrap:hover .kk-testi-track{animation-play-state:paused;}
        .kk-testi-track{display:flex;gap:22px;width:max-content;animation:scrollTrack 32s linear infinite;}
        .kk-testi-card{background:#fff;border-radius:14px;padding:22px;box-shadow:0 2px 16px rgba(0,0,0,.07);width:300px;flex-shrink:0;border:1.5px solid #ede9e2;transition:transform .3s,box-shadow .3s;}
        .kk-testi-card:hover{transform:translateY(-5px);box-shadow:0 12px 36px rgba(255,215,0,.2);}
        .kk-testi-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
        .kk-testi-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);flex-shrink:0;}
        .kk-testi-name{font-weight:700;color:var(--text);margin:0 0 1px;font-size:.88rem;}
        .kk-testi-loc{font-size:.72rem;color:var(--muted);margin:0 0 3px;}
        .kk-testi-comment{font-size:.84rem;color:#495057;font-style:italic;line-height:1.65;margin:0;}
        .kk-quote-icon{font-size:1.6rem;color:#e0ddd8;display:block;margin-bottom:5px;}

        /* ══════════════════════════════
           CRAFTSMEN SHOWCASE SCROLL
        ══════════════════════════════ */
        .kk-craft-track-wrap{overflow:hidden;position:relative;-webkit-mask:linear-gradient(to right,transparent 0%,#f5f5f0 6%,#f5f5f0 94%,transparent 100%);mask:linear-gradient(to right,transparent 0%,#f5f5f0 6%,#f5f5f0 94%,transparent 100%);}
        .kk-craft-track-wrap:hover .kk-craft-track{animation-play-state:paused;}
        .kk-craft-track{display:flex;gap:18px;width:max-content;animation:scrollTrack 38s linear infinite;}
        .kk-craft-pill{
          background:#fff;border-radius:60px;padding:10px 18px 10px 10px;
          display:flex;align-items:center;gap:12px;
          box-shadow:0 2px 14px rgba(0,0,0,.07);
          border:1.5px solid #ede9e2;flex-shrink:0;
          transition:transform .25s,box-shadow .25s;
          cursor:pointer;text-decoration:none;
        }
        .kk-craft-pill:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(255,215,0,.22);border-color:var(--gold);}
        .kk-craft-pill-img{
          width:52px;height:52px;border-radius:50%;object-fit:cover;
          border:2.5px solid var(--gold);flex-shrink:0;
        }
        .kk-craft-pill-name{font-weight:700;font-size:.88rem;color:var(--text);margin:0;white-space:nowrap;}
        .kk-craft-pill-trade{font-size:.72rem;color:var(--green);font-weight:600;margin:2px 0 0;white-space:nowrap;}

        /* ══════════════════════════════
           FAQ
        ══════════════════════════════ */
        .kk-faq{background:#f5f5f0;padding:72px 0;}
        .kk-faq-item{border:none!important;border-radius:12px!important;margin-bottom:10px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow:hidden;transition:transform .2s,box-shadow .2s;}
        .kk-faq-item:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(0,0,0,.09);}
        .kk-faq-btn{background:#fff!important;font-weight:600;font-size:.93rem;padding:17px 22px;border:none;font-family:'DM Sans',sans-serif;}
        .accordion-button:not(.collapsed){color:var(--green)!important;box-shadow:none!important;}
        .accordion-button::after{background-image:none!important;content:"+";font-size:1.35rem;font-weight:700;color:var(--green);}
        .accordion-button:not(.collapsed)::after{content:"−";}
        .kk-faq-body{background:#fff;color:var(--muted);padding:4px 22px 20px;font-size:.88rem;line-height:1.75;}
        .kk-q-card{background:#fff;border-radius:20px;padding:32px 26px;max-width:420px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,.08);}
        .kk-q-blob{width:110px;height:96px;background:var(--gold);border-radius:40% 60% 50% 50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;transition:transform .3s;cursor:default;}
        .kk-q-blob:hover{transform:scale(1.06) rotate(-3deg);}
        .kk-q-mark{font-size:3.4rem;font-weight:900;color:#fff;line-height:1;}
        .kk-q-area{border-radius:10px;padding:12px 14px;border:1.5px solid #e9ecef;width:100%;resize:vertical;font-size:.9rem;transition:border-color .2s,box-shadow .2s;font-family:'DM Sans',sans-serif;}
        .kk-q-area:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(25,135,84,.1);outline:none;}
        .kk-q-send{background:var(--green);color:#fff;border:none;border-radius:10px;padding:12px;font-weight:700;font-size:.92rem;width:100%;margin-top:12px;cursor:pointer;transition:background .18s;font-family:'DM Sans',sans-serif;}
        .kk-q-send:hover:not(:disabled){background:var(--green-d);}
        .kk-q-send:disabled{opacity:.55;cursor:not-allowed;}
        .kk-q-success{background:var(--green-l);color:var(--green);border-radius:10px;padding:14px;text-align:center;font-weight:600;font-size:.88rem;}

        /* ══════════════════════════════
           SECTION HEADERS
        ══════════════════════════════ */
        .kk-section-label{display:inline-flex;align-items:center;gap:8px;background:var(--green-l);border:1.5px solid #c8e6c9;border-radius:50px;padding:5px 16px;font-size:.72rem;font-weight:700;color:var(--green);letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px;}
        .kk-section-title{font-family:'Playfair Display',serif;font-size:clamp(1.7rem,3.5vw,2.4rem);font-weight:800;color:var(--text);margin:0 0 10px;}
        .kk-section-sub{font-size:.95rem;color:var(--muted);line-height:1.75;margin:0;}

        /* ══════════════════════════════
           FOOTER
        ══════════════════════════════ */
        .kk-footer{background:#1a1a2e;color:#bbb;padding:52px 0 26px;font-family:'DM Sans',sans-serif;}
        .kk-footer h5{color:#fff;font-weight:700;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;}
        .kk-footer a{color:#bbb;text-decoration:none;font-size:.85rem;transition:color .15s;}
        .kk-footer a:hover{color:var(--gold);}
        .kk-footer p{font-size:.85rem;margin-bottom:6px;}
        .kk-footer-hr{border-color:rgba(255,255,255,.08);margin:26px 0 18px;}
        .kk-footer-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:.8rem;}
        .kk-social a{font-size:1rem;color:#bbb;margin-right:14px;display:inline-block;transition:color .15s,transform .15s;}
        .kk-social a:hover{color:var(--gold);transform:translateY(-2px);}
        .kk-map-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.3);}

        /* ══════════════════════════════
           BACK TO TOP
        ══════════════════════════════ */
        .kk-back-top{position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:var(--green);color:#fff;border:none;font-size:.9rem;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(25,135,84,.4);cursor:pointer;transition:all .2s;z-index:9999;opacity:0;pointer-events:none;}
        .kk-back-top.on{opacity:1;pointer-events:auto;}
        .kk-back-top:hover{background:var(--green-d);transform:translateY(-2px);}

        /* empty state */
        .kk-empty{text-align:center;padding:56px 20px;}
        .kk-empty-icon{font-size:3rem;margin-bottom:14px;display:block;}
        .kk-empty h5{font-weight:700;color:var(--muted);}
        .kk-empty p{color:var(--muted);font-size:.9rem;}
      `}</style>

      {/* ══ MODAL ══ */}
      <ServiceModal
        isOpen={modalOpen} onClose={closeModal}
        serviceName={modalSvcName} craftsmen={modalList} coverImg={modalCover}
        navigate={navigate}
      />

      {/* ══════════════════════════════════════════
          HERO — who we are & two clear CTAs
      ══════════════════════════════════════════ */}
      <section className="kk-hero" id="top">
        <div className="kk-hero-bg" style={{backgroundImage:`url(${heroImage})`}} aria-hidden="true"/>
        <div className="kk-hero-overlay" aria-hidden="true"/>
        <div className="kk-hero-content">
          <h1 className="kk-hero-title">
            Find a Trusted Craftsman<br/>for Any Job in Kenya
          </h1>
          <p className="kk-hero-sub">
            Plumbers, electricians, carpenters, tailors, artisans and more — all verified and ready to work in your county. Search, view their portfolio, and hire in minutes.
          </p>
          <div className="kk-hero-btns">
            <Link to="/craftsmen" className="kk-btn-gold">
              Find a Craftsman Now
            </Link>
            <Link to="/signup" className="kk-btn-green-outline">
              Join as Craftsman — Free
            </Link>
          </div>
        </div>
        <div className="kk-hero-scroll" aria-hidden="true">
          <div className="kk-hero-scroll-line"/>
          Scroll
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — large icon circles, white bg
          matching kaakazini.com style
      ══════════════════════════════════════════ */}
      <section className="kk-hiw" id="how-it-works" aria-label="How KaaKazini works">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="kk-section-title">How It Works</h2>
            <p className="kk-section-sub">Get the right craftsman for your job in 4 simple steps</p>
          </div>
          <div className="kk-hiw-steps">
            {[
              { n:1, icon:'fas fa-search',      title:'Search a Trade',      body:'Type the trade you need and your county to find verified craftsmen near you.' },
              { n:2, icon:'fas fa-user-circle', title:'View Their Profile',  body:'Browse their portfolio, read real client reviews, and check their ratings.' },
              { n:3, icon:'fas fa-hard-hat',    title:'Hire Them',           body:'Click Hire Now on their profile page and agree on the job and price directly.' },
              { n:4, icon:'fas fa-star',        title:'Rate & Review',       body:'After the job, leave a review so other Kenyans can find the best craftsmen.' },
            ].map(({n,icon,title,body})=>(
              <div className="kk-hiw-item" key={n} data-aos="fade-up" data-aos-delay={n*90}>
                <div className="kk-hiw-icon-wrap">
                  <div className="kk-hiw-circle"><i className={icon}/></div>
                  <span className="kk-hiw-num">{n}</span>
                </div>
                <h3 className="kk-hiw-title">{title}</h3>
                <p className="kk-hiw-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION GUIDE BANNER ── */}
      <section style={{background:'#fff',borderTop:'3px solid var(--green-l)',padding:'40px 0'}}>
        <div className="container">
          <div className="row g-4 align-items-stretch justify-content-center">
            {/* FOR CLIENTS */}
            <div className="col-md-5" data-aos="fade-right">
              <div style={{background:'var(--green-l)',border:'2px solid #c8e6c9',borderRadius:16,padding:'28px 28px',height:'100%',display:'flex',flexDirection:'column',gap:12}}>
                <div style={{width:48,height:48,borderRadius:12,background:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:4}}>
                  <i className="fas fa-user" style={{color:'#fff',fontSize:'1.2rem'}}/>
                </div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:800,color:'var(--text)',margin:0}}>
                  I Need to Hire a Craftsman
                </h3>
                <p style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.75,margin:0}}>
                  No registration needed to browse. Search by trade, view profiles and reviews, then click <strong>Hire Now</strong> on any profile to get started.
                </p>
                <ol style={{fontSize:'.84rem',color:'#4a5568',paddingLeft:20,margin:0,lineHeight:2}}>
                  <li>Search or browse craftsmen below</li>
                  <li>Click a card to view their full profile</li>
                  <li>Click <strong style={{color:'var(--green)'}}>Hire Now</strong> and describe your job</li>
                  <li>Rate after the job is done </li>
                </ol>
                <Link to="/craftsmen" className="kk-btn-gold" style={{borderRadius:10,marginTop:'auto',textAlign:'center',padding:'12px 0'}}>
                  <i className="fas fa-search me-2"/>Browse Craftsmen
                </Link>
              </div>
            </div>
            {/* DIVIDER */}
            <div className="col-md-1 d-none d-md-flex align-items-center justify-content-center">
              <div style={{width:1,height:'80%',background:'#e0e0e0',position:'relative'}}>
                <span style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#fff',padding:'6px 4px',color:'var(--muted)',fontSize:'.75rem',fontWeight:700,border:'1.5px solid #e0e0e0',borderRadius:20,whiteSpace:'nowrap'}}>OR</span>
              </div>
            </div>
            {/* FOR CRAFTSMEN */}
            <div className="col-md-5" data-aos="fade-left">
              <div style={{background:'#fffbea',border:'2px solid var(--gold)',borderRadius:16,padding:'28px 28px',height:'100%',display:'flex',flexDirection:'column',gap:12}}>
                <div style={{width:48,height:48,borderRadius:12,background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:4}}>
                  <i className="fas fa-hard-hat" style={{color:'#1a1a2e',fontSize:'1.2rem'}}/>
                </div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:800,color:'var(--text)',margin:0}}>
                  I'm a Craftsman — Join Free
                </h3>
                <p style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.75,margin:0}}>
                  Create your free profile in minutes. Once approved by our team, you'll appear on the platform and start receiving hire requests from clients across Kenya.
                </p>
                <ol style={{fontSize:'.84rem',color:'#4a5568',paddingLeft:20,margin:0,lineHeight:2}}>
                  <li>Click <strong style={{color:'#c47800'}}>Register below</strong> — it's completely free</li>
                  <li>Fill in your trade, location &amp; description</li>
                  <li>Upload your portfolio photos</li>
                  <li>Wait for approval (usually 1–2 days)</li>
                </ol>
                <Link to="/signup" style={{display:'block',background:'var(--gold)',color:'#1a1a2e',border:'none',borderRadius:10,padding:'12px 0',fontWeight:700,fontSize:'.9rem',textDecoration:'none',textAlign:'center',marginTop:'auto',transition:'all .2s'}}>
                  <i className="fas fa-user-plus me-2"/>Register as Craftsman — Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{background:`url(${heroBottom}) no-repeat center center/cover`,height:'60px',width:'100%'}} aria-hidden="true"/>

      {/* ══════════════════════════════════════════
          STATS — yellow background, white circles
          (kaakazini.com style)
      ══════════════════════════════════════════ */}
      <section className="kk-stats" id="impact" aria-label="Platform stats">
        <div className="container">
          <div className="text-center mb-5" style={{position:'relative',zIndex:1}} data-aos="fade-up">
            <h2 className="kk-stats-title">Growing Kenya's Craft Economy</h2>
            <p className="kk-stats-sub mt-2">Real numbers from real craftsmen and happy clients</p>
          </div>
          <div className="row justify-content-center g-4">
            {[
              {icon:'bi-people-fill',     value:'100+', label:'Active Craftsmen'},
              {icon:'bi-clipboard-check', value:'50+',  label:'Jobs Completed'},
              {icon:'bi-emoji-smile',     value:'30+',  label:'Happy Clients'},
              {icon:'bi-shop',            value:'8+',   label:'Trades Available'},
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

      {/* ══════════════════════════════════════════
          SEARCH SECTION
      ══════════════════════════════════════════ */}
      <section className="kk-search-section" aria-label="Search for craftsmen">
        <div className="container">
          <div className="text-center mb-4" data-aos="fade-up">
            <h2 className="kk-search-heading">Search for a Craftsman</h2>
            <p className="kk-search-sub">Type a trade and your county  we'll show you verified craftsmen near you.</p>
          </div>
          {loadingCraft && (
            <p style={{textAlign:'center',color:'rgba(255,255,255,.7)',fontSize:'.82rem',marginBottom:10}}>
              <span className="spinner-border spinner-border-sm me-2" style={{color:'#fff'}} role="status" aria-hidden="true"/>
              Loading craftsmen…
            </p>
          )}
          <div className="kk-search-box">
            <div className="kk-sf">
              <i className="fas fa-search kk-sf-icon" aria-hidden="true"/>
              <input
                type="search" className="kk-sf-input"
                placeholder="Trade, e.g. Plumber, Electrician, Carpenter…"
                value={query} onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&doSearch(query, location)}
                aria-label="Search by trade"
              />
            </div>
            <div className="kk-sf-div" aria-hidden="true"/>
            <div className="kk-loc-wrap">
              <i className="fas fa-map-marker-alt kk-sf-icon kk-sf-icon-loc" aria-hidden="true"/>
              <input
                type="search" className="kk-sf-input"
                placeholder="County, e.g. Nairobi, Mombasa…"
                value={location} onChange={e=>onLocInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&doSearch(query, location)}
                onBlur={()=>setTimeout(()=>setShowSugs(false),180)}
                onFocus={()=>location.trim()&&setShowSugs(locSugs.length>0)}
                autoComplete="off" aria-label="Filter by county"
              />
              {showSugs && locSugs.length > 0 && (
                <ul className="kk-loc-dd" role="listbox">
                  {locSugs.slice(0,8).map((l,i)=>(
                    <li key={i} role="option" onMouseDown={()=>{ setLocation(l); setLocSugs([]); setShowSugs(false); doSearch(query,l); }}>
                      <i className="fas fa-map-marker-alt"/>{l}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="kk-sf-btn" onClick={()=>doSearch(query, location)} disabled={!query.trim()&&!location.trim()} aria-label="Search">
              <i className="fas fa-search me-2"/>Search
            </button>
          </div>
          <div className="text-center">
            <Link to="/craftsmen" className="kk-search-pill">
              Or browse all craftsmen and artisans by service
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SEARCH RESULTS ══ */}
      <div ref={resultsRef} style={{scrollMarginTop:'80px'}}/>
      {searched && (
        <section className="kk-results-section" aria-label="Search results" aria-live="polite">
          <div className="container">
            <div className="kk-results-bar">
              <span className="kk-results-tag">
                {loadingCraft ? 'Searching…'
                  : results.length > 0
                    ? <><strong>{results.length}</strong> craftsman{results.length!==1?'en':''} found{query?<> · "<em>{query}</em>"</>:''}{location?<> in <strong>{location}</strong></>:''}</>
                    : <>No results{query?` for "${query}"`:''}{ location?` in ${location}`:''}</>
                }
              </span>
              <button className="kk-clear-btn" onClick={clearSearch}>
                <i className="fas fa-times" aria-hidden="true"/>Clear search
              </button>
            </div>
            {loadingCraft ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
            ) : results.length === 0 ? (
              <div className="kk-empty">
                <span className="kk-empty-icon" role="img" aria-label="No results">🔍</span>
                <h5>No craftsmen match your search</h5>
                <p>Try a broader term — e.g. "plumber" instead of "pipe fitting". Or remove the county filter.</p>
                <Link to="/services" className="kk-btn-hire-sm" style={{display:'inline-block',width:'auto',padding:'11px 24px',marginTop:12}}>
                  <i className="fas fa-th-list me-2"/>View All Services
                </Link>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {results.map((s,i)=><div key={s.id||i} className="col"><CraftsmanCard service={s}/></div>)}
              </div>
            )}
          </div>
        </section>
      )}



      {/* ══════════════════════════════════════════
          SERVICES / TRADES
          — grouped by trade, each card opens modal
      ══════════════════════════════════════════ */}
      <section className="kk-services" id="services" aria-label="Browse by trade">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="kk-section-title">Explore Our Services</h2>
            <p className="kk-section-sub">Click any trade card to see all verified craftsmen available in that category — then hire directly from their profiles.</p>
          </div>

          <CoverFlow/>

          {/* ── Craftsmen Showcase — scrolling pills with real photos ── */}
          {!loadingCraft && craftsmen.length > 0 && (
            <div className="kk-craft-track-wrap mt-4 mb-2">
              <div className="kk-craft-track">
                {[...craftsmen,...craftsmen].map((c, i) => {
                  const profileImg = imgUrl(c.profile_image || c.avatar);
                  const svcImg     = imgUrl(c.services?.[0]?.image || c.service_image);
                  const photo      = profileImg || svcImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name||'C')}&background=e8f5e9&color=198754&size=88`;
                  const cId        = c.slug || c.id || '';
                  return (
                    <div
                      key={`${c.id||i}-${i}`}
                      className="kk-craft-pill"
                      onClick={()=>cId&&navigate(`/craftsmen/${cId}`)}
                      role="button" tabIndex={0}
                      onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&cId&&navigate(`/craftsmen/${cId}`)}
                      aria-label={`View ${c.name||'craftsman'} profile`}
                    >
                      <img
                        src={photo} alt={c.name||'Craftsman'}
                        className="kk-craft-pill-img"
                        loading="lazy"
                        onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name||'C')}&background=e8f5e9&color=198754&size=88`; }}
                      />
                      <div>
                        <p className="kk-craft-pill-name">{c.name||'Craftsman'}</p>
                        <p className="kk-craft-pill-trade">{c.primary_service}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loadingCraft ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mt-3">
              {[...Array(6)].map((_,i)=><SkeletonCard key={i}/>)}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="kk-empty mt-4">
              <span className="kk-empty-icon">🔍</span>
              <h5>No craftsmen available yet</h5>
              <p>Check back soon — new craftsmen join every day.</p>
            </div>
          ) : (
            <div className="kk-svc-track-wrap mt-3">
              <div className="kk-svc-track">
                {[...Object.entries(grouped),...Object.entries(grouped)].map(([tradeName, group], idx) => {
                  const src = group.find(c=>c.services?.[0]?.image||c.service_image);
                  const imgPath = src?.services?.[0]?.image || src?.service_image || null;
                  const cover = imgPath ? (imgPath.startsWith('http')?imgPath:`${MEDIA_URL}${imgPath}`) : PLACEHOLDER;
                  const locs  = [...new Set(group.map(c=>c.location).filter(Boolean))];
                  const locLabel = locs.length === 0 ? null : locs.slice(0,2).join(', ')+(locs.length>2?` +${locs.length-2} more`:'');
                  const count = group.length;
                  return (
                    <div key={`${tradeName}-${idx}`} className="kk-svc-track-item">
                      <div
                        className="kk-svc-card"
                        role="button" tabIndex={0}
                        onClick={()=>openModal(tradeName,cover)}
                        onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&openModal(tradeName,cover)}
                        aria-label={`Browse ${tradeName} craftsmen — ${count} available`}
                      >
                        <div className="kk-svc-inner">
                          <div className="kk-svc-img-wrap">
                            <img src={cover} alt={tradeName} className="kk-svc-img" loading="lazy" onError={e=>{e.target.src=PLACEHOLDER;}}/>
                            <div className="kk-svc-overlay" aria-hidden="true">
                              <span className="kk-svc-overlay-label"><i className="fas fa-users me-1"/>See Craftsmen</span>
                              <span className="kk-svc-overlay-count">{count} available</span>
                            </div>
                            <span style={{position:'absolute',top:10,right:10,background:'rgba(255,215,0,.93)',color:'#1a1a2e',borderRadius:20,padding:'3px 11px',fontSize:'.7rem',fontWeight:800,pointerEvents:'none'}}>
                              {count} {count===1?'craftsman':'craftsmen'}
                            </span>
                          </div>
                          <div className="kk-svc-body">
                            <p className="kk-svc-name">{tradeName}</p>
                            {locLabel&&<span className="kk-svc-loc"><i className="fas fa-map-marker-alt me-1"/>{locLabel}</span>}
                            <div className="kk-svc-cta"><i className="fas fa-users me-2"/>View {tradeName} Craftsmen</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="text-center mt-5" data-aos="fade-up">
            <Link to="/services" className="kk-btn-gold" style={{borderRadius:12,padding:'14px 42px'}}>
              <i className="fas fa-th-list me-2"/>View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HIRE SECTION — images + text CTA
      ══════════════════════════════════════════ */}
      <section className="kk-hire" aria-label="Hire craftsmen">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-md-6" data-aos="fade-right">
              {/* <div className="kk-section-label mb-3">For Clients</div> */}
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.7rem,3.5vw,2.4rem)',fontWeight:800,color:'#145a32',marginBottom:16}}>
                Hire Skilled Craftsmen in Your County — Effortlessly
              </h2>
              <p style={{color:'var(--muted)',fontSize:'1rem',lineHeight:'1.85',marginBottom:20}}>
                Every craftsman on KaaKazini is manually reviewed and approved before listing. You can browse their portfolio, read real reviews from past clients, and call or hire them directly — no middlemen, no hassle.
              </p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <Link to="/craftsmen" className="kk-btn-gold" style={{borderRadius:11}}>
                  <i className="fas fa-search me-2"/>Find a Craftsman
                </Link>
                <Link to="/signup" style={{display:'inline-flex',alignItems:'center',gap:7,background:'transparent',color:'var(--green)',border:'2px solid var(--green)',borderRadius:11,padding:'12px 22px',fontWeight:700,fontSize:'.9rem',textDecoration:'none',transition:'all .2s'}}>
                  <i className="fas fa-user-plus"/>Join as Craftsman
                </Link>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="kk-hire-img-wrap">
                <img src="https://couplingz.com/wp-content/uploads/2025/01/Couplingz-Plumbers-12.jpg" className="kk-hire-main" alt="Skilled plumber" loading="lazy"/>
                <img src="https://www.wilsonmclain.com/wp-content/uploads/2013/03/2-resized.png" className="kk-hire-f1" alt="Craftsman tools" loading="lazy"/>
                <img src={c3} className="kk-hire-f2" alt="Carpentry work" loading="lazy"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <section className="kk-about" id="about" aria-label="About KaaKazini">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="kk-section-title">About KaaKazini</h2>
            <p className="kk-section-sub">Connecting skilled craftsmen and artisans with the clients who need them — across every county in Kenya.</p>
          </div>
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <p style={{fontSize:'1.02rem',lineHeight:'1.9',color:'#4a5568',marginBottom:16}}>
                <strong>KaaKazini</strong> is a Kenyan platform built to solve a real problem: clients struggle to find trusted craftsmen and artisans, and skilled professionals struggle to find reliable clients. We bridge that gap.
              </p>
              <p style={{fontSize:'1.02rem',lineHeight:'1.9',color:'#4a5568'}}>
                Every craftsman and artisan is manually verified before they appear on the platform. You see their real portfolio, real reviews, and real contact details. From Nairobi to Kisumu — one skilled job at a time.
              </p>
              <Link to="/services" className="kk-btn-gold mt-3" style={{borderRadius:11,marginTop:20,display:'inline-flex',alignItems:'center',gap:8}}>
                <i className="fas fa-th-list"/>View All Services
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div id="aboutCarousel" className="carousel slide kk-carousel-wrap" data-bs-ride="carousel" data-bs-interval="3500">
                <div className="carousel-inner h-100">
                  {[
                    {src:'https://www.ariseiip.com/wp-content/uploads/2022/06/textile.png',alt:'Textile'},
                    {src:c2,alt:'Craftsman'},
                    {src:c3,alt:'Carpentry'},
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

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="kk-testi" aria-label="Client testimonials">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="kk-section-title">What Our Clients Say</h2>
            <p className="kk-section-sub">Real feedback from people who found and hired craftsmen and artisans through KaaKazini</p>
          </div>
        </div>
        {reviewsLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading…</span></div>
          </div>
        ) : (
          <div className="kk-testi-track-wrap" style={{backgroundImage:`url(${bgImage})`,backgroundRepeat:'repeat',backgroundSize:'200px',padding:'28px 0'}}>
            <div className="kk-testi-track">
              {[...shownReviews,...shownReviews].map((r,i)=>(
                <div className="kk-testi-card" key={i}>
                  <div className="kk-testi-top">
                    <img src={FALLBACK_AVATARS[(r._i!==undefined?r._i:i%shownReviews.length)%3]} alt={r.reviewer||'Client'} className="kk-testi-avatar" loading="lazy"/>
                    <div>
                      <p className="kk-testi-name">{r.reviewer||'Anonymous'}</p>
                      {r.location&&<p className="kk-testi-loc">{r.location}</p>}
                      <StarRating rating={Number(r.rating)}/>
                    </div>
                  </div>
                  <p className="kk-testi-comment">"{r.comment}"</p>
                  {(r.craftsman_name||r.trade)&&(
                    <div style={{display:'flex',alignItems:'center',gap:9,marginTop:10,borderTop:'1px solid #f0f0f0',paddingTop:10}}>
                      {r.craftsman_name&&(
                        <img
                          src={r.craftsman_image
                            ? imgUrl(r.craftsman_image)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.craftsman_name)}&background=e8f5e9&color=198754&size=64`}
                          alt={r.craftsman_name}
                          style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--gold)',flexShrink:0}}
                          loading="lazy"
                          onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(r.craftsman_name)}&background=e8f5e9&color=198754&size=64`; }}
                        />
                      )}
                      <div>
                        {r.craftsman_name&&<p style={{fontSize:'.72rem',color:'var(--green)',fontWeight:700,margin:0}}>{r.craftsman_name}</p>}
                        {r.trade&&<p style={{fontSize:'.68rem',color:'var(--muted)',margin:0}}>{r.trade}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="kk-faq" id="faq" aria-label="FAQ">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            {/* <div className="kk-section-label">FAQ</div> */}
            <h2 className="kk-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="row align-items-start g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="accordion" id="faqAcc">
                {[
                  {q:'How do I hire a craftsman?',        a:"Use the search bar above to find craftsmen by trade and county. Click their card to view their full profile, portfolio and ratings. Then click 'Hire Now' on their profile page."},
                  {q:'Is it free to search and hire?',    a:'Yes — searching and contacting craftsmen is completely free for clients. Craftsmen also join for free; we only take a small commission on completed jobs.'},
                  {q:'Are the craftsmen verified?',       a:'Yes. Every craftsman is manually reviewed by our team before they appear on the platform. We check their credentials and approve only genuine professionals.'},
                  {q:'What trades are available?',        a:'Plumbing, electrical, carpentry, tiling, masonry, tailoring, metalwork, painting, and more. New trades and craftsmen join every week.'},
                  {q:'How do I leave a review?',          a:'After your job is done, visit the craftsman\'s profile and submit a rating and review. This helps other Kenyans find the best craftsmen.'},
                  {q:'Are craftsmen available in my county?', a:'We have craftsmen across 40+ counties in Kenya including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and more. Use the county filter when searching.'},
                ].map((f,i)=>(
                  <div className="accordion-item kk-faq-item" key={i} data-aos="fade-up" data-aos-delay={i*50}>
                    <h2 className="accordion-header" id={`fh${i}`}>
                      <button className={`accordion-button kk-faq-btn ${i!==0?'collapsed':''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#fc${i}`} aria-expanded={i===0?'true':'false'} aria-controls={`fc${i}`}>{f.q}</button>
                    </h2>
                    <div id={`fc${i}`} className={`accordion-collapse collapse ${i===0?'show':''}`} aria-labelledby={`fh${i}`} data-bs-parent="#faqAcc">
                      <div className="kk-faq-body">{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="kk-q-card">
                <div className="kk-q-blob"><span className="kk-q-mark">?</span></div>
                <h4 style={{fontWeight:800,marginBottom:6,textAlign:'center'}}>Still have a question?</h4>
                <p style={{color:'var(--muted)',fontSize:'.88rem',textAlign:'center',marginBottom:20}}>Send it to us — we reply within 24 hours.</p>
                {faqSent ? (
                  <div className="kk-q-success"><i className="fas fa-check-circle me-2"/>Thanks! We'll get back to you soon.</div>
                ) : (
                  <>
                    <textarea className="kk-q-area" rows={3} placeholder="Type your question here…" value={faqQ} onChange={e=>setFaqQ(e.target.value)} aria-label="Your question"/>
                    <button className="kk-q-send" onClick={sendFaq} disabled={faqBusy||!faqQ.trim()}>
                      {faqBusy?<><span className="spinner-border spinner-border-sm me-2"/>Sending…</>:'Send Question'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="kk-footer" role="contentinfo">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h5>Quick Links</h5>
              <ul className="list-unstyled" style={{lineHeight:'2.2'}}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/services">View All Services</Link></li>
                <li><Link to="/signup">Become a Craftsman</Link></li>
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
                {[['fab fa-facebook-f','Facebook'],['fab fa-twitter','Twitter'],['fab fa-instagram','Instagram'],['fab fa-linkedin-in','LinkedIn']].map(([icon,lbl])=>(
                  <a key={lbl} href="#" aria-label={lbl}><i className={icon}/></a>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <h5>Find Us</h5>
              <div className="kk-map-wrap">
                <iframe title="KaaKazini — Kisumu" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%" height="220" style={{border:0,display:'block'}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              </div>
            </div>
          </div>
          <hr className="kk-footer-hr"/>
          <div className="kk-footer-bottom">
            <p style={{margin:0}}>© {new Date().getFullYear()} <strong style={{color:'#fff'}}>KaaKazini</strong>. All rights reserved.</p>
            <a href="#top" style={{color:'var(--gold)',fontWeight:600}}>Back to top <i className="fas fa-arrow-up ms-1"/></a>
          </div>
        </div>
      </footer>

      <button className={`kk-back-top ${showTop?'on':''}`} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">
        <i className="fas fa-arrow-up"/>
      </button>
    </>
  );
}
