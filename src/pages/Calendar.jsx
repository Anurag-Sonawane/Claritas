import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Users, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await api.getStudentCalendar();
        setEvents(data);
      } catch (err) {
        console.warn('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, []);

  const defaultSchedule = [
    { time: '09:00 AM', duration: '1h 30m', title: 'CS301: Data Structures & Algorithms', type: 'Lecture', room: 'Room 402', status: 'active' },
    { time: '11:30 AM', duration: '1h', title: 'CS402: Operating Systems & Kernels', type: 'Lecture', room: 'Lab B', status: 'upcoming' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><CalendarIcon size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Schedule & Academic Calendar</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        
        {/* Today's Agenda Header */}
        <div className="surface" style={{ padding: '24px 32px', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>Academic Timetable & Deadlines</h2>
             <span className="text-muted">Synced with Fall 2026 Academic Term</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary">Sync Calendar</button>
          </div>
        </div>

        {/* Live Academic Deadlines Grid */}
        {events.length > 0 && (
          <div className="surface" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--secondary)' }}>Upcoming Deadlines & Exams</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {events.map((ev, i) => (
                <div key={ev.id || i} style={{ padding: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>
                    {ev.type} • {ev.course_code}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{ev.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> Due: {ev.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timetable View */}
        <div className="surface" style={{ padding: '40px 32px', borderRadius: 16, border: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '110px', top: '40px', bottom: '40px', width: 2, background: 'var(--glass-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {defaultSchedule.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 40, position: 'relative' }}>
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'right', fontWeight: 'bold', color: 'var(--foreground)' }}>
                  {item.time}
                </div>

                <div style={{ 
                  position: 'absolute', left: '74px', top: '4px', width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)', zIndex: 2
                }} />

                <div className="glow-panel" style={{ 
                  flex: 1, padding: 24, borderRadius: 12,
                  background: 'rgba(46, 196, 241, 0.05)',
                  border: '1px solid rgba(46, 196, 241, 0.3)',
                  position: 'relative', marginTop: -16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                     <div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 'bold' }}>
                         {item.type}
                       </div>
                       <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.title}</h3>
                     </div>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>
                       <Clock size={14} /> {item.duration}
                     </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={16}/> {item.room}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
