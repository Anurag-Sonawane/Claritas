import { Link } from 'react-router-dom';
import {
  BookOpen, Users, CheckSquare, Clock, ArrowRight,
  MapPin, CheckCircle2, Sparkles, TrendingUp, AlertCircle
} from 'lucide-react';
import './FacultyDashboard.css';

export default function FacultyDashboard() {
  const stats = [
    { label: 'Active Courses', value: '4', icon: BookOpen, color: '#0d9488', bg: 'rgba(13, 148, 136, 0.15)' },
    { label: 'Total Students Taught', value: '142', icon: Users, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    { label: 'Pending Grading', value: '18', icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { label: 'Lectures Today', value: '3', icon: Clock, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  ];

  const todayClasses = [
    { id: 'c1', name: 'CS301: Data Structures & Algorithms', time: '09:00 AM - 10:30 AM', room: 'Lab 4B', students: 42, status: 'Completed' },
    { id: 'c2', name: 'CS402: Operating Systems', time: '11:30 AM - 01:00 PM', room: 'Hall 201', students: 38, status: 'In Progress' },
    { id: 'c3', name: 'AI501: Applied Machine Learning', time: '02:30 PM - 04:00 PM', room: 'Auditorium A', students: 62, status: 'Upcoming' },
  ];

  const recentSubmissions = [
    { id: 's1', student: 'Rohan Sharma', course: 'CS301', task: 'Binary Search Tree Implementation', time: '10 mins ago', avatar: 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=6366f1&color=fff' },
    { id: 's2', student: 'Priya Verma', course: 'CS402', task: 'Process Scheduler Simulation', time: '25 mins ago', avatar: 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff' },
    { id: 's3', student: 'Aarav Patel', course: 'AI501', task: 'Linear Regression Notebook', time: '1 hour ago', avatar: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=10b981&color=fff' },
    { id: 's4', student: 'Sneha Gupta', course: 'CS301', task: 'Binary Search Tree Implementation', time: '2 hours ago', avatar: 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=8b5cf6&color=fff' },
  ];

  return (
    <div className="faculty-dashboard">
      {/* ── Welcome Banner ── */}
      <div className="faculty-header">
        <div className="faculty-welcome">
          <h1>Welcome back, Dr. Vikram Patel 👋</h1>
          <p>Associate Professor, Computer Science & Engineering • Academic Term 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/faculty/attendance" className="btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
            <MapPin size={16} /> Take Quick Attendance
          </Link>
          <Link to="/faculty/assignments" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Sparkles size={16} /> New Assignment
          </Link>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="faculty-stats-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: stat.bg, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Sections ── */}
      <div className="faculty-sections-grid">
        {/* Today's Schedule */}
        <div className="faculty-card">
          <div className="card-title">
            <span>Today's Class Schedule</span>
            <span style={{ fontSize: '0.8rem', color: '#14b8a6', fontWeight: 500 }}>July 30, 2026</span>
          </div>

          <div className="schedule-list">
            {todayClasses.map((item) => (
              <div key={item.id} className="schedule-item">
                <div className="schedule-time">
                  <span>{item.time.split(' - ')[0]}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>to {item.time.split(' - ')[1]}</span>
                </div>
                <div className="schedule-info" style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p>{item.room} • {item.students} Enrolled Students</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20,
                    background: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : item.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: item.status === 'Completed' ? '#10b981' : item.status === 'In Progress' ? '#f59e0b' : 'var(--muted)'
                  }}>
                    {item.status}
                  </span>
                  <Link to="/faculty/attendance" className="btn-outline btn-sm" style={{ textDecoration: 'none' }}>
                    Roll Call
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Submissions Queue */}
        <div className="faculty-card">
          <div className="card-title">
            <span>Recent Submissions</span>
            <Link to="/faculty/grading" style={{ fontSize: '0.82rem', color: '#14b8a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All (18) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="submissions-list">
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="submission-item">
                <div className="submission-student">
                  <img src={sub.avatar} alt={sub.student} className="submission-avatar" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{sub.student}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{sub.course} • {sub.task}</div>
                  </div>
                </div>
                <Link to="/faculty/grading" className="btn-primary btn-sm" style={{ textDecoration: 'none', background: '#0d9488', fontSize: '0.78rem' }}>
                  Grade
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Class Performance Insights ── */}
      <div className="faculty-card">
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#14b8a6" />
            <span>Course Performance Overview</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Average Quiz & Assignment Scores</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { course: 'CS301 Data Structures', score: '84%', attendance: '91%', status: 'Good' },
            { course: 'CS402 Operating Systems', score: '76%', attendance: '82%', status: 'Average' },
            { course: 'AI501 Machine Learning', score: '88%', attendance: '95%', status: 'Excellent' },
            { course: 'CS204 Object Oriented Design', score: '69%', attendance: '74%', status: 'Attention Needed' },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>{item.course}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 4 }}>
                <span>Avg. Score:</span> <strong style={{ color: 'var(--foreground)' }}>{item.score}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                <span>Avg. Attendance:</span> <strong style={{ color: 'var(--foreground)' }}>{item.attendance}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
