import { useState, useEffect } from 'react';
import { MapPin, Calendar, CheckCircle2, XCircle, Clock, Save, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function FacultyAttendancePage() {
  const [courses, setCourses] = useState([
    { id: 'crs-001', code: 'CS301', title: 'Data Structures & Algorithms' },
    { id: 'crs-002', code: 'CS402', title: 'Operating Systems Design' }
  ]);
  const [selectedCourse, setSelectedCourse] = useState('crs-001');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaved, setIsSaved] = useState(false);

  const [students, setStudents] = useState([
    { id: 'student-001', roll: '2026-CS-001', name: 'Anurag Sonawane', status: 'Present' },
    { id: 'student-002', roll: '2026-CS-014', name: 'Rohan Sharma', status: 'Present' },
    { id: 'student-003', roll: '2026-CS-022', name: 'Priya Verma', status: 'Present' },
    { id: 'student-004', roll: '2026-CS-031', name: 'Karan Malhotra', status: 'Absent' },
    { id: 'student-005', roll: '2026-CS-045', name: 'Sneha Gupta', status: 'Present' },
  ]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.getCourses();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses for attendance:', err);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    async function loadCourseStudents() {
      try {
        const roster = await api.getCourseRoster(selectedCourse);
        if (Array.isArray(roster) && roster.length > 0) {
          setStudents(roster.map(st => ({
            id: st.id,
            roll: '2026-CS-' + (st.id ? String(st.id).slice(-3) : '001'),
            name: st.name,
            status: 'Present'
          })));
        }
      } catch (err) {
        console.error('Failed to load roster for attendance:', err);
      }
    }
    loadCourseStudents();
  }, [selectedCourse]);

  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(st => st.id === id ? { ...st, status: newStatus } : st));
    setIsSaved(false);
  };

  const handleMarkAll = (status) => {
    setStudents(prev => prev.map(st => ({ ...st, status })));
    setIsSaved(false);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map(s => ({ student_id: s.id, status: s.status }));
      await api.saveAttendanceSession(selectedCourse, attendanceDate, records);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    }
  };

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;
  const percentage = Math.round((presentCount / students.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Class Attendance Logger</h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Conduct live roll call, record student attendance, and track real-time lecture metrics.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleSaveAttendance} className="btn-primary" style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={16} /> Save Attendance Record
          </button>
        </div>
      </div>

      {/* Confirmation notification */}
      {isSaved && (
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={18} /> Attendance record for {selectedCourse} on {attendanceDate} saved successfully!
        </div>
      )}

      {/* Control Panel Bar */}
      <div style={{ background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4 }}>Course Subject</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                padding: '8px 14px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
              }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4 }}>Lecture Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              style={{
                padding: '8px 14px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => handleMarkAll('Present')} className="btn-outline btn-sm" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            Mark All Present
          </button>
          <button onClick={() => handleMarkAll('Absent')} className="btn-outline btn-sm" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}>
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Students</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{students.length}</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Present ({percentage}%)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: '#10b981' }}>{presentCount}</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.8rem', color: '#f87171' }}>Absent</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: '#f87171' }}>{absentCount}</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 14 }}>
          <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Late Arrival</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: '#f59e0b' }}>{lateCount}</div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div style={{ background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Student Roll Call ({selectedCourse})</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                }}>
                  {st.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{st.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>Roll: {st.roll}</div>
                </div>
              </div>

              {/* Status Selector Chips */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.id, 'Present')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    background: st.status === 'Present' ? '#10b981' : 'transparent',
                    color: st.status === 'Present' ? '#fff' : 'var(--muted)',
                    border: st.status === 'Present' ? '1px solid #10b981' : '1px solid var(--glass-border)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.id, 'Late')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    background: st.status === 'Late' ? '#f59e0b' : 'transparent',
                    color: st.status === 'Late' ? '#fff' : 'var(--muted)',
                    border: st.status === 'Late' ? '1px solid #f59e0b' : '1px solid var(--glass-border)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Late
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(st.id, 'Absent')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    background: st.status === 'Absent' ? '#f87171' : 'transparent',
                    color: st.status === 'Absent' ? '#fff' : 'var(--muted)',
                    border: st.status === 'Absent' ? '1px solid #f87171' : '1px solid var(--glass-border)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
