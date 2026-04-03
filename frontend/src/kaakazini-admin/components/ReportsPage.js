import React, { useState } from 'react';
import { FaFileAlt, FaDownload, FaFileCsv, FaCheckCircle, FaDollarSign, FaUsers, FaBriefcase } from 'react-icons/fa';

const CARD = { background:'#141414', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'1rem' };

function downloadCSV(filename, headers, rows) {
  const lines = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type:'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage({ jobs = [], craftsmen = [] }) {
  const [generated, setGenerated] = useState('');

  const paidJobs      = jobs.filter(j => /paid/i.test(j.status || ''));
  const completedJobs = jobs.filter(j => /complet/i.test(j.status || ''));
  const revenue       = paidJobs.reduce((a, j) => a + (Number(j.budget) || 0), 0);
  const platformCut   = Math.round(revenue * 0.1);

  const reports = [
    {
      id: 'jobs',
      icon: <FaBriefcase style={{ color:'#FFD700' }}/>,
      title: 'All Jobs Report',
      desc: `${jobs.length} total jobs — statuses, budgets, craftsmen and clients`,
      color: '#FFD700',
      fn: () => {
        downloadCSV('kaakazini_jobs.csv',
          ['Job ID','Service','Client','Craftsman','Budget (KSh)','Status','Schedule','Location'],
          jobs.map(j => [j.id, j.service||'', j.name||'', j.craftsman?.full_name||'', j.budget||0, j.status||'', j.schedule ? new Date(j.schedule).toLocaleDateString() : '', j.location||''])
        );
        setGenerated('jobs');
      }
    },
    {
      id: 'payments',
      icon: <FaDollarSign style={{ color:'#22c55e' }}/>,
      title: 'Payment Report',
      desc: `${paidJobs.length} paid jobs — KSh ${revenue.toLocaleString()} total processed`,
      color: '#22c55e',
      fn: () => {
        downloadCSV('kaakazini_payments.csv',
          ['Job ID','Service','Client','Craftsman','Total (KSh)','Platform 10%','Net to Craftsman','Status'],
          paidJobs.map(j => {
            const total = Number(j.budget)||0, cut = Math.round(total*.1), net = total-cut;
            return [j.id, j.service||'', j.name||'', j.craftsman?.full_name||'', total, cut, net, j.status||''];
          })
        );
        setGenerated('payments');
      }
    },
    {
      id: 'craftsmen',
      icon: <FaUsers style={{ color:'#3b82f6' }}/>,
      title: 'Craftsmen Report',
      desc: `${craftsmen.length} approved craftsmen — names, professions, locations`,
      color: '#3b82f6',
      fn: () => {
        downloadCSV('kaakazini_craftsmen.csv',
          ['ID','Full Name','Profession','Primary Service','Location','Status','Active'],
          craftsmen.map(c => [c.id, c.full_name||'', c.profession||'', c.primary_service||'', c.location||'', c.status||'', c.is_active ? 'Yes' : 'No'])
        );
        setGenerated('craftsmen');
      }
    },
    {
      id: 'revenue',
      icon: <FaCheckCircle style={{ color:'#8b5cf6' }}/>,
      title: 'Revenue Summary',
      desc: `Platform revenue KSh ${platformCut.toLocaleString()} — commission breakdown`,
      color: '#8b5cf6',
      fn: () => {
        downloadCSV('kaakazini_revenue.csv',
          ['Metric','Value'],
          [
            ['Total Jobs', jobs.length],
            ['Completed Jobs', completedJobs.length],
            ['Paid Jobs', paidJobs.length],
            ['Total Revenue (KSh)', revenue],
            ['Platform Commission 10% (KSh)', platformCut],
            ['Net to Craftsmen (KSh)', revenue - platformCut],
            ['Avg Job Value (KSh)', paidJobs.length > 0 ? Math.round(revenue/paidJobs.length) : 0],
          ]
        );
        setGenerated('revenue');
      }
    },
  ];

  const summaryStats = [
    { lbl:'Total Revenue', val:`KSh ${revenue.toLocaleString()}`, c:'#22c55e' },
    { lbl:'Platform Cut',  val:`KSh ${platformCut.toLocaleString()}`, c:'#FFD700' },
    { lbl:'Jobs Paid',     val:paidJobs.length, c:'#3b82f6' },
    { lbl:'Active Craftsmen', val:craftsmen.filter(c=>c.is_active).length, c:'#8b5cf6' },
  ];

  return (
    <div>
      {/* Summary */}
      <div style={{ ...CARD, background:'linear-gradient(135deg,rgba(255,215,0,.06),rgba(34,197,94,.04))', borderColor:'rgba(255,215,0,.15)' }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'.95rem', color:'#f0f0f0', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
          <FaFileAlt style={{ color:'#FFD700' }}/> Platform Summary
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem' }}>
          {summaryStats.map((s,i) => (
            <div key={i} style={{ textAlign:'center', padding:'.875rem', background:'rgba(0,0,0,.2)', borderRadius:10 }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.5rem', fontWeight:800, color:s.c }}>{s.val}</div>
              <div style={{ fontSize:'.72rem', color:'#666', marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:'.78rem', color:'#555', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
        <FaFileCsv/> All reports download as CSV files compatible with Excel and Google Sheets
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem' }}>
        {reports.map(r => (
          <div key={r.id} style={{ ...CARD, cursor:'pointer', transition:'all .2s', border:`1px solid ${generated === r.id ? r.color + '44' : 'rgba(255,255,255,.07)'}` }}
            onMouseEnter={e => e.currentTarget.style.borderColor = r.color + '55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = generated === r.id ? r.color + '44' : 'rgba(255,255,255,.07)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:42, height:42, borderRadius:11, background:`${r.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem' }}>{r.icon}</div>
              {generated === r.id && <span style={{ fontSize:'.68rem', background:'rgba(34,197,94,.12)', color:'#4ade80', borderRadius:20, padding:'2px 8px', fontWeight:700 }}>✓ Downloaded</span>}
            </div>
            <div style={{ fontFamily:'Playfair Display,serif', fontWeight:800, color:'#f0f0f0', marginBottom:5 }}>{r.title}</div>
            <div style={{ fontSize:'.8rem', color:'#666', marginBottom:'1rem', lineHeight:1.5 }}>{r.desc}</div>
            <button onClick={r.fn} style={{ width:'100%', background:`linear-gradient(135deg,${r.color}cc,${r.color}99)`, border:'none', borderRadius:9, padding:'.6rem 1rem', color:'#000', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:'.84rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all .2s' }}>
              <FaDownload size={12}/> Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
