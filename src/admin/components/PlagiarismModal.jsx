import { useState, useEffect } from 'react';
import { AlertCircle, FileSearch, CheckCircle } from 'lucide-react';
import Modal from './Modal.jsx';
import { simulatePlagiarismCheck } from '../services/assessmentMockService.js';

export default function PlagiarismModal({ text, onClose }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    simulatePlagiarismCheck(text).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [text]);

  return (
    <Modal onClose={onClose} title="Plagiarism Report" size="md">
      <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <FileSearch size={48} style={{ opacity: 0.5, marginBottom: 16 }} className="spin-pulse" /> {/* Assuming some global animation, else static */}
            <p>Analyzing submission across web sources...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, borderRadius: 12, background: result.similarity > 20 ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${result.similarity > 20 ? 'var(--status-deleted)' : 'var(--status-published)'}` }}>
              {result.similarity > 20 ? <AlertCircle size={32} color="var(--status-deleted)" /> : <CheckCircle size={32} color="var(--status-published)" />}
              <div>
                <h2 style={{ fontSize: '2rem', margin: 0, color: result.similarity > 20 ? 'var(--status-deleted)' : 'var(--status-published)' }}>{result.similarity}%</h2>
                <div style={{ color: 'var(--muted)' }}>Similarity Score</div>
              </div>
            </div>

            {result.matches.length > 0 ? (
              <div>
                <h4 style={{ marginBottom: 12 }}>Matched Sources</h4>
                {result.matches.map((m, i) => (
                  <div key={i} style={{ padding: 16, background: 'var(--admin-input-bg)', borderRadius: 8, border: '1px solid var(--admin-input-border)', fontSize: '0.9rem' }}>
                    <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '0.8rem' }}>Source: <a href="#" style={{ color: 'var(--primary)' }}>{m.source}</a></div>
                    <div style={{ color: 'var(--foreground)', fontStyle: 'italic' }}>"...{m.text}..."</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', textAlign: 'center' }}>No significant matches found. Submission appears original.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 16 }}>
              <button className="btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
