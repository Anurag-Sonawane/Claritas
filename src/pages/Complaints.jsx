export default function Complaints() {
  const history = [
    { title: 'Wi-Fi connectivity in Hostel B', dept: 'Infrastructure', date: 'Sep 25, 2026', status: 'Resolved' },
    { title: 'Air conditioning noise in Room 204', dept: 'Maintenance', date: 'Oct 02, 2026', status: 'In Progress' }
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Complaints & Grievances</h1>
      <p className="text-muted">Submit issues securely. Your voice matters to administration.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        <div className="surface glow-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Submit New Complaint</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Department / Category</label>
              <select style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                <option>Academic Infrastructure</option>
                <option>Hostel / Accomodation</option>
                <option>Library & Resources</option>
                <option>Other</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Subject</label>
              <input type="text" placeholder="Brief summary of the issue" style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Description (Please be detailed)</label>
              <textarea rows={5} placeholder="Provide information that would assist in resolving the issue..." style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px', resize: 'vertical' }} />
            </div>

            <button type="submit" style={{ alignSelf: 'flex-start' }}>Submit Complaint</button>
          </form>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>My Past Grievances</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((h, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h4 style={{ margin: 0 }}>{h.title}</h4>
                   <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: h.status === 'Resolved' ? 'rgba(46, 196, 241, 0.2)' : 'rgba(255, 90, 54, 0.2)', color: h.status === 'Resolved' ? 'var(--secondary)' : 'var(--primary)', fontWeight: 'bold' }}>{h.status}</span>
                 </div>
                 <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{h.dept} • {h.date}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
