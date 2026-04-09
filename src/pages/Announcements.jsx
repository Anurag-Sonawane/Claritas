import { Bell, Pin, Megaphone, AlertCircle } from 'lucide-react';

export default function Announcements() {
  const notices = [
    { id: 1, title: 'Final Exam Schedule Published', date: 'Oct 12, 2026', sender: 'Registrar', type: 'campus', pinned: true, content: 'The final examination schedule for the Fall 2026 semester has been finalized and published. Please verify your conflicting dates in the system before Friday.' },
    { id: 2, title: 'Network Maintenance Downtime', date: 'Oct 11, 2026', sender: 'IT Services', type: 'system', pinned: true, content: 'Campus-wide WiFi and the Claritas LMS portal will undergo scheduled maintenance this Sunday from 2:00 AM to 4:00 AM.' },
    { id: 3, title: 'Lab Hours Extended', date: 'Oct 10, 2026', sender: 'Prof. Davis', type: 'course', pinned: false, content: 'Just a heads-up that Physics Lab B will remain open until 10:00 PM this week for those finishing the projectile motion assignment.' },
    { id: 4, title: 'Student Council Nominations Open', date: 'Oct 09, 2026', sender: 'Student Affairs', type: 'campus', pinned: false, content: 'Nominate yourself or a peer for the 2027 Student Council. Forms are available in the main office.' },
    { id: 5, title: 'Library Renovation Noise Warning', date: 'Oct 08, 2026', sender: 'Campus Admin', type: 'campus', pinned: false, content: 'The east wing of the library will experience heavy construction noise during mid-days next week.' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><Bell size={24} /></div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Notice Board</h1>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline btn-sm">Mark all as read</button>
          <select style={{ padding: '8px 16px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' }}>
            <option>All Types</option>
            <option>Campus Updates</option>
            <option>Course Specific</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24, alignItems: 'start' }}>
        {notices.map(n => (
          <div 
            key={n.id} 
            className={`surface ${n.pinned ? 'glow-panel' : ''}`} 
            style={{ 
              padding: 24, borderRadius: 16, 
              border: n.pinned ? '1px solid rgba(46, 196, 241, 0.3)' : '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              boxShadow: n.pinned ? '0 8px 32px rgba(0,0,0,0.2)' : 'none'
            }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 {n.type === 'system' ? <AlertCircle size={14} color="#f43f5e"/> : 
                  n.type === 'course' ? <Megaphone size={14} color="#a855f7"/> : 
                  <Bell size={14} color="var(--muted)"/>}
                 <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', fontWeight: 'bold' }}>{n.sender}</span>
               </div>
               {n.pinned && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}><Pin size={12}/> Pinned</div>}
             </div>

             <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', lineHeight: 1.4 }}>{n.title}</h3>
             
             <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: 24 }}>
               {n.content}
             </p>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{n.date}</span>
               <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>Read More</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
