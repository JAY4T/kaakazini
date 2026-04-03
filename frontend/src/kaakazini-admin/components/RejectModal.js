import React from 'react';
import { FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function RejectModal({ show, rejectReason, setRejectReason, confirmReject, closeModal }) {
  if (!show) return null;

  return (
    <>
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:1050 }} onClick={closeModal}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(460px,94vw)', background:'#141414',
        border:'1px solid rgba(239,68,68,.25)', borderRadius:16,
        zIndex:1051, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.7)',
        fontFamily:'DM Sans,sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding:'1.1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,.07)', background:'rgba(239,68,68,.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'.95rem', color:'#f87171' }}>
            <FaExclamationTriangle/> Reject Craftsman
          </span>
          <button onClick={closeModal} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'1.375rem 1.5rem' }}>
          <p style={{ fontSize:'.85rem', color:'#888', marginBottom:'1rem', lineHeight:1.6 }}>
            Please provide a clear reason for rejection. This will be shown to the craftsman so they can fix the issue and reapply.
          </p>
          <label style={{ fontSize:'.72rem', fontWeight:700, color:'#777', textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:6 }}>
            Reason for rejection *
          </label>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Profile photo is blurry, missing work portfolio photos, description is too short…"
            style={{
              width:'100%', background:'#1a1a1a', border:'1.5px solid rgba(255,255,255,.08)',
              borderRadius:9, padding:'.75rem 1rem', color:'#f0f0f0',
              fontFamily:'DM Sans,sans-serif', fontSize:'.9rem', outline:'none',
              resize:'vertical', transition:'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = '#ef4444'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
          />
          {rejectReason.length > 0 && rejectReason.length < 20 && (
            <p style={{ fontSize:'.73rem', color:'#f87171', marginTop:5 }}>Please provide a more detailed reason (min 20 characters).</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'.875rem 1.5rem', borderTop:'1px solid rgba(255,255,255,.06)', display:'flex', justifyContent:'flex-end', gap:10, background:'rgba(255,255,255,.02)' }}>
          <button onClick={closeModal} style={{ padding:'.6rem 1.25rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, color:'#aaa', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.84rem' }}>
            Cancel
          </button>
          <button
            onClick={confirmReject}
            disabled={rejectReason.trim().length < 10}
            style={{ padding:'.6rem 1.25rem', background: rejectReason.trim().length >= 10 ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#333', border:'none', borderRadius:9, color: rejectReason.trim().length >= 10 ? '#fff' : '#555', cursor: rejectReason.trim().length >= 10 ? 'pointer' : 'not-allowed', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:'.84rem', display:'flex', alignItems:'center', gap:6, transition:'all .2s' }}
          >
            <FaTimesCircle size={12}/> Confirm Rejection
          </button>
        </div>
      </div>
    </>
  );
}
