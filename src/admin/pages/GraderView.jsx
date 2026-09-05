/* eslint-disable no-unused-vars */
 
 
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import PlagiarismModal from '../components/PlagiarismModal.jsx';
import { submitGrade } from '../services/assessmentMockService.js';
import './AssessmentBuilder.css'; // Reuse CSS layout

export default function GraderView() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock submission data
  const submissionInfo = {
    student: 'Alice Johnson',
    assessment: 'Final Project Submission',
    date: 'April 8, 2026',
    content: "The virtual DOM (VDOM) is a programming concept where an ideal, or 'virtual', representation of a UI is kept in memory and synced with the 'real' DOM by a library such as ReactDOM. This process is called reconciliation. This approach enables the declarative API of React: You tell React what state you want the UI to be in, and it makes sure the DOM matches that state. This abstracts out the attribute manipulation, event handling, and manual DOM updating that you would otherwise have to use to build your app.",
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await submitGrade(submissionId, score, feedback);
    setIsSubmitting(false);
    navigate('/admin/grading'); // Return to queue after grading
  };

  return (
    <div className="assessment-builder">
      {/* Topbar */}
      <div className="builder-header glass">
        <div className="header-left">
          <button className="btn-icon" onClick={() => navigate('/admin/grading')}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ marginLeft: 8 }}>
            <div className="title-input" style={{ padding: 0 }}>Grading: {submissionInfo.student}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{submissionInfo.assessment} &nbsp;•&nbsp; {submissionInfo.date}</div>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-outline" onClick={() => setShowPlagiarism(true)}>
            <AlertTriangle size={16} /> Check Plagiarism
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><Save size={16} /> Submit Grade</>}
          </button>
        </div>
      </div>

      <div className="builder-body" style={{ flexDirection: 'row' }}>
        {/* Left Side: Submission Wrapper */}
        <div className="builder-canvas" style={{ flex: 2, borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <FileText style={{ color: 'var(--primary)' }} /> Student Submission
            </h2>
            <div style={{ 
              background: 'var(--background)', 
              padding: 32, 
              borderRadius: 8, 
              border: '1px solid var(--border)',
              lineHeight: 1.6,
              fontSize: '1rem',
              color: 'var(--foreground)'
            }}>
              {submissionInfo.content}
            </div>
            
            <div style={{ marginTop: 24, padding: 16, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-info)' }}>
              <CheckCircle2 size={24} />
              <div>
                <strong style={{ display: 'block', color: 'var(--foreground)' }}>Auto-Grader Passed</strong>
                <span style={{ fontSize: '0.85rem' }}>MCQ questions were auto-scored: 40/40 pts. Only Essay section requires manual review.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Rubric & Score Input */}
        <div className="builder-rail right" style={{ flex: 1, minWidth: 320 }}>
          <h3>Rubric & Feedback</h3>
          
          <div style={{ background: 'var(--background)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Essay Rubric (10 pts max)</h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', paddingLeft: 16, margin: 0 }}>
              <li>Clarity & Structure (3)</li>
              <li>Technical Accuracy (5)</li>
              <li>Code Example Quality (2)</li>
            </ul>
          </div>

          <label className="rail-label">Score (out of 10)</label>
          <input 
            type="number" 
            className="rail-input" 
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g., 8"
            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
          />

          <label className="rail-label">Feedback Comments</label>
          <textarea 
            className="rail-input" 
            rows="6" 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback to the student..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {showPlagiarism && (
        <PlagiarismModal 
          text={submissionInfo.content} 
          onClose={() => setShowPlagiarism(false)} 
        />
      )}
    </div>
  );
}
