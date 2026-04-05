export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="surface" style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '4px solid var(--primary)' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem auto', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
          C
        </div>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>Claritas</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>Empowering the Future of Education</p>
        <p className="text-muted" style={{ lineHeight: '1.8', marginTop: '2rem' }}>
          Claritas is a state-of-the-art educational platform built to bridge the gap between institutions and students. We believe that technology should seamlessly adapt to academic workflows, enabling educators to teach freely and students to learn efficiently. 
          <br /><br />
          Built by students, for students.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '3rem' }}>
          <div>
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>10k+</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Active Students</p>
          </div>
          <div>
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>500+</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Educators & Staff</p>
          </div>
          <div>
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>99%</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Uptime Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
