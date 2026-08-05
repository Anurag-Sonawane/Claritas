import { useState, useEffect } from 'react';
import { Bell, Pin, Megaphone, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Announcements() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await api.getAnnouncements();
        setNotices(data);
      } catch (err) {
        console.warn('Announcements fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><Bell size={24} /></div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Campus Notice Board</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        {notices.map(n => (
          <div 
            key={n.id} 
            className="surface glow-panel" 
            style={{ 
              padding: 24, borderRadius: 16, 
              border: '1px solid rgba(46, 196, 241, 0.3)',
              display: 'flex', flexDirection: 'column',
            }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Megaphone size={16} color="var(--secondary)"/>
                 <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--secondary)', fontWeight: 'bold' }}>{n.author || 'Academic Affairs'}</span>
               </div>
               <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold' }}>{n.category}</span>
             </div>

             <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', lineHeight: 1.4 }}>{n.title}</h3>
             
             <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: 24 }}>
               {n.content}
             </p>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Posted: {n.created_at}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
