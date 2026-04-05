import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function Assignments() {
  const assignments = [
    { id: 1, title: 'Physics Lab Report', course: 'PHY 201', dueDate: 'Tomorrow, 11:59 PM', status: 'pending' },
    { id: 2, title: 'Calculus Problem Set 4', course: 'MAT 102', dueDate: 'Oct 12, 11:59 PM', status: 'pending' },
    { id: 3, title: 'React Project Alpha', course: 'CS 302', dueDate: 'Oct 05, 11:59 PM', status: 'submitted' },
    { id: 4, title: 'History Essay', course: 'HIS 101', dueDate: 'Sep 28, 11:59 PM', status: 'graded', score: '92/100' },
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Assignments</h1>
      <p className="text-muted">Manage your submissions and pending tasks.</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assignments.map(a => (
          <div key={a.id} className="surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <FileText color={a.status === 'pending' ? 'var(--primary)' : 'var(--secondary)'} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{a.title}</h3>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{a.course} • Due: {a.dueDate}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {a.status === 'pending' && <span style={{ color: '#FF5A36', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16}/> Pending</span>}
              {a.status === 'submitted' && <span style={{ color: '#2EC4F1', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16}/> Submitted</span>}
              {a.status === 'graded' && <span style={{ color: '#F7F8FA', fontWeight: '500', fontSize: '0.9rem' }}>Score: {a.score}</span>}
              
              {a.status === 'pending' ? (
                <button>Upload</button>
              ) : (
                <button style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>View</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
