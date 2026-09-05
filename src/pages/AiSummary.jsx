import { useState } from 'react';
import { Sparkles, FileText, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const SAMPLE_LECTURES = {
  'lecture-dsa': {
    title: 'CS301: Balanced Trees & Asymptotic Analysis',
    text: 'In this lecture, we explore self-balancing search trees with emphasis on AVL and Red-Black trees. The critical invariant of an AVL tree is that for every node, the heights of the left and right subtrees differ by at most one. When this invariant is violated during insertion or deletion, we restore balance using single or double rotations. We analyze worst-case time complexity: search, insertion, and deletion all execute strictly in O(log n) time. Red-Black trees trade tighter height balancing for fewer rotations on write operations, making them the standard choice for associative containers in modern language runtimes.'
  },
  'lecture-os': {
    title: 'CS402: Virtual Memory & Page Replacement',
    text: 'Virtual memory provides an illusion of a large, contiguous address space to every process. The memory management unit (MMU) translates virtual addresses to physical frames using page tables. When a page is accessed that is not resident in physical RAM, the CPU triggers a page fault exception. The operating system handles this by selecting an eviction candidate using algorithms like Clock, Second-Chance, or Least Recently Used (LRU). The translation lookaside buffer (TLB) caches recent translations to prevent double memory dereferences.'
  },
  'custom': {
    title: 'Custom Lecture / Notes',
    text: ''
  }
};

export default function AiSummary() {
  const navigate = useNavigate();
  const [sourceKey, setSourceKey] = useState('lecture-dsa');
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeText = sourceKey === 'custom' ? customText : SAMPLE_LECTURES[sourceKey]?.text || '';
  const activeTitle = sourceKey === 'custom' ? 'Custom Study Material' : SAMPLE_LECTURES[sourceKey]?.title || 'Lecture Summary';

  const generateSummary = async () => {
    if (!activeText.trim()) {
      setErrorMsg('Please enter or select lecture text to summarize.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const data = await api.summarizeNotes(activeText, activeTitle);
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.title}\n\n${result.exec}\n\nKey Takeaways:\n${result.bullets.map(b => `- ${b}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Back to AI Hub
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(244, 63, 94, 0.1)', borderRadius: 12, color: '#f43f5e' }}>
          <FileText size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lecture Summary Generator</h1>
          <span className="text-muted">Live extractive NLP & algorithmic study synthesizer.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Input Panel */}
        <div className="surface" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Configuration</h3>
          
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Select Source Material</label>
          <select 
            value={sourceKey} 
            onChange={e => { setSourceKey(e.target.value); setErrorMsg(''); }}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', marginBottom: 16 }}
          >
            <option value="lecture-dsa">CS301: Balanced Trees & Complexity .txt</option>
            <option value="lecture-os">CS402: Virtual Memory & Page Faults .txt</option>
            <option value="custom">Paste Custom Notes / Text...</option>
          </select>

          {sourceKey === 'custom' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>Paste Lecture Transcript or Notes</label>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste paragraph or notes to summarize..."
                style={{ width: '100%', height: 120, padding: 10, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', resize: 'vertical' }}
              />
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 6, color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}

          <button 
            onClick={generateSummary} 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            <Sparkles size={18} /> {loading ? 'Synthesizing Notes...' : 'Generate Summary'}
          </button>
        </div>

        {/* Output Panel */}
        {result ? (
          <div className="surface" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)', animation: 'slideDown 0.3s ease-out' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{result.title}</h2>
                 <span className="text-muted" style={{ fontSize: '0.85rem' }}>{result.wordCount} words • {result.readingTime}</span>
               </div>
               <button className="btn-outline btn-sm" onClick={handleCopy}>
                 <Copy size={14}/> {copied ? 'Copied!' : 'Copy Summary'}
               </button>
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
          </div>
        ) : (
          !loading && (
            <div className="surface" style={{ padding: 40, border: '2px dashed var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Select material or paste notes to generate an analytical study summary.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
