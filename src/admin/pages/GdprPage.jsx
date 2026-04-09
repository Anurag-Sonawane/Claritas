import { useState } from 'react';
import { UserX, Search, AlertCircle } from 'lucide-react';
import { executeDeletionRequest } from '../services/operationsMockService.js';

export default function GdprPage() {
  const [userId, setUserId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState([
    { id: 'usr_812', date: '2026-04-01 09:00', status: 'Completed', admin: 'Aarav Sharma' }
  ]);

  const handleDelete = async () => {
    if (!userId.trim()) return;
    if (!confirm('Are you sure you want to permanently delete this user? This satisfies GDPR Right to Erasure and cannot be undone.')) return;
    
    setProcessing(true);
    await executeDeletionRequest(userId);
    setLogs([{ id: userId, date: 'Just now', status: 'Completed', admin: 'Current User' }, ...logs]);
    setUserId('');
    setProcessing(false);
  };

  return (
    <div>
      <h1 className="settings-title" style={{ fontSize: '1.4rem' }}>Privacy & GDPR</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Handle data subject requests and "Right to Erasure" protocols.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Request Form */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><UserX size={18}/> Execute Deletion Request</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 24 }}>
            Enter the exact internal User ID. Executing this will permanently scrub PII while retaining anonymized record hashes for analytics.
          </p>

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="usr_..." 
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="date-picker-mock" 
              style={{ width: '100%', paddingLeft: 36, fontFamily: 'monospace' }} 
            />
          </div>

          <div style={{ padding: 12, background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 12 }}>
            <AlertCircle size={20} color="var(--status-deleted)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>Double-check the ID before executing. This simulates cascading deletion across all modules.</span>
          </div>

          <button className="btn-primary" style={{ width: '100%', background: 'var(--status-deleted)' }} onClick={handleDelete} disabled={processing || !userId.trim()}>
            {processing ? 'Scrubbing Records...' : 'Execute Permanent Deletion'}
          </button>
        </div>

        {/* Audit Log */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
           <h3 style={{ margin: '0 0 20px 0' }}>Deletion Audit Timeline</h3>
           
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '8px 0' }}>User ID target</th>
                <th>Executed By</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '16px 0', fontFamily: 'monospace' }}>{log.id}</td>
                  <td style={{ color: 'var(--muted)' }}>{log.admin}</td>
                  <td style={{ color: 'var(--muted)' }}>{log.date}</td>
                  <td style={{ color: '#22c55e', fontWeight: 600 }}>{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
