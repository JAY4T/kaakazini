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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes shimmer {
          0%  { background-position: 200% 0; }
          100%{ background-position: -200% 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes pulse-dot {
          0%,100% { transform:scale(1);   opacity:1; }
          50%      { transform:scale(1.4); opacity:.6; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0);   }
          50%      { transform:translateY(-8px); }
        }

        :root {
          --gold:     #f5a623;
          --gold-d:   #d4861a;
          --gold-l:   #fff8ec;
          --gold-ll:  #fffbf4;
          --amber:    #f59e0b;
          --white:    #ffffff;
          --bg:       #fafaf8;
          --text:     #1c1917;
          --text-2:   #57534e;
          --muted:    #a8a29e;
          --border:   #e7e5e4;
          --r:        16px;
          --shadow:   0 2px 20px rgba(0,0,0,.06);
          --shadow-h: 0 12px 40px rgba(245,166,35,.22);
        }

        * { box-sizing:border-box; }
        .cl-page { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }

        /* ━━━━━━━━━━━━ HEADER ━━━━━━━━━━━━ */
          /* Hero background for header */
.cl-header {
  background: url('https://images.unsplash.com/photo-1605902711622-cfb43c443f8f?auto=format&fit=crop&w=1600&q=80') no-repeat center center;
  background-size: cover;
  position: relative;
  padding: 64px 0 52px;
  color: #fff; /* makes text readable on dark image */
}

.cl-header::before {
  content: '';
  position: absolute;
  inset: 0;
  // background: rgba(0,0,0,0.4); /* semi-transparent overlay for text readability */
  pointer-events: none;
  z-index: 1;
}

.cl-header-inner {
  position: relative;
  z-index: 2; /* ensures content is above overlay */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
}

        .cl-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--gold-l); border:1.5px solid #fcd58a;
          border-radius:50px; padding:5px 16px;
          font-size:.75rem; font-weight:700; color:var(--gold-d);
          letter-spacing:.07em; text-transform:uppercase;
        }
        .cl-eyebrow-dot {
          width:7px; height:7px; border-radius:50%;
          background:var(--gold); animation:pulse-dot 1.6s infinite;
        }
        .cl-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(2rem,5vw,3.2rem);
          font-weight:800; color:var(--text); line-height:1.15;
          margin:0;
        }
        .cl-title em { font-style:normal; color:var(--gold); }
        .cl-subtitle {
          font-size:1.05rem; color:var(--text-2); line-height:1.8;
          max-width:560px; margin:0;
        }

        /* ── Search bar ── */
        .cl-search-wrap {
          width:100%; max-width:640px; position:relative; margin-top:4px;
        }
        .cl-search-icon {
          position:absolute; left:20px; top:50%; transform:translateY(-50%);
          color:var(--muted); font-size:.95rem; pointer-events:none;
        }
        .cl-search {
          width:100%; border:2px solid var(--border); border-radius:50px;
          padding:15px 20px 15px 50px;
          font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:500;
          color:var(--text); background:var(--white); outline:none;
          transition:border-color .18s, box-shadow .18s;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .cl-search::placeholder { color:var(--muted); }
        .cl-search:focus {
          border-color:var(--gold);
          box-shadow:0 0 0 4px rgba(245,166,35,.12), 0 2px 12px rgba(0,0,0,.05);
        }
        .cl-search-btn {
          position:absolute; right:6px; top:50%; transform:translateY(-50%);
          background:var(--gold); color:var(--white); border:none; border-radius:50px;
          padding:9px 22px; font-weight:700; font-size:.88rem;
          cursor:pointer; transition:all .18s; white-space:nowrap;
        }
        .cl-search-btn:hover { background:var(--gold-d); transform:translateY(-50%) scale(1.03); }

        /* ── Stats pills ── */
        .cl-stats {
          display:flex; gap:12px; flex-wrap:wrap; justify-content:center;
          margin-top:8px;
        }
        .cl-stat-pill {
          background:var(--white); border:1.5px solid var(--border);
          border-radius:50px; padding:7px 18px;
          display:flex; align-items:center; gap:8px;
          font-size:.8rem; font-weight:600; color:var(--text-2);
          box-shadow:0 1px 6px rgba(0,0,0,.04);
        }
        .cl-stat-pill i { color:var(--gold); font-size:.82rem; }
        .cl-stat-pill strong { color:var(--text); }

        /* ━━━━━━━━━━━━ CONTENT AREA ━━━━━━━━━━━━ */
        .cl-content { padding:52px 0 80px; }

        /* count bar */
        .cl-count-bar {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:28px; flex-wrap:wrap; gap:10px;
        }
        .cl-count-tag {
          font-size:.88rem; font-weight:600; color:var(--text-2);
        }
        .cl-count-tag strong { color:var(--gold-d); }
        .cl-sort-wrap {
          display:flex; align-items:center; gap:8px;
          font-size:.82rem; color:var(--muted); font-weight:500;
        }

        /* ━━━━━━━━━━━━ CRAFTSMAN CARD ━━━━━━━━━━━━ */
        .cl-card {
          background:var(--white); border-radius:var(--r); overflow:hidden;
          border:1.5px solid var(--border);
          box-shadow:var(--shadow);
          transition:transform .26s cubic-bezier(.22,1,.36,1), box-shadow .26s;
          display:flex; flex-direction:column; height:100%;
          animation:fadeSlideUp .4s ease both;
        }
        .cl-card:hover {
          transform:translateY(-6px);
          box-shadow:var(--shadow-h);
          border-color:#fcd58a;
        }

        /* image */
        .cl-card-img-wrap {
          position:relative; height:220px; overflow:hidden; flex-shrink:0;
        }
        .cl-card-img {
          width:100%; height:100%; object-fit:cover;
          transition:transform .45s cubic-bezier(.22,1,.36,1);
        }
        .cl-card:hover .cl-card-img { transform:scale(1.06); }
        .cl-card-img-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(28,25,23,.5) 0%, transparent 55%);
        }
        /* gold top-bar on hover */
        .cl-card::before {
          content:''; position:absolute; top:0; left:0; right:0;
          height:3px; background:linear-gradient(to right,var(--gold),var(--amber));
          transform:scaleX(0); transform-origin:left;
          transition:transform .3s ease; z-index:3;
        }
        .cl-card:hover::before { transform:scaleX(1); }

        /* verified badge */
        .cl-verified {
          position:absolute; top:12px; right:12px; z-index:2;
          background:var(--gold); color:var(--white);
          border-radius:50px; padding:3px 10px;
          font-size:.67rem; font-weight:800;
          display:inline-flex; align-items:center; gap:5px;
          box-shadow:0 2px 8px rgba(245,166,35,.4);
        }

        /* profession badge */
        .cl-profession-badge {
          position:absolute; bottom:10px; left:12px; z-index:2;
          background:rgba(255,255,255,.92); color:var(--text);
          border-radius:50px; padding:3px 12px;
          font-size:.7rem; font-weight:700;
          backdrop-filter:blur(6px);
        }

        /* card body */
        .cl-card-body {
          padding:18px 18px 20px;
          display:flex; flex-direction:column; gap:10px; flex:1;
        }
        .cl-card-name {
          font-family:'Playfair Display',serif;
          font-size:1.05rem; font-weight:700; color:var(--text);
          margin:0; line-height:1.25;
        }
        .cl-card-meta {
          display:flex; align-items:center; gap:6px;
          font-size:.78rem; color:var(--text-2);
        }
        .cl-card-meta i { color:var(--gold); font-size:.75rem; }
        .cl-card-services {
          display:flex; gap:6px; flex-wrap:wrap;
        }
        .cl-svc-tag {
          background:var(--gold-l); color:var(--gold-d);
          border:1px solid #fcd58a; border-radius:6px;
          padding:2px 10px; font-size:.7rem; font-weight:600;
        }
        .cl-card-cta {
          margin-top:auto;
          display:block; text-align:center; text-decoration:none;
          background:var(--gold); color:var(--white);
          border-radius:10px; padding:11px 0;
          font-weight:700; font-size:.88rem;
          transition:background .18s, transform .14s, box-shadow .18s;
          box-shadow:0 3px 12px rgba(245,166,35,.3);
        }
        .cl-card-cta:hover {
          background:var(--gold-d); color:var(--white);
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(245,166,35,.4);
        }

        /* ━━━━━━━━━━━━ SKELETON ━━━━━━━━━━━━ */
        .cl-skel {
          background:linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%);
          background-size:200% 100%; animation:shimmer 1.4s infinite;
          border-radius:8px;
        }

        /* ━━━━━━━━━━━━ EMPTY / ERROR ━━━━━━━━━━━━ */
        .cl-empty {
          text-align:center; padding:72px 24px;
          background:var(--white); border-radius:var(--r);
          border:1.5px solid var(--border);
        }
        .cl-empty-icon { font-size:3.2rem; display:block; margin-bottom:16px; }
        .cl-empty h5   { font-family:'Playfair Display',serif; font-size:1.3rem; color:var(--text); font-weight:700; }
        .cl-empty p    { color:var(--text-2); font-size:.93rem; margin-top:6px; }

        /* ━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━ */
        .cl-footer {
          background:#1c1917;
          color:#d6d3d1; padding:64px 0 36px;
          font-family:'DM Sans',sans-serif;
        }
        .cl-footer-brand {
          font-family:'Playfair Display',serif;
          font-size:1.6rem; font-weight:800;
          color:var(--white); margin-bottom:10px;
        }
        .cl-footer-brand span { color:var(--gold); }
        .cl-footer-tagline { font-size:.85rem; color:#a8a29e; line-height:1.65; max-width:260px; }
        .cl-footer-heading {
          font-size:.72rem; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:var(--gold); margin-bottom:18px;
        }
        .cl-footer-links { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
        .cl-footer-links a {
          color:#a8a29e; text-decoration:none; font-size:.87rem; font-weight:500;
          transition:color .15s;
        }
        .cl-footer-links a:hover { color:var(--gold); }
        .cl-footer-contact-item {
          display:flex; align-items:flex-start; gap:10px;
          font-size:.87rem; color:#a8a29e; margin-bottom:10px;
        }
        .cl-footer-contact-item i { color:var(--gold); margin-top:2px; flex-shrink:0; }
        .cl-socials { display:flex; gap:12px; margin-top:20px; }
        .cl-social-btn {
          width:38px; height:38px; border-radius:50%;
          background:#292524; border:1px solid #44403c;
          color:#a8a29e; display:flex; align-items:center; justify-content:center;
          font-size:.9rem; text-decoration:none;
          transition:all .18s;
        }
        .cl-social-btn:hover { background:var(--gold); color:var(--white); border-color:var(--gold); transform:translateY(-2px); }
        .cl-footer-divider { border-color:#292524; margin:36px 0 24px; }
        .cl-footer-bottom {
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:10px;
          font-size:.8rem; color:#78716c;
        }
        .cl-footer-bottom strong { color:#d6d3d1; }
        .cl-footer-bottom a { color:#78716c; text-decoration:none; transition:color .15s; }
        .cl-footer-bottom a:hover { color:var(--gold); }

        /* ━━━━━━━━━━━━ MAP ━━━━━━━━━━━━ */
        .cl-map-wrap {
          border-radius:12px; overflow:hidden;
          box-shadow:0 4px 20px rgba(0,0,0,.2);
          border:2px solid #292524;
        }

        @media(max-width:768px){
          .cl-header { padding:52px 0 40px; }
          .cl-title  { font-size:2rem; }
          .cl-search-btn { padding:8px 14px; font-size:.78rem; }
          .cl-stats  { gap:8px; }
        }
        @media(max-width:576px){
          .cl-stats  { flex-direction:column; align-items:center; }
        }
      `}</style>

      <div className="cl-page">

        {/* ╔══════════════════════════════════════╗
            ║  PAGE HEADER                          ║
            ╚══════════════════════════════════════╝ */}
        <header className="cl-header">
          <div className="container">
            <div className="cl-header-inner">

             

              <h1 className="cl-title">
                Find &amp; Hire <em>Skilled</em><br/>Craftsmen Near You
              </h1>

              <p className="cl-subtitle">
                Browse our hand-vetted artisans across plumbing, carpentry, electrical,
                tiling &amp; more. Every craftsman is approved before listing.
              </p>

              {/* Search */}
              <div className="cl-search-wrap">
                <i className="fas fa-search cl-search-icon" aria-hidden="true"/>
                <input
                  type="text"
                  className="cl-search"
                  placeholder="Search craftsmen by name, trade or location…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search craftsmen"
                />
                <button className="cl-search-btn" onClick={fetchCraftsmen} aria-label="Search">
                  <i className="fas fa-search me-1" aria-hidden="true"/> Search
                </button>
              </div>

              {/* Quick stats */}
              <div className="cl-stats">
                {[
                  { icon:'fas fa-hard-hat',       label:'100+ Active Craftsmen'  },
                  { icon:'fas fa-tools',           label:'8 Trades Available'     },
                  { icon:'fas fa-map-marker-alt',  label:'40+ Counties'           },
                  { icon:'fas fa-shield-alt',      label:'All Verified & Approved'},
                ].map((s,i) => (
                  <div className="cl-stat-pill" key={i}>
                    <i className={s.icon} aria-hidden="true"/>
                    <strong>{s.label}</strong>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </header>

        {/* ╔══════════════════════════════════════╗
            ║  CRAFTSMEN GRID                       ║
            ╚══════════════════════════════════════╝ */}
        <main className="cl-content">
          <div className="container">

            {/* Count bar */}
            {!loading && !error && (
              <div className="cl-count-bar">
                <p className="cl-count-tag">
                  Showing <strong>{filteredCraftsmen.length}</strong> craftsman{filteredCraftsmen.length !== 1 ? 'en' : ''}
                  {searchTerm && <> matching "<strong>{searchTerm}</strong>"</>}
                </p>
                <div className="cl-sort-wrap">
                  <i className="fas fa-sliders-h" aria-hidden="true"/>
                  All Trades
                </div>
              </div>
            )}

            {/* States */}
            {loading ? (
              <div className="row g-4">
                {[...Array(8)].map((_,i) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={i}>
                    <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid #e7e5e4'}}>
                      <div className="cl-skel" style={{height:220}}/>
                      <div style={{padding:18,display:'flex',flexDirection:'column',gap:10}}>
                        <div className="cl-skel" style={{height:14,width:'70%'}}/>
                        <div className="cl-skel" style={{height:11,width:'45%'}}/>
                        <div className="cl-skel" style={{height:11,width:'85%'}}/>
                        <div className="cl-skel" style={{height:40,borderRadius:10,marginTop:6}}/>
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
                <button
                  onClick={fetchCraftsmen}
                  style={{marginTop:16,background:'var(--gold)',color:'#fff',border:'none',borderRadius:10,padding:'11px 28px',fontWeight:700,cursor:'pointer'}}
                >
                  Try Again
                </button>
              </div>
            ) : filteredCraftsmen.length === 0 ? (
              <div className="cl-empty">
                <span className="cl-empty-icon" role="img" aria-label="No results">🔍</span>
                <h5>No craftsmen found</h5>
                <p>Try a different name or clear your search to browse everyone.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  style={{marginTop:16,background:'var(--gold)',color:'#fff',border:'none',borderRadius:10,padding:'11px 28px',fontWeight:700,cursor:'pointer'}}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredCraftsmen.map((craftsman, idx) => {
                  const craftsmanSlug = craftsman.slug || craftsman.id;
                  return (
                    <div
                      className="col-sm-6 col-md-4 col-lg-3"
                      key={craftsman.id}
                      style={{animationDelay:`${(idx % 8) * 55}ms`}}
                    >
                      <div className="cl-card">
                        {/* Image */}
                        <div className="cl-card-img-wrap">
                          <img
                            src={craftsman.profile?.trim() || `https://picsum.photos/seed/${craftsman.id}/400/400`}
                            alt={craftsman.full_name}
                            className="cl-card-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/400x220/fff8ec/f5a623?text=KaaKazini';
                            }}
                          />
                          <div className="cl-card-img-overlay" aria-hidden="true"/>

                          {/* Verified badge */}
                          <span className="cl-verified">
                            <i className="fas fa-check-circle" aria-hidden="true"/> Verified
                          </span>

                          {/* Profession overlay */}
                          {craftsman.profession && (
                            <span className="cl-profession-badge">{craftsman.profession}</span>
                          )}
                        </div>

                        {/* Body */}
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
                              {craftsman.services.slice(0, 2).map((s, si) => (
                                <span className="cl-svc-tag" key={si}>{s.name}</span>
                              ))}
                              {craftsman.services.length > 2 && (
                                <span className="cl-svc-tag">+{craftsman.services.length - 2} more</span>
                              )}
                            </div>
                          )}

                          <Link
                            to={`/craftsman/${craftsmanSlug}`}
                            className="cl-card-cta"
                          >
                            View Portfolio &amp; Hire <i className="fas fa-arrow-right ms-1" aria-hidden="true"/>
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

        {/*FOOTER   */}
        <footer className="cl-footer">
          <div className="container">
            <div className="row g-5">

              {/* Brand */}
              <div className="col-lg-3 col-md-6">
                <div className="cl-footer-brand">Kaa<span>Kazini</span></div>
                <p className="cl-footer-tagline">
                  Connecting skilled craftsmen with clients across Kenya. Verified, trusted, and professional.
                </p>
                <div className="cl-socials">
                  {[
                    { icon:'fab fa-facebook-f', href:'#' },
                    { icon:'fab fa-twitter',    href:'#' },
                    { icon:'fab fa-instagram',  href:'#' },
                    { icon:'fab fa-linkedin-in',href:'#' },
                  ].map((s,i) => (
                    <a key={i} href={s.href} className="cl-social-btn" aria-label={s.icon}>
                      <i className={s.icon} aria-hidden="true"/>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-lg-2 col-md-6">
                <div className="cl-footer-heading">Quick Links</div>
                <ul className="cl-footer-links">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/signup">Become A Craftsman</Link></li>
                  <li><Link to="/HireSignUp">Hire a Craftsman</Link></li>
                  <li><a href="#services">Services</a></li>
                  <li><a href="#how-it-works">How It Works</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="col-lg-3 col-md-6">
                <div className="cl-footer-heading">Contact Us</div>
                <div className="cl-footer-contact-item">
                  <i className="fas fa-map-marker-alt" aria-hidden="true"/>
                  <span>Kisumu, Kenya</span>
                </div>
                <div className="cl-footer-contact-item">
                  <i className="fas fa-envelope" aria-hidden="true"/>
                  <span>support@kaakazini.com</span>
                </div>
                <div className="cl-footer-contact-item">
                  <i className="fas fa-clock" aria-hidden="true"/>
                  <span>Mon – Sat · 8am – 6pm EAT</span>
                </div>
              </div>

              {/* Map */}
              <div className="col-lg-4 col-md-6">
                <div className="cl-footer-heading">Find Us</div>
                <div className="cl-map-wrap">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                    width="100%" height="200"
                    style={{border:0, display:'block'}}
                    allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kisumu Location Map"
                  />
                </div>
              </div>

            </div>

            <hr className="cl-footer-divider"/>

            <div className="cl-footer-bottom">
              <p>© {new Date().getFullYear()} <strong>KaaKazini</strong>. All Rights Reserved.</p>
              <a href="#top">Back to top <i className="fas fa-arrow-up ms-1" aria-hidden="true"/></a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

export default CraftsmenList;
