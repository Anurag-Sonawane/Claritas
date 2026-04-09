import { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiSummary() {
  const navigate = useNavigate();
  const [source, setSource] = useState('lecture-3');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const generateSummary = () => {
    setLoading(true);
    setProgress(0);
    setResult(null);

    // Simulate AI thinking and "typing" process
    const duration = 2000;
    const interval = 50;
    let current = 0;
    
    const timer = setInterval(() => {
      current += interval;
      setProgress(Math.min((current / duration) * 100, 100));
      
      if (current >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          setLoading(false);
          setResult({
            title: 'Week 3: Advanced Matrix Calculus',
            exec: 'This lecture covered the foundational concepts of Jacobian matrices and their application to backpropagation in deep neural networks. The professor emphasized that understanding the chain rule at a multivariate level is critical for optimization functions.',
            bullets: [
              'The Jacobian matrix represents all first-order partial derivatives of a vector-valued function.',
              'Gradients scale proportionally with the eigenvalues of the transformation matrix.',
              'Vanishing gradient problems occur when these eigenvalues are repeatedly < 1 across hidden layers.',
              'ReLU activation functions bypass this mathematical saturation.'
            ]
          });
        }, 300);
      }
    }, interval);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Back to AI Hub
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(244, 63, 94, 0.1)', borderRadius: 12, color: '#f43f5e' }}><FileText size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lecture Summary Generator</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Input Panel */}
        <div className="surface" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Configuration</h3>
          
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Select Source Material</label>
          <select 
            value={source} 
            onChange={e => setSource(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', marginBottom: 24 }}
          >
            <option value="lecture-2">Lecture 2: Intro to Linear Algebra .mp4</option>
            <option value="lecture-3">Lecture 3: Jacobian Matrices .mp4 (Current)</option>
            <option value="pdf-1">Reading: Chapter 4 Tensor Dynamics .pdf</option>
          </select>

          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Summary Length</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['Short', 'Medium', 'Detailed'].map(len => (
              <button key={len} style={{ flex: 1, padding: '8px 0', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}>{len}</button>
            ))}
          </div>

          <button 
            onClick={generateSummary} 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            <Sparkles size={18} /> {loading ? 'Extracting Context...' : 'Generate Summary'}
          </button>

          {loading && (
            <div style={{ marginTop: 24 }}>
              <div style={{ width: '100%', height: 4, background: 'var(--background)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#f43f5e', transition: 'width 0.1s' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8 }}>Processing NLP heuristics...</p>
            </div>
          )}
        </div>

        {/* Output Panel */}
        {result ? (
          <div className="surface" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)', animation: 'slideDown 0.3s ease-out' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{result.title}</h2>
               <button className="btn-outline btn-sm" onClick={() => alert('Mock: Copied to clipboard')}><Copy size={14}/> Copy Raw</button>
             </div>

             <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: '3px solid #f43f5e', marginBottom: 24, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.6 }}>
               "{result.exec}"
             </div>

             <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Key Takeaways</h3>
             <ul style={{ paddingLeft: 20, color: 'var(--foreground)', lineHeight: 1.6, margin: 0 }}>
               {result.bullets.map((bullet, i) => (
                 <li key={i} style={{ marginBottom: 12 }}>{bullet}</li>
               ))}
             </ul>

             <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ background: '#f43f5e' }}><CheckCircle size={16} /> Save to My Notes</button>
             </div>
          </div>
        ) : (
          !loading && (
            <div style={{ padding: 40, border: '2px dashed var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Configure and generate to view your summary here.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
