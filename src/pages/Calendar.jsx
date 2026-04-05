export default function Calendar() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM'];

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Lecture Timetable</h1>
      <p className="text-muted">Your weekly academic schedule.</p>

      <div className="surface" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--secondary)' }}>Time</th>
              {days.map(d => (
                <th key={d} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t, idx) => (
              <tr key={t}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 'bold' }}>{t}</td>
                {days.map((d, dIdx) => (
                  <td key={d} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                    {idx === dIdx % 3 ? (
                      <div style={{ background: 'rgba(46, 196, 241, 0.1)', borderLeft: '3px solid var(--secondary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--foreground)' }}>CS {101 + idx * 10}</strong><br/>
                        <span className="text-muted">Room A-{(100 + dIdx * 20)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--glass-border)' }}>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
