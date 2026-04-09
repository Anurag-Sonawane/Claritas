import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Network, ShieldCheck, Key, Webhook, UserX, Activity } from 'lucide-react';
import './SettingsLayout.css';

const SettingsNav = [
  { path: '/admin/settings/integrations', label: 'Integrations', icon: Network },
  { path: '/admin/settings/security', label: 'Security & Auth', icon: ShieldCheck },
  { path: '/admin/settings/api-keys', label: 'API Keys', icon: Key },
  { path: '/admin/settings/webhooks', label: 'Webhooks', icon: Webhook },
  { path: '/admin/settings/gdpr', label: 'Privacy & GDPR', icon: UserX },
  { path: '/admin/health', label: 'System Health & Ops', icon: Activity },
];

export default function SettingsLayout() {
  return (
    <div className="settings-layout">
      {/* Settings Sidebar */}
      <aside className="settings-sidebar surface">
        <h2 className="settings-title">Platform Settings</h2>
        <nav className="settings-nav">
          {SettingsNav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({isActive}) => `settings-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Settings Content Pane */}
      <div className="settings-content">
        <Outlet />
      </div>
    </div>
  );
}
