import { useState } from 'react';
import { MapPin, Clock, BatteryCharging, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Attendance() {
  const [washroomStatus, setWashroomStatus] = useState('idle'); // idle, active
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes (600s)

  const requestPass = () => {
    setWashroomStatus('active');
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setWashroomStatus('idle');
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(255, 90, 54, 0.1)', borderRadius: 12, color: 'var(--primary)' }}><MapPin size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Attendance & Tracking</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main KPI */}
          <div className="surface" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>Semester Attendance</h2>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>You are maintaining good standing.</p>
            </div>
            
            {/* CSS Conic Gradient Donut Mock */}
            <div style={{ 
              width: 100, height: 100, borderRadius: '50%', 
              background: 'conic-gradient(var(--secondary) 0% 92%, rgba(255,255,255,0.05) 92% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(46, 196, 241, 0.2)'
            }}>
              <div style={{ width: 80, height: 80, background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem' }}>
                92%
              </div>
            </div>
          </div>

          {/* Chronological Grid */}
          <div className="surface" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
             <h3 style={{ margin: '0 0 24px 0' }}>Recent Logins</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {[
                 { date: 'Today, 9:00 AM', status: 'Present', type: 'Campus WiFi' },
                 { date: 'Yesterday, 8:45 AM', status: 'Present', type: 'Biometric' },
                 { date: 'Monday, 10:00 AM', status: 'Late', type: 'Campus WiFi' },
               ].map((log, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: i !== 2 ? '1px solid var(--glass-border)' : 'none' }}>
                   <div>
                     <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{log.date}</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--muted)'}}>Verified via {log.type}</div>
                   </div>
                   <span style={{ 
                     padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold',
                     background: log.status === 'Present' ? 'rgba(46, 196, 241, 0.1)' : 'rgba(255, 90, 54, 0.1)',
                     color: log.status === 'Present' ? 'var(--secondary)' : 'var(--primary)'
                   }}>
                     {log.status}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Washroom Pass */}
        <div className="surface glow-panel" style={{ padding: 32, borderRadius: 16, border: washroomStatus === 'active' ? '1px solid rgba(255, 90, 54, 0.4)' : '1px solid rgba(46, 196, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <BatteryCharging size={24} color={washroomStatus === 'active' ? 'var(--primary)' : 'var(--secondary)'} />
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Washroom Tracker</h3>
          </div>

          <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            Claritas limits washroom breaks during active lectures to 10 minutes to ensure safety and attendance consistency. Requesting a pass notifies the professor's dashboard.
          </p>

          {washroomStatus === 'idle' ? (
            <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} onClick={requestPass}>
              Request Washroom Pass (10m)
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: 160, height: 160, borderRadius: '50%', border: '4px solid var(--primary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(255, 90, 54, 0.3)', marginBottom: 24, animation: 'pulse 2s infinite'
              }}>
                <Clock size={32} color="var(--primary)" style={{ marginBottom: 8 }}/>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--foreground)'}}>{formatTime(timeRemaining)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.9rem' }}>
                <ShieldCheck size={16} /> Pass actively broadcasting
              </div>
              <button className="btn-outline" style={{ marginTop: 24, width: '100%', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => { setWashroomStatus('idle'); setTimeRemaining(600); }}>
                End Break Early
              </button>
            </div>
          )}

          {/* Warning notice */}
          <div style={{ marginTop: 32, padding: 16, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, display: 'flex', gap: 12, fontSize: '0.85rem', color: 'var(--muted)' }}>
            <AlertTriangle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            Failure to return before the timer expires will automatically mark your status as 'Absent' for the remainder of the session unless overridden by the professor.
          </div>
        </div>

      </div>
    </div>
  );
}
