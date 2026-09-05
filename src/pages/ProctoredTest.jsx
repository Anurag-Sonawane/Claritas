import { useState } from 'react';
import { ShieldAlert, Video, Mic, Globe, AlertTriangle, CheckCircle, FileText, Lock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sampleQuestions = [
  {
    id: 1,
    text: "1. If a particle's velocity is given by v(t) = 3t² - 2t, what is its acceleration at t = 2s?",
    options: ['a) 10 m/s²', 'b) 12 m/s²', 'c) 8 m/s²', 'd) 4 m/s²'],
    correct: 'a) 10 m/s²'
  },
  {
    id: 2,
    text: "2. Which of the following principles states that an increase in the speed of a fluid occurs simultaneously with a decrease in static pressure?",
    options: ["a) Pascal's Principle", "b) Bernoulli's Principle", "c) Archimedes' Principle", "d) Hooke's Law"],
    correct: "b) Bernoulli's Principle"
  },
  {
    id: 3,
    text: "3. What is the time complexity of searching for an element in a balanced Binary Search Tree containing n nodes?",
    options: ['a) O(1)', 'b) O(n)', 'c) O(log n)', 'd) O(n log n)'],
    correct: 'c) O(log n)'
  }
];

export default function ProctoredTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState('preflight'); // preflight, test
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({ 0: 'a) 10 m/s²' });
  const [submitted, setSubmitted] = useState(false);
  const [checks, setChecks] = useState({
    network: false,
    camera: false,
    audio: false,
    browser: false
  });

  const runChecks = () => {
    // Simulate sequential hardware checks
    setTimeout(() => setChecks(prev => ({...prev, network: true})), 600);
    setTimeout(() => setChecks(prev => ({...prev, camera: true})), 1400);
    setTimeout(() => setChecks(prev => ({...prev, audio: true})), 2000);
    setTimeout(() => setChecks(prev => ({...prev, browser: true})), 2600);
  };

  const allPassed = Object.values(checks).every(Boolean);
  const currentQuestion = sampleQuestions[currentQIndex];
  const selectedOption = answers[currentQIndex];

  const handleSelectOption = (opt) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: opt }));
  };

  const handleNext = () => {
    if (currentQIndex < sampleQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const studentWebcamTag = user?.name 
    ? `${user.name.trim().replace(/\s+/g, '_')}_Webcam_01` 
    : 'Student_Webcam_01';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Lockdown Header */}
      <div style={{ height: 60, minHeight: 60, background: '#1c1f26', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #FF5A36', zIndex: 10 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FF5A36', fontWeight: 'bold' }}>
           <ShieldAlert size={20} /> Secure Exam Browser Lockdown
         </div>
         {phase === 'test' && !submitted && (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '4px 14px', borderRadius: 20 }}>
             <div style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
             Recording Live
           </div>
         )}
         <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
           Exit Lockdown
         </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', overflowY: 'auto' }}>
        
        {phase === 'preflight' ? (
          <div className="surface" style={{ width: '100%', maxWidth: 680, padding: 36, borderRadius: 16, border: '1px solid var(--border)' }}>
             <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem' }}>Pre-flight Check</h1>
             <p className="text-muted" style={{ marginBottom: 28, fontSize: '0.92rem' }}>Your hardware and environment will be continuously monitored during "Midterm: Physics & Systems Architecture".</p>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {[{ key: 'network', icon: Globe, label: 'Stable Network Connection > 5Mbps' },
                  { key: 'camera', icon: Video, label: 'Webcam feed un-obstructed' },
                  { key: 'audio', icon: Mic, label: 'Microphone ambient noise acceptable' },
                  { key: 'browser', icon: Lock, label: 'Browser full-screen API secured' }].map(c => (
                  <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <c.icon size={18} color="var(--muted)" />
                       <span style={{ fontSize: '0.9rem' }}>{c.label}</span>
                     </div>
                     {checks[c.key] ? <CheckCircle size={20} color="#22c55e" /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--muted)', opacity: 0.3 }} />}
                  </div>
                ))}
             </div>

             <div style={{ display: 'flex', gap: 16 }}>
               <button className="btn-outline" onClick={runChecks} style={{ flex: 1, padding: '12px' }}>Run Diagnostics</button>
               <button className="btn-primary" disabled={!allPassed} onClick={() => setPhase('test')} style={{ flex: 1, padding: '12px', opacity: allPassed ? 1 : 0.5, cursor: allPassed ? 'pointer' : 'not-allowed' }}>
                 Start Examination
               </button>
             </div>
          </div>
        ) : submitted ? (
          <div className="surface" style={{ width: '100%', maxWidth: 560, padding: 40, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.6rem' }}>Examination Completed</h2>
            <p className="text-muted" style={{ marginBottom: 28, fontSize: '0.95rem' }}>
              Your answers and proctoring telemetry have been securely transmitted and verified.
            </p>
            <div style={{ display: 'inline-flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/assessments')}>
                Back to Assessments
              </button>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 1040, display: 'flex', gap: 24, minHeight: 'min-content', alignItems: 'stretch' }}>
            
            {/* Exam Question Card */}
            <div className="surface" style={{ flex: 1, padding: '28px 32px', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: '0.88rem', color: 'var(--muted)'}}>
                 <span style={{ fontWeight: 600 }}>Question {currentQIndex + 1} of {sampleQuestions.length}</span>
                 <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6 }}>Time Remaining: 58:24</span>
               </div>

               <h2 style={{ fontSize: '1.25rem', lineHeight: 1.5, marginBottom: 24, fontWeight: 600 }}>
                 {currentQuestion.text}
               </h2>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                 {currentQuestion.options.map((opt, i) => {
                   const isSelected = selectedOption === opt;
                   return (
                     <label 
                       key={i} 
                       onClick={() => handleSelectOption(opt)}
                       style={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: 14, 
                         padding: '14px 18px', 
                         border: isSelected ? '1px solid #3b82f6' : '1px solid var(--glass-border)', 
                         background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                         borderRadius: 10, 
                         cursor: 'pointer', 
                         transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                       }}
                     >
                       <input 
                         type="radio" 
                         name={`q_${currentQuestion.id}`} 
                         checked={isSelected}
                         onChange={() => handleSelectOption(opt)}
                         style={{ width: 18, height: 18, accentColor: '#3b82f6', cursor: 'pointer' }} 
                       />
                       <span style={{ fontSize: '0.95rem', color: isSelected ? '#fff' : 'var(--foreground)' }}>{opt}</span>
                     </label>
                   );
                 })}
               </div>

               {/* Action Footer */}
               <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <button 
                   className="btn-outline" 
                   disabled={currentQIndex === 0}
                   onClick={handlePrev}
                   style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: currentQIndex === 0 ? 0.4 : 1, cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer' }}
                 >
                   <ChevronLeft size={16} /> Previous
                 </button>

                 <button 
                   className="btn-primary" 
                   onClick={handleNext}
                   style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px' }}
                 >
                   {currentQIndex === sampleQuestions.length - 1 ? (
                     <>Submit Exam <Check size={16} /></>
                   ) : (
                     <>Next Question <ChevronRight size={16} /></>
                   )}
                 </button>
               </div>
            </div>

            {/* Sidebar feeds */}
            <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
               {/* Mock Webcam */}
               <div className="surface glow-panel" style={{ width: '100%', height: 190, borderRadius: 16, border: '1px solid #FF5A36', position: 'relative', overflow: 'hidden', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Video size={44} color="#FF5A36" style={{ opacity: 0.35 }} />
                 <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.72rem', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                     {studentWebcamTag}
                   </div>
                   <div style={{ fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                     1080p 30fps
                   </div>
                 </div>
               </div>

               {/* Exam Rules Info */}
               <div className="surface" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                 <h3 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <FileText size={16} color="var(--primary)"/> Guidelines
                 </h3>
                 <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <li>Do not leave the camera frame.</li>
                   <li>No mobile devices or secondary displays.</li>
                   <li>Audio is aggressively monitored.</li>
                 </ul>
                 <div style={{ marginTop: 18, padding: 12, background: 'rgba(255, 90, 54, 0.1)', color: '#FF5A36', borderRadius: 8, fontSize: '0.78rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                   <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                   <span>Any attempt to switch tabs or minimize browser will instantly terminate the exam.</span>
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
