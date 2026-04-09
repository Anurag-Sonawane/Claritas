import { useState, useEffect } from 'react';
import { X, Eye, UserX, UserCheck, Trash2, Save } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { roles, PERMISSIONS_CATALOG } from '../data/adminMockData.js';
import * as api from '../services/adminApi.js';
import './UserDetailSlideOver.css';

const TABS = ['Profile', 'Enrollments', 'Activity', 'Permissions', 'Audit Log'];

export default function UserDetailSlideOver({ user, onClose, onUpdate, onImpersonate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [userAudit, setUserAudit] = useState([]);

  useEffect(() => {
    if (user) {
      setEditData({ name: user.name, email: user.email, roleId: user.roleId, organization: user.organization, phone: user.phone || '' });
      setActiveTab('Profile');
      // Load audit for this user
      api.getAuditLogs({ actor: '', action: '', page: 1, perPage: 50 }).then(result => {
        setUserAudit(result.data.filter(l => l.targetId === user.id || l.actorAdminId === user.id));
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUser(user.id, editData);
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    await api.suspendUser(user.id, 'Admin action from detail panel');
    onUpdate?.();
    onClose();
  };

  const handleReactivate = async () => {
    await api.reactivateUser(user.id);
    onUpdate?.();
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action uses soft delete with retention.`)) {
      await api.deleteUser(user.id);
      onUpdate?.();
      onClose();
    }
  };

  const userRole = roles.find(r => r.id === user.roleId);

  return (
    <>
      <div className="slideover-backdrop" onClick={onClose} />
      <div className="slideover-panel">
        <button className="slideover-close" onClick={onClose}><X size={16} /></button>

        {/* Header */}
        <div className="slideover-header">
          <div className="slideover-user-header">
            <img src={user.avatarUrl} alt="" className="slideover-avatar" />
            <div className="slideover-user-info">
              <h2>{user.name}</h2>
              <div className="slideover-user-meta">{user.email}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <StatusBadge status={user.status} />
                <span className="role-badge" style={{
                  background: `var(${userRole?.colorVar}-bg, rgba(167,139,250,0.12))`,
                  color: `var(${userRole?.colorVar}, #A78BFA)`,
                }}>{user.roleName}</span>
              </div>
            </div>
          </div>

          <div className="slideover-quick-actions">
            <button className="btn-outline btn-sm" onClick={() => { onImpersonate?.(user); onClose(); }}>
              <Eye size={14} /> Impersonate
            </button>
            {user.status === 'active' ? (
              <button className="btn-outline btn-sm" onClick={handleSuspend}>
                <UserX size={14} /> Suspend
              </button>
            ) : user.status === 'suspended' ? (
              <button className="btn-outline btn-sm" onClick={handleReactivate}>
                <UserCheck size={14} /> Reactivate
              </button>
            ) : null}
            <button className="btn-outline btn-sm" style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--status-deleted)' }} onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="slideover-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`slideover-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="slideover-body">
          {activeTab === 'Profile' && (
            <ProfileTab editData={editData} setEditData={setEditData} onSave={handleSave} saving={saving} user={user} />
          )}
          {activeTab === 'Enrollments' && <EnrollmentsTab enrollments={user.enrollments} />}
          {activeTab === 'Activity' && <ActivityTab timeline={user.activityTimeline} />}
          {activeTab === 'Permissions' && <PermissionsTab roleId={user.roleId} />}
          {activeTab === 'Audit Log' && <AuditTab logs={userAudit} />}
        </div>
      </div>
    </>
  );
}

function ProfileTab({ editData, setEditData, onSave, saving, user }) {
  const change = (key, value) => setEditData(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <div className="form-group">
        <label>Full Name</label>
        <input className="form-input" value={editData.name || ''} onChange={e => change('name', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input className="form-input" type="email" value={editData.email || ''} onChange={e => change('email', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input className="form-input" value={editData.phone || ''} onChange={e => change('phone', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Role</label>
        <select className="form-input" value={editData.roleId || ''} onChange={e => change('roleId', e.target.value)}>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Organization</label>
        <input className="form-input" value={editData.organization || ''} onChange={e => change('organization', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn-primary" onClick={onSave} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: 'var(--background)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>ACCOUNT INFO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '0.85rem' }}>
          <div><span style={{ color: 'var(--muted)' }}>User ID:</span> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id}</span></div>
          <div><span style={{ color: 'var(--muted)' }}>Status:</span> {user.status}</div>
          <div><span style={{ color: 'var(--muted)' }}>Created:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
          <div><span style={{ color: 'var(--muted)' }}>Last Active:</span> {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}</div>
        </div>
      </div>
    </div>
  );
}

function EnrollmentsTab({ enrollments }) {
  if (!enrollments?.length) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No enrollments found.</div>;

  return (
    <div>
      {enrollments.map(e => (
        <div key={e.courseId} className="enrollment-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="enrollment-name">{e.courseName}</span>
            <StatusBadge status={e.status === 'completed' ? 'active' : 'invited'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="enrollment-progress-track" style={{ flex: 1 }}>
              <div
                className="enrollment-progress-fill"
                style={{
                  width: `${e.progress}%`,
                  background: e.progress >= 80 ? 'var(--status-active)' : e.progress >= 40 ? 'var(--secondary)' : 'var(--primary)',
                  boxShadow: `0 0 8px ${e.progress >= 80 ? 'var(--status-active)' : e.progress >= 40 ? 'var(--secondary)' : 'var(--primary)'}`,
                }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: 40 }}>{e.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityTab({ timeline }) {
  if (!timeline?.length) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No activity recorded.</div>;

  const colors = {
    'Logged in': 'var(--status-active)',
    'Logged out': 'var(--muted)',
    'Viewed course': 'var(--secondary)',
    'Submitted assignment': 'var(--primary)',
    'Downloaded resource': 'var(--status-invited)',
    'Updated profile': 'var(--status-suspended)',
    'Completed quiz': 'var(--status-active)',
    'Posted in discussion': 'var(--role-custom)',
  };

  return (
    <div>
      {timeline.map(item => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-dot" style={{ background: colors[item.action] || 'var(--muted)' }} />
          <div className="timeline-content">
            <div className="timeline-action">{item.action}</div>
            {item.detail && <div className="timeline-detail">{item.detail}</div>}
            <div className="timeline-time">{new Date(item.timestamp).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PermissionsTab({ roleId }) {
  const role = roles.find(r => r.id === roleId);
  const permsSet = new Set(role?.permissions || []);
  const categories = [...new Set(PERMISSIONS_CATALOG.map(p => p.category))];

  return (
    <div>
      <div style={{ padding: '12px 16px', background: 'rgba(46, 196, 241, 0.06)', borderRadius: 8, marginBottom: 20, fontSize: '0.85rem', color: 'var(--secondary)' }}>
        Permissions inherited from role: <strong>{role?.name}</strong>
      </div>
      {categories.map(cat => (
        <div key={cat} className="perm-category">
          <div className="perm-category-title">{cat}</div>
          {PERMISSIONS_CATALOG.filter(p => p.category === cat).map(perm => (
            <div key={perm.key} className="perm-item">
              <label>{perm.label}</label>
              <button className={`toggle ${permsSet.has(perm.key) ? 'active' : ''}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AuditTab({ logs }) {
  if (!logs?.length) return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No audit entries for this user.</div>;

  return (
    <div>
      {logs.map(log => (
        <div key={log.id} className="timeline-item">
          <div className="timeline-dot" style={{
            background: log.action.includes('created') ? 'var(--status-active)'
              : log.action.includes('deleted') ? 'var(--status-deleted)'
              : log.action.includes('suspended') ? 'var(--status-suspended)'
              : 'var(--secondary)',
          }} />
          <div className="timeline-content">
            <div className="timeline-action">
              <span style={{ color: 'var(--secondary)' }}>{log.actorName}</span>{' '}
              {log.action.replace(/[._]/g, ' ')}
            </div>
            {log.reason && <div className="timeline-detail">Reason: {log.reason}</div>}
            <div className="timeline-time">{new Date(log.createdAt).toLocaleString()} • IP: {log.ip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
