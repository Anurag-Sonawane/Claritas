import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <div className="admin-page-header">
        <h1>
          <Settings size={24} style={{ color: 'var(--primary)' }} />
          Platform Settings
        </h1>
      </div>
      <div style={{ 
        background: 'var(--surface)', 
        padding: '3rem', 
        borderRadius: '12px', 
        border: '1px solid var(--border)',
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <Settings size={48} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Coming Soon</h2>
        <p style={{ color: 'var(--muted)' }}>The settings module is currently under development.</p>
      </div>
    </div>
  );
}
