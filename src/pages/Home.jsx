import { useState, useEffect } from 'react';
import { Activity, BookOpen, Target, Calendar, Award, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getStudentDashboard();
        setDashboardData(data);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = dashboardData?.metrics || { gpa: 3.8, attendance: 92.5, pendingTasksCount: 2 };
  const upcoming = dashboardData?.upcomingAssignments || [
    { id: '1', title: 'Binary Search Tree Implementation', course_code: 'CS301', due_date: '2026-08-05' },
    { id: '2', title: 'Round Robin CPU Scheduler Simulation', course_code: 'CS402', due_date: '2026-08-08' }
  ];
  const courses = dashboardData?.courses || [];

  return (
    <div>
      {/* Hero Banner */}
      <div className="surface glow-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '2.5rem', 
        borderRadius: '16px',
        marginBottom: '2rem',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '2.5rem' }}>
            Good Afternoon, {user?.name?.split(' ')[0] || 'Student'}! ✨
          </h1>
          <p className="text-muted" style={{ fontSize: '1.2rem', margin: 0 }}>
            GPA: <strong style={{ color: 'var(--secondary)' }}>{metrics.gpa}</strong> • Attendance Rate: <strong style={{ color: '#10b981' }}>{metrics.attendance}%</strong>
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> View Courses ({courses.length || 3})
            </button>
            <button style={{ background: 'rgba(46, 196, 241, 0.1)', border: '1px solid rgba(46, 196, 241, 0.3)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> View Schedule
            </button>
          </div>
        </div>
        
        <div style={{ padding: '2rem', background: 'radial-gradient(circle, rgba(46, 196, 241, 0.15) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Target size={120} color="var(--secondary)" style={{ filter: 'drop-shadow(0 0 20px rgba(46,196,241,0.5))' }} />
        </div>
      </div>
      
      {/* Live Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(46, 196, 241, 0.1)', borderRadius: '12px', color: 'var(--secondary)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{metrics.pendingTasksCount} Tasks Due</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Pending submission</span>
          </div>
        </div>

        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(255, 90, 54, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Flame size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>7 Day Streak</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Active Learning</span>
          </div>
        </div>

        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Award size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{metrics.attendance}%</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Overall Attendance</span>
          </div>
        </div>

        <div className="surface" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ padding: '16px', background: 'rgba(247, 248, 250, 0.05)', borderRadius: '12px', color: 'var(--foreground)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{courses.length || 3} Enrolled</h3>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Active Courses</span>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity color="var(--secondary)" /> Live Upcoming Assignments & Tasks
      </h2>
      <div className="surface" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
             <tr>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>ASSIGNMENT / TASK</th>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>COURSE</th>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>DUE DATE</th>
               <th style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>STATUS</th>
             </tr>
          </thead>
          <tbody>
            {upcoming.map((item, i) => (
               <tr key={item.id || i}>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', fontWeight: '500' }}>{item.title}</td>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--secondary)', fontWeight: 600 }}>{item.course_code}</td>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--muted)' }}>{item.due_date}</td>
                 <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                      background: 'rgba(255, 90, 54, 0.2)', color: 'var(--primary)'
                    }}>
                      PENDING
                    </span>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
