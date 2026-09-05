import { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Assessments() {
  const [tests, setTests] = useState([]);
  useEffect(() => {
    async function loadTests() {
      try {
        const data = await api.getAssessments();
        setTests(data);
      } catch (err) {
        console.warn('Assessments fetch error:', err);
      } 
    }
    loadTests();
  }, []);

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Active Quizzes & Assessments</h1>
      <p className="text-muted">View and attempt live course assessments with proctored monitoring.</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tests.length > 0 ? (
          tests.map((test, i) => (
            <div key={test.id || i} className="surface glow-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#FF5A36" />
                  {test.title}
                </h3>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Course: {test.course_code} • Duration: {test.duration_mins} mins • Passing Score: {test.passing_score}%
                </span>
              </div>
              <Link to="/proctored-test">
                <button className="btn-primary">Launch Proctored Quiz</button>
              </Link>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No active assessments right now.</div>
        )}
      </div>
    </div>
  );
}
