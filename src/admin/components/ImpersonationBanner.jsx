import { AlertTriangle, X } from 'lucide-react';

export default function ImpersonationBanner({ user, onExit }) {
  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 'var(--z-impersonation)',
      background: 'var(--impersonation-bg)',
      borderBottom: '1px solid var(--impersonation-border)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backdropFilter: 'blur(8px)',
      animation: 'slideDown 300ms var(--ease-out-expo)',
    }}>
      <AlertTriangle size={16} style={{ color: 'var(--impersonation-text)' }} />
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--impersonation-text)' }}>
        You are impersonating <strong>{user.name}</strong> ({user.email})
      </span>
      <button
        onClick={onExit}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', background: 'rgba(251, 191, 36, 0.2)',
          border: '1px solid var(--impersonation-border)',
          borderRadius: 6, color: 'var(--impersonation-text)',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          marginLeft: 8,
        }}
      >
        <X size={14} /> Exit Impersonation
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
