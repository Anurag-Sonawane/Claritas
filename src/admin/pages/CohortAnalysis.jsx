import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import { getCohorts } from '../services/analyticsMockService.js';
import './AdminDashboard.css';

export default function CohortAnalysis() {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCohorts().then(res => {
      setCohorts(res);
      setLoading(false);
    });
  }, []);

  // Helper to color cells based on percentage
  const getCellColor = (val) => {
    if (val === 0) return 'transparent'; // Incomplete future weeks
    const alpha = Math.max(0.1, val / 100);
    return `rgba(147, 51, 234, ${alpha})`; // primary color (purple/blue scale)
  };

  const handleExport = () => {
    alert("Mock: Exporting Cohort Analysis as CSV.");
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Cohorts...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Cohort Retention Analysis</h1>
        <button className="btn-outline btn-sm" onClick={handleExport}><Download size={14} /> Export Table</button>
      </div>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--muted)' }}>
          <Calendar size={18} /> User Retention by Enrollment Week
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: 12, borderBottom: '2px solid var(--border)', color: 'var(--muted)', width: 140 }}>Cohort</th>
              <th style={{ padding: 12, borderBottom: '2px solid var(--border)', color: 'var(--muted)', width: 100 }}>Size</th>
              {['W0', 'W1', 'W2', 'W3', 'W4'].map(w => (
                <th key={w} style={{ padding: 12, borderBottom: '2px solid var(--border)', color: 'var(--foreground)', textAlign: 'center' }}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px 12px', fontWeight: 600 }}>{c.cohort}</td>
                <td style={{ padding: '16px 12px', color: 'var(--muted)' }}>{c.size}</td>
                {['w0', 'w1', 'w2', 'w3', 'w4'].map(w => (
                  <td key={w} style={{ padding: 4 }}>
                     {c[w] > 0 ? (
                       <div 
                         style={{ 
                           background: getCellColor(c[w]), 
                           padding: '12px 4px', 
                           textAlign: 'center', 
                           borderRadius: 4, 
                           color: c[w] > 50 ? '#fff' : 'var(--foreground)',
                           fontWeight: 500,
                           cursor: 'pointer'
                         }}
                         onClick={() => alert(`Mock: view users in ${c.cohort} for ${w}`)}
                       >
                         {c[w]}%
                       </div>
                     ) : (
                       <div style={{ padding: '12px 4px', textAlign: 'center', color: 'var(--muted)' }}>—</div>
                     )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
          * W0 = Week of Enrollment. Percentages represent users active during the specified week. Data is simulated.
        </div>
      </div>
    </div>
  );
}
