import { useState } from 'react';
import { PlusCircle, Calendar, BookOpen, Clock, Award, FileText, CheckCircle2, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

export default function FacultyAssignmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('cs301');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('50');
  const [instructions, setInstructions] = useState('');

  const [assignments, setAssignments] = useState([
    {
      id: 'asg-1',
      title: 'Binary Search Tree Implementation',
      course: 'CS301: Data Structures',
      dueDate: 'Aug 05, 2026',
      maxScore: 50,
      submittedCount: 28,
      totalStudents: 42,
      status: 'Active'
    },
    {
      id: 'asg-2',
      title: 'Round Robin CPU Scheduler Simulation',
      course: 'CS402: Operating Systems',
      dueDate: 'Aug 08, 2026',
      maxScore: 100,
      submittedCount: 19,
      totalStudents: 38,
      status: 'Active'
    }
  ]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    try {
      const created = await api.createAssignment({
        course_id: course.toLowerCase(),
        title,
        due_date: dueDate,
        max_score: parseInt(maxScore) || 50,
        instructions
      });

      const newAsg = {
        id: created.id,
        title: created.title,
        course: course.toUpperCase() + ': Course Assignment',
        dueDate: created.due_date,
        maxScore: created.max_score,
        submittedCount: 0,
        totalStudents: 40,
        status: 'Active'
      };

      setAssignments([newAsg, ...assignments]);
      setShowCreateModal(false);
      setTitle('');
      setDueDate('');
      setInstructions('');
    } catch (err) {
      alert('Failed to create assignment: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Faculty Assignment Manager</h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Publish coursework, set grading benchmarks, and monitor submission rates.</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create New Assignment
        </button>
      </div>

      {/* Assignment List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {assignments.map((asg) => (
          <div key={asg.id} style={{ background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#14b8a6', padding: '3px 8px', background: 'rgba(20, 184, 166, 0.15)', borderRadius: 6 }}>
                  {asg.course.split(':')[0]}
                </span>
                <span style={{
                  fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6,
                  background: asg.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: asg.status === 'Active' ? '#10b981' : 'var(--muted)'
                }}>
                  {asg.status}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{asg.title}</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>{asg.course}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>Due Date:</span>
                <strong style={{ color: 'var(--foreground)' }}>{asg.dueDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>Max Score:</span>
                <strong style={{ color: 'var(--foreground)' }}>{asg.maxScore} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>Submissions:</span>
                <strong style={{ color: '#10b981' }}>{asg.submittedCount} / {asg.totalStudents} ({Math.round((asg.submittedCount/asg.totalStudents)*100)}%)</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: 16,
            width: '100%', maxWidth: 600, overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Create New Course Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Assignment Title <span style={{ color: '#f87171' }}>*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heap Memory Allocator Implementation"
                  style={{
                    width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Course Subject</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                    }}
                  >
                    <option value="CS301">CS301: Data Structures</option>
                    <option value="CS402">CS402: Operating Systems</option>
                    <option value="AI501">AI501: Machine Learning</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Due Date <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Max Score Points</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Instructions & Requirements</label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Outline submission instructions, code syntax constraints, test case expectations..."
                  style={{
                    width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.88rem', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#0d9488' }}>
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
