import { useState } from 'react';
import { ShieldCheck, MonitorSmartphone } from 'lucide-react';
import '../layouts/SettingsLayout.css';

export default function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessions] = useState([
    { id: 1, device: 'MacBook Pro - Chrome', ip: '192.168.1.42', time: 'Active now', current: true },
    { id: 2, device: 'iPhone 13 - Safari', ip: '10.0.0.5', time: '2 hours ago', current: false },
  ]);

  return (
    <div>
      <h1 className="settings-title" style={{ fontSize: '1.4rem' }}>Security & Authentication</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Manage platform security policies and active sessions.</p>

      <div style={{ display: 'grid', gap: 24 }}>
        
        {/* Policies */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18}/> Access Policies</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--glass-border)', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Enforce Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Require all admin users to configure 2FA via Authenticator App.</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
               <input type="checkbox" checked={mfaEnabled} onChange={e => setMfaEnabled(e.target.checked)} style={{ width: 18, height: 18 }} />
            </label>
          </div>

          <div style={{ paddingBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>IP Allowlist</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>Restrict admin portal access to specific IP ranges.</div>
            <input type="text" placeholder="e.g. 192.168.1.0/24" className="date-picker-mock" style={{ width: 300, marginRight: 12 }} />
            <button className="btn-outline btn-sm">Add Range</button>
          </div>
        </div>

        {/* Sessions */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}><MonitorSmartphone size={18}/> Active Sessions</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '8px 0' }}>Device</th>
                <th>IP Address</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '16px 0', fontWeight: 500 }}>
                    {s.device} {s.current && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--status-active-bg)', color: 'var(--status-active)', borderRadius: 10, marginLeft: 8 }}>Current</span>}
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{s.ip}</td>
                  <td style={{ color: 'var(--muted)' }}>{s.time}</td>
                  <td style={{ textAlign: 'right' }}>
                    {!s.current && <button className="btn-outline btn-sm danger" style={{ color: 'var(--status-deleted)', border: 'none' }}>Revoke</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
