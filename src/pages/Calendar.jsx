import { Calendar as CalendarIcon, Clock, Video, Users } from 'lucide-react';

export default function Calendar() {
  const schedule = [
    { time: '09:00 AM', duration: '1h 30m', title: 'Data Structures & Algorithms', type: 'Lecture', room: 'Room 402', status: 'completed' },
    { time: '11:00 AM', duration: '1h', title: 'Calculus III', type: 'Lecture', room: 'Online (Zoom)', status: 'active', link: '#' },
    { time: '01:00 PM', duration: '2h', title: 'Physics Lab', type: 'Practical', room: 'Lab B', status: 'upcoming' },
    { time: '03:30 PM', duration: '1h', title: 'Student Council Meeting', type: 'Extracurricular', room: 'Main Hall', status: 'upcoming' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><CalendarIcon size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Schedule & Timetable</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        
        {/* Today's Agenda Header */}
        <div className="surface" style={{ padding: '24px 32px', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>Today's Agenda</h2>
             <span className="text-muted">Thursday, October 12, 2026</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-outline">Weekly View</button>
            <button className="btn-primary">Sync to Google Calendar</button>
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="surface" style={{ padding: '40px 32px', borderRadius: 16, border: '1px solid var(--border)', position: 'relative' }}>
          
          {/* Vertical Track Line */}
          <div style={{ position: 'absolute', left: '110px', top: '40px', bottom: '40px', width: 2, background: 'var(--glass-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {schedule.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 40, position: 'relative' }}>
                
                {/* Time Gutter */}
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'right', fontWeight: 'bold', color: item.status === 'completed' ? 'var(--muted)' : 'var(--foreground)' }}>
                  {item.time}
                </div>

                {/* Node Dot */}
                <div style={{ 
                  position: 'absolute', left: '74px', top: '4px', width: 14, height: 14, borderRadius: '50%',
                  background: item.status === 'active' ? 'var(--secondary)' : (item.status === 'completed' ? 'var(--muted)' : 'var(--background)'),
                  border: item.status === 'active' ? 'none' : '2px solid var(--glass-border)',
                  boxShadow: item.status === 'active' ? '0 0 10px var(--secondary)' : 'none',
                  zIndex: 2
                }} />

                {/* Event Card */}
                <div className={item.status === 'active' ? 'glow-panel' : ''} style={{ 
                  flex: 1, padding: 24, borderRadius: 12,
                  background: item.status === 'active' ? 'rgba(46, 196, 241, 0.05)' : 'rgba(255,255,255,0.02)',
                  border: item.status === 'active' ? '1px solid rgba(46, 196, 241, 0.3)' : '1px solid var(--glass-border)',
                  opacity: item.status === 'completed' ? 0.6 : 1,
                  position: 'relative', marginTop: -16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                     <div>
                       <div style={{ fontSize: '0.8rem', color: item.status === 'active' ? 'var(--secondary)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 'bold' }}>
                         {item.type}
                       </div>
                       <h3 style={{ margin: 0, fontSize: '1.2rem', color: item.status === 'completed' ? 'var(--muted)' : 'var(--foreground)' }}>{item.title}</h3>
                     </div>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>
                       <Clock size={14} /> {item.duration}
                     </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.room.includes('Online') ? <Video size={16}/> : <Users size={16}/>}
                      {item.room}
                    </span>
                  </div>

                  {item.status === 'active' && item.link && (
                    <div style={{ marginTop: 24 }}>
                       <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}>
                         <Video size={16} /> Join Class Call
                       </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
