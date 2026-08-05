import { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Search, Plus, Mail, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export default function MyClassesPage() {
  const [selectedCourse, setSelectedCourse] = useState('cs301');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveRoster, setLiveRoster] = useState([]);

  const courses = [
    { id: 'cs301', code: 'CS301', title: 'Data Structures & Algorithms', department: 'Computer Science', students: 42, term: 'Fall 2026', schedule: 'Mon, Wed 09:00 AM' },
    { id: 'cs402', code: 'CS402', title: 'Operating Systems & Kernels', department: 'Computer Science', students: 38, term: 'Fall 2026', schedule: 'Tue, Thu 11:30 AM' },
    { id: 'ai501', code: 'AI501', title: 'Applied Machine Learning', department: 'Artificial Intelligence', students: 62, term: 'Fall 2026', schedule: 'Wed, Fri 02:30 PM' },
  ];

  useEffect(() => {
    async function loadRoster() {
      try {
        const data = await api.getCourseRoster(selectedCourse);
        const mapped = data.map(st => ({
          id: st.id,
          roll: '2026-CS-' + st.id.slice(-3),
          name: st.name,
          email: st.email,
          attendance: `${st.attendance_rate}%`,
          gpa: String(st.gpa),
          status: st.status,
          avatar: st.avatar_url
        }));
        setLiveRoster(mapped);
      } catch (err) {
        console.error('Failed to load roster:', err);
      }
    }
    loadRoster();
  }, [selectedCourse]);

  const currentCourseInfo = courses.find((c) => c.id === selectedCourse);
  const currentRoster = liveRoster.filter(st => 
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    st.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Title ── */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Classes & Student Rosters</h1>
        <p style={{ color: 'var(--muted)', margin: '4px 0 0 0' }}>Manage assigned subjects, inspect student enrollment, and share course resources.</p>
      </div>

      {/* ── Course Selector Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {courses.map((course) => {
          const isSelected = selectedCourse === course.id;
          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              style={{
                padding: 18, borderRadius: 14, cursor: 'pointer',
                background: isSelected ? 'rgba(13, 148, 136, 0.12)' : 'var(--surface-card, rgba(30, 41, 59, 0.6))',
                border: isSelected ? '1px solid #14b8a6' : '1px solid var(--glass-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#14b8a6', padding: '2px 8px', background: 'rgba(20, 184, 166, 0.15)', borderRadius: 6 }}>
                  {course.code}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{course.students} Students</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{course.title}</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>{course.schedule}</p>
            </div>
          );
        })}
      </div>

      {/* ── Selected Course Details & Roster ── */}
      <div style={{ background: 'var(--surface-card, rgba(30, 41, 59, 0.6))', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentCourseInfo?.code}: {currentCourseInfo?.title}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Department: {currentCourseInfo?.department} • Term: {currentCourseInfo?.term}</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px', background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)', borderRadius: 8,
                  color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Roster Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Student</th>
                <th style={{ padding: '12px 16px' }}>Roll Number</th>
                <th style={{ padding: '12px 16px' }}>Attendance</th>
                <th style={{ padding: '12px 16px' }}>GPA</th>
                <th style={{ padding: '12px 16px' }}>Academic Standing</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRoster.length > 0 ? (
                currentRoster.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={student.avatar} alt={student.name} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{student.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{student.roll}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontWeight: 600,
                        color: parseInt(student.attendance) >= 75 ? '#10b981' : '#f87171'
                      }}>
                        {student.attendance}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{student.gpa}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20,
                        background: student.status === 'Low Attendance' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: student.status === 'Low Attendance' ? '#f87171' : '#10b981',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {student.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <a href={`mailto:${student.email}`} className="btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} /> Email
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                    No enrolled students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
