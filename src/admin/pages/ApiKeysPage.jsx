import { useState } from 'react';
import { Key, Copy, AlertTriangle } from 'lucide-react';
import { MOCK_API_KEYS } from '../services/operationsMockService.js';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(MOCK_API_KEYS);
  const [newKey, setNewKey] = useState(null);
  const [keyName, setKeyName] = useState('');

  const generateKey = () => {
    if (!keyName) return;
    const token = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setNewKey(token);
    
    setKeys([{
      id: 'key_' + Date.now(),
      name: keyName,
      prefix: token.substring(0, 12),
      created: 'Just now',
      lastUsed: 'Never'
    }, ...keys]);
    
    setKeyName('');
  };

  return (
    <div>
      <h1 className="settings-title" style={{ fontSize: '1.4rem' }}>API Keys</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Manage secret keys utilized for programmatic API access.</p>

      {newKey && (
        <div style={{ padding: 24, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: 12, marginBottom: 32 }}>
           <h3 style={{ margin: '0 0 12px 0', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
             <AlertTriangle size={18} /> Please copy your API key now
           </h3>
           <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '0 0 16px 0'}}>
             For security reasons, we will not show this key again. If you lose it, you will need to generate a new one.
           </p>
           <div style={{ display: 'flex', gap: 12 }}>
             <input type="text" readOnly value={newKey} className="date-picker-mock" style={{ flex: 1, fontFamily: 'monospace' }} />
             <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(newKey); alert('Copied!'); }}><Copy size={16}/> Copy</button>
           </div>
        </div>
      )}

      {/* Create Key Form */}
      <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)', marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Key size={18}/> Create New Secret Key</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            type="text" 
            placeholder="Key Name (e.g. Zapier Production)" 
            className="date-picker-mock" 
            style={{ width: 300 }} 
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
          <button className="btn-primary" onClick={generateKey} disabled={!keyName}>Generate Key</button>
        </div>
      </div>

      {/* Keys Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
            <th style={{ padding: '8px 0' }}>Name</th>
            <th>Token Prefix</th>
            <th>Created</th>
            <th>Last Used</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '16px 0', fontWeight: 500 }}>{k.name}</td>
              <td style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>{k.prefix}...</td>
              <td style={{ color: 'var(--muted)' }}>{k.created}</td>
              <td style={{ color: 'var(--muted)' }}>{k.lastUsed}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn-outline btn-sm danger" style={{ color: 'var(--status-deleted)' }} onClick={() => setKeys(keys.filter(x => x.id !== k.id))}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
