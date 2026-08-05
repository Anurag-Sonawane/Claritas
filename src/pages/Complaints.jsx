import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Complaints() {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('Academic Infrastructure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const list = await api.getTickets();
      setTickets(list);
    } catch (err) {
      console.warn('Tickets fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await api.createTicket({ title, category, description, priority: 'Medium' });
      setTitle('');
      setDescription('');
      fetchTickets();
    } catch (err) {
      alert('Error filing complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Complaints & Grievances</h1>
      <p className="text-muted">Submit issues securely to administration with live SQLite persistence.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        <div className="surface glow-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Submit New Complaint</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Department / Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
              >
                <option value="Academic Infrastructure">Academic Infrastructure</option>
                <option value="Hostel & Accomodation">Hostel & Accomodation</option>
                <option value="Library & Resources">Library & Resources</option>
                <option value="IT & Portal Issues">IT & Portal Issues</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Subject *</label>
              <input 
                type="text" 
                required
                placeholder="Brief summary of the issue" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500' }}>Description *</label>
              <textarea 
                rows={5} 
                required
                placeholder="Provide information that would assist in resolving the issue..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ padding: '0.75rem', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '6px', resize: 'vertical' }} 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>My Past Grievances ({tickets.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.length > 0 ? (
              tickets.map((h, i) => (
                <div key={h.id || i} style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h4 style={{ margin: 0 }}>{h.title}</h4>
                     <span style={{ 
                       fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', 
                       background: h.status === 'Resolved' ? 'rgba(46, 196, 241, 0.2)' : 'rgba(255, 90, 54, 0.2)', 
                       color: h.status === 'Resolved' ? 'var(--secondary)' : 'var(--primary)', fontWeight: 'bold' 
                     }}>
                       {h.status}
                     </span>
                   </div>
                   <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{h.category} • Filed: {h.created_at}</div>
                   <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--foreground)' }}>{h.description}</p>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No grievance tickets submitted yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
