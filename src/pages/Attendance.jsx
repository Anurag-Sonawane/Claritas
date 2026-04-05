import { Camera, Map, QrCode, ClipboardList, PieChart, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Attendance() {
  const trackingOptions = [
    { id: 'face', title: 'Face Recognition', icon: Camera, desc: 'Uses webcam to verify identity automatically.', action: 'Launch Camera' },
    { id: 'geo', title: 'Geolocation', icon: Map, desc: 'Verifies your location on campus.', action: 'Share Location' },
    { id: 'qr', title: 'QR Code', icon: QrCode, desc: 'Scan the code projected in class by your professor.', action: 'Open Scanner' },
    { id: 'manual', title: 'Manual Entry', icon: ClipboardList, desc: 'Submit standard attendance request if other methods fail.', action: 'Submit Request' },
  ];

  const stats = [
    { course: 'CS 302', percent: 92, status: 'Excellent', color: 'var(--secondary)' },
    { course: 'MAT 102', percent: 88, status: 'Good', color: 'var(--secondary)' },
    { course: 'PHY 201', percent: 76, status: 'Warning', color: 'var(--primary)' },
  ];

  const average = Math.round(stats.reduce((acc, curr) => acc + curr.percent, 0) / stats.length);

  const CircularProgress = ({ percent, color, size = 160, strokeWidth = 14 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={radius} 
            stroke={color} 
            strokeWidth={strokeWidth} 
            fill="none" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} 
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--foreground)', lineHeight: '1.2' }}>{percent}%</span>
          <span className="text-muted" style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Average</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Attendance Tracking</h1>
      <p className="text-muted">Mark your attendance for ongoing lectures using our secure methods.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        
        {/* Upgraded Overall Attendance Banner */}
        <div className="surface glow-panel" style={{ gridColumn: '1 / -1', display: 'flex', gap: '4rem', alignItems: 'center', padding: '2.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', minWidth: '200px' }}>
            <CircularProgress percent={average} color="var(--secondary)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', background: 'rgba(46, 196, 241, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
              <TrendingUp size={18} />
              <span style={{ fontWeight: '600' }}>On Track</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 0.5rem 0' }}>
               <PieChart color="var(--primary)" size={28} /> Course Breakdown
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {stats.map(s => (
                <div key={s.course} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                   <div style={{ width: '80px', fontWeight: '600', fontSize: '1.1rem' }}>{s.course}</div>
                   <div style={{ flex: 1, height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${s.percent}%`, background: s.color, borderRadius: '5px', boxShadow: `0 0 10px ${s.color}` }} />
                   </div>
                   <div style={{ width: '50px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>{s.percent}%</div>
                   <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '8px', color: s.color, fontSize: '0.9rem', fontWeight: '500' }}>
                     {s.status === 'Warning' ? <AlertTriangle size={16} /> : <div style={{width: 8, height: 8, borderRadius: '50%', background: s.color}}/>}
                     {s.status}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracking Options */}
        {trackingOptions.map(option => {
          const Icon = option.icon;
          return (
            <div key={option.id} className="surface" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ padding: '16px', background: 'rgba(255, 90, 54, 0.1)', borderRadius: '14px', color: 'var(--primary)' }}>
                <Icon size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{option.title}</h3>
              <p className="text-muted" style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>{option.desc}</p>
              <button style={{ width: '100%', marginTop: 'auto', padding: '1rem', fontSize: '1.05rem' }}>{option.action}</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
