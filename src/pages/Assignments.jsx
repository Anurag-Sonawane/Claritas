import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
      if (data.length > 0 && !selectedAssignment) {
        setSelectedAssignment(data[0]);
      }
    } catch (err) {
      console.warn('Assignments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionText.trim()) return;
    setSubmitting(true);
    try {
      await api.submitAssignment(selectedAssignment.id, submissionText);
      setSubmittedSuccess(true);
      setSubmissionText('');
      fetchAssignments();
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><FileText size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Course Assignments</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Assignment List */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#FF5A36" /> Active Coursework <span className="count-badge" style={{ background: 'rgba(255, 90, 54, 0.1)', color: '#FF5A36', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>{assignments.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {assignments.map(a => (
              <div 
                key={a.id} 
                className="surface" 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, cursor: 'pointer',
                  border: selectedAssignment?.id === a.id ? '1px solid var(--secondary)' : '1px solid var(--border)',
                  boxShadow: selectedAssignment?.id === a.id ? '0 0 20px rgba(46, 196, 241, 0.1)' : 'none'
                }}
                onClick={() => { setSelectedAssignment(a); setSubmittedSuccess(false); }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{a.title}</h3>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{a.course_code || 'CS301'} • Due: {a.due_date}</span>
                </div>
                <button className="btn-outline btn-sm">Select</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Submission Form */}
        <div style={{ position: 'sticky', top: 90 }}>
          {selectedAssignment ? (
            <div className="surface glow-panel" style={{ padding: 32, borderRadius: 16, border: '1px solid rgba(46, 196, 241, 0.2)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{selectedAssignment.title}</h3>
              <div className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>{selectedAssignment.course_code} • Max Score: {selectedAssignment.max_score || 100} pts</div>

              <p style={{ color: 'var(--foreground)', marginBottom: 20, lineHeight: 1.5 }}>
                {selectedAssignment.instructions || 'Implement the assignment solution and submit your code/response below.'}
              </p>

              {submittedSuccess && (
                <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> Assignment submitted successfully! Sent to Faculty Grading Queue.
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Your Code / Submission Response</label>
                <textarea
                  rows={8}
                  placeholder="// Paste your solution or code here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', borderRadius: 8, color: '#fff', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical'
                  }}
                />
              </div>

              <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting || !submissionText.trim()}>
                {submitting ? 'Submitting...' : 'Submit to Faculty Queue'}
              </button>
            </div>
          ) : (
            <div className="surface" style={{ padding: 40, borderRadius: 16, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <AlertCircle size={48} color="var(--muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
               <h3 style={{ color: 'var(--muted)' }}>No Assignment Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
