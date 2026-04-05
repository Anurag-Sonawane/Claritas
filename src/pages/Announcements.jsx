import { Megaphone, Calendar as CalendarIcon, Info } from 'lucide-react';

export default function Announcements() {
  const notices = [
    { title: 'Campus Maintenance', date: 'Oct 10, 2026', type: 'warning', desc: 'Main library will be closed this Friday for scheduled maintenance. Please use the digital catalog.' },
    { title: 'Mid Semester Syllabus update', date: 'Oct 08, 2026', type: 'info', desc: 'The syllabus for CS 302 has been slightly adjusted. Check your course portal.' },
    { title: 'Annual Tech Fest Registration', date: 'Oct 05, 2026', type: 'event', desc: 'Claritas Tech Fest is back! Register your teams by the end of next week.' }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <Megaphone color="#FF5A36" />;
      case 'event': return <CalendarIcon color="#2EC4F1" />;
      default: return <Info color="#F7F8FA" />;
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Announcements & Notices</h1>
      <p className="text-muted">Stay up to date with the latest campus news.</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {notices.map((notice, idx) => (
          <div key={idx} className="surface" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }}>
              {getIcon(notice.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{notice.title}</h3>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{notice.date}</span>
              </div>
              <p className="text-muted" style={{ margin: 0, lineHeight: '1.6' }}>{notice.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
