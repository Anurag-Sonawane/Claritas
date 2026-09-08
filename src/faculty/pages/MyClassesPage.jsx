import { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Search, Plus, Mail, ShieldAlert, CheckCircle, ChevronRight, Edit } from 'lucide-react';
import { api } from '../../services/api';
import ProfileModal from '../../components/ProfileModal';

export default function MyClassesPage() {
  const [courses, setCourses] = useState([
    { id: 'crs-001', code: 'CS301', title: 'Data Structures & Algorithms', department: 'Computer Science', students: 54, term: 'Fall 2026', schedule: 'Mon/Wed 10:00 AM' },
    { id: 'crs-002', code: 'CS402', title: 'Operating Systems Design', department: 'Computer Science', students: 42, term: 'Fall 2026', schedule: 'Tue/Thu 2:00 PM' }
  ]);
  const [selectedCourse, setSelectedCourse] = useState('crs-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveRoster, setLiveRoster] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.getCourses();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(c => ({
            id: c.id,
            code: c.code || 'CS101',
            title: c.title,
            department: c.department || 'Computer Science',
            students: c.students_count || 40,
            term: c.term || 'Fall 2026',
            schedule: c.schedule || 'Mon, Wed 10:00 AM'
          }));
          setCourses(mapped);
          setSelectedCourse(mapped[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    async function loadRoster() {
      try {
        const data = await api.getCourseRoster(selectedCourse);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(st => ({
            id: st.id,
            roll: '2026-CS-' + (st.id ? String(st.id).slice(-3) : '001'),
            name: st.name,
            email: st.email,
            attendance: `${st.attendance_rate || 92}%`,
            gpa: String(st.gpa || 3.8),
            status: st.status || 'Active',
            avatar: st.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=0d9488&color=fff`
          }));
          setLiveRoster(mapped);
        } else {
          setLiveRoster([
            { id: 'student-001', roll: '2026-CS-001', name: 'Anurag Sonawane', email: 'anurag@claritas.edu', attendance: '94.5%', gpa: '3.9', status: 'Good Standing', avatar: 'https://ui-avatars.com/api/?name=Anurag+Sonawane&background=6366f1&color=fff' },
            { id: 'student-002', roll: '2026-CS-014', name: 'Rohan Sharma', email: 'rohan@claritas.edu', attendance: '88.0%', gpa: '3.6', status: 'Good Standing', avatar: 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=3b82f6&color=fff' },
            { id: 'student-003', roll: '2026-CS-022', name: 'Priya Verma', email: 'priya@claritas.edu', attendance: '91.2%', gpa: '3.85', status: 'Honor Roll', avatar: 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff' },
          ]);
        }
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
                    <td style={{ padding: '14px 16px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setEditingStudent({ ...student, role: 'student' })}
                        className="btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        title="Edit Student Profile (Name, Photo)"
                      >
                        <Edit size={14} /> Edit Profile
                      </button>
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

      {/* Student Profile Edit Modal */}
      {editingStudent && (
        <ProfileModal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          targetUser={editingStudent}
          onSuccess={(updated) => {
            setLiveRoster(prev => prev.map(s => s.id === updated.id ? {
              ...s,
              name: updated.name,
              avatar: updated.avatarUrl || updated.avatar_url || s.avatar
            } : s));
          }}
        />
      )}
    </div>
  );
}
