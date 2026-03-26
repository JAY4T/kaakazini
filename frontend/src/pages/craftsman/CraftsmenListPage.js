import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../../api/axiosClient";

function CraftsmenList() {
  const [craftsmen, setCraftsmen] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCraftsmen = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/public-craftsman/', {
        params: { is_approved: true },
      });
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setCraftsmen(results);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to load craftsmen. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCraftsmen(); }, []);

  const filteredCraftsmen = craftsmen.filter((c) =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes shimmer {
          0%  { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,215,0,.5); }
          70%  { box-shadow: 0 0 0 10px rgba(255,215,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0.7); opacity:0; }
          80%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity:1; }
        }
        @keyframes stripe-slide {
          0%   { background-position: 0 0; }
          100% { background-position: 60px 0; }
        }

        :root {
          --yellow:    #FFD700;
          --yellow-d:  #e6c200;
          --yellow-l:  #fffbe6;
          --green:     #16a34a;
          --green-d:   #15803d;
          --green-l:   #f0fdf4;
          --green-ll:  #dcfce7;
          --white:     #ffffff;
          --off:       #f9fafb;
          --text:      #111827;
          --text-2:    #374151;
          --muted:     #6b7280;
          --border:    #e5e7eb;
          --gold:      #FFD700;
          --gold-d:    #e6ac00;
          --gold-l:    #fffbea;
        }

        * { box-sizing: border-box; }

        .cl-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--off);
          color: var(--text);
          min-height: 100vh;
        }

        /* ══════ HEADER ══════ */
        .cl-header { position:relative; padding:0; overflow:hidden; background:#0a1a0e; }
        .cl-header-bg {
          position:absolute; inset:0;
          background:url('https://images.unsplash.com/photo-1605902711622-cfb43c443f8f?auto=format&fit=crop&w=1600&q=80') no-repeat center center/cover;
          opacity:.22;
        }
        .cl-header-stripe {
          position:absolute; inset:0; pointer-events:none;
          background:repeating-linear-gradient(-55deg,rgba(255,215,0,.04) 0px,rgba(255,215,0,.04) 2px,transparent 2px,transparent 28px);
          animation:stripe-slide 8s linear infinite;
        }
        .cl-header-orb  { position:absolute; bottom:-80px; right:-60px; width:380px; height:380px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,.35) 0%,transparent 70%); pointer-events:none; }
        .cl-header-orb2 { position:absolute; top:-60px; left:-40px; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(255,215,0,.2) 0%,transparent 70%); pointer-events:none; }
        .cl-header-inner { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center; gap:24px; padding:72px 20px 60px; }
        .cl-eyebrow { display:inline-flex; align-items:center; gap:8px; background:rgba(255,215,0,.15); border:1.5px solid rgba(255,215,0,.4); border-radius:50px; padding:6px 18px; font-size:.72rem; font-weight:700; color:var(--yellow); letter-spacing:.1em; text-transform:uppercase; }
        .cl-eyebrow-dot { width:7px; height:7px; border-radius:50%; background:var(--yellow); animation:pulse-ring 2s infinite; }
        .cl-title { font-family:'Fraunces',serif; font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:900; color:#fff; line-height:1.1; margin:0; letter-spacing:-.02em; }
        .cl-title em { font-style:italic; color:var(--yellow); }
        .cl-subtitle { font-size:1.05rem; color:rgba(255,255,255,.72); line-height:1.85; max-width:520px; margin:0; }

        /* search */
        .cl-search-wrap { width:100%; max-width:620px; position:relative; }
        .cl-search-icon { position:absolute; left:20px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:.95rem; pointer-events:none; z-index:2; }
        .cl-search { width:100%; border:2px solid rgba(255,255,255,.18); border-radius:50px; padding:15px 148px 15px 50px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.97rem; font-weight:500; color:var(--text); background:rgba(255,255,255,.96); outline:none; transition:border-color .2s,box-shadow .2s; box-shadow:0 4px 24px rgba(0,0,0,.3); }
        .cl-search::placeholder { color:#9ca3af; }
        .cl-search:focus { border-color:var(--yellow); box-shadow:0 0 0 4px rgba(255,215,0,.2),0 4px 24px rgba(0,0,0,.2); background:#fff; }
        .cl-search-btn { position:absolute; right:5px; top:50%; transform:translateY(-50%); background:linear-gradient(135deg,var(--yellow),var(--yellow-d)); color:#111; border:none; border-radius:50px; padding:10px 24px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:.88rem; cursor:pointer; transition:all .2s; white-space:nowrap; box-shadow:0 4px 14px rgba(255,215,0,.4); display:flex; align-items:center; gap:6px; }
        .cl-search-btn:hover { transform:translateY(-50%) scale(1.04); box-shadow:0 6px 20px rgba(255,215,0,.55); }

        /* stats */
        .cl-stats { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
        .cl-stat-pill { background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.2); border-radius:50px; padding:7px 16px; display:flex; align-items:center; gap:8px; font-size:.78rem; font-weight:600; color:rgba(255,255,255,.85); backdrop-filter:blur(8px); transition:background .18s,border-color .18s; }
        .cl-stat-pill:hover { background:rgba(255,215,0,.15); border-color:rgba(255,215,0,.4); color:var(--yellow); }
        .cl-stat-pill i { color:var(--yellow); font-size:.8rem; }

        /* wave */
        .cl-wave { display:block; width:100%; height:60px; background:var(--off); position:relative; margin-top:-2px; }
        .cl-wave svg { width:100%; height:100%; display:block; }

        /* ══════ CONTENT ══════ */
        .cl-content { padding:44px 0 88px; }
        .cl-count-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; flex-wrap:wrap; gap:12px; padding-bottom:20px; border-bottom:2px solid var(--border); }
        .cl-count-tag { font-size:.9rem; font-weight:600; color:var(--text-2); }
        .cl-count-tag strong { color:var(--green); background:var(--green-ll); padding:2px 10px; border-radius:20px; font-size:.82rem; }
        .cl-sort-wrap { display:flex; align-items:center; gap:8px; font-size:.82rem; color:var(--muted); background:#fff; border:1.5px solid var(--border); border-radius:8px; padding:6px 14px; }
        .cl-sort-wrap i { color:var(--yellow); }

        /* ══════ CARD ══════ */
        .cl-card { background:var(--white); border-radius:20px; overflow:hidden; border:2px solid var(--border); box-shadow:0 2px 16px rgba(0,0,0,.05); transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .2s; display:flex; flex-direction:column; height:100%; animation:fadeUp .4s ease both; position:relative; }
        .cl-card:hover { transform:translateY(-7px); box-shadow:0 20px 48px rgba(22,163,74,.14); border-color:var(--green); }
        .cl-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,var(--yellow),var(--green)); transform:scaleX(0); transform-origin:left; transition:transform .32s ease; z-index:3; }
        .cl-card:hover::before { transform:scaleX(1); }
        .cl-card-img-wrap { position:relative; height:210px; overflow:hidden; flex-shrink:0; }
        .cl-card-img { width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,1,.36,1); }
        .cl-card:hover .cl-card-img { transform:scale(1.08); }
        .cl-card-img-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 45%,transparent 100%); }
        .cl-verified { position:absolute; top:12px; right:12px; z-index:2; background:linear-gradient(135deg,var(--yellow),var(--yellow-d)); color:#111; border-radius:50px; padding:4px 11px; font-size:.65rem; font-weight:800; display:inline-flex; align-items:center; gap:5px; box-shadow:0 3px 10px rgba(255,215,0,.45); animation:badge-pop .4s ease both; }
        .cl-profession-badge { position:absolute; bottom:12px; left:12px; z-index:2; background:rgba(255,255,255,.94); color:var(--text); border-radius:6px; padding:3px 12px; font-size:.7rem; font-weight:700; backdrop-filter:blur(6px); border-left:3px solid var(--green); }
        .cl-card-body { padding:20px 20px 22px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .cl-card-name { font-family:'Fraunces',serif; font-size:1.08rem; font-weight:800; color:var(--text); margin:0; line-height:1.2; }
        .cl-card-meta { display:flex; align-items:center; gap:6px; font-size:.78rem; color:var(--green); font-weight:600; }
        .cl-card-meta i { font-size:.72rem; }
        .cl-card-services { display:flex; gap:6px; flex-wrap:wrap; }
        .cl-svc-tag { background:var(--yellow-l); color:#92400e; border:1px solid rgba(255,215,0,.5); border-radius:6px; padding:2px 10px; font-size:.69rem; font-weight:700; }
        .cl-card-cta { margin-top:auto; display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; background:linear-gradient(135deg,var(--green),var(--green-d)); color:#fff; border-radius:12px; padding:12px 0; font-weight:800; font-size:.87rem; transition:all .2s; box-shadow:0 4px 14px rgba(22,163,74,.25); }
        .cl-card-cta:hover { background:linear-gradient(135deg,#18b558,var(--green)); color:#fff; transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,163,74,.35); }
        .cl-card-cta i { font-size:.78rem; transition:transform .2s; }
        .cl-card-cta:hover i { transform:translateX(4px); }

        /* skeleton */
        .cl-skel { background:linear-gradient(90deg,#f3f4f6 25%,#e9eaed 50%,#f3f4f6 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }

        /* empty / error */
        .cl-empty { text-align:center; padding:80px 24px; background:var(--white); border-radius:20px; border:2px solid var(--border); }
        .cl-empty-icon { font-size:3.5rem; display:block; margin-bottom:18px; }
        .cl-empty h5 { font-family:'Fraunces',serif; font-size:1.35rem; color:var(--text); font-weight:800; }
        .cl-empty p { color:var(--muted); font-size:.93rem; margin-top:8px; }

        /* CTA banner */
        .cl-banner { background:linear-gradient(135deg,var(--green),#14532d); padding:48px 0; position:relative; overflow:hidden; }
        .cl-banner::after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(-45deg,rgba(255,215,0,.04) 0px,rgba(255,215,0,.04) 2px,transparent 2px,transparent 20px); pointer-events:none; }
        .cl-banner-inner { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:24px; }
        .cl-banner h2 { font-family:'Fraunces',serif; font-size:clamp(1.5rem,3vw,2.2rem); font-weight:900; color:#fff; margin:0; line-height:1.2; }
        .cl-banner h2 span { color:var(--yellow); }
        .cl-banner p { color:rgba(255,255,255,.7); font-size:.93rem; margin:6px 0 0; }
        .cl-banner-btn { display:inline-flex; align-items:center; gap:8px; background:var(--yellow); color:#111; border:none; border-radius:12px; padding:14px 28px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:.93rem; cursor:pointer; transition:all .2s; text-decoration:none; box-shadow:0 6px 20px rgba(255,215,0,.4); white-space:nowrap; }
        .cl-banner-btn:hover { background:#ffe033; color:#111; transform:translateY(-2px); box-shadow:0 10px 28px rgba(255,215,0,.5); }

        /* ══════════════════════════════════════════
           FOOTER — matches LandingPage exactly
        ══════════════════════════════════════════ */
        .cl-footer {
          background: #1a1a2e;
          color: #bbb;
          padding: 52px 0 26px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-footer h5 {
          color: #fff; font-weight: 700; font-size: .8rem;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .cl-footer a {
          color: #bbb; text-decoration: none; font-size: .85rem; transition: color .15s;
        }
        .cl-footer a:hover { color: var(--gold); }
        .cl-footer p { font-size: .85rem; margin-bottom: 6px; }
        .cl-footer-hr { border-color: rgba(255,255,255,.08); margin: 26px 0 18px; }
        .cl-footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 10px; font-size: .8rem;
        }
        .cl-footer-links-list { list-style: none; padding: 0; margin: 0; line-height: 2.2; }
        .cl-footer-links-list li a { color: #bbb; text-decoration: none; font-size: .85rem; transition: color .15s; }
        .cl-footer-links-list li a:hover { color: var(--gold); }
        .cl-footer-social a {
          font-size: 1rem; color: #bbb; margin-right: 14px;
          display: inline-block; transition: color .15s, transform .15s;
        }
        .cl-footer-social a:hover { color: var(--gold); transform: translateY(-2px); }
        .cl-footer-map-wrap { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.3); }

        /* ══════ RESPONSIVE ══════ */
        @media(max-width:768px){
          .cl-header-inner { padding:56px 16px 48px; }
          .cl-title { font-size:2rem; }
          .cl-search { padding-right:20px; border-radius:14px; }
          .cl-search-btn { position:static; transform:none; width:100%; border-radius:50px; padding:12px 0; margin-top:10px; justify-content:center; }
          .cl-search-wrap { display:flex; flex-direction:column; }
          .cl-stats { gap:8px; }
          .cl-banner-inner { flex-direction:column; text-align:center; align-items:center; }
          .cl-footer-bottom { flex-direction:column; text-align:center; }
        }
        @media(max-width:576px){
          .cl-stats { flex-direction:column; align-items:center; }
          .cl-count-bar { flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      <div className="cl-page">

        {/* HEADER */}
        <header className="cl-header" id="top">
          <div className="cl-header-bg" aria-hidden="true"/>
          <div className="cl-header-stripe" aria-hidden="true"/>
          <div className="cl-header-orb" aria-hidden="true"/>
          <div className="cl-header-orb2" aria-hidden="true"/>
          <div className="container">
            <div className="cl-header-inner">
             
              {/* <h1 className="cl-title">Find &amp; Hire <em>Skilled</em><br/>Craftsmen Near You</h1> */}
              {/* <p className="cl-subtitle">Browse our hand-vetted artisans across plumbing, carpentry, electrical, tiling &amp; more. Every craftsman is approved before listing.</p> */}
              <div className="cl-search-wrap">
                <i className="fas fa-search cl-search-icon" aria-hidden="true"/>
                <input type="text" className="cl-search" placeholder="Search craftsmen by name, trade or location…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search craftsmen"/>
                <button className="cl-search-btn" onClick={fetchCraftsmen} aria-label="Search">
                  <i className="fas fa-search" aria-hidden="true"/> Search
                </button>
              </div>
              <div className="cl-stats">
                {[
                  { icon:'fas fa-hard-hat',      label:'100+ Active Craftsmen'   },
                  { icon:'fas fa-tools',          label:'8 Trades Available'      },
                  { icon:'fas fa-map-marker-alt', label:'40+ Counties'            },
                  { icon:'fas fa-shield-alt',     label:'All Verified & Approved' },
                ].map((s,i) => (
                  <div className="cl-stat-pill" key={i}>
                    <i className={s.icon} aria-hidden="true"/>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Wave */}
        <div className="cl-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 C240,60 480,60 720,30 C960,0 1200,0 1440,40 L1440,60 L0,60 Z" fill="#0d1f12"/>
            <path d="M0,0 C300,50 600,60 900,30 C1100,10 1300,15 1440,35 L1440,60 L0,60 Z" fill="#f9fafb" opacity=".9"/>
          </svg>
        </div>

        {/* GRID */}
        <main className="cl-content">
          <div className="container">
            {!loading && !error && (
              <div className="cl-count-bar">
                <p className="cl-count-tag">
                  Showing&nbsp;<strong>{filteredCraftsmen.length}</strong>&nbsp;craftsman{filteredCraftsmen.length !== 1 ? 'en' : ''}
                  {searchTerm && <>&nbsp;matching "<strong>{searchTerm}</strong>"</>}
                </p>
                <div className="cl-sort-wrap">
                  <i className="fas fa-sliders-h" aria-hidden="true"/> All Trades
                </div>
              </div>
            )}

            {loading ? (
              <div className="row g-4">
                {[...Array(8)].map((_,i) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={i}>
                    <div style={{background:'#fff',borderRadius:20,overflow:'hidden',border:'2px solid #e5e7eb'}}>
                      <div className="cl-skel" style={{height:210}}/>
                      <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
                        <div className="cl-skel" style={{height:14,width:'68%'}}/>
                        <div className="cl-skel" style={{height:11,width:'44%'}}/>
                        <div className="cl-skel" style={{height:11,width:'80%'}}/>
                        <div className="cl-skel" style={{height:44,borderRadius:12,marginTop:8}}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="cl-empty">
                <span className="cl-empty-icon" role="img" aria-label="Error">⚠️</span>
                <h5>Something went wrong</h5>
                <p>{error}</p>
                <button onClick={fetchCraftsmen} style={{marginTop:18,background:'linear-gradient(135deg,#FFD700,#e6c200)',color:'#111',border:'none',borderRadius:12,padding:'12px 30px',fontWeight:800,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:'.9rem',boxShadow:'0 4px 14px rgba(255,215,0,.35)'}}>Try Again</button>
              </div>
            ) : filteredCraftsmen.length === 0 ? (
              <div className="cl-empty">
                <span className="cl-empty-icon" role="img" aria-label="No results">🔍</span>
                <h5>No craftsmen found</h5>
                <p>Try a different name or clear your search to browse everyone.</p>
                <button onClick={() => setSearchTerm('')} style={{marginTop:18,background:'linear-gradient(135deg,#FFD700,#e6c200)',color:'#111',border:'none',borderRadius:12,padding:'12px 30px',fontWeight:800,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:'.9rem',boxShadow:'0 4px 14px rgba(255,215,0,.35)'}}>Clear Search</button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredCraftsmen.map((craftsman, idx) => {
                  const craftsmanSlug = craftsman.slug || craftsman.id;
                  return (
                    <div className="col-sm-6 col-md-4 col-lg-3" key={craftsman.id} style={{animationDelay:`${(idx % 8) * 60}ms`}}>
                      <div className="cl-card">
                        <div className="cl-card-img-wrap">
                          <img src={craftsman.profile?.trim() || `https://picsum.photos/seed/${craftsman.id}/400/400`} alt={craftsman.full_name} className="cl-card-img" onError={(e) => { e.target.onerror=null; e.target.src='https://placehold.co/400x220/f0fdf4/16a34a?text=KaaKazini'; }}/>
                          <div className="cl-card-img-overlay" aria-hidden="true"/>
                          <span className="cl-verified"><i className="fas fa-check-circle" aria-hidden="true"/> Verified</span>
                          {craftsman.profession && <span className="cl-profession-badge">{craftsman.profession}</span>}
                        </div>
                        <div className="cl-card-body">
                          <h3 className="cl-card-name">{craftsman.full_name}</h3>
                          {craftsman.location && (
                            <div className="cl-card-meta">
                              <i className="fas fa-map-marker-alt" aria-hidden="true"/>
                              {craftsman.location}
                            </div>
                          )}
                          {craftsman.services && craftsman.services.length > 0 && (
                            <div className="cl-card-services">
                              {craftsman.services.slice(0, 2).map((s, si) => <span className="cl-svc-tag" key={si}>{s.name}</span>)}
                              {craftsman.services.length > 2 && <span className="cl-svc-tag">+{craftsman.services.length - 2} more</span>}
                            </div>
                          )}
                          <Link to={`/craftsman/${craftsmanSlug}`} className="cl-card-cta">
                            View Portfolio &amp; Hire <i className="fas fa-arrow-right" aria-hidden="true"/>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* CTA BANNER */}
        <section className="cl-banner">
          <div className="container">
            <div className="cl-banner-inner">
              <div>
                <h2>Are you a skilled <span>craftsman?</span></h2>
                <p>Join KaaKazini free — get approved and start receiving job requests.</p>
              </div>
              <Link to="/signup" className="cl-banner-btn">
                <i className="fas fa-user-plus" aria-hidden="true"/> Join as Craftsman — Free
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER — same layout & style as LandingPage
        ══════════════════════════════════════════ */}
        <footer className="cl-footer">
          <div className="container">
            <div className="row g-5">

              {/* Brand & socials */}
              <div className="col-lg-3 col-md-6">
                <h5 style={{fontFamily:"'Fraunces',serif",fontSize:'1.5rem',fontWeight:900,letterSpacing:'-.02em',textTransform:'none',color:'#fff',marginBottom:12}}>
                  Kaa<span style={{color:'var(--gold)'}}>Kazini</span>
                </h5>
                <p style={{fontSize:'.84rem',color:'#bbb',lineHeight:1.7,maxWidth:240}}>
                  Connecting skilled craftsmen with clients across Kenya. Verified, trusted, and professional.
                </p>
                <div className="cl-footer-social mt-3">
                  {[['fab fa-facebook-f','Facebook'],['fab fa-twitter','Twitter'],['fab fa-instagram','Instagram'],['fab fa-linkedin-in','LinkedIn']].map(([icon,lbl]) => (
                    <a key={lbl} href="#" aria-label={lbl}><i className={icon}/></a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-lg-3 col-md-6">
                <h5>Quick Links</h5>
                <ul className="cl-footer-links-list">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/services">View All Services</Link></li>
                  <li><Link to="/signup">Become a Craftsman</Link></li>
                  <li><Link to="/HireSignUp">Hire a Craftsman</Link></li>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="col-lg-2 col-md-6">
                <h5>Contact Us</h5>
                <p><i className="fas fa-map-marker-alt me-2" style={{color:'var(--gold)'}}/> Kisumu, Kenya</p>
                <p><i className="fas fa-envelope me-2" style={{color:'var(--gold)'}}/> support@kaakazini.com</p>
                <p><i className="fas fa-phone me-2" style={{color:'var(--gold)'}}/> +254 700 000 000</p>
              </div>

              {/* Map */}
              <div className="col-lg-4 col-md-6">
                <h5>Find Us</h5>
                <div className="cl-footer-map-wrap">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                    width="100%" height="200"
                    style={{border:0,display:'block'}}
                    allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kisumu Location Map"
                  />
                </div>
              </div>

            </div>

            <hr className="cl-footer-hr"/>

            <div className="cl-footer-bottom">
              <p style={{margin:0}}>© {new Date().getFullYear()} <strong style={{color:'#fff'}}>KaaKazini</strong>. All Rights Reserved.</p>
              <a href="#top" style={{color:'var(--gold)',fontWeight:600}}>
                Back to top <i className="fas fa-arrow-up ms-1" aria-hidden="true"/>
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

export default CraftsmenList;
