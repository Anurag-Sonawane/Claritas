import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, MapPin, PlusCircle,
  Sparkles, Code2, LogOut, Bell, User, CheckCircle
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import ProfileModal from '../../components/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import './FacultyLayout.css';

const facultyNavLinks = [
  { path: '/faculty', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/faculty/classes', label: 'My Classes', icon: BookOpen },
  { path: '/faculty/grading', label: 'Grading Queue', icon: CheckSquare },
  { path: '/faculty/attendance', label: 'Attendance', icon: MapPin },
  { path: '/faculty/assignments', label: 'Assignments', icon: PlusCircle },
  { path: '/faculty/compiler', label: 'Sandbox', icon: Code2 },
  { path: '/faculty/ai', label: 'AI Study Hub', icon: Sparkles },
];

export default function FacultyLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  return (
    <div className="faculty-layout">
      {/* ── Top Bar ── */}
      <header className="faculty-topbar">
        <div className="faculty-topbar-left">
          <Link to="/faculty" className="faculty-brand">
            <div className="faculty-logo-box">C</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="faculty-brand-title">
                Claritas <span className="faculty-badge">Faculty</span>
              </h2>
            </div>
          </Link>
        </div>

        <div className="faculty-topbar-right">
          <div className="faculty-quick-actions">
            <Link to="/faculty/grading" className="faculty-action-chip">
              <CheckSquare size={15} /> Grade Submissions (18)
            </Link>
            <Link to="/faculty/attendance" className="faculty-action-chip">
              <CheckCircle size={15} /> Mark Attendance
            </Link>
          </div>

          <button 
            onClick={logout} 
            className="btn-outline btn-sm danger" 
            title="Sign Out" 
            style={{ borderColor: 'rgba(248, 113, 113, 0.4)', color: 'var(--status-deleted)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>

          <div 
            className="faculty-profile-chip"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ position: 'relative' }}
          >
            <img 
              src={user?.avatarUrl || "https://ui-avatars.com/api/?name=Vikram+Patel&background=0d9488&color=fff"} 
              alt={user?.name || "Dr. Vikram Patel"} 
              className="faculty-avatar" 
            />
            <div className="faculty-profile-info">
              <span className="faculty-name">{user?.name || 'Dr. Vikram Patel'}</span>
              <span className="faculty-dept">{user?.roleName || 'Associate Professor'}</span>
            </div>

            {showUserMenu && (
              <div 
                className="user-menu-dropdown" 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '120%', right: 0, width: 220,
                  background: '#0f172a', border: '1px solid var(--glass-border)',
                  borderRadius: 12, padding: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user?.email}</div>
                </div>
                <button 
                  className="actions-menu-item" 
                  onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', borderRadius: 6 }}
                >
                  <User size={16} /> Profile & Department
                </button>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '4px 0' }} />
                <button className="actions-menu-item danger" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--status-deleted)', cursor: 'pointer', borderRadius: 6 }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* ── Main View Content ── */}
      <main className="faculty-main">
        <div className="faculty-content">
          <PageWrapper locationKey={location.pathname}>
            <Outlet />
          </PageWrapper>
        </div>
      </main>

      {/* ── Floating Bottom Taskbar ── */}
      <nav className="faculty-bottom-taskbar">
        {facultyNavLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`faculty-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="faculty-nav-tooltip">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
