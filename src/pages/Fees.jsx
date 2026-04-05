import { CheckCircle, Clock, CreditCard } from 'lucide-react';

export default function Fees() {
  const history = [
    { id: 'TXN-001', date: 'Aug 15, 2026', desc: 'Fall 2026 Tuition', amount: '$4,500.00', status: 'Paid' },
    { id: 'TXN-002', date: 'Aug 10, 2026', desc: 'Library Fine', amount: '$15.00', status: 'Paid' },
    { id: 'TXN-003', date: 'Jan 12, 2026', desc: 'Spring 2026 Tuition', amount: '$4,500.00', status: 'Paid' },
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Fees & Scholarships</h1>
      <p className="text-muted">Manage your tuition records and scholarship applications.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="surface glow-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Current Semester Dues</h3>
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--foreground)' }}>$0.00</div>
            <p className="text-muted">All clear! No pending payments.</p>
          </div>
          <button style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Make a Payment</button>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Active Scholarships</h3>
          <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle color="#2EC4F1" />
              <div>
                <div style={{ fontWeight: '600' }}>Merit Base Grant 2026</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Covers 50% Tuition • Approved</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock color="#FF5A36" />
              <div>
                <div style={{ fontWeight: '600' }}>Research Fellowship Program</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Pending committee review</div>
              </div>
            </div>
          </div>
          <button style={{ marginTop: 'auto' }}>Apply for New</button>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard color="var(--primary)" /> Payment History
      </h2>
      <div className="surface">
        {history.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.desc}</h4>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>{item.date} • {item.id}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{item.amount}</div>
              <span style={{ fontSize: '0.85rem', color: '#2EC4F1' }}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
