import { useState } from 'react';
import { ArrowLeft, Plus, Settings, Eye, HelpCircle, Save, GripVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuestionBankModal from '../components/QuestionBankModal.jsx';
import './AssessmentBuilder.css';

export default function AssessmentBuilder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Untitled Assessment');
  const [questions, setQuestions] = useState([]);
  const [showBank, setShowBank] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (idx) => {
    setDraggedIdx(idx);
  };

  const handleDragEnter = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    
    // Swap items
    const newQuestions = [...questions];
    const draggedItem = newQuestions[draggedIdx];
    newQuestions.splice(draggedIdx, 1);
    newQuestions.splice(idx, 0, draggedItem);
    
    setDraggedIdx(idx);
    setQuestions(newQuestions);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const addQuestion = (qType) => {
    const newQ = { id: `q-${Date.now()}`, type: qType, text: 'New Question', points: 10 };
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  return (
    <div className="assessment-builder">
      <div className="builder-header glass">
        <div className="header-left">
          <button className="btn-icon" onClick={() => navigate('/admin/assessments')}>
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            className="title-input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        <div className="header-right">
          <button className="btn-outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye size={16} /> {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin/assessments')}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div className="builder-body">
        {/* Left Toolbar (Palette) */}
        {!previewMode && (
          <div className="builder-rail left">
            <h3>Add Question</h3>
            <div className="question-types">
              {['MCQ', 'Multi-select', 'Short Answer', 'Essay', 'Code', 'File Upload'].map(t => (
                <button key={t} className="type-btn" onClick={() => addQuestion(t)}>
                  <Plus size={16} /> {t}
                </button>
              ))}
            </div>
            <div className="rail-divider" />
            <button className="btn-secondary qbank-btn" onClick={() => setShowBank(true)}>
              <HelpCircle size={16} /> From Question Bank
            </button>
          </div>
        )}

        {/* Main Canvas */}
        <div className={`builder-canvas ${previewMode ? 'previewing' : ''}`}>
          {questions.length === 0 ? (
            <div className="empty-canvas">
              <HelpCircle size={48} style={{ color: 'var(--muted)' }} />
              <h3>No Questions Yet</h3>
              <p>Drag a question type from the left or select from the Question Bank.</p>
            </div>
          ) : previewMode ? (
            <div className="preview-container">
              <h2>{title}</h2>
              {questions.map((q, idx) => (
                <div key={q.id} className="preview-question">
                  <div className="preview-qtext">{(idx + 1)}. {q.text}</div>
                  <span className="preview-points">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                  {/* Mock student input based on type */}
                  {q.type === 'MCQ' && <div className="mock-input radio" />}
                  {q.type === 'Essay' && <textarea className="mock-textarea" disabled placeholder="Essay response..." />}
                  {(q.type === 'Code' || q.type === 'Short Answer') && <input className="mock-input text" disabled placeholder="Type answer..." />}
                </div>
              ))}
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div 
                  key={q.id} 
                  className={`q-block ${draggedIdx === idx ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="q-drag-handle">
                    <GripVertical size={16} />
                  </div>
                  <div className="q-content">
                    <div className="q-meta">
                      <span className="q-type-badge">{q.type}</span>
                      <input 
                        type="number" 
                        value={q.points}
                        onChange={(e) => {
                          const n = [...questions];
                          n[idx].points = e.target.value;
                          setQuestions(n);
                        }}
                        className="q-points"
                      /> pts
                    </div>
                    <input 
                      type="text" 
                      value={q.text}
                      onChange={(e) => {
                        const n = [...questions];
                        n[idx].text = e.target.value;
                        setQuestions(n);
                      }}
                      className="q-text-input"
                    />
                  </div>
                  <button className="q-delete" onClick={() => deleteQuestion(idx)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Toolbar (Settings) */}
        {!previewMode && (
          <div className="builder-rail right">
            <h3><Settings size={18} /> Settings</h3>
            <label className="rail-label">Total Points</label>
            <div className="total-points">
              {questions.reduce((sum, q) => sum + Number(q.points || 0), 0)}
            </div>
            
            <label className="rail-label">Passing Score (%)</label>
            <input type="number" defaultValue="80" className="rail-input" />
            
            <label className="rail-label">Time Limit (mins)</label>
            <input type="number" defaultValue="60" className="rail-input" />

            <div className="rail-checkbox">
              <input type="checkbox" id="shuffle" />
              <label htmlFor="shuffle">Shuffle Questions</label>
            </div>
          </div>
        )}
      </div>

      {showBank && (
        <QuestionBankModal 
          onClose={() => setShowBank(false)} 
          onSelect={(selectedQs) => {
            setQuestions([...questions, ...selectedQs]);
            setShowBank(false);
          }}
        />
      )}
    </div>
  );
}
