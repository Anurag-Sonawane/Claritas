import { Activity, BookOpen, Target, Calendar, Award } from 'lucide-react';

export default function Home() {
  const stream = [
    { title: 'Physics Lab Report', type: 'Physics', status: 'PENDING' },
    { title: 'Calculus Problem Set', type: 'Math', status: 'SUBMITTED' },
    { title: 'React Project', type: 'CS', status: 'GRADED' },
    { title: 'Weekly Check-in', type: 'General', status: 'PENDING' },
  ];

  return (
    <div>
      {/* New Hero Banner */}
      <div className="surface glow-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '2.5rem', 
        borderRadius: '16px',
        marginBottom: '2rem',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '2.5rem' }}>Good Afternoon, Anurag! ✨</h1>
          <p className="text-muted" style={{ fontSize: '1.2rem', margin: 0 }}>You've completed 80% of your tasks this week. Keep the momentum going!</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> Continue Reading
            </button>
            <button style={{ background: 'rgba(46, 196, 241, 0.1)', border: '1px solid rgba(46, 196, 241, 0.3)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> View Schedule
            </button>
          </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '50%', boxShadow: '0 0 40px rgba(46, 196, 241, 0.15)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'none' }}>
           {/* Hiding the exact icon on narrow screens, but it can show on wider ones */}
        </div>
        
        {/* We use a media query trick manually or just keep it responsive with flex-wrap. The icon block is simple enough. */}
        <div style={{ padding: '2rem', background: 'radial-gradient(circle, rgba(46, 196, 241, 0.15) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Target size={120} color="var(--secondary)" style={{ filter: 'drop-shadow(0 0 20px rgba(46,196,241,0.5))' }} />
        </div>
      </div>
      
      {/* New Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(46, 196, 241, 0.1)', borderRadius: '12px', color: 'var(--secondary)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>3 Tasks Due</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Within next 48 hours</span>
          </div>
        </div>

        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(255, 90, 54, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Award size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Top 5%</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Class Ranking</span>
          </div>
        </div>

        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(247, 248, 250, 0.05)', borderRadius: '12px', color: 'var(--foreground)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>2 Lectures</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Remaining for today</span>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity color="var(--secondary)" /> Activity Stream
      </h2>
      <div className="surface" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
             <tr>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>MODULE</th>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>TYPE</th>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>STATUS</th>
             </tr>
          </thead>
          <tbody>
            {stream.map((item, i) => (
               <tr key={i}>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', fontWeight: '500' }}>{item.title}</td>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>{item.type}</td>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                      background: item.status === 'PENDING' ? 'rgba(255, 90, 54, 0.2)' : 'rgba(46, 196, 241, 0.2)',
                      color: item.status === 'PENDING' ? 'var(--primary)' : 'var(--secondary)'
                    }}>
                      {item.status}
                    </span>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
