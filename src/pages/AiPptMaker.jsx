import { useState } from 'react';
import { Sparkles, Presentation, ArrowLeft, Download, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiPptMaker() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Beginners');
  const [slides, setSlides] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState(null);

  const generateDeck = () => {
    if (!topic.trim()) return;
    setLoading(true);

    setTimeout(() => {
      setDeck([
        { id: 1, title: 'Title Slide', body: topic || 'Introduction to Topic' },
        { id: 2, title: 'Agenda', body: '- Core Concepts\\n- Historical Context\\n- Case Studies\\n- Q&A' },
        { id: 3, title: 'The Problem Space', body: '- Current limitations\\n- Why this matters now\\n- Statistical overview' },
        { id: 4, title: 'Proposed Solutions', body: '- Methodology A\\n- Methodology B\\n- Hybrid Approach' },
        { id: 5, title: 'Conclusion', body: '- Summary of findings\\n- Next steps\\n- Thank you' }
      ].slice(0, slides));
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Back to AI Hub
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(168, 85, 247, 0.1)', borderRadius: 12, color: '#a855f7' }}><Presentation size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>AI Pitch Deck Maker</h1>
      </div>

      {!deck ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 600 }}>
          <div className="surface" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem' }}>Presentation Parameters</h3>
            
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Topic or Raw Text</label>
            <textarea 
              placeholder="Provide a subject, paste an essay, or describe your project..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'var(--background)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', height: 100, resize: 'none', marginBottom: 20 }}
            />

            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Target Audience</label>
                <select 
                  value={audience} 
                  onChange={e => setAudience(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' }}
                >
                  <option>Beginners</option>
                  <option>Peers / Classmates</option>
                  <option>Professors / Experts</option>
                  <option>Investors</option>
                </select>
              </div>
              <div style={{ width: 120 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Slide Count</label>
                <input 
                  type="number" 
                  value={slides} 
                  onChange={e => setSlides(Number(e.target.value))} 
                  min="3" max="20"
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <button 
              onClick={generateDeck}
              disabled={loading || !topic.trim()}
              style={{ width: '100%', padding: '14px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: (loading || !topic.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !topic.trim()) ? 0.7 : 1 }}
            >
              {loading ? 'Designing slides...' : <><Sparkles size={18}/> Draft Presentation</>}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: 24, alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={18}/> Outline Review</h3>
               <span style={{ fontSize: '0.8rem', color: 'var(--muted)'}}>{deck.length} slides generated</span>
             </div>

             {deck.map((slide, i) => (
               <div key={slide.id} className="surface" style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid #a855f7' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Slide {i+1}</div>
                 <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>{slide.title}</h4>
                 <div style={{ whiteSpace: 'pre-line', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                   {slide.body}
                 </div>
               </div>
             ))}
          </div>

          <div className="surface" style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', position: 'sticky', top: 100 }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Actions</h3>
             <button className="btn-primary" style={{ width: '100%', background: '#a855f7', marginBottom: 16 }} onClick={() => alert('Mock: Downloading .pptx')}>
               <Download size={16} /> Export as .PPTX
             </button>
             <button className="btn-outline" style={{ width: '100%' }} onClick={() => setDeck(null)}>
               Edit Parameters
             </button>
          </div>

        </div>
      )}
    </div>
  );
}
