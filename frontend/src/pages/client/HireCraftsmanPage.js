import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosClient";

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

// ── Image URL helpers ──────────────────────────────────────────────────────
// MEDIA_BASE: strip /api suffix from the API base so we get the root domain
const MEDIA_BASE = (process.env.REACT_APP_MEDIA_URL || process.env.REACT_APP_API_BASE_URL || '')
  .replace(/\/api\/?$/, '');

// Make any file URL absolute
const imgUrl = (p) => {
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${MEDIA_BASE}${p.startsWith('/') ? '' : '/'}${p}`;
};

// proof image object → absolute URL
// Serializer returns { id, image_url, uploaded_at }  ← image_url is the field
const proofImgUrl = (img) => {
  if (!img) return null;
  // Handle both {image_url:...} and {image:...} shapes defensively
  const raw = img.image_url || img.image || (typeof img === 'string' ? img : null);
  return imgUrl(raw);
};

const avi = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'C')}&background=1a1a1a&color=FFD700&size=80&bold=true`;

// ── Craftsman field helpers ────────────────────────────────────────────────
const getCover = (c) => {
  if (!c) return null;
  if (Array.isArray(c.gallery_images) && c.gallery_images.length)
    return imgUrl(c.gallery_images[0].image_url || c.gallery_images[0].url || c.gallery_images[0].image);
  return imgUrl(c.services?.[0]?.image_url || c.services?.[0]?.image || c.service_image || null);
};
const getAvatar  = (c) => imgUrl(c?.profile_url || c?.profile || c?.profile_image || c?.avatar || null);
const getName    = (c) => c?.full_name || c?.name || 'Craftsman';
const getJobCraftsmanName = (job) => {
  if (!job) return '—';
  const c = job.craftsman;
  if (c && typeof c === 'object') {
    const name = c.full_name || c.name || c.user?.full_name || c.user?.username || null;
    if (name) return name;
  }
  return job.craftsman_name || job.craftsman_full_name || '—';
};

const SERVICES  = ["Plumbing","Electrical","Carpentry","Painting","Masonry","Tiling","Roofing","Tailoring","Metalwork","Other"];
const LOCATIONS = ["Nairobi","Mombasa","Kisumu","Eldoret","Nakuru","Thika","Kisii","Nyeri","Meru","Machakos"];

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.hcp {
  --sb-w: 260px;
  --yellow: #FFD700; --yellow-d: #e6c200; --yellow-l: #fef9c3;
  --green: #16a34a; --green-d: #15803d; --green-l: #f0fdf4;
  --black: #0d0d0d; --off: #f8fafc; --border: #e2e8f0;
  --text: #1e293b; --muted: #64748b;
  all: initial; font-family: 'Outfit', sans-serif;
  display: block; background: var(--off); color: var(--text); min-height: 100vh;
}
.hcp *, .hcp *::before, .hcp *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes spin   { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.45; } }
@keyframes mpesa-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.3); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }

/* SHELL */
.hcp .shell { display: flex; min-height: 100vh; position: relative; }

/* SIDEBAR */
.hcp .sb {
  width: var(--sb-w); min-width: var(--sb-w); background: var(--black);
  display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0;
  flex-shrink: 0; border-right: 1px solid rgba(255,215,0,.08); overflow: hidden; z-index: 10;
}
.hcp .sb::after {
  content: ''; position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%);
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.12) 0%, transparent 70%); pointer-events: none;
}
.hcp .sb-head { position: relative; z-index: 1; padding: 22px 18px 18px; border-bottom: 1px solid rgba(255,255,255,.06); flex-shrink: 0; }
.hcp .user-row { display: flex; align-items: center; gap: 10px; }
.hcp .user-av { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,215,0,.35); flex-shrink: 0; }
.hcp .user-name { font-weight: 700; font-size: .85rem; color: #fff; margin-bottom: 3px; line-height: 1.2; }
.hcp .user-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,215,0,.12); color: var(--yellow); border: 1px solid rgba(255,215,0,.25);
  border-radius: 20px; padding: 2px 8px; font-size: .58rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
}
.hcp .user-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--yellow); }
.hcp .sb-nav { position: relative; z-index: 1; flex: 1; padding: 14px 10px; overflow-y: auto; }
.hcp .nav-section { font-size: .58rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.25); padding: 0 10px; margin-bottom: 7px; margin-top: 4px; }
.hcp .nb {
  width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent;
  color: rgba(255,255,255,.5); font-family: 'Outfit', sans-serif; font-weight: 600; font-size: .83rem;
  text-align: left; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all .18s; margin-bottom: 2px; position: relative;
}
.hcp .nb-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,.07); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .18s; font-size: .78rem; }
.hcp .nb:hover { color: #fff; }
.hcp .nb:hover .nb-icon { background: rgba(255,215,0,.15); color: var(--yellow); }
.hcp .nb.on { color: #fbbf24; }
.hcp .nb.on .nb-icon { background: linear-gradient(135deg, #fbbf24, #22c55e); color: var(--black); }
.hcp .nb.on::before { content: ''; position: absolute; left: -10px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; background: linear-gradient(180deg, #fbbf24, #22c55e); border-radius: 0 3px 3px 0; }
.hcp .sb-foot { position: relative; z-index: 1; padding: 12px 10px; border-top: 1px solid rgba(255,255,255,.06); flex-shrink: 0; }
.hcp .sb-foot a { display: flex; align-items: center; gap: 10px; font-size: .8rem; font-weight: 600; color: rgba(255,255,255,.35); text-decoration: none; padding: 9px 12px; border-radius: 10px; transition: all .15s; }
.hcp .sb-foot a:hover { color: #fff; background: rgba(255,255,255,.07); }

/* MOBILE */
.hcp .topbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px; background: var(--black); z-index: 300; align-items: center; padding: 0 16px; gap: 12px; border-bottom: 1px solid rgba(255,215,0,.12); }
.hcp .topbar-brand { font-size: 1rem; font-weight: 800; color: #fff; flex: 1; }
.hcp .hamburger { width: 38px; height: 38px; border-radius: 9px; background: rgba(255,215,0,.12); color: var(--yellow); border: 1.5px solid rgba(255,215,0,.25); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: .88rem; flex-shrink: 0; }
.hcp .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 400; }
.hcp .overlay.show { display: block; }
.hcp .sb-mobile { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; z-index: 500; transform: translateX(-100%); transition: transform .28s cubic-bezier(.4,0,.2,1); }
.hcp .sb-mobile.open { transform: translateX(0); }

/* MAIN */
.hcp .main { flex: 1; min-width: 0; padding: 2.25rem 2.25rem 3rem; background: var(--off); }
.hcp .card { background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(0,0,0,.06); padding: 2.25rem; margin-bottom: 1.75rem; border: 2px solid rgba(255,215,0,.1); position: relative; overflow: hidden; animation: fadeUp .35s ease both; }
.hcp .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--black), var(--yellow), var(--black)); }

/* FILTER */
.hcp .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; align-items: center; }
.hcp .srch-wrap { flex: 1; min-width: 180px; position: relative; }
.hcp .srch-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: .82rem; pointer-events: none; }
.hcp .srch { width: 100%; padding: 11px 13px 11px 36px; font-size: .88rem; border: 2px solid var(--border); border-radius: 11px; background: #fff; color: var(--text); font-family: 'Outfit', sans-serif; outline: none; transition: border-color .2s, box-shadow .2s; font-weight: 500; }
.hcp .srch:focus { border-color: var(--yellow); box-shadow: 0 0 0 4px rgba(255,215,0,.1); }
.hcp .filter-sel { padding: 11px 15px; border: 2px solid var(--border); border-radius: 11px; font-size: .88rem; font-family: 'Outfit', sans-serif; outline: none; background: #fff; color: var(--text); cursor: pointer; min-width: 145px; font-weight: 600; transition: border-color .2s; }
.hcp .filter-sel:focus { border-color: var(--yellow); }

/* CRAFTSMAN GRID */
.hcp .craft-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
.hcp .craft-card { background: #fff; border: 2px solid var(--border); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; transition: transform .22s, box-shadow .22s, border-color .2s; box-shadow: 0 4px 14px rgba(0,0,0,.05); }
.hcp .craft-card:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(0,0,0,.11); border-color: var(--yellow); }
.hcp .craft-cover { position: relative; height: 140px; overflow: hidden; flex-shrink: 0; }
.hcp .craft-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .38s; display: block; }
.hcp .craft-card:hover .craft-cover img { transform: scale(1.07); }
.hcp .craft-cover::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 55%); }
.hcp .trade-pill { position: absolute; top: 10px; left: 10px; z-index: 1; background: linear-gradient(135deg, var(--yellow), var(--yellow-d)); color: var(--black); border-radius: 50px; padding: 3px 11px; font-size: .6rem; font-weight: 800; letter-spacing: .04em; box-shadow: 0 2px 8px rgba(255,215,0,.4); }
.hcp .avail-pill { position: absolute; top: 10px; right: 10px; z-index: 1; background: var(--green); color: #fff; border-radius: 50px; padding: 3px 9px; font-size: .58rem; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(22,163,74,.4); }
.hcp .avail-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: pulse 1.5s infinite; }
.hcp .craft-body { padding: 15px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.hcp .craft-row { display: flex; align-items: center; gap: 10px; }
.hcp .craft-av { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--yellow); flex-shrink: 0; }
.hcp .craft-name { font-weight: 800; font-size: .9rem; color: var(--text); }
.hcp .craft-loc { font-size: .72rem; color: var(--green); font-weight: 600; margin-top: 2px; }
.hcp .craft-stars { display: inline-flex; gap: 1px; font-size: .68rem; color: #f59e0b; }
.hcp .craft-rtg { font-size: .7rem; font-weight: 700; color: var(--muted); }
.hcp .craft-desc { font-size: .76rem; color: var(--muted); line-height: 1.6; flex: 1; }
.hcp .hire-btn { display: flex; align-items: center; justify-content: center; gap: 7px; background: linear-gradient(135deg, var(--black), #333); color: var(--yellow); border: none; border-radius: 11px; padding: 10px 0; font-weight: 800; font-size: .82rem; cursor: pointer; margin-top: auto; font-family: 'Outfit', sans-serif; transition: all .2s; box-shadow: 0 4px 14px rgba(0,0,0,.2); }
.hcp .hire-btn:hover { background: linear-gradient(135deg, #1a1a1a, #444); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,.3); }

/* HIRE FORM */
.hcp .locked-bar { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #0d0d0d, #1a1a2e); border-radius: 14px; padding: 18px 22px; margin-bottom: 20px; border: 1px solid rgba(255,215,0,.15); box-shadow: 0 8px 28px rgba(0,0,0,.2); flex-wrap: wrap; }
.hcp .locked-av { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid var(--yellow); flex-shrink: 0; }
.hcp .locked-name { font-weight: 800; font-size: 1.15rem; color: #fff; }
.hcp .locked-meta { font-size: .76rem; color: rgba(255,255,255,.5); font-weight: 500; margin-top: 3px; }
.hcp .back-btn { display: inline-flex; align-items: center; gap: 7px; background: none; border: 2px solid var(--border); color: var(--muted); border-radius: 9px; padding: 8px 15px; font-size: .8rem; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .15s; margin-bottom: 18px; }
.hcp .back-btn:hover { border-color: var(--yellow); color: var(--text); background: var(--yellow-l); }
.hcp .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.hcp .lbl { display: block; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 6px; }
.hcp .inp, .hcp .sel, .hcp .ta { width: 100%; padding: 11px 13px; font-size: .88rem; border: 2px solid var(--border); border-radius: 11px; background: var(--off); color: var(--text); font-family: 'Outfit', sans-serif; outline: none; transition: border-color .2s, box-shadow .2s; font-weight: 500; display: block; appearance: auto; }
.hcp .inp:focus, .hcp .sel:focus, .hcp .ta:focus { border-color: var(--yellow); box-shadow: 0 0 0 4px rgba(255,215,0,.1); background: #fff; }
.hcp .ta { resize: vertical; min-height: 95px; }
.hcp .ck-row { display: flex; align-items: center; gap: 8px; padding: 9px 0; }
.hcp .ck { width: 16px; height: 16px; accent-color: var(--black); cursor: pointer; }
.hcp .ck-lbl { font-size: .85rem; font-weight: 600; color: var(--text); cursor: pointer; }
.hcp .submit-btn { width: 100%; padding: 14px; font-size: .93rem; font-weight: 800; background: linear-gradient(135deg, var(--yellow), var(--yellow-d)); color: var(--black); border: none; border-radius: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .2s; margin-top: 10px; box-shadow: 0 6px 22px rgba(255,215,0,.3); display: flex; align-items: center; justify-content: center; gap: 8px; }
.hcp .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,215,0,.4); filter: brightness(1.04); }
.hcp .submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.hcp .ok-banner { background: var(--green-l); border: 2px solid #bbf7d0; border-radius: 13px; padding: 13px 17px; font-size: .88rem; color: var(--green-d); font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }

/* TABLE */
.hcp .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.hcp .tbl { width: 100%; border-collapse: collapse; min-width: 560px; }
.hcp .tbl th { background: var(--off); font-size: .66rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); padding: 12px 16px; text-align: left; border-bottom: 2px solid var(--border); white-space: nowrap; }
.hcp .tbl td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: .86rem; vertical-align: middle; font-family: 'Outfit', sans-serif; }
.hcp .tbl tr:last-child td { border-bottom: none; }
.hcp .tbl tbody tr:hover { background: var(--off); }

/* BADGES */
.hcp .bdg { display: inline-flex; align-items: center; gap: 5px; border-radius: 50px; padding: 4px 11px; font-size: .68rem; font-weight: 700; white-space: nowrap; }
.hcp .bdg-g  { background: var(--green-l); color: var(--green-d); }
.hcp .bdg-y  { background: #fef9c3; color: #78350f; }
.hcp .bdg-r  { background: #fef2f2; color: #b91c1c; }
.hcp .bdg-gr { background: #f3f4f6; color: #6b7280; }
.hcp .bdg-b  { background: #eff6ff; color: #1d4ed8; }
.hcp .bdg-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; flex-shrink: 0; }

/* ACTION BUTTONS */
.hcp .act { padding: 5px 12px; border-radius: 7px; font-size: .72rem; font-weight: 700; cursor: pointer; border: 2px solid; font-family: 'Outfit', sans-serif; transition: all .14s; white-space: nowrap; }
.hcp .act-ok  { background: var(--green-l); color: var(--green-d); border-color: #bbf7d0; }
.hcp .act-ok:hover  { background: var(--green); color: #fff; border-color: var(--green); }
.hcp .act-bad { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.hcp .act-bad:hover { background: #b91c1c; color: #fff; border-color: #b91c1c; }
.hcp .act-pay { background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; border-color: transparent; box-shadow: 0 3px 10px rgba(22,163,74,.3); animation: mpesa-glow 2s infinite; }
.hcp .act-pay:hover { filter: brightness(1.1); transform: translateY(-1px); }

/* PROOF LIGHTBOX */
.hcp .proof-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.hcp .proof-lightbox img { max-width: 100%; max-height: 85vh; border-radius: 12px; object-fit: contain; }
.hcp .proof-close { position: absolute; top: 16px; right: 20px; background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2); color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; }
.hcp .proof-thumb { width: 38px; height: 38px; object-fit: cover; border-radius: 7px; border: 2px solid var(--border); cursor: pointer; transition: border-color .15s, transform .15s; display: block; }
.hcp .proof-thumb:hover { border-color: var(--yellow); transform: scale(1.08); }
.hcp .proof-broken { width: 38px; height: 38px; border-radius: 7px; border: 2px dashed var(--border); background: var(--off); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: .6rem; }

/* M-PESA MODAL */
.hcp .mpesa-steps { display: flex; flex-direction: column; gap: 14px; margin: 18px 0; }
.hcp .mpesa-step { display: flex; align-items: flex-start; gap: 13px; padding: 14px; border-radius: 12px; background: var(--off); border: 1.5px solid var(--border); }
.hcp .mpesa-num { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: var(--black); color: var(--yellow); display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 800; }
.hcp .mpesa-step-title { font-weight: 800; font-size: .85rem; color: var(--text); margin-bottom: 2px; }
.hcp .mpesa-step-text  { font-size: .76rem; color: var(--muted); line-height: 1.6; }
.hcp .mpesa-amt { background: linear-gradient(135deg, #0d0d0d, #1a1a2e); border-radius: 12px; padding: 16px 20px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,215,0,.15); }
.hcp .mpesa-amt-lbl { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.5); text-transform: uppercase; }
.hcp .mpesa-amt-val { font-size: 1.6rem; font-weight: 900; color: var(--yellow); }
.hcp .mpesa-inp-wrap { margin: 16px 0; }
.hcp .mpesa-btn { width: 100%; padding: 14px; border-radius: 13px; border: none; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-weight: 800; font-size: .93rem; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 22px rgba(22,163,74,.3); }
.hcp .mpesa-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
.hcp .mpesa-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.hcp .mpesa-note { text-align: center; font-size: .74rem; color: var(--muted); margin-top: 12px; line-height: 1.6; }
.hcp .mpesa-logo-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
.hcp .mpesa-logo { background: #16a34a; color: #fff; border-radius: 8px; padding: 4px 12px; font-size: .78rem; font-weight: 900; letter-spacing: .05em; }

/* REVIEWS */
.hcp .rev-grid { display: flex; flex-direction: column; gap: 16px; }
.hcp .rev-card { background: #fff; border: 2px solid var(--border); border-radius: 18px; padding: 24px; box-shadow: 0 6px 22px rgba(0,0,0,.05); position: relative; overflow: hidden; animation: fadeUp .35s ease both; }
.hcp .rev-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--black), var(--yellow)); }
.hcp .rev-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
.hcp .rev-svc { font-weight: 800; font-size: 1.02rem; color: var(--text); margin-bottom: 2px; }
.hcp .rev-meta { font-size: .76rem; color: var(--muted); font-weight: 500; }
.hcp .rev-craft { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; padding: 9px 13px; background: var(--off); border-radius: 9px; border: 1.5px solid var(--border); }
.hcp .rev-craft-av { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--yellow); object-fit: cover; }
.hcp .rev-craft-name { font-size: .82rem; font-weight: 700; color: var(--text); }
.hcp .star-row { display: flex; gap: 6px; margin-bottom: 13px; align-items: center; }
.hcp .star { font-size: 1.8rem; cursor: pointer; transition: transform .12s; color: #d1d5db; user-select: none; line-height: 1; }
.hcp .star:hover, .hcp .star.on { color: #f59e0b; transform: scale(1.2); }
.hcp .star-val { font-size: .82rem; font-weight: 800; color: var(--muted); margin-left: 4px; }
.hcp .rev-btn { background: linear-gradient(135deg, var(--yellow), var(--yellow-d)); color: var(--black); border: none; border-radius: 9px; padding: 9px 22px; font-weight: 800; font-size: .84rem; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .18s; box-shadow: 0 4px 14px rgba(255,215,0,.3); display: inline-flex; align-items: center; gap: 7px; }
.hcp .rev-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(255,215,0,.4); }

/* PAYMENTS */
.hcp .pay-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 14px; margin-bottom: 20px; }
.hcp .pay-stat { background: #fff; border: 2px solid rgba(255,215,0,.12); border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,.05); transition: transform .2s; }
.hcp .pay-stat:hover { transform: translateY(-3px); }
.hcp .pay-stat-icon { width: 42px; height: 42px; border-radius: 11px; background: #0d0d0d; display: flex; align-items: center; justify-content: center; margin-bottom: 13px; }
.hcp .pay-stat-icon i { color: var(--yellow); font-size: .88rem; }
.hcp .pay-stat-v { font-size: 1.55rem; font-weight: 800; color: var(--text); margin-bottom: 3px; }
.hcp .pay-stat-l { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }

/* PROFILE */
.hcp .prof-hero { background: linear-gradient(135deg, #0d0d0d, #1a1a2e); border: 1px solid rgba(255,215,0,.12); border-radius: 18px; padding: 28px; margin-bottom: 18px; position: relative; overflow: hidden; box-shadow: 0 18px 48px rgba(0,0,0,.2); animation: fadeUp .35s ease both; }
.hcp .prof-hero::before { content: ''; position: absolute; top: -80px; right: -80px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,.08) 0%, transparent 65%); pointer-events: none; }
.hcp .prof-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 18px; margin-bottom: 24px; flex-wrap: wrap; }
.hcp .prof-av { width: 68px; height: 68px; border-radius: 50%; border: 3px solid var(--yellow); flex-shrink: 0; object-fit: cover; }
.hcp .prof-name { font-size: clamp(1.25rem, 3vw, 1.8rem); font-weight: 900; color: #fff; margin-bottom: 5px; letter-spacing: -.03em; }
.hcp .prof-role { display: inline-block; background: rgba(255,215,0,.12); color: var(--yellow); border: 1px solid rgba(255,215,0,.25); border-radius: 50px; padding: 2px 11px; font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.hcp .prof-email { font-size: .78rem; color: rgba(255,255,255,.5); margin-top: 4px; }
.hcp .prof-stats-row { position: relative; z-index: 1; display: flex; border-top: 1px solid rgba(255,255,255,.08); padding-top: 18px; flex-wrap: wrap; gap: 8px 0; }
.hcp .prof-stat { flex: 1; min-width: 80px; text-align: center; border-right: 1px solid rgba(255,255,255,.08); padding: 0 12px; }
.hcp .prof-stat:last-child { border-right: none; }
.hcp .prof-stat-v { font-size: 1.4rem; font-weight: 800; color: var(--yellow); margin-bottom: 2px; }
.hcp .prof-stat-l { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.45); }
.hcp .prof-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.hcp .prof-item { display: flex; align-items: flex-start; gap: 11px; background: #fff; border-radius: 13px; padding: 15px; border: 2px solid var(--border); box-shadow: 0 2px 10px rgba(0,0,0,.04); transition: border-color .2s, transform .2s; }
.hcp .prof-item:hover { border-color: var(--yellow); transform: translateY(-2px); }
.hcp .prof-item-icon { width: 34px; height: 34px; border-radius: 9px; background: #0d0d0d; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hcp .prof-item-icon i { color: var(--yellow); font-size: .8rem; }
.hcp .prof-item-lbl { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 2px; }
.hcp .prof-item-val { font-size: .88rem; font-weight: 700; color: var(--text); word-break: break-word; }

/* EMPTY */
.hcp .empty { text-align: center; padding: 56px 20px; }
.hcp .empty-icon { width: 66px; height: 66px; border-radius: 50%; background: var(--off); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 1.4rem; color: #cbd5e1; }
.hcp .empty h3 { font-size: .97rem; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.hcp .empty p  { font-size: .83rem; color: var(--muted); }

/* SPINNERS */
.hcp .spinner { width: 16px; height: 16px; border: 2.5px solid rgba(0,0,0,.18); border-top-color: var(--black); border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; vertical-align: middle; }
.hcp .spinner-white { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; vertical-align: middle; }
.hcp .spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(245,158,11,.2); border-top-color: #f59e0b; border-radius: 50%; animation: spin .7s linear infinite; display: block; }

/* MODAL */
.hcp .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 800; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeUp .2s ease both; }
.hcp .modal-box { background: #fff; border-radius: 20px; border: 2px solid rgba(255,215,0,.15); font-family: 'Outfit', sans-serif; box-shadow: 0 24px 80px rgba(0,0,0,.25); max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; }
.hcp .modal-hd { border-bottom: 2px solid #f1f5f9; padding: 20px 26px; border-radius: 18px 18px 0 0; position: relative; }
.hcp .modal-hd.dark { background: linear-gradient(135deg, #0d0d0d, #1a1a2e); }
.hcp .modal-hd.dark h5 { color: #fff; }
.hcp .modal-hd.dark p  { color: rgba(255,255,255,.5); }
.hcp .modal-hd.light { background: linear-gradient(135deg, var(--yellow-l), var(--green-l)); }
.hcp .modal-hd h5 { font-weight: 800; font-size: 1.15rem; color: #1e293b; margin-bottom: 2px; }
.hcp .modal-hd p  { font-size: .78rem; color: #64748b; }
.hcp .modal-body { padding: 24px 28px; }
.hcp .modal-ft { border-top: 2px solid #f1f5f9; padding: 16px 26px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
.hcp .modal-close { position: absolute; top: 16px; right: 20px; background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #64748b; line-height: 1; }
.hcp .modal-hd.dark .modal-close { color: rgba(255,255,255,.5); }
.hcp .mbl { padding: 7px 18px; border-radius: 9px; font-weight: 700; font-size: .84rem; cursor: pointer; font-family: 'Outfit', sans-serif; border: 2px solid transparent; transition: all .15s; }
.hcp .mbl-light { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
.hcp .mbl-light:hover { background: #e2e8f0; }
.hcp .mbl-red   { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.hcp .mbl-red:hover   { background: #b91c1c; color: #fff; }
.hcp .mbl-gold  { background: linear-gradient(135deg, var(--yellow), var(--yellow-d)); color: var(--black); box-shadow: 0 4px 14px rgba(255,215,0,.3); font-weight: 800; }
.hcp .mbl-gold:hover  { filter: brightness(1.06); transform: translateY(-1px); }
.hcp .modal-hr { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }

/* RESPONSIVE */
@media (max-width: 992px) {
  .hcp .sb { display: none; }
  .hcp .topbar { display: flex; }
  .hcp .sb-mobile { display: flex; flex-direction: column; }
  .hcp .main { padding: 72px 16px 40px; }
  .hcp .card { padding: 1.4rem; }
  .hcp .form-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hcp .craft-grid { grid-template-columns: 1fr 1fr; }
  .hcp .pay-grid   { grid-template-columns: 1fr 1fr; }
  .hcp .filter-bar { flex-direction: column; }
  .hcp .srch-wrap  { min-width: 100%; }
  .hcp .filter-sel { min-width: 100%; }
}
@media (max-width: 400px) {
  .hcp .craft-grid { grid-template-columns: 1fr; }
  .hcp .pay-grid   { grid-template-columns: 1fr; }
  .hcp .main       { padding: 66px 12px 36px; }
}
`;

function Stars({ r }) {
  return (
    <span className="craft-stars">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={i <= Math.round(Number(r)||0) ? 'fas fa-star' : 'far fa-star'}/>
      ))}
    </span>
  );
}

function SidebarContent({ client, tab, setTab, setSbOpen }) {
  const TABS = [
    { id:'browse',   label:'Find Craftsmen', icon:'fas fa-search' },
    { id:'requests', label:'My Requests',    icon:'fas fa-clipboard-list' },
    { id:'reviews',  label:'Leave a Review', icon:'fas fa-star' },
    { id:'payments', label:'Payments',       icon:'fas fa-receipt' },
    { id:'profile',  label:'My Profile',     icon:'fas fa-user' },
  ];
  return (
    <>
      <div className="sb-head">
        <div className="user-row">
          <img src={avi(client.full_name)} alt={client.full_name} className="user-av"/>
          <div>
            <p className="user-name">{client.full_name || 'Client'}</p>
            <span className="user-badge">Client</span>
          </div>
        </div>
      </div>
      <div className="sb-nav">
        <p className="nav-section">Menu</p>
        {TABS.map(t => (
          <button key={t.id}
            className={`nb${(tab === t.id || (tab === 'hire' && t.id === 'browse')) ? ' on' : ''}`}
            onClick={() => { setTab(t.id); setSbOpen(false); }}>
            <span className="nb-icon"><i className={t.icon}/></span>
            {t.label}
          </button>
        ))}
      </div>
      <div className="sb-foot">
        <Link to="/"><span className="nb-icon"><i className="fas fa-arrow-left"/></span>Back to site</Link>
      </div>
    </>
  );
}

/* ── Proof thumbnails row ────────────────────────────────────────────────── */
function ProofThumbs({ proofs, onOpen }) {
  if (!proofs?.length) return <span style={{ color:'#64748b', fontSize:'.8rem' }}>—</span>;
  return (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
      {proofs.slice(0, 3).map((img, ix) => {
        // ✅ FIX: serializer returns image_url, NOT image
        const url = proofImgUrl(img);
        if (!url) return <div key={ix} className="proof-broken"><i className="fas fa-image"/></div>;
        return (
          <img key={ix} src={url} alt={`Proof ${ix+1}`}
            className="proof-thumb"
            onClick={() => onOpen(proofs, ix)}
            onError={e => { e.target.style.opacity='.2'; e.target.style.border='2px dashed #e2e8f0'; }}
          />
        );
      })}
      {proofs.length > 3 && (
        <div style={{ width:38, height:38, borderRadius:7, background:'#f1f5f9', border:'2px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.68rem', fontWeight:800, color:'#64748b', cursor:'pointer' }}
          onClick={() => onOpen(proofs, 0)}>
          +{proofs.length - 3}
        </div>
      )}
    </div>
  );
}

/* ── Lightbox ────────────────────────────────────────────────────────────── */
function Lightbox({ proofs, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const url = proofImgUrl(proofs[idx]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % proofs.length);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + proofs.length) % proofs.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [proofs.length, onClose]);

  return (
    <div className="hcp proof-lightbox" onClick={onClose}>
      <button className="proof-close" onClick={onClose}>✕</button>
      <div onClick={e => e.stopPropagation()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
        <img src={url} alt="Proof" style={{ maxWidth:'90vw', maxHeight:'80vh', borderRadius:12, objectFit:'contain' }}
          onError={e => { e.target.src='https://placehold.co/400x300/1e293b/64748b?text=Image+not+found'; }}
        />
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {proofs.length > 1 && (
            <button onClick={() => setIdx(i => (i-1+proofs.length)%proofs.length)}
              style={{ background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.2)', color:'#fff', borderRadius:9, padding:'6px 14px', cursor:'pointer', fontSize:'.82rem', fontWeight:700 }}>‹ Prev</button>
          )}
          <span style={{ color:'rgba(255,255,255,.6)', fontSize:'.78rem' }}>{idx+1} / {proofs.length}</span>
          {proofs.length > 1 && (
            <button onClick={() => setIdx(i => (i+1)%proofs.length)}
              style={{ background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.2)', color:'#fff', borderRadius:9, padding:'6px 14px', cursor:'pointer', fontSize:'.82rem', fontWeight:700 }}>Next ›</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function HireCraftsmanPage() {
  const [tab, setTab]             = useState('browse');
  const [sbOpen, setSbOpen]       = useState(false);
  const [client, setClient]       = useState(null);
  const [jobs, setJobs]           = useState([]);
  const [craftsmen, setCraftsmen] = useState([]);
  const [srch, setSrch]           = useState('');
  const [trade, setTrade]         = useState('All');
  const [picked, setPicked]       = useState(null);
  const [jobOk, setJobOk]         = useState(false);
  const [jobBusy, setJobBusy]     = useState(false);
  const [reviews, setReviews]     = useState({});

  const [quoteJob, setQuoteJob]   = useState(null);

  // ── Payment state ─────────────────────────────────────────────────────────
  const [payJob,   setPayJob]   = useState(null);
  const [payPhone, setPayPhone] = useState('');
  const [payBusy,  setPayBusy]  = useState(false);
  // payState: 'idle' | 'stk_sent' | 'polling' | 'complete' | 'failed'
  const [payState, setPayState] = useState('idle');
  const [payMsg,   setPayMsg]   = useState('');
  const pollRef = useRef(null);

  // ── Lightbox state ────────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState(null); // { proofs:[], idx:0 }

  const [jf, setJf] = useState({
    service:'', budget:'', schedule:'', location:'', address:'',
    description:'', isUrgent: false, media: null,
  });

  // Clear poll on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  useEffect(() => {
    api.get('/me/').then(r => {
      setClient(r.data);
      fetchJobs(r.data.id);
      setPayPhone(r.data.phone || r.data.phone_number || '');
    }).catch(() => setClient(null));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/public-craftsman/`)
      .then(r => r.json())
      .then(d => setCraftsmen((d || []).filter(c =>
        c.primary_service &&
        (c.is_approved === true || c.status === 'approved' || c.is_active === true || !c.status)
      )))
      .catch(() => {});
  }, []);

  const fetchJobs = async (id) => {
    try {
      const { data } = await api.get('/job-requests/?role=client');
      const mine = (data || []).filter(j => {
        if (j.client === undefined || j.client === null) return true;
        if (typeof j.client === 'number') return j.client === id;
        if (j.client?.id !== undefined)   return j.client.id === id;
        if (j.client_id !== undefined)    return j.client_id === id;
        return true;
      });
      setJobs(mine);
      const rv = {};
      mine.forEach(j => { rv[j.id] = { rating: j.rating || 0, review: j.review || '' }; });
      setReviews(rv);
    } catch (err) {
      console.error('fetchJobs error:', err);
    }
  };

  const openHire = (c) => {
    setPicked(c);
    setJf(p => ({ ...p, service: c.primary_service || '', location: c.location?.toLowerCase() || '' }));
    setTab('hire'); setSbOpen(false);
  };

  const jfChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === 'checkbox')   setJf(p => ({ ...p, [id]: checked }));
    else if (type === 'file')  setJf(p => ({ ...p, [id]: files[0] }));
    else                       setJf(p => ({ ...p, [id]: value }));
  };

  const submitHire = async (e) => {
    e.preventDefault();
    if (!client?.id) return;
    setJobBusy(true);
    const fd = new FormData();
    fd.append('client', client.id);
    if (picked?.id) fd.append('craftsman', picked.id);
    fd.append('name',   client.full_name || '');
    fd.append('phone',  client.phone || client.phone_number || '');
    fd.append('status', 'Pending');
    Object.entries(jf).forEach(([k, v]) => {
      if (v !== null && v !== '' && k !== 'media')
        fd.append(k, k === 'schedule' ? new Date(v).toISOString() : v);
    });
    if (jf.media) fd.append('media', jf.media);
    try {
      await api.post('/job-requests/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setJobOk(true);
      await fetchJobs(client.id);
      setTimeout(() => { setJobOk(false); setTab('requests'); setPicked(null); }, 2400);
    } catch {
      alert('Failed to submit. Please try again.');
    } finally { setJobBusy(false); }
  };

  const quoteDecide = async (jobId, decision) => {
    if (!window.confirm(`${decision === 'approve' ? 'Approve' : 'Reject'} this quote?`)) return;
    try {
      await api.post(`/job-requests/${jobId}/quote-decision/`, { decision });
      await fetchJobs(client.id);
      setQuoteJob(null);
    } catch { alert(`Could not ${decision} quote.`); }
  };

  // ── M-Pesa: STK push then poll every 3s ───────────────────────────────────
  const initiateMpesa = async () => {
    const clean = payPhone.replace(/\D/g, '');
    if (!clean.match(/^(2547|2541|07|01)\d{7,8}$/)) {
      alert('Enter a valid M-Pesa number, e.g. 0712345678 or 254712345678');
      return;
    }
    clearInterval(pollRef.current);
    setPayBusy(true); setPayState('idle'); setPayMsg('');

    try {
      await api.post(`/job-requests/${payJob.id}/pay/`, {
        phone:  clean,
        amount: Number(payJob.budget),
      });
      setPayBusy(false);
      setPayState('stk_sent');
      setPayMsg('check your phone and enter your M-Pesa PIN.');

      // Poll every 3s up to 20 times (60s)
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        setPayState('polling');
        try {
          const { data } = await api.get(`/job-requests/${payJob.id}/pay-status/`);
          const state = (data.payment_status || data.payment_state || '').toUpperCase();
          if (state === 'COMPLETE') {
            clearInterval(pollRef.current);
            setPayState('complete');
            setPayMsg('Payment confirmed! The craftsman has been notified.');
            await fetchJobs(client.id);
            setTimeout(() => { setPayJob(null); setPayState('idle'); }, 3500);
          } else if (state === 'FAILED') {
            clearInterval(pollRef.current);
            setPayState('failed');
            setPayMsg('Payment was not completed. Please try again.');
            await fetchJobs(client.id);
          } else if (attempts >= 20) {
            clearInterval(pollRef.current);
            setPayState('failed');
            setPayMsg('Status unknown — check your M-Pesa messages and refresh the page.');
          }
        } catch { /* network hiccup — keep polling */ }
      }, 3000);

    } catch (err) {
      setPayBusy(false);
      setPayState('failed');
      setPayMsg(err.response?.data?.detail || 'Payment initiation failed. Please try again.');
    }
  };

  const submitReview = async (jobId) => {
    const r = reviews[jobId] || {};
    if (!r.rating || !r.review?.trim()) return alert('Please fill in rating and review.');
    const job = jobs.find(j => j.id === jobId);
    const craftsmanId = job?.craftsman?.id || job?.craftsman_id;
    if (!craftsmanId) return alert('Missing craftsman info.');
    try {
      await api.post('/reviews/', {
        rating: r.rating, comment: r.review.trim(),
        location: job.location || '', craftsman: craftsmanId,
      });
      alert('Review submitted!');
      setReviews(p => ({ ...p, [jobId]: { rating: 0, review: '' } }));
    } catch { alert('Failed to submit review.'); }
  };

  const filtered = craftsmen.filter(c => {
    const q  = srch.toLowerCase();
    const mt = trade === 'All' || c.primary_service === trade;
    const mq = !q
      || (c.full_name        || '').toLowerCase().includes(q)
      || (c.name             || '').toLowerCase().includes(q)
      || (c.primary_service  || '').toLowerCase().includes(q)
      || (c.location         || '').toLowerCase().includes(q)
      || (c.description      || '').toLowerCase().includes(q);
    return mt && mq;
  });

  const badgeCls = (s) => {
    if (!s) return 'bdg bdg-gr';
    const sl = s.toLowerCase();
    if (sl.includes('paid'))    return 'bdg bdg-g';
    if (sl.includes('complet')) return 'bdg bdg-g';
    if (sl.includes('approv'))  return 'bdg bdg-b';
    if (sl.includes('cancel'))  return 'bdg bdg-r';
    if (sl.includes('quote'))   return 'bdg bdg-b';
    return 'bdg bdg-y';
  };

  const totalSpent     = jobs.filter(j => j.budget).reduce((a, j) => a + Number(j.budget), 0);
  const completedCount = jobs.filter(j => /complet|paid/i.test(j.status || '')).length;
  const pendingCount   = jobs.filter(j => !/complet|paid|cancel/i.test(j.status || '')).length;

  const canPay = (job) => {
    const s = (job.status || '').toLowerCase();
    return (s.includes('approv') || s.includes('quot')) && !s.includes('paid');
  };

  if (!client) return (
    <div className="hcp">
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0d0d' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:44, height:44, border:'3px solid rgba(255,215,0,.2)', borderTopColor:'#FFD700', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 14px' }}/>
          <p style={{ color:'rgba(255,215,0,.6)', fontWeight:700, fontSize:'.88rem', fontFamily:'Outfit,sans-serif' }}>Loading your dashboard…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hcp">
      <style>{CSS}</style>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox proofs={lightbox.proofs} startIdx={lightbox.idx} onClose={() => setLightbox(null)}/>
      )}

      {/* Mobile topbar */}
      <div className="topbar">
        <button className="hamburger" onClick={() => setSbOpen(!sbOpen)}>
          <i className={`fas fa-${sbOpen ? 'times' : 'bars'}`}/>
        </button>
        <span className="topbar-brand">KaaKazini</span>
        <img src={avi(client.full_name)} alt="" style={{ width:32, height:32, borderRadius:'50%', border:'2px solid rgba(255,215,0,.4)', objectFit:'cover' }}/>
      </div>

      <div className={`overlay${sbOpen ? ' show' : ''}`} onClick={() => setSbOpen(false)}/>
      <nav className={`sb sb-mobile${sbOpen ? ' open' : ''}`} style={{ background:'#0d0d0d' }}>
        <SidebarContent client={client} tab={tab} setTab={setTab} setSbOpen={setSbOpen}/>
      </nav>

      <div className="shell">
        <nav className="sb" style={{ display:'flex' }}>
          <SidebarContent client={client} tab={tab} setTab={setTab} setSbOpen={setSbOpen}/>
        </nav>

        <main className="main">

          {/* ━━━━━━━━━━ BROWSE ━━━━━━━━━━ */}
          {tab === 'browse' && (
            <>
              <div className="filter-bar">
                <div className="srch-wrap">
                  <i className="fas fa-search srch-ico"/>
                  <input className="srch" placeholder="Search by name, trade or location…"
                    value={srch} onChange={e => setSrch(e.target.value)}/>
                </div>
                <select className="filter-sel" value={trade} onChange={e => setTrade(e.target.value)}>
                  <option value="All">All trades</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="card"><div className="empty">
                  <div className="empty-icon"><i className="fas fa-search"/></div>
                  <h3>No craftsmen found</h3><p>Try a broader search or select "All trades"</p>
                </div></div>
              ) : (
                <div className="craft-grid">
                  {filtered.map((c, i) => {
                    const cover  = getCover(c);
                    const avatar = getAvatar(c);
                    const cName  = getName(c);
                    const rating = Number(c.average_rating) || 0;
                    const ph = `https://placehold.co/400x140/0d0d0d/FFD700?text=${encodeURIComponent(c.primary_service || '')}`;
                    return (
                      <div className="craft-card" key={c.id || i}>
                        <div className="craft-cover">
                          <img src={cover || ph} alt={c.primary_service} onError={e => { e.target.src = ph; }}/>
                          <span className="trade-pill">{c.primary_service}</span>
                          {c.is_available && <span className="avail-pill"><span className="avail-dot"/>Available</span>}
                        </div>
                        <div className="craft-body">
                          <div className="craft-row">
                            <img src={avatar || avi(cName)} alt={cName} className="craft-av" onError={e => { e.target.src = avi(cName); }}/>
                            <div style={{ minWidth:0 }}>
                              <p className="craft-name">{cName}</p>
                              {c.location && <p className="craft-loc"><i className="fas fa-map-marker-alt" style={{ marginRight:4 }}/>{c.location}</p>}
                            </div>
                          </div>
                          {rating > 0 && <div style={{ display:'flex', alignItems:'center', gap:7 }}><Stars r={rating}/><span className="craft-rtg">{rating.toFixed(1)}</span></div>}
                          {c.description && <p className="craft-desc">{c.description.length > 88 ? c.description.slice(0, 88) + '…' : c.description}</p>}
                          <button className="hire-btn" onClick={() => openHire(c)}>
                            <i className="fas fa-paper-plane"/>Request {cName.split(' ')[0]}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ━━━━━━━━━━ HIRE FORM ━━━━━━━━━━ */}
          {tab === 'hire' && picked && (
            <>
              <button className="back-btn" onClick={() => { setTab('browse'); setPicked(null); }}>
                <i className="fas fa-arrow-left"/>Back to browse
              </button>
              {jobOk && (
                <div className="ok-banner">
                  <i className="fas fa-check-circle" style={{ fontSize:'1.1rem' }}/>
                  Request sent! {getName(picked).split(' ')[0]} has been notified. Redirecting…
                </div>
              )}
              <div className="locked-bar">
                <img src={getAvatar(picked) || avi(getName(picked))} alt={getName(picked)} className="locked-av" onError={e => { e.target.src = avi(getName(picked)); }}/>
                <div>
                  <p className="locked-name">{getName(picked)}</p>
                  <p className="locked-meta">
                    <i className="fas fa-tools" style={{ marginRight:5 }}/>{picked.primary_service}
                    {picked.location && <> · <i className="fas fa-map-marker-alt" style={{ margin:'0 4px 0 6px' }}/>{picked.location}</>}
                    {Number(picked.average_rating) > 0 && <> · <Stars r={picked.average_rating}/> {Number(picked.average_rating).toFixed(1)}</>}
                  </p>
                </div>
              </div>
              <div className="card">
                <form onSubmit={submitHire}>
                  <div className="form-grid">
                    <div>
                      <label className="lbl" htmlFor="service">Service needed</label>
                      <select id="service" className="sel" value={jf.service} onChange={jfChange} required>
                        <option value="">Select service…</option>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="lbl" htmlFor="budget">Your budget (KSh)</label>
                      <input id="budget" type="number" min="0" className="inp" placeholder="e.g. 5,000" value={jf.budget} onChange={jfChange} required/>
                    </div>
                    <div>
                      <label className="lbl" htmlFor="schedule">Preferred date &amp; time</label>
                      <input id="schedule" type="datetime-local" className="inp" value={jf.schedule} onChange={jfChange} required/>
                    </div>
                    <div>
                      <label className="lbl" htmlFor="location">County</label>
                      <select id="location" className="sel" value={jf.location} onChange={jfChange} required>
                        <option value="">Select county…</option>
                        {LOCATIONS.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:'1 / -1' }}>
                      <label className="lbl" htmlFor="address">Exact address</label>
                      <input id="address" type="text" className="inp" placeholder="e.g. Westlands, Nairobi" value={jf.address} onChange={jfChange} required/>
                    </div>
                    <div style={{ gridColumn:'1 / -1' }}>
                      <label className="lbl" htmlFor="description">Describe the work</label>
                      <textarea id="description" className="ta" rows={4} placeholder="Describe the work…" value={jf.description} onChange={jfChange} required/>
                    </div>
                    <div>
                      <label className="lbl" htmlFor="media">Attach a photo (optional)</label>
                      <input id="media" type="file" accept="image/*" className="inp" onChange={jfChange}/>
                    </div>
                    <div style={{ display:'flex', alignItems:'center' }}>
                      <div className="ck-row">
                        <input id="isUrgent" type="checkbox" className="ck" checked={jf.isUrgent} onChange={jfChange}/>
                        <label className="ck-lbl" htmlFor="isUrgent">⚡ Mark as urgent</label>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" disabled={jobBusy}>
                    {jobBusy ? <><span className="spinner"/>Sending request…</> : <><i className="fas fa-paper-plane"/>Send request to {getName(picked).split(' ')[0]}</>}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ━━━━━━━━━━ MY REQUESTS ━━━━━━━━━━ */}
          {tab === 'requests' && (
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              {jobs.length === 0 ? (
                <div style={{ padding:'2.25rem' }}><div className="empty">
                  <div className="empty-icon"><i className="fas fa-clipboard-list"/></div>
                  <h3>No requests yet</h3><p>Find a craftsman and send your first request to get started</p>
                </div></div>
              ) : (
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr>
                      <th>Service</th><th>Craftsman</th><th>Budget</th>
                      <th>Scheduled</th><th>Status</th><th>Quote</th>
                      <th>Work photos</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {jobs.map(job => {
                        const hasQ = !!(job.quote_file_url || job.quote_details);
                        const isQS = job.status === 'Quote Submitted';
                        const craftsmanName   = getJobCraftsmanName(job) || (job.craftsman && typeof job.craftsman === 'number' ? `Craftsman #${job.craftsman}` : '—');
                        const craftsmanAvatar = getAvatar(job.craftsman) || avi(craftsmanName);
                        // ✅ proof_images is an array of {id, image_url, uploaded_at}
                        const proofs = job.proof_images || [];
                        return (
                          <tr key={job.id}>
                            <td><strong>{job.service}</strong></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                {craftsmanName !== '—' && (
                                  <img src={craftsmanAvatar} alt={craftsmanName}
                                    style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', border:'2px solid #FFD700', flexShrink:0 }}
                                    onError={e => { e.target.src = avi(craftsmanName); }}/>
                                )}
                                <span style={{ fontSize:'.83rem', color:'#64748b', fontWeight:600 }}>{craftsmanName}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight:800 }}>{job.budget ? `KSh ${Number(job.budget).toLocaleString()}` : '—'}</td>
                            <td style={{ fontSize:'.8rem', color:'#64748b' }}>
                              {job.schedule ? new Date(job.schedule).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                            </td>
                            <td>
                              <span className={badgeCls(job.status)}>
                                <span className="bdg-dot"/>
                                {job.status === 'Quote Submitted' ? 'Quote Received' : job.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              {job.quote_file_url ? (
                                <a href={job.quote_file_url} target="_blank" rel="noopener noreferrer" style={{ color:'#15803d', fontWeight:700, fontSize:'.8rem' }}>View file</a>
                              ) : job.quote_details ? (
                                <button className="act act-ok" onClick={() => setQuoteJob(job)}>View Quote</button>
                              ) : <span style={{ color:'#64748b', fontSize:'.8rem' }}>—</span>}
                            </td>
                            <td>
                              {/* ✅ FIX: use image_url field, display via proofImgUrl() */}
                              <ProofThumbs
                                proofs={proofs}
                                onOpen={(p, i) => setLightbox({ proofs: p, idx: i })}
                              />
                            </td>
                            <td>
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {isQS && hasQ && (
                                  <>
                                    <button className="act act-ok"  onClick={() => quoteDecide(job.id, 'approve')}>Approve</button>
                                    <button className="act act-bad" onClick={() => quoteDecide(job.id, 'reject')}>Reject</button>
                                  </>
                                )}
                                {canPay(job) && !isQS && (
                                  <button className="act act-pay" onClick={() => { setPayJob(job); setPayState('idle'); setPayMsg(''); }}>
                                    <i className="fas fa-mobile-alt" style={{ marginRight:4 }}/>Pay
                                  </button>
                                )}
                                {!isQS && !canPay(job) && <span style={{ fontSize:'.8rem', color:'#64748b' }}>—</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━ REVIEWS ━━━━━━━━━━ */}
          {tab === 'reviews' && (
            <>
              {jobs.filter(j => j.status === 'Completed').length === 0 ? (
                <div className="card"><div className="empty">
                  <div className="empty-icon"><i className="fas fa-star"/></div>
                  <h3>No completed jobs yet</h3><p>Completed jobs will appear here for you to review</p>
                </div></div>
              ) : (
                <div className="rev-grid">
                  {jobs.filter(j => j.status === 'Completed').map(job => {
                    const cName = getJobCraftsmanName(job);
                    return (
                      <div className="rev-card" key={job.id}>
                        <div className="rev-header">
                          <div>
                            <p className="rev-svc">{job.service}</p>
                            <p className="rev-meta">
                              {job.schedule && new Date(job.schedule).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}
                              {job.budget && ` · KSh ${Number(job.budget).toLocaleString()}`}
                            </p>
                          </div>
                          <span className="bdg bdg-g"><span className="bdg-dot"/>Completed</span>
                        </div>
                        {cName !== '—' && (
                          <div className="rev-craft">
                            <img src={getAvatar(job.craftsman) || avi(cName)} alt={cName} className="rev-craft-av" onError={e => { e.target.src = avi(cName); }}/>
                            <span className="rev-craft-name">{cName}</span>
                          </div>
                        )}
                        <div className="star-row">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`star${(reviews[job.id]?.rating || 0) >= s ? ' on' : ''}`}
                              onClick={() => setReviews(p => ({ ...p, [job.id]: { ...p[job.id], rating: s } }))}>★</span>
                          ))}
                          {reviews[job.id]?.rating > 0 && <span className="star-val">{reviews[job.id].rating}/5</span>}
                        </div>
                        <textarea className="ta" rows={3} placeholder="Your review…"
                          value={reviews[job.id]?.review || ''}
                          onChange={e => setReviews(p => ({ ...p, [job.id]: { ...p[job.id], review: e.target.value } }))}
                          style={{ marginBottom:14, width:'100%' }}
                        />
                        <button className="rev-btn" onClick={() => submitReview(job.id)}>
                          <i className="fas fa-star"/>Submit Review
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ━━━━━━━━━━ PAYMENTS ━━━━━━━━━━ */}
          {tab === 'payments' && (
            <>
              <div className="pay-grid">
                {[
                  { icon:'fas fa-receipt',       l:'Total Requests', v: jobs.length },
                  { icon:'fas fa-wallet',         l:'Total Spent',    v: `KSh ${totalSpent.toLocaleString()}` },
                  { icon:'fas fa-check-circle',   l:'Completed',      v: completedCount },
                  { icon:'fas fa-hourglass-half', l:'Pending',        v: pendingCount },
                ].map((s, i) => (
                  <div className="pay-stat" key={i}>
                    <div className="pay-stat-icon"><i className={s.icon}/></div>
                    <p className="pay-stat-v">{s.v}</p>
                    <p className="pay-stat-l">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                {jobs.length === 0 ? (
                  <div style={{ padding:'2.25rem' }}><div className="empty">
                    <div className="empty-icon"><i className="fas fa-receipt"/></div>
                    <h3>No payment records yet</h3><p>Payments will appear here once you hire a craftsman</p>
                  </div></div>
                ) : (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead><tr>
                        <th>Service</th><th>Total</th><th>Platform fee (10%)</th>
                        <th>Craftsman receives</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {jobs.map(job => {
                          const total = Number(job.budget) || 0;
                          const fee   = Math.round(total * .1);
                          const net   = total - fee;
                          const paid  = /paid/i.test(job.status || '');
                          const cName = getJobCraftsmanName(job);
                          return (
                            <tr key={job.id}>
                              <td>
                                <strong>{job.service}</strong>
                                {cName !== '—' && <p style={{ fontSize:'.76rem', color:'#64748b', fontWeight:500, marginTop:2 }}>{cName}</p>}
                              </td>
                              <td style={{ fontWeight:800 }}>KSh {total.toLocaleString()}</td>
                              <td style={{ color:'#64748b', fontWeight:600 }}>KSh {fee.toLocaleString()}</td>
                              <td style={{ fontWeight:800, color:'#15803d' }}>KSh {net.toLocaleString()}</td>
                              <td>
                                <span className={`bdg ${paid ? 'bdg-g' : 'bdg-y'}`}>
                                  <span className="bdg-dot"/>{paid ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                              
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ━━━━━━━━━━ PROFILE ━━━━━━━━━━ */}
          {tab === 'profile' && (
            <>
              <div className="prof-hero">
                <div className="prof-top">
                  <img src={avi(client.full_name)} alt={client.full_name} className="prof-av"/>
                  <div>
                    <h2 className="prof-name">{client.full_name || 'Client'}</h2>
                    <span className="prof-role">Client Account</span>
                    {client.email && <p className="prof-email">{client.email}</p>}
                  </div>
                </div>
                <div className="prof-stats-row">
                  {[
                    { v: jobs.length,    l: 'Requests' },
                    { v: completedCount, l: 'Completed' },
                    { v: `KSh ${totalSpent.toLocaleString()}`, l: 'Total Spent' },
                  ].map((s, i) => (
                    <div className="prof-stat" key={i}>
                      <p className="prof-stat-v">{s.v}</p>
                      <p className="prof-stat-l">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="prof-grid" style={{ marginBottom:24 }}>
                {[
                  { icon:'fas fa-envelope',      label:'Email',          val: client.email || '—' },
                  { icon:'fas fa-phone',          label:'Phone',          val: client.phone || client.phone_number || '—' },
                  { icon:'fas fa-id-badge',       label:'Account type',   val: 'Client' },
                  { icon:'fas fa-clipboard-list', label:'Total requests', val: jobs.length },
                  { icon:'fas fa-check-circle',   label:'Completed jobs', val: completedCount },
                  { icon:'fas fa-wallet',         label:'Total spent',    val: `KSh ${totalSpent.toLocaleString()}` },
                ].map((item, i) => (
                  <div className="prof-item" key={i}>
                    <div className="prof-item-icon"><i className={item.icon}/></div>
                    <div>
                      <p className="prof-item-lbl">{item.label}</p>
                      <p className="prof-item-val">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>

      {/* ══ QUOTE MODAL ══ */}
      {quoteJob && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setQuoteJob(null); }}>
          <div className="modal-box">
            <div className="modal-hd light" style={{ position:'relative' }}>
              <button className="modal-close" onClick={() => setQuoteJob(null)}>✕</button>
              <h5>Quote Summary</h5>
              {getJobCraftsmanName(quoteJob) !== '—' && <p>From {getJobCraftsmanName(quoteJob)}</p>}
            </div>
            <div className="modal-body">
              {quoteJob.quote_details ? (
                <>
                  {['plumberName','workType','duration','paymentTerms'].map(k => quoteJob.quote_details[k] && (
                    <div key={k} style={{ display:'flex', gap:14, marginBottom:10, fontSize:'.88rem' }}>
                      <span style={{ fontWeight:700, minWidth:125, color:'#64748b', textTransform:'capitalize' }}>
                        {k==='plumberName'?'From':k==='workType'?'Work type':k==='paymentTerms'?'Payment terms':'Duration'}
                      </span>
                      <span style={{ fontWeight:600 }}>{quoteJob.quote_details[k]}</span>
                    </div>
                  ))}
                  {Array.isArray(quoteJob.quote_details.items) && quoteJob.quote_details.items.length > 0 && (
                    <>
                      <hr className="modal-hr"/>
                      <p style={{ fontWeight:700, fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.06em', color:'#64748b', marginBottom:12 }}>Line items</p>
                      {quoteJob.quote_details.items.map((item, i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:9, fontSize:'.88rem', padding:'9px 0', borderBottom:'1px solid #f1f5f9' }}>
                          <span>{item.desc || `Item ${i+1}`}</span>
                          <strong>KSh {(item.qty * item.price).toLocaleString()}</strong>
                        </div>
                      ))}
                    </>
                  )}
                  {quoteJob.quote_details.total && (
                    <>
                      <hr className="modal-hr"/>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1.02rem' }}>
                        <span>Total</span>
                        <span style={{ color:'#15803d' }}>KSh {Number(quoteJob.quote_details.total).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </>
              ) : <p style={{ color:'#64748b' }}>No quote details available.</p>}
            </div>
            <div className="modal-ft">
              <button className="mbl mbl-light" onClick={() => setQuoteJob(null)}>Close</button>
              {jobs.find(j => j.id === quoteJob.id)?.status === 'Quote Submitted' && (
                <>
                  <button className="mbl mbl-red"  onClick={() => quoteDecide(quoteJob.id, 'reject')}>Reject Quote</button>
                  <button className="mbl mbl-gold" onClick={() => quoteDecide(quoteJob.id, 'approve')}>Approve Quote</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ M-PESA MODAL ══ */}
      {payJob && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) { clearInterval(pollRef.current); setPayJob(null); setPayState('idle'); } }}>
          <div className="modal-box">
            <div className="modal-hd dark" style={{ position:'relative' }}>
              <button className="modal-close" onClick={() => { clearInterval(pollRef.current); setPayJob(null); setPayState('idle'); }}>✕</button>
              <h5>Pay via M-Pesa</h5>
              <p>Job: {payJob.service} · {getJobCraftsmanName(payJob)}</p>
            </div>
            <div className="modal-body">

              {/* ── COMPLETE ─────────────────────────────────────────────── */}
              {payState === 'complete' && (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0fdf4', border:'2px solid #22c55e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                    <i className="fas fa-check" style={{ fontSize:'1.7rem', color:'#16a34a' }}/>
                  </div>
                  <p style={{ fontWeight:800, fontSize:'1.1rem', color:'#1e293b', marginBottom:6 }}>Payment Confirmed!</p>
                  <p style={{ fontSize:'.85rem', color:'#64748b', lineHeight:1.7 }}>
                    KSh {Number(payJob.budget).toLocaleString()} received.<br/>Craftsman has been notified. Closing…
                  </p>
                </div>
              )}

              {/* ── FAILED ───────────────────────────────────────────────── */}
              {payState === 'failed' && (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#fef2f2', border:'2px solid #fca5a5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                    <i className="fas fa-times" style={{ fontSize:'1.7rem', color:'#b91c1c' }}/>
                  </div>
                  <p style={{ fontWeight:800, fontSize:'1.05rem', color:'#1e293b', marginBottom:8 }}>Payment not completed</p>
                  <p style={{ fontSize:'.85rem', color:'#64748b', lineHeight:1.7, marginBottom:18 }}>{payMsg}</p>
                  <button className="mpesa-btn" onClick={() => setPayState('idle')} style={{ maxWidth:240, margin:'0 auto' }}>
                    <i className="fas fa-redo"/> Try again
                  </button>
                </div>
              )}

              {/* ── WAITING FOR PIN ───────────────────────────────────────── */}
              {(payState === 'stk_sent' || payState === 'polling') && (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#fffbeb', border:'2px solid #fde68a', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                    <span className="spinner-lg"/>
                  </div>
                  <p style={{ fontWeight:800, fontSize:'1.05rem', color:'#1e293b', marginBottom:8 }}>
                    {payState === 'stk_sent' ? 'Check your phone' : 'Confirming payment…'}
                  </p>
                  <p style={{ fontSize:'.85rem', color:'#64748b', lineHeight:1.7 }}>
                    {payMsg || 'Enter your M-Pesa PIN when prompted.'}
                  </p>
                  <p style={{ fontSize:'.75rem', color:'#94a3b8', marginTop:10 }}>Checking automatically every 3 seconds…</p>
                </div>
              )}

              {/* ── IDLE: enter phone ─────────────────────────────────────── */}
              {payState === 'idle' && (
                <>
                  <div className="mpesa-logo-row">
                    <span className="mpesa-logo">M-PESA</span>
                    <span style={{ fontSize:'.78rem', color:'#64748b', fontWeight:600 }}>Powered by Safaricom</span>
                  </div>
                  <div className="mpesa-amt">
                    <div>
                      <p className="mpesa-amt-lbl">Amount to pay</p>
                      <p className="mpesa-amt-val">KSh {Number(payJob.budget).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p className="mpesa-amt-lbl">To craftsman</p>
                      <p style={{ fontSize:'.88rem', fontWeight:700, color:'rgba(255,255,255,.7)' }}>KSh {Math.round(Number(payJob.budget) * .9).toLocaleString()}</p>
                      <p style={{ fontSize:'.68rem', color:'rgba(255,255,255,.35)', marginTop:2 }}>After 10% platform fee</p>
                    </div>
                  </div>
                  <div className="mpesa-steps">
                    {[
                      { n:1, title:'Enter your M-Pesa number', text:'Use the number registered with M-Pesa' },
                      { n:2, title:'Check your phone',         text:"You'll receive a prompt from M-Pesa" },
                      { n:3, title:'Enter your PIN',           text:'Confirm — status updates automatically here' },
                    ].map(s => (
                      <div className="mpesa-step" key={s.n}>
                        <span className="mpesa-num">{s.n}</span>
                        <div><p className="mpesa-step-title">{s.title}</p><p className="mpesa-step-text">{s.text}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mpesa-inp-wrap">
                    <label className="lbl" style={{ marginBottom:6, display:'block' }}>M-Pesa phone number</label>
                    <input type="tel" className="inp" placeholder="0712345678 or 254712345678"
                      value={payPhone} onChange={e => setPayPhone(e.target.value.replace(/\D/g, ''))} maxLength={12}/>
                  </div>
                  <button className="mpesa-btn" onClick={initiateMpesa} disabled={payBusy}>
  {payBusy
    ? <><span className="spinner-white"/>Sending</>
    : <>
        <svg width="100" height="24" viewBox="0 0 260 54" fill="none" style={{flexShrink:0, display:'inline-block', verticalAlign:'middle'}}>
          <text x="2" y="44" fontFamily="Arial Black, sans-serif" fontSize="48" fontWeight="900" fill="#ffffff">M-</text>
          <text x="80" y="44" fontFamily="Arial Black, sans-serif" fontSize="48" fontWeight="900" fill="#e8ff00">PESA</text>
        </svg>
        Send · KSh {Number(payJob.budget).toLocaleString()}
      </>
  }
</button>
                  <p className="mpesa-note">
                    Secure payment via Safaricom M-Pesa.<br/>
                    Platform fee: KSh {Math.round(Number(payJob.budget) * .1).toLocaleString()} (10%)
                  </p>
                </>
              )}
            </div>
            <div className="modal-ft">
              <button className="mbl mbl-light" onClick={() => { clearInterval(pollRef.current); setPayJob(null); setPayState('idle'); }}>
                {payState === 'complete' ? 'Done' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
