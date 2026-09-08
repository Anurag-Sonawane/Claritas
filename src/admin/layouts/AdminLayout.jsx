import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, FileText, Settings,
  Search, Bell, Plus, LogOut, User, BookOpen,
  CheckCircle, CheckSquare, Award, BarChart3, Presentation, Users2, Sparkles, Code2
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import ProfileModal from '../../components/ProfileModal.jsx';
import ImpersonationBanner from '../components/ImpersonationBanner.jsx';
import useImpersonation from '../hooks/useImpersonation.js';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-tokens.css';
import './AdminLayout.css';

const navLinks = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/assessments', label: 'Assessments', icon: CheckCircle },
  { path: '/admin/grading', label: 'Grading Queue', icon: CheckSquare },
  { path: '/admin/certificates', label: 'Certificates', icon: Award },
  { path: '/admin/analytics/engagement', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/reports', label: 'Report Builder', icon: Presentation },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/roles', label: 'Roles', icon: Shield },
  { path: '/admin/compiler', label: 'Sandbox', icon: Code2 },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/admin/ai', label: 'AI Operations', icon: Sparkles },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const impersonation = useImpersonation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`admin-layout ${impersonation.impersonating ? 'impersonating' : ''}`}>
      <ImpersonationBanner
        user={impersonation.impersonating}
        onExit={impersonation.exitImpersonation}
      />

      {/* ── Main Content ── */}
      <div className="admin-main">
        {/* ── Top Bar ── */}
        <header className="admin-topbar glass">
          <div className="topbar-left">
            <Link to="/admin" className="topbar-brand" style={{ textDecoration: 'none' }}>
              <div className="topbar-logo">C</div>
              <div className="topbar-brand-text">
                <h2 className="topbar-brand-name">Claritas</h2>
                <span className="topbar-brand-sub">Admin Panel</span>
              </div>
            </Link>

            <div className="topbar-search">
              <Search size={16} className="topbar-search-icon" />
              <input type="text" placeholder="Search users, courses, settings..." />
              <span className="topbar-search-kbd">⌘K</span>
            </div>
          </div>

          <div className="topbar-right">
            <Link to="/admin/users" state={{ openAdd: true }} className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <Plus size={16} /> Invite User
            </Link>

            <button className="topbar-icon-btn" title="Notifications">
              <Bell size={20} />
              <span className="topbar-notif-dot" />
            </button>

            <button onClick={logout} className="btn-outline btn-sm danger" title="Sign Out" style={{ borderColor: 'rgba(248, 113, 113, 0.4)', color: 'var(--status-deleted)', marginLeft: '8px' }}>
              <LogOut size={16} /> Sign Out
            </button>

            <div
              className="topbar-avatar-group"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img src={user?.avatarUrl || user?.avatar_url || "https://ui-avatars.com/api/?name=Admin&background=f87171&color=fff"} alt={user?.name} className="topbar-avatar" />
              <div className="topbar-avatar-info">
                <span className="topbar-avatar-name">{user?.name}</span>
                <span className="topbar-avatar-role">{user?.roleName}</span>
              </div>

              {showUserMenu && (
                <div className="user-menu-dropdown" onClick={e => e.stopPropagation()}>
                  <button className="actions-menu-item" onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                    <User size={16} /> My Profile
                  </button>
                  <Link to="/admin/settings" className="actions-menu-item" style={{ textDecoration: 'none', color: 'var(--foreground)' }} onClick={() => setShowUserMenu(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="actions-menu-divider" />
                  <Link to="/" className="actions-menu-item" style={{ textDecoration: 'none', color: 'var(--foreground)' }} onClick={() => setShowUserMenu(false)}>
                    <LayoutDashboard size={16} /> Student Dashboard
                  </Link>
                  <div className="actions-menu-divider" />
                  <button className="actions-menu-item danger" onClick={logout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile Edit Modal */}
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

        {/* ── Page Content ── */}
        <main className="admin-content">
          <PageWrapper locationKey={location.pathname}>
            <Outlet context={{ impersonation }} />
          </PageWrapper>
        </main>
        {/* ── Floating Bottom Taskbar ── */}
        <nav className="admin-bottom-taskbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`admin-nav-link ${active ? 'active' : ''}`}
                title={link.label}
              >
                <Icon size={20} />
                <span className="admin-nav-tooltip">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Impersonation Reason Prompt */}
      {impersonation.showReasonPrompt && (
        <ImpersonationReasonModal
          user={impersonation.pendingUser}
          onConfirm={impersonation.confirmImpersonation}
          onCancel={impersonation.cancelImpersonation}
        />
      )}
    </div>
  );
}

function ImpersonationReasonModal({ user, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-container modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Impersonate User</h2>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.9rem' }}>
            You are about to view the platform as <strong style={{ color: 'var(--foreground)' }}>{user?.name}</strong>.
            Please provide a reason — it will be recorded in the audit log.
          </p>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.88rem' }}>
            Reason <span style={{ color: 'var(--primary)' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g., Investigating support ticket #1234..."
            rows={3}
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--admin-input-bg)',
              border: '1px solid var(--admin-input-border)', borderRadius: 'var(--admin-input-radius)',
              color: 'var(--foreground)', fontSize: '0.88rem', resize: 'vertical', outline: 'none',
            }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel} style={{
            background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--muted)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            style={{ opacity: !reason.trim() ? 0.4 : 1 }}
          >
            Start Impersonation
          </button>
        </div>
      </div>
    </div>
  );
}
