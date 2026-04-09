import { useState } from 'react';
import { UploadCloud, Link as LinkIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { verifySsoMetadata, testSsoConnection } from '../services/operationsMockService.js';

export default function IntegrationsPage() {
  const [ssoData, setSsoData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const result = await verifySsoMetadata(evt.target.result);
        setSsoData(result);
      } catch (err) {
        alert(err.message);
      }
      setUploading(false);
    };
    reader.readAsText(file);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await testSsoConnection();
    setTesting(false);
    alert('Mock: SSO Connection Successful!');
  };

  return (
    <div>
      <h1 className="settings-title" style={{ fontSize: '1.4rem' }}>Platform Integrations</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Configure connections to external systems.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* SSO Card */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><LinkIcon size={18}/> SAML 2.0 SSO</h3>
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: ssoData ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', color: ssoData ? '#22c55e' : 'var(--muted)', borderRadius: 4 }}>
              {ssoData ? 'Configured' : 'Not Configured'}
            </span>
          </div>

          {!ssoData ? (
             <div style={{ padding: 24, border: '2px dashed var(--border)', borderRadius: 8, textAlign: 'center' }}>
               <UploadCloud size={32} style={{ color: 'var(--muted)', marginBottom: 12 }} />
               <div style={{ marginBottom: 16, fontSize: '0.9rem' }}>Upload IdP Metadata XML</div>
               <label className="btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                 {uploading ? 'Parsing...' : 'Select File'}
                 <input type="file" accept=".xml" hidden onChange={handleFileUpload} disabled={uploading} />
               </label>
             </div>
          ) : (
             <div style={{ fontSize: '0.85rem' }}>
               <div style={{ marginBottom: 8 }}><strong style={{ color: 'var(--muted)'}}>Entity ID:</strong> {ssoData.entityId}</div>
               <div style={{ marginBottom: 16 }}><strong style={{ color: 'var(--muted)'}}>Login URL:</strong> {ssoData.loginUrl}</div>
               
               <div style={{ display: 'flex', gap: 12 }}>
                 <button className="btn-outline btn-sm" onClick={() => setSsoData(null)}>Remove Config</button>
                 <button className="btn-primary btn-sm" onClick={handleTestConnection} disabled={testing}>
                   {testing ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={14} />} Test Login
                 </button>
               </div>
             </div>
          )}
        </div>

        {/* Mock other integration cards */}
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)', opacity: 0.7 }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Stripe Payments</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)'}}>Connect to Stripe for course enrollment processing.</p>
          <button className="btn-outline btn-sm">Connect Stripe</button>
        </div>
        
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--background)', opacity: 0.7 }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Zoom Webinars</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)'}}>Sync webinar attendance data automatically.</p>
          <button className="btn-outline btn-sm">Connect Zoom</button>
        </div>

      </div>
    </div>
  );
}
