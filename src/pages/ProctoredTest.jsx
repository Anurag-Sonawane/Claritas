import { useState } from 'react';
import { ShieldAlert, Video, Mic, Globe, AlertTriangle, CheckCircle, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProctoredTest() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('preflight'); // preflight, test
  const [checks, setChecks] = useState({
    network: false,
    camera: false,
    audio: false,
    browser: false
  });

  const runChecks = () => {
    // Simulate sequential hardware checks
    setTimeout(() => setChecks(prev => ({...prev, network: true})), 600);
    setTimeout(() => setChecks(prev => ({...prev, camera: true})), 1400);
    setTimeout(() => setChecks(prev => ({...prev, audio: true})), 2000);
    setTimeout(() => setChecks(prev => ({...prev, browser: true})), 2600);
  };

  const allPassed = Object.values(checks).every(Boolean);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--background)', // Takes over entire screen, hiding dashboard Layout
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Lockdown Header */}
      <div style={{ height: 60, background: '#1c1f26', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #FF5A36' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FF5A36', fontWeight: 'bold' }}>
           <ShieldAlert size={20} /> Secure Exam Browser Lockdown
         </div>
         {phase === 'test' && (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '4px 12px', borderRadius: 20 }}>
             <div style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
             Recording
           </div>
         )}
         <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
           Exit Lockdown
         </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        
        {phase === 'preflight' ? (
          <div className="surface" style={{ width: '100%', maxWidth: 700, padding: 40, borderRadius: 16, border: '1px solid var(--border)' }}>
             <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem' }}>Pre-flight Check</h1>
             <p className="text-muted" style={{ marginBottom: 32 }}>Your hardware and environment will be continuously monitored during "Midterm: Physics Sub-dynamics".</p>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {[{ key: 'network', icon: Globe, label: 'Stable Network Connection > 5Mbps' },
                  { key: 'camera', icon: Video, label: 'Webcam feed un-obstructed' },
                  { key: 'audio', icon: Mic, label: 'Microphone ambient noise acceptable' },
                  { key: 'browser', icon: Lock, label: 'Browser full-screen API secured' }].map(c => (
                  <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <c.icon size={18} color="var(--muted)" />
                       <span>{c.label}</span>
                     </div>
                     {checks[c.key] ? <CheckCircle size={20} color="#22c55e" /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--muted)', opacity: 0.3 }} />}
                  </div>
                ))}
             </div>

             <div style={{ display: 'flex', gap: 16 }}>
               <button className="btn-outline" onClick={runChecks} style={{ flex: 1 }}>Run Diagnostics</button>
               <button className="btn-primary" disabled={!allPassed} onClick={() => setPhase('test')} style={{ flex: 1, opacity: allPassed ? 1 : 0.5, cursor: allPassed ? 'pointer' : 'not-allowed' }}>
                 Start Examination
               </button>
             </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 1000, display: 'flex', gap: 24, height: '100%' }}>
            
            {/* Exam Content */}
            <div className="surface" style={{ flex: 1, padding: 40, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, fontSize: '0.9rem', color: 'var(--muted)'}}>
                 <span>Question 1 of 40</span>
                 <span>Time Remaining: 58:24</span>
               </div>

               <h2 style={{ fontSize: '1.4rem', lineHeight: 1.5, marginBottom: 32 }}>
                 1. If a particle's velocity is given by v(t) = 3t² - 2t, what is its acceleration at t = 2s?
               </h2>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {['a) 10 m/s²', 'b) 12 m/s²', 'c) 8 m/s²', 'd) 4 m/s²'].map((opt, i) => (
                   <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, border: '1px solid var(--glass-border)', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}>
                     <input type="radio" name="q1" style={{ width: 18, height: 18 }} />
                     {opt}
                   </label>
                 ))}
               </div>

               <div style={{ marginTop: 'auto', paddingTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                 <button className="btn-outline" disabled>Previous</button>
                 <button className="btn-primary" style={{ background: '#3b82f6' }}>Next Question</button>
               </div>
            </div>

            {/* Sidebar feeds */}
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 24 }}>
               {/* Mock Webcam */}
               <div className="surface glow-panel" style={{ width: '100%', height: 200, borderRadius: 16, border: '1px solid #FF5A36', position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Video size={48} color="#FF5A36" style={{ opacity: 0.3 }} />
                 <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 }}>
                   Anurag_Webcam_01
                 </div>
               </div>

               {/* Exam Rules Info */}
               <div className="surface" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                 <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16}/> Guidelines</h3>
                 <ul style={{ paddingLeft: 16, margin: 0, fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <li>Do not leave the camera frame.</li>
                   <li>No mobile devices allowed.</li>
                   <li>Audio is aggressively monitored.</li>
                 </ul>
                 <div style={{ marginTop: 24, padding: 12, background: 'rgba(255, 90, 54, 0.1)', color: '#FF5A36', borderRadius: 8, fontSize: '0.8rem', display: 'flex', gap: 8 }}>
                   <AlertTriangle size={16} style={{ flexShrink: 0 }} /> Any attempt to switch tabs will instantly terminate the exam.
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
