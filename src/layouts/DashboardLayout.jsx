import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileCheck, MapPin, Calendar, Bell, Wallet, MessageSquare, Info, ShieldAlert, LogOut, Sparkles, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';
import './DashboardLayout.css';

const NavigationLinks = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/assignments', label: 'Assignments', icon: BookOpen },
  { path: '/assessments', label: 'Assessments', icon: FileCheck },
  { path: '/attendance', label: 'Attendance', icon: MapPin },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/announcements', label: 'Announcements', icon: Bell },
  { path: '/fees', label: 'Fees & Scholarships', icon: Wallet },
  { path: '/complaints', label: 'Complaints', icon: MessageSquare },
  { path: '/proctored-test', label: 'Proctored Test', icon: ShieldAlert },
  { path: '/compiler', label: 'Sandbox', icon: Code2 },
  { path: '/ai', label: 'AI Study Hub', icon: Sparkles },
  { path: '/about', label: 'About Us', icon: Info },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isLockdown = location.pathname === '/proctored-test';

  if (isLockdown) {
    return (
      <div className="lockdown-viewport" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="layout-container">
      <main className="main-content">
        <header className="topbar glass">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem'}}>C</div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--foreground)'}}>Claritas</h2>
          </div>
          
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={user?.avatarUrl || "https://i.pravatar.cc/150?u=student1"} alt="User Avatar" className="avatar" />
              <div className="user-details" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ fontWeight: '600' }}>{user?.name || 'Student'}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Computer Science</span>
              </div>
            </div>
            <button onClick={logout} className="btn-outline btn-sm danger" title="Sign Out" style={{ borderColor: 'rgba(248, 113, 113, 0.4)', color: 'var(--status-deleted)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        <div className="page-content">
          <PageWrapper locationKey={location.pathname}>
            <Outlet />
          </PageWrapper>
        </div>

        <nav className="bottom-taskbar">
          {NavigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={link.label}
              >
                <Icon size={20} />
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  );
}
