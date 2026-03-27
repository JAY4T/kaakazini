import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from "../../api/axiosClient";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

function CraftsmanProfile() {
  const { slug } = useParams();
  const [craftsman, setCraftsman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    if (!slug || slug === 'undefined' || slug === 'null') {
      setNotFound(true); setLoading(false);
      setErrorMsg('Invalid craftsman slug.'); return;
    }
    const fetchCraftsman = async () => {
      setLoading(true); setNotFound(false); setErrorMsg('');
      try {
        const response = await api.get(`/public-craftsman/${slug}/`);
        if (response.status === 200 && response.data) setCraftsman(response.data);
        else { setNotFound(true); setErrorMsg('No data returned from API.'); }
      } catch (error) {
        setErrorMsg(error.response?.status === 404 ? 'Craftsman not found.' : 'Failed to fetch craftsman data.');
        setNotFound(true);
      } finally { setLoading(false); }
    };
    fetchCraftsman();
  }, [slug]);

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0fdf4'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #bbf7d0',borderTopColor:'#16a34a',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/>
        <p style={{marginTop:16,fontFamily:"'DM Sans',sans-serif",color:'#15803d',fontWeight:600,fontSize:'.88rem'}}>Loading profile…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (notFound || !craftsman) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0fdf4'}}>
      <div style={{textAlign:'center',padding:'40px 24px'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:'#1a2e1a',marginBottom:8,fontWeight:800}}>Craftsman Not Found</h2>
        <p style={{color:'#64748b',marginBottom:24}}>{errorMsg || 'Please check the URL or select another craftsman.'}</p>
        <Link to="/craftsmen" style={{background:'#FFD700',color:'#1a2e1a',padding:'12px 28px',borderRadius:10,textDecoration:'none',fontWeight:700}}>Browse Craftsmen</Link>
      </div>
    </div>
  );

  const profileImage = getFullImageUrl(craftsman.profile);
  const proofDocument = getFullImageUrl(craftsman.proof_document);
  const primaryService = craftsman.primary_service || null;
  const services = primaryService
    ? [{ name: primaryService, service_image_url: craftsman.service_image }].concat(craftsman.services || [])
    : craftsman.services || [];

  const avgRating = craftsman.reviews?.length > 0
    ? (craftsman.reviews.reduce((sum, r) => sum + r.rating, 0) / craftsman.reviews.length).toFixed(1)
    : null;

  const handleShare = () => {
    const url = `${window.location.origin}/craftsman/${slug}`;
    if (navigator.share) {
      navigator.share({
        title: `${craftsman.name} — KaaKazini`,
        text: `Check out ${craftsman.name}'s profile on KaaKazini`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }
  };

  const tabs = ['about', 'portfolio', 'skills', 'reviews'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --green:   #16a34a;
          --green-d: #15803d;
          --green-l: #f0fdf4;
          --green-b: #bbf7d0;
          --gold:    #FFD700;
          --gold-d:  #e6c200;
          --gold-l:  #fffbea;
          --white:   #ffffff;
          --bg:      #f8fafc;
          --text:    #1a2e1a;
          --muted:   #64748b;
          --border:  #e2e8f0;
        }

        * { box-sizing: border-box; }

        .cp-cover {
          height: 240px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0a2e1a 0%, #15803d 50%, #16a34a 100%);
        }
        .cp-cover-pattern {
          position: absolute; inset: 0; opacity: .06;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        @media(max-width:768px){ .cp-cover { height: 150px; } }

        .cp-header-card {
          background: var(--white); border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,.07);
          border: 1.5px solid var(--border);
          margin: 0 0 1.5rem; overflow: hidden; position: relative;
        }
        .cp-header-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--green), var(--gold), var(--green-d));
        }

        .cp-avatar-row {
          padding: 0 2rem 1.5rem; margin-top: -64px;
          display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap;
        }
        @media(max-width:576px){ .cp-avatar-row { margin-top: -48px; padding: 0 1rem 1.25rem; gap: 1rem; } }

        .cp-avatar {
          width: 128px; height: 128px; border-radius: 50%;
          border: 4px solid var(--white);
          box-shadow: 0 4px 18px rgba(0,0,0,.12);
          object-fit: cover; background: var(--white); flex-shrink: 0;
        }
        @media(max-width:576px){ .cp-avatar { width: 90px; height: 90px; } }

        .cp-name-block { flex: 1; min-width: 200px; padding-top: 72px; }
        @media(max-width:576px){ .cp-name-block { padding-top: 56px; } }

        .cp-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem; font-weight: 800; color: var(--text); margin: 0 0 6px;
        }
        @media(max-width:576px){ .cp-name { font-size: 1.45rem; } }

        .cp-headline {
          font-size: .93rem; color: var(--muted); margin: 0 0 8px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }

        .cp-trade-pill {
          background: var(--green); color: #fff; border-radius: 20px;
          padding: 3px 12px; font-size: .73rem; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
        }

        .cp-verified-badge {
          background: var(--gold-l); color: #7c4b00;
          border: 1.5px solid var(--gold); border-radius: 20px;
          padding: 3px 12px; font-size: .73rem; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
        }

        .cp-location { font-size: .87rem; color: var(--muted); display: flex; align-items: center; gap: 6px; }
        .cp-location i { color: var(--green); }

        .cp-rating-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--gold-l); border: 1.5px solid var(--gold);
          border-radius: 20px; padding: 4px 13px; font-size: .85rem; font-weight: 700;
          color: #7c4b00; margin-top: 8px;
        }

        .cp-stats {
          display: flex; gap: 0; border-top: 1px solid var(--border); margin: 0 2rem;
        }
        @media(max-width:576px){ .cp-stats { margin: 0 1rem; } }
        .cp-stat { flex: 1; text-align: center; padding: 14px 8px; border-right: 1px solid var(--border); }
        .cp-stat:last-child { border-right: none; }
        .cp-stat-val { display: block; font-size: 1.3rem; font-weight: 800; color: var(--text); }
        .cp-stat-lbl { display: block; font-size: .7rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

        .cp-actions { display: flex; gap: 10px; flex-wrap: wrap; padding: 1.25rem 2rem; }
        @media(max-width:576px){ .cp-actions { padding: 1rem; flex-direction: column; } }

        .cp-btn-hire {
          flex: 1; min-width: 160px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--gold); color: #1a2e1a;
          border: none; border-radius: 11px; padding: 13px 22px;
          font-family: 'DM Sans', sans-serif; font-size: .97rem; font-weight: 700;
          cursor: pointer; text-decoration: none; transition: all .2s;
        }
        .cp-btn-hire:hover { background: var(--gold-d); color: #1a2e1a; transform: translateY(-1px); }

        .cp-btn-share {
          display: flex; align-items: center; gap: 7px;
          background: var(--white); color: var(--muted);
          border: 1.5px solid var(--border); border-radius: 11px; padding: 13px 18px;
          font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .cp-btn-share:hover { border-color: var(--gold); color: #7c4b00; }

        .cp-tabs {
          display: flex; gap: 0; background: var(--white);
          border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.05);
          overflow: hidden; margin-bottom: 1.5rem; border: 1.5px solid var(--border);
        }
        .cp-tab {
          flex: 1; padding: 13px 8px; text-align: center; border: none;
          background: transparent; font-family: 'DM Sans', sans-serif;
          font-size: .83rem; font-weight: 600; color: var(--muted); cursor: pointer;
          transition: all .18s; border-right: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .cp-tab:last-child { border-right: none; }
        .cp-tab.active { background: var(--green); color: #fff; }
        .cp-tab:hover:not(.active) { background: var(--green-l); color: var(--green); }

        .cp-section {
          background: var(--white); border-radius: 14px;
          box-shadow: 0 2px 14px rgba(0,0,0,.05);
          padding: 1.75rem; margin-bottom: 1.5rem;
          border: 1.5px solid var(--border);
        }
        .cp-section-title {
          font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700;
          color: var(--text); margin: 0 0 1.25rem;
          display: flex; align-items: center; gap: 10px;
        }
        .cp-section-title-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--green-l); color: var(--green);
          display: flex; align-items: center; justify-content: center;
          font-size: .85rem; flex-shrink: 0;
        }
        .cp-about-text { font-size: .95rem; color: var(--muted); line-height: 1.8; }

        .cp-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
        .cp-gallery-img {
          width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 10px;
          cursor: pointer; transition: transform .22s, box-shadow .22s;
          box-shadow: 0 2px 8px rgba(0,0,0,.08); border: 1.5px solid var(--border);
        }
        .cp-gallery-img:hover { transform: scale(1.04); box-shadow: 0 8px 22px rgba(0,0,0,.18); border-color: var(--gold); }

        .cp-lightbox {
          position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,.88);
          display: flex; align-items: center; justify-content: center; padding: 20px; cursor: pointer;
        }
        .cp-lightbox img { max-width: 90vw; max-height: 85vh; border-radius: 12px; object-fit: contain; }
        .cp-lightbox-close {
          position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.25);
          color: #fff; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        .cp-skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .cp-skill-tag {
          background: var(--green-l); color: var(--green);
          border: 1px solid var(--green-b); border-radius: 20px;
          padding: 6px 15px; font-size: .82rem; font-weight: 600;
        }

        .cp-review {
          background: var(--bg); border-radius: 12px; padding: 1.25rem;
          border: 1px solid var(--border); margin-bottom: 12px;
        }
        .cp-review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .cp-reviewer-name { font-weight: 700; color: var(--text); font-size: .93rem; margin: 0 0 3px; }
        .cp-reviewer-loc { font-size: .77rem; color: var(--muted); }
        .cp-rating-badge {
          background: var(--gold); color: #1a2e1a; border-radius: 20px;
          padding: 4px 11px; font-size: .78rem; font-weight: 800;
          display: flex; align-items: center; gap: 4px; flex-shrink: 0;
        }
        .cp-review-text { font-size: .88rem; color: var(--muted); line-height: 1.65; margin: 0; }

        .cp-sidebar-card {
          background: var(--white); border-radius: 14px;
          box-shadow: 0 2px 14px rgba(0,0,0,.05);
          padding: 1.5rem; margin-bottom: 1.5rem; border: 1.5px solid var(--border);
        }
        .cp-contact-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0; border-bottom: 1px solid var(--border); font-size: .9rem;
        }
        .cp-contact-item:last-child { border-bottom: none; padding-bottom: 0; }
        .cp-contact-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: var(--green-l); color: var(--green);
          display: flex; align-items: center; justify-content: center;
          font-size: .85rem; flex-shrink: 0;
        }
        .cp-contact-label { font-size: .72rem; color: var(--muted); display: block; }
        .cp-contact-value { font-weight: 600; color: var(--text); }

        .cp-cred-btn {
          display: flex; align-items: center; gap: 10px;
          background: var(--green-l); color: var(--green);
          border: 1.5px solid var(--green-b); border-radius: 10px; padding: 12px 18px;
          font-weight: 700; font-size: .88rem; text-decoration: none; transition: all .18s; width: 100%;
        }
        .cp-cred-btn:hover { background: var(--green); color: #fff; }

        .cp-service-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 0;
          border-bottom: 1px solid var(--border); font-size: .9rem;
        }
        .cp-service-item:last-child { border-bottom: none; }
        .cp-service-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

        .cp-sticky-cta {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem;
          position: sticky; top: 20px;
          box-shadow: 0 4px 18px rgba(0,0,0,.06);
        }
        .cp-sticky-cta h3 { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; color: var(--text); }
        .cp-sticky-cta p { font-size: .84rem; color: var(--muted); margin-bottom: 16px; line-height: 1.65; }
        .cp-sticky-note { font-size: .72rem; color: var(--muted); text-align: center; margin-top: 10px; margin-bottom: 0; }

        .cp-footer { background: #1a1a2e; color: #bbb; padding: 52px 0 26px; font-family: 'DM Sans', sans-serif; }
        .cp-footer h5 { color: #fff; font-weight: 700; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px; }
        .cp-footer a { color: #bbb; text-decoration: none; font-size: .85rem; transition: color .15s; }
        .cp-footer a:hover { color: var(--gold); }
        .cp-footer p { font-size: .85rem; margin-bottom: 6px; }

        @media(max-width:768px){
          .cp-tabs { overflow-x: auto; }
          .cp-tab { font-size: .75rem; padding: 11px 6px; white-space: nowrap; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {lightboxImg && (
        <div className="cp-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="cp-lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
          <img src={lightboxImg} alt="Portfolio" onClick={e => e.stopPropagation()}/>
        </div>
      )}

      {/* Cover */}
      <div className="cp-cover">
        <div className="cp-cover-pattern"/>
      </div>

      <div style={{background:'var(--bg)', padding:'0 0 80px'}}>
        <div className="container" style={{maxWidth:1100}}>
          <div className="row g-4" style={{marginTop:0}}>

            {/* Main column */}
            <div className="col-lg-8">

              {/* Profile card */}
              <div className="cp-header-card">
                <div className="cp-avatar-row">
                  <img
                    src={profileImage} alt={craftsman.name} className="cp-avatar"
                    onError={e => { e.target.src='https://placehold.co/128x128/f0fdf4/16a34a?text=C'; }}
                  />
                  <div className="cp-name-block">
                    <h1 className="cp-name">{craftsman.name}</h1>
                    <p className="cp-headline">
                      <span className="cp-trade-pill">
                        <i className="fas fa-hard-hat"/> {craftsman.primary_service || 'Craftsman'}
                      </span>
                      {craftsman.status === 'approved' && (
                        <span className="cp-verified-badge">
                          <i className="fas fa-check-circle"/> Verified
                        </span>
                      )}
                    </p>
                    <p className="cp-location">
                      <i className="fas fa-map-marker-alt"/>
                      {craftsman.location || 'Kenya'}
                      {craftsman.company_name && <> &nbsp;·&nbsp; {craftsman.company_name}</>}
                    </p>
                    {avgRating && (
                      <div className="cp-rating-pill">
                        <span style={{color:'#d97706'}}>★</span>
                        <strong>{avgRating}</strong>
                        <span style={{fontWeight:400,opacity:.7}}>({craftsman.reviews.length} {craftsman.reviews.length === 1 ? 'review' : 'reviews'})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cp-stats">
                  <div className="cp-stat">
                    <span className="cp-stat-val">{craftsman.gallery_images?.length || 0}</span>
                    <span className="cp-stat-lbl">Portfolio</span>
                  </div>
                  <div className="cp-stat">
                    <span className="cp-stat-val">{craftsman.reviews?.length || 0}</span>
                    <span className="cp-stat-lbl">Reviews</span>
                  </div>
                  <div className="cp-stat">
                    <span className="cp-stat-val">{services.length}</span>
                    <span className="cp-stat-lbl">Services</span>
                  </div>
                  <div className="cp-stat">
                    <span className="cp-stat-val" style={{color:'var(--green)', fontSize:'.95rem'}}>
                      {craftsman.status === 'approved' ? 'Verified' : 'Active'}
                    </span>
                    <span className="cp-stat-lbl">Status</span>
                  </div>
                </div>

                <div className="cp-actions">
                  <Link to="/HireLogin" className="cp-btn-hire">
                    <i className="fas fa-paper-plane"/> Hire {craftsman.name?.split(' ')[0] || 'Now'}
                  </Link>
                  <button className="cp-btn-share" onClick={handleShare}>
                    <i className="fas fa-share-alt"/> Share
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="cp-tabs">
                {tabs.map(t => (
                  <button key={t} className={`cp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t === 'about'     && <><i className="fas fa-user"/> About</>}
                    {t === 'portfolio' && <><i className="fas fa-images"/> Portfolio</>}
                    {t === 'skills'    && <><i className="fas fa-tools"/> Skills</>}
                    {t === 'reviews'   && <><i className="fas fa-star"/> Reviews {craftsman.reviews?.length > 0 && `(${craftsman.reviews.length})`}</>}
                  </button>
                ))}
              </div>

              {/* About */}
              {activeTab === 'about' && (
                <div className="cp-section">
                  <h2 className="cp-section-title">
                    <span className="cp-section-title-icon"><i className="fas fa-user"/></span>
                    About {craftsman.name?.split(' ')[0]}
                  </h2>
                  <p className="cp-about-text">
                    {craftsman.description || 'No description added yet.'}
                  </p>
                  {services.length > 0 && (
                    <>
                      <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:'var(--text)', marginTop:24, marginBottom:12}}>
                        Services Offered
                      </h3>
                      <div>
                        {services.map((svc, i) => (
                          <div className="cp-service-item" key={i}>
                            <span className="cp-service-dot"/>
                            <span style={{fontWeight:600, color:'var(--text)'}}>{svc.name || `Service ${i + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Portfolio */}
              {activeTab === 'portfolio' && (
                <div className="cp-section">
                  <h2 className="cp-section-title">
                    <span className="cp-section-title-icon"><i className="fas fa-images"/></span>
                    Work Portfolio
                  </h2>
                  {craftsman.gallery_images?.length > 0 ? (
                    <>
                      <p style={{fontSize:'.84rem', color:'var(--muted)', marginBottom:16}}>
                        {craftsman.gallery_images.length} project{craftsman.gallery_images.length !== 1 ? 's' : ''} — click to enlarge.
                      </p>
                      <div className="cp-gallery">
                        {craftsman.gallery_images.map((img, i) => (
                          <img
                            key={img.id || i}
                            src={getFullImageUrl(img.image_url)}
                            alt={`Project ${i + 1}`}
                            className="cp-gallery-img"
                            loading="lazy"
                            onClick={() => setLightboxImg(getFullImageUrl(img.image_url))}
                            onError={e => { e.target.src='https://placehold.co/200x200/f0fdf4/16a34a?text=Project'; }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{color:'var(--muted)', fontSize:'.9rem'}}>No portfolio images uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Skills */}
              {activeTab === 'skills' && (
                <div className="cp-section">
                  <h2 className="cp-section-title">
                    <span className="cp-section-title-icon"><i className="fas fa-tools"/></span>
                    Skills & Expertise
                  </h2>
                  {Array.isArray(craftsman.skills) && craftsman.skills.length > 0 ? (
                    <div className="cp-skills">
                      {craftsman.skills.map((skill, i) => (
                        <span className="cp-skill-tag" key={i}>{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{color:'var(--muted)', fontSize:'.9rem'}}>No skills listed yet.</p>
                  )}
                  {proofDocument && (
                    <div style={{marginTop:24}}>
                      <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:'var(--text)', marginBottom:12}}>
                        Credentials
                      </h3>
                      <a href={proofDocument} target="_blank" rel="noopener noreferrer" className="cp-cred-btn">
                        <i className="fas fa-file-alt"/> View Verification Document
                        <i className="fas fa-external-link-alt" style={{marginLeft:'auto', fontSize:'.72rem', opacity:.6}}/>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="cp-section">
                  <h2 className="cp-section-title">
                    <span className="cp-section-title-icon"><i className="fas fa-star"/></span>
                    Client Reviews
                    {avgRating && (
                      <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:'.83rem', fontWeight:600, color:'var(--muted)', marginLeft:8}}>
                        Avg {avgRating}/10
                      </span>
                    )}
                  </h2>
                  {craftsman.reviews?.length > 0 ? (
                    craftsman.reviews.map((review, i) => (
                      <div className="cp-review" key={i}>
                        <div className="cp-review-header">
                          <div>
                            <p className="cp-reviewer-name">{review.reviewer}</p>
                            <p className="cp-reviewer-loc">{review.location}</p>
                          </div>
                          <div className="cp-rating-badge">
                            <span>★</span> {review.rating}/10
                          </div>
                        </div>
                        <p className="cp-review-text">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p style={{color:'var(--muted)', fontSize:'.9rem'}}>No reviews yet.</p>
                  )}
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="col-lg-4">

              <div className="cp-sticky-cta">
                <h3>Hire {craftsman.name?.split(' ')[0]}</h3>
                <p>Available for work across Kenya. Send a request to get started.</p>
                <Link to="/HireLogin" className="cp-btn-hire" style={{display:'flex', width:'100%', justifyContent:'center', marginBottom: craftsman.phone ? 10 : 0}}>
                  <i className="fas fa-paper-plane"/> Send Request
                </Link>
                {craftsman.phone && (
                  <a href={`tel:${craftsman.phone}`} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--green)', color:'#fff', border:'none', borderRadius:11, padding:'13px 22px', fontFamily:"'DM Sans',sans-serif", fontSize:'.97rem', fontWeight:700, textDecoration:'none', transition:'all .2s', width:'100%'}}>
                    <i className="fas fa-phone"/> Call Now
                  </a>
                )}
                <p className="cp-sticky-note">No upfront fees</p>
              </div>

              <div className="cp-sidebar-card">
                <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:'var(--text)', marginBottom:12}}>Details</h3>
                {craftsman.phone && (
                  <div className="cp-contact-item">
                    <span className="cp-contact-icon"><i className="fas fa-phone"/></span>
                    <div>
                      <span className="cp-contact-label">Phone</span>
                      <a href={`tel:${craftsman.phone}`} className="cp-contact-value" style={{color:'var(--green)', display:'block'}}>{craftsman.phone}</a>
                    </div>
                  </div>
                )}
                <div className="cp-contact-item">
                  <span className="cp-contact-icon"><i className="fas fa-map-marker-alt"/></span>
                  <div>
                    <span className="cp-contact-label">Location</span>
                    <span className="cp-contact-value">{craftsman.location || 'Kenya'}</span>
                  </div>
                </div>
                {craftsman.company_name && (
                  <div className="cp-contact-item">
                    <span className="cp-contact-icon"><i className="fas fa-building"/></span>
                    <div>
                      <span className="cp-contact-label">Company</span>
                      <span className="cp-contact-value">{craftsman.company_name}</span>
                    </div>
                  </div>
                )}
                <div className="cp-contact-item">
                  <span className="cp-contact-icon"><i className="fas fa-hard-hat"/></span>
                  <div>
                    <span className="cp-contact-label">Primary Trade</span>
                    <span className="cp-contact-value">{craftsman.primary_service || 'General Craftsman'}</span>
                  </div>
                </div>
              </div>

              <div className="cp-sidebar-card" style={{textAlign:'center'}}>
                <p style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, color:'var(--text)', marginBottom:6}}>Looking for other craftsmen?</p>
                <p style={{fontSize:'.82rem', color:'var(--muted)', marginBottom:14}}>Browse all verified craftsmen across Kenya.</p>
                <Link to="/craftsmen"
                  style={{display:'block', background:'#FFD700', color:'#1a2e1a', borderRadius:10, padding:'10px', fontWeight:700, fontSize:'.88rem', textDecoration:'none'}}>
                  View All Craftsmen
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      <footer className="cp-footer">
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
              <h5>Contact</h5>
              <p><i className="fas fa-map-marker-alt me-2" style={{color:'#FFD700'}}/>Kisumu, Kenya</p>
              <p><i className="fas fa-envelope me-2" style={{color:'#FFD700'}}/>support@kaakazini.com</p>
              <p><i className="fas fa-phone me-2" style={{color:'#FFD700'}}/>+254 700 000 000</p>
            </div>
            <div className="col-lg-5">
              <h5>Find Us</h5>
              <div style={{borderRadius:12, overflow:'hidden'}}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63828.69947405925!2d34.7106301!3d-0.1022054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa5b2e0a70b83%3A0x36005f520589fdfc!2sKisumu!5e0!3m2!1sen!2ske!4v1718888888888!5m2!1sen!2ske"
                  width="100%" height="200" style={{border:0, display:'block'}}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Location"
                />
              </div>
            </div>
          </div>
          <hr style={{borderColor:'rgba(255,255,255,.08)', margin:'26px 0 18px'}}/>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, fontSize:'.8rem'}}>
            <p style={{margin:0}}>© {new Date().getFullYear()} <strong style={{color:'#fff'}}>KaaKazini</strong>. All rights reserved.</p>
            <a href="#top" style={{color:'#FFD700', fontWeight:600}}>Back to top</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default CraftsmanProfile;
