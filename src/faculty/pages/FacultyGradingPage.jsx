import { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter, CheckCircle2, Star, Send, X, Code, FileText, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function FacultyGradingPage() {
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSubmissions();
      const mapped = data.map(sub => ({
        id: sub.id,
        student: sub.student_name,
        roll: '2026-CS-' + sub.student_id.slice(-3),
        course: `${sub.course_code}: ${sub.course_title}`,
        assignment: sub.assignment_title,
        submittedAt: sub.submitted_at,
        status: sub.status,
        maxScore: sub.max_score,
        currentScore: sub.current_score,
        feedback: sub.feedback || '',
        content: sub.content || '// Submission content...'
      }));
      setSubmissions(mapped);
    } catch (e) {
      console.error('Failed to load submissions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenEvaluation = (sub) => {
    setActiveSubmission(sub);
    setScore(sub.currentScore !== null ? String(sub.currentScore) : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      const parsedScore = parseFloat(score) || 0;
      await api.gradeSubmission(activeSubmission.id, parsedScore, feedback);

      setSubmissions(prev => prev.map(s => {
        if (s.id === activeSubmission.id) {
          return {
            ...s,
            status: 'Graded',
            currentScore: parsedScore,
            feedback: feedback
          };
        }
        return s;
      }));

      setActiveSubmission(null);
    } catch (err) {
      alert('Failed to save grade: ' + err.message);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filterCourse === 'all') return true;
    return s.course.includes(filterCourse);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Faculty Grading Queue</h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Review student code, award marks out of total scores, and send constructive feedback.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={{
              padding: '8px 14px', background: 'var(--surface-card, rgba(30, 41, 59, 0.6))',
              border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', outline: 'none'
            }}
          >
            <option value="all">All Courses</option>
            <option value="CS301">CS301 Data Structures</option>
            <option value="CS402">CS402 Operating Systems</option>
          </select>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div style={{ background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Student</th>
                <th style={{ padding: '12px 16px' }}>Course</th>
                <th style={{ padding: '12px 16px' }}>Assignment</th>
                <th style={{ padding: '12px 16px' }}>Submitted Time</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{sub.student}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sub.roll}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>{sub.course}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{sub.assignment}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>{sub.submittedAt}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20,
                      background: sub.status === 'Graded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: sub.status === 'Graded' ? '#10b981' : '#f59e0b',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {sub.currentScore !== null ? `${sub.currentScore} / ${sub.maxScore}` : `- / ${sub.maxScore}`}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEvaluation(sub)}
                      className={sub.status === 'Graded' ? 'btn-outline btn-sm' : 'btn-primary btn-sm'}
                      style={{ background: sub.status === 'Graded' ? 'transparent' : '#0d9488' }}
                    >
                      {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Evaluation Drawer / Modal ── */}
      {activeSubmission && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: 16,
            width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Evaluate: {activeSubmission.assignment}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>Student: {activeSubmission.student} ({activeSubmission.roll}) • {activeSubmission.course}</p>
              </div>
              <button onClick={() => setActiveSubmission(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Submission Work Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#14b8a6' }}>
                  Student Submission Payload
                </label>
                <pre style={{
                  padding: 16, background: '#020617', border: '1px solid var(--glass-border)', borderRadius: 10,
                  color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'monospace', overflowX: 'auto', maxHeight: 220
                }}>
                  {activeSubmission.content}
                </pre>
              </div>

              {/* Score Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Score Awarded (Max: {activeSubmission.maxScore}) <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeSubmission.maxScore}
                    step="0.5"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={`e.g. 45`}
                    style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Grade Standard</label>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Passing Threshold: 40% ({activeSubmission.maxScore * 0.4} pts)
                  </div>
                </div>
              </div>

              {/* Feedback Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Faculty Feedback</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide comments on algorithm optimization, code style, or area of improvement..."
                  style={{
                    width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.88rem', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setActiveSubmission(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#0d9488', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={16} /> Publish Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
