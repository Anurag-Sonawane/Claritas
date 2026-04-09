import { useState } from 'react';
import { Activity, AlertTriangle, Terminal, PlayCircle, BookOpen, Check } from 'lucide-react';
import { MOCK_HEALTH_ALERTS } from '../services/operationsMockService.js';
import { VENDOR_CONFIG } from '../constants/config.js';

const STATIC_RUNBOOK = `
## Sev-1 Incident Runbook
**Internal Support Contact:** ${VENDOR_CONFIG.SUPPORT_CONTACT}

### 1. Verification
- Confirm error rate spikes via Metrics pane.
- Check Database Pool utilization. If > 90%, initiate DB replica scaler.

### 2. Mitigation
- Drain stuck jobs in transcoder queue.
- Purge Redis Edge Cache.
- Restart Web dynos.

### 3. Communication
- Post status update to Slack #incidents.
- Update external statuspage.io.
`;

export default function SystemHealth() {
  const [alerts, setAlerts] = useState(MOCK_HEALTH_ALERTS);
  const [jobs, setJobs] = useState([
    { id: 'job_import_42', type: 'CSV Users Import', status: 'Failed', time: '10m ago' },
    { id: 'job_video_tx', type: 'Course Intro Transcode', status: 'Stuck', time: '12m ago' }
  ]);
  const [copied, setCopied] = useState(false);

  const handleAcknowledgeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleRetryJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
    alert(`Mock: Job ${id} has been re-queued.`);
  };

  const copyRunbook = () => {
    navigator.clipboard.writeText(STATIC_RUNBOOK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1><Activity size={28} style={{ color: 'var(--primary)'}} /> System Health & Operations</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--status-active)', padding: '6px 12px', background: 'var(--status-active-bg)', borderRadius: 20, fontWeight: 600 }}>
             All Systems Nominal
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr)', gap: 24, marginBottom: 24 }}>
        
        {/* Column 1: Active Alerts */}
        <div style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18}/> Active Alerts</h3>
          {alerts.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>No active alerts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ padding: 12, background: a.severity === 'high' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(250, 204, 21, 0.1)', border: `1px solid ${a.severity === 'high' ? '#f87171' : '#facc15'}`, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 500, marginBottom: 8 }}>{a.message}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.time} ago</span>
                    <button style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--foreground)' }} onClick={() => handleAcknowledgeAlert(a.id)}>Acknowledge</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Job Queue Logs */}
        <div style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Terminal size={18}/> Background Jobs Log</h3>
          {jobs.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>Queue clear.</div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {jobs.map(j => (
                 <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--glass-border)' }}>
                   <div>
                     <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{j.type}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--status-deleted)' }}>{j.status} • {j.time}</div>
                   </div>
                   <button className="topbar-icon-btn" onClick={() => handleRetryJob(j.id)} title="Retry Job" style={{ color: 'var(--primary)' }}>
                     <PlayCircle size={18} />
                   </button>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Column 3: Metrics summary */}
        <div style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--background)' }}>
           <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18}/> Core Metrics</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem', color: 'var(--muted)' }}>
                 <span>DB Pool Usage</span>
                 <span style={{ color: 'var(--status-review)'}}>68%</span>
               </div>
               <div style={{ height: 6, background: 'var(--surface)', borderRadius: 3 }}><div style={{ width: '68%', height: '100%', background: 'var(--status-review)', borderRadius: 3 }}/></div>
             </div>
             
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem', color: 'var(--muted)' }}>
                 <span>API Latency (p99)</span>
                 <span style={{ color: 'var(--status-active)'}}>120ms</span>
               </div>
               <div style={{ height: 6, background: 'var(--surface)', borderRadius: 3 }}><div style={{ width: '20%', height: '100%', background: 'var(--status-active)', borderRadius: 3 }}/></div>
             </div>
           </div>
        </div>
      </div>

      {/* Incident Runbook Embed */}
      <div style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--background)', marginTop: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} color="var(--secondary)" /> Admin Runbook</h3>
            <button className="btn-outline btn-sm" onClick={copyRunbook}>
              {copied ? <><Check size={14}/> Copied</> : 'Copy Runbook MD'}
            </button>
         </div>
         <div style={{ 
           background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 8, 
           fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap', border: '1px solid var(--glass-border)' 
         }}>
           {STATIC_RUNBOOK}
         </div>
      </div>

    </div>
  );
}
