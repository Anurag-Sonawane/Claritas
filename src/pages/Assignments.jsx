import { useState } from 'react';
import { FileText, CheckCircle, Clock, UploadCloud, AlertCircle } from 'lucide-react';

export default function Assignments() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);

  const assignments = [
    { id: 1, title: 'Physics Lab Report', course: 'PHY 201', dueDate: 'Tomorrow, 11:59 PM', status: 'pending', desc: 'Attach your PDF lab report spanning the projectile motion experiment data.' },
    { id: 2, title: 'Calculus Problem Set 4', course: 'MAT 102', dueDate: 'Oct 12, 11:59 PM', status: 'pending', desc: 'Scanned handwritten notes are accepted. Must show all derivative work.' },
    { id: 3, title: 'React Project Alpha', course: 'CS 302', dueDate: 'Oct 05, 11:59 PM', status: 'graded', score: '92/100', feedback: 'Great job on the component isolation. However, CSS specificity could be improved.' },
    { id: 4, title: 'History Essay', course: 'HIS 101', dueDate: 'Sep 28, 11:59 PM', status: 'graded', score: '88/100', feedback: 'Solid thesis statement, though paragraph 3 lacked citations.' },
  ];

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileDetails(e.dataTransfer.files[0]);
    }
  };

  const pending = assignments.filter(a => a.status === 'pending');
  const graded = assignments.filter(a => a.status === 'graded');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(46, 196, 241, 0.1)', borderRadius: 12, color: 'var(--secondary)' }}><FileText size={24} /></div>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Course Assignments</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Assignment Lists */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#FF5A36" /> Action Required <span className="count-badge" style={{ background: 'rgba(255, 90, 54, 0.1)', color: '#FF5A36', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>{pending.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {pending.map(a => (
              <div 
                key={a.id} 
                className="surface" 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, cursor: 'pointer',
                  border: selectedAssignment?.id === a.id ? '1px solid var(--secondary)' : '1px solid var(--border)',
                  boxShadow: selectedAssignment?.id === a.id ? '0 0 20px rgba(46, 196, 241, 0.1)' : 'none'
                }}
                onClick={() => setSelectedAssignment(a)}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{a.title}</h3>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{a.course} • Due: {a.dueDate}</span>
                </div>
                <button className="btn-outline btn-sm">Select</button>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} color="#2EC4F1" /> Recently Graded
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {graded.map(a => (
              <div 
                key={a.id} 
                className="surface" 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, cursor: 'pointer',
                  border: selectedAssignment?.id === a.id ? '1px solid var(--secondary)' : '1px solid var(--border)'
                }}
                onClick={() => setSelectedAssignment(a)}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{a.title}</h3>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{a.course} • Score: {a.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Submission Area */}
        <div style={{ position: 'sticky', top: 90 }}>
          {selectedAssignment ? (
            <div className="surface glow-panel" style={{ padding: 32, borderRadius: 16, border: '1px solid rgba(46, 196, 241, 0.2)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{selectedAssignment.title}</h3>
              <div className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>{selectedAssignment.course}</div>

              {selectedAssignment.status === 'pending' ? (
                <>
                  <p style={{ color: 'var(--foreground)', marginBottom: 24, lineHeight: 1.5 }}>{selectedAssignment.desc}</p>
                  
                  {/* Custom Drag Drop Canvas */}
                  <div 
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    style={{ 
                      width: '100%', height: 200, 
                      border: dragActive ? '2px dashed var(--secondary)' : '2px dashed var(--border)',
                      background: dragActive ? 'rgba(46, 196, 241, 0.05)' : 'var(--background)',
                      borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', marginBottom: 24
                    }}
                  >
                    <UploadCloud size={40} color={dragActive ? 'var(--secondary)' : 'var(--muted)'} style={{ marginBottom: 16 }}/>
                    {fileDetails ? (
                      <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{fileDetails.name}</span>
                    ) : (
                      <span className="text-muted">Drag & Drop files or <span style={{ color: 'var(--secondary)', textDecoration: 'underline', cursor: 'pointer'}}>Browse</span></span>
                    )}
                  </div>

                  <button className="btn-primary" style={{ width: '100%' }} disabled={!fileDetails}>
                    Submit Assignment
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{selectedAssignment.score.split('/')[0]}<span style={{ fontSize: '1rem', color: 'var(--muted)'}}>/100</span></div>
                  </div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--muted)' }}>Instructor Feedback</h4>
                  <div style={{ padding: 16, background: 'var(--background)', borderLeft: '3px solid var(--secondary)', borderRadius: 8, lineHeight: 1.6 }}>
                    {selectedAssignment.feedback}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="surface" style={{ padding: 40, borderRadius: 16, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <AlertCircle size={48} color="var(--muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
               <h3 style={{ color: 'var(--muted)' }}>No Assignment Selected</h3>
               <p style={{ fontSize: '0.85rem', color: 'var(--muted)'}}>Select a pending test or past submission to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
