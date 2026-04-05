import { ShieldCheck, Video, LayoutList } from 'lucide-react';

export default function ProctoredTest() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="surface glow-panel" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', border: '1px solid var(--primary)' }}>
        <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ margin: 0, color: 'var(--foreground)' }}>Secure Testing Environment</h1>
        <p className="text-muted" style={{ margin: '1rem 0 2rem 0' }}>You are about to enter a proctored session. Your camera, microphone, and screen will be actively monitored. Please ensure your environment is clear.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left' }}>
           <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Video color="var(--secondary)" />
              <div>
                <div style={{ fontWeight: '600' }}>Webcam Check</div>
                <div style={{ fontSize: '0.8rem', color: '#2EC4F1' }}>Passed</div>
              </div>
           </div>
           <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutList color="var(--secondary)" />
              <div>
                <div style={{ fontWeight: '600' }}>Screen Lock</div>
                <div style={{ fontSize: '0.8rem', color: '#2EC4F1' }}>Ready</div>
              </div>
           </div>
        </div>

        <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Enter Fullscreen & Begin Test</button>
      </div>
    </div>
  );
}
