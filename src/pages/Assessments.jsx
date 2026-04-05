import { CheckCircle, Clock } from 'lucide-react';

export default function Assessments() {
  const tests = [
    { title: 'Software Engineering MCQ', subject: 'CS 302', duration: '45 mins', date: 'Tomorrow, 10:00 AM', status: 'pending' },
    { title: 'Database Systems Final', subject: 'CS 305', duration: '90 mins', date: 'Oct 15, 2:00 PM', status: 'pending' },
    { title: 'Data Structures Quiz', subject: 'CS 201', duration: '30 mins', date: 'Completed', status: 'completed' },
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Assessments</h1>
      <p className="text-muted">View and take your scheduled MCQ tests.</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tests.map((test, i) => (
          <div key={i} className="surface" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {test.status === 'completed' ? <CheckCircle size={18} color="#2EC4F1" /> : <Clock size={18} color="#FF5A36" />}
                {test.title}
              </h3>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>{test.subject} • {test.duration} • {test.date}</span>
            </div>
            {test.status === 'pending' ? (
              <button>Take Test</button>
            ) : (
              <button style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--foreground)' }}>View Results</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
