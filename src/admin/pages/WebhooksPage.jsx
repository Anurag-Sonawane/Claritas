import { useState, useEffect } from 'react';
import { Webhook, Plus, CheckCircle, XCircle } from 'lucide-react';
import { MOCK_WEBHOOK_LOGS, getWebhookLogs } from '../services/operationsMockService.js';

export default function WebhooksPage() {
  const [logs, setLogs] = useState(MOCK_WEBHOOK_LOGS);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getWebhookLogs();
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data.map(l => ({
            id: l.id || `wh_${l.created_at || Date.now()}`,
            event: l.event,
            time: l.created_at ? new Date(l.created_at).toLocaleTimeString() : 'Recently',
            url: l.url,
            status: l.status_code || 200
          })));
        }
      } catch (err) {
        console.warn('Webhook logs notice:', err.message);
      }
    }
    loadLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="settings-title" style={{ fontSize: '1.4rem', margin: 0, padding: 0 }}>Webhooks</h1>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0 0' }}>Subscribe to real-time events across the platform.</p>
        </div>
        <button className="btn-primary"><Plus size={16}/> Add Endpoint</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        
        {/* Delivery Logs */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Recent Deliveries</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                {log.status === 200 ? <CheckCircle size={20} color="#22c55e" /> : <XCircle size={20} color="var(--status-deleted)" />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--foreground)' }}>{log.event}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{log.time}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8 }}>{log.url}</div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', gap: 12 }}>
                    <span style={{ color: log.status === 200 ? '#22c55e' : 'var(--status-deleted)', fontWeight: 600 }}>HTTP {log.status}</span>
                    {log.status !== 200 && <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}>Retry Delivery</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Endpoints (Mock) */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
           <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Webhook size={18}/> Active Endpoints</h3>
           <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--glass-border)', marginBottom: 12 }}>
             <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>HubSpot Sync</div>
             <div style={{ fontSize: '0.8rem', color: 'var(--muted)', wordBreak: 'break-all' }}>https://api.hubapi.com/v1/webhook...</div>
             <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
               <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>user.created</span>
               <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>course.completed</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
