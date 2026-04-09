import { useState, useEffect } from 'react';
import { AlertCircle, EyeOff } from 'lucide-react';
import { getHeatmap } from '../services/analyticsMockService.js';
import './AdminDashboard.css';

export default function DropoffHeatmaps() {
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeatmap().then(res => {
      setHeatmap(res);
      setLoading(false);
    });
  }, []);

  const getHeatColor = (rate) => {
    // Red scale based on dropoff percentage
    const intensity = Math.min(1, rate / 50); // 50% dropoff is solid red
    return `rgba(248, 113, 113, ${intensity})`; // matches var(--status-deleted) core color roughly
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Heatmap...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Lesson Drop-off Heatmap</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 280px', gap: 24, alignItems: 'start' }}>
        
        {/* Main Heatmap */}
        <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--muted)' }}>
            <EyeOff size={18} /> Identifying Course Friction Points
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {heatmap.map((h, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 16, 
                  background: 'var(--background)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' 
                }}
              >
                <div style={{ width: 180, fontWeight: 500, fontSize: '0.9rem' }}>{h.chapter}</div>
                <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
                  <div 
                    title={`Drop-off: ${h.dropoffRate}%. Click to view users.`}
                    onClick={() => alert(`Mock drill-down: Users who dropped off at ${h.chapter}`)}
                    style={{ 
                      width: `${h.dropoffRate}%`, 
                      background: getHeatColor(h.dropoffRate),
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      padding: '0 8px', fontSize: '0.75rem', fontWeight: 600, color: h.dropoffRate > 20 ? '#fff' : 'var(--foreground)',
                      cursor: 'pointer', transition: 'opacity 0.2s'
                    }}
                  >
                    {h.dropoffRate}%
                  </div>
                </div>
                <div style={{ width: 80, textAlign: 'right', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {h.usersStarted} started
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Rail */}
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}><AlertCircle size={18} style={{ display: 'inline', color: 'var(--status-deleted)', verticalAlign: 'middle', marginRight: 8 }}/> Critical Action Required</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Users are experiencing a massive <strong style={{ color: 'var(--foreground)'}}>40% drop-off</strong> during Chapter 4 (Advanced Deployment). 
            <br/><br/>
            Consider reviewing the assessment difficulty for this module or offering supplementary video material.
          </p>
          <button className="btn-outline btn-sm" style={{ width: '100%', marginTop: 20 }}>Edit Chapter 4</button>
        </div>

      </div>
    </div>
  );
}
