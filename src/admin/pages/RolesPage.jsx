/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, Edit, Trash2, Save, X, Users, Lock, Check,
  Search, ExternalLink, Info, Sliders, RefreshCw, AlertCircle
} from 'lucide-react';
import * as api from '../services/adminApi.js';
import { PERMISSIONS_CATALOG } from '../data/adminMockData.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import './RolesPage.css';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalTab, setModalTab] = useState('users');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const result = await api.getRoles();
      setRoles(result.data || []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (roleId) => {
    if (confirm('Delete this custom role? Users with this role will need to be reassigned.')) {
      try {
        await api.deleteRole(roleId);
        showToast('Role deleted successfully');
        fetchRoles();
      } catch (err) {
        alert(err.message || 'Failed to delete role');
      }
    }
  };

  const openRoleManager = (role, tab = 'users') => {
    setSelectedRole(role);
    setModalTab(tab);
  };

  const categories = [...new Set(PERMISSIONS_CATALOG.map(p => p.category))];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>
            <Shield size={24} style={{ color: 'var(--secondary)' }} />
            Roles & Permissions
            <span className="count-badge">{roles.length}</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
            Manage platform permissions, inspect assigned users, and configure role access rules.
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Custom Role
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          marginBottom: 20,
          borderRadius: 8,
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          color: 'var(--status-active)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Check size={16} /> {feedback}
        </div>
      )}

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--admin-gutter)', marginBottom: 32 }}>
        {roles.map(role => (
          <div
            key={role.id}
            className="surface role-card"
            style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
            onClick={() => openRoleManager(role, 'users')}
          >
            {/* Header */}
            <div className="role-card-header" style={{
              background: `linear-gradient(135deg, var(${role.colorVar}-bg, rgba(167,139,250,0.12)), transparent)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `var(${role.colorVar}-bg, rgba(167,139,250,0.14))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--glass-border)'
                }}>
                  {role.isSystem ? <Lock size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} /> : <Shield size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{role.name}</h3>
                  <span style={{
                    fontSize: '0.68rem',
                    color: role.isSystem ? 'var(--secondary)' : 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                  }}>
                    {role.isSystem ? 'System Protected Role' : 'Custom Role'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <button
                  className="actions-trigger"
                  title="Manage Role & Permissions"
                  style={{
                    width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8,
                    color: 'var(--foreground)', cursor: 'pointer'
                  }}
                  onClick={() => openRoleManager(role, 'permissions')}
                >
                  <Edit size={14} />
                </button>
                {!role.isSystem ? (
                  <button
                    className="actions-trigger"
                    title="Delete Role"
                    style={{
                      width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8,
                      color: 'var(--status-deleted)', cursor: 'pointer'
                    }}
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <div
                    title="Core platform role"
                    style={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--muted)'
                    }}
                  >
                    <Lock size={14} />
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="role-card-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5, minHeight: 40 }}>
                {role.description}
              </p>

              {/* Users Trigger Button */}
              <div
                className="role-users-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  openRoleManager(role, 'users');
                }}
                title="Click to inspect all assigned users"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} style={{ color: 'var(--secondary)' }} />
                  <span style={{ fontSize: '0.88rem', color: 'var(--foreground)', fontWeight: 600 }}>
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'} assigned
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  Check Users →
                </span>
              </div>

              {/* Permission Summary */}
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Permissions ({role.permissions.length}/{PERMISSIONS_CATALOG.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                {categories.map(cat => {
                  const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat);
                  const activeCount = catPerms.filter(p => role.permissions.includes(p.key)).length;
                  if (activeCount === 0) return null;
                  return (
                    <span key={cat} style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: activeCount === catPerms.length ? 'var(--status-active-bg)' : 'rgba(255,255,255,0.04)',
                      color: activeCount === catPerms.length ? 'var(--status-active)' : 'var(--muted)',
                      fontSize: '0.72rem', fontWeight: 500,
                    }}>
                      {cat} {activeCount}/{catPerms.length}
                    </span>
                  );
                })}
              </div>

              {/* Card Action Footer */}
              <div className="role-card-actions">
                <button
                  className="btn-secondary"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '9px 16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--glass-border)',
                    borderRadius: 8, color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRoleManager(role, 'users');
                  }}
                >
                  <Shield size={14} style={{ color: 'var(--secondary)' }} /> Manage Role & Check Users
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Management & Assigned Users Modal */}
      {selectedRole && (
        <RoleManagerModal
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          role={selectedRole}
          initialTab={modalTab}
          onSuccess={() => {
            fetchRoles();
            showToast(`Role "${selectedRole.name}" updated successfully`);
          }}
        />
      )}

      {/* Create Custom Role Modal */}
      <RoleEditorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        role={null}
        onSuccess={() => {
          fetchRoles();
          showToast('Custom role created successfully');
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Role Manager Modal: Assigned Users + Permissions Matrix + Info
// ═══════════════════════════════════════════════════════════
function RoleManagerModal({ isOpen, onClose, role, initialTab = 'users', onSuccess }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permissions state
  const [permissions, setPermissions] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions([...role.permissions]);
      loadRoleUsers();
    }
  }, [role, isOpen]);

  const loadRoleUsers = async () => {
    if (!role) return;
    setLoadingUsers(true);
    try {
      const res = await api.getRoleUsers(role.id);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load role users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [users, userQuery, statusFilter]);

  const togglePerm = (key) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleCategory = (cat) => {
    const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat).map(p => p.key);
    const allActive = catPerms.every(k => permissions.includes(k));
    if (allActive) {
      setPermissions(prev => prev.filter(k => !catPerms.includes(k)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...catPerms])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateRole(role.id, {
        name: role.isSystem ? role.name : name,
        description,
        permissions
      });
      setSaveSuccess(true);
      onSuccess?.();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert(err.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(PERMISSIONS_CATALOG.map(p => p.category))];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `var(${role.colorVar}-bg, rgba(167,139,250,0.15))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {role.isSystem ? <Lock size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} /> : <Shield size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} />}
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{role.name}</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {role.isSystem ? 'System Protected Role' : 'Custom Configured Role'} • {users.length} assigned {users.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>
      }
      size="xl"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {saveSuccess && (
              <span style={{ color: 'var(--status-active)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <Check size={16} /> Changes saved successfully!
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{
              background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--muted)',
              padding: '9px 18px', borderRadius: 8, cursor: 'pointer'
            }}>
              Close
            </button>
            {activeTab !== 'users' && (
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="role-modal-tabs">
        <button
          className={`role-modal-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Assigned Users ({users.length})
        </button>
        <button
          className={`role-modal-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Shield size={16} /> Permissions Matrix ({permissions.length}/{PERMISSIONS_CATALOG.length})
        </button>
        <button
          className={`role-modal-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Info size={16} /> Role Details
        </button>
      </div>

      {/* ── Tab 1: Assigned Users ── */}
      {activeTab === 'users' && (
        <div>
          <div className="role-users-header-bar">
            <div className="role-users-search-box">
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search assigned users by name, email, department..."
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                className="form-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: 140, padding: '9px 12px', fontSize: '0.85rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <button
                className="btn-secondary"
                onClick={loadRoleUsers}
                title="Refresh user list"
                style={{
                  padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#131b2e', border: '1px solid var(--admin-input-border)', borderRadius: 8, color: 'var(--foreground)', cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} className={loadingUsers ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: 8, display: 'inline-block' }} />
              <div>Loading users holding this role...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--muted)'
            }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
                {users.length === 0 ? 'No users assigned to this role' : 'No users match the search filter'}
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: 360, margin: '0 auto 16px', lineHeight: 1.5 }}>
                {users.length === 0
                  ? `Users can be assigned to the "${role.name}" role from the Users management panel.`
                  : 'Try adjusting your search criteria or clearing status filters.'}
              </p>
              {users.length === 0 && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    navigate('/admin/users');
                  }}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Go to Users Panel
                </button>
              )}
            </div>
          ) : (
            <div className="role-users-list">
              <div style={{
                padding: '10px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)',
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'flex', justifyContent: 'space-between'
              }}>
                <span>User ({filteredUsers.length})</span>
                <span style={{ display: 'flex', gap: 60, paddingRight: 32 }}>
                  <span>Status</span>
                  <span>Action</span>
                </span>
              </div>
              {filteredUsers.map(u => (
                <div key={u.id} className="role-user-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2ec4f1&color=fff`}
                      alt={u.name}
                      className="role-user-avatar"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`; }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {u.email} • <span style={{ color: 'rgba(247,248,250,0.8)' }}>{u.department || u.organization}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <StatusBadge status={u.status} />
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(46, 196, 241, 0.08)', border: '1px solid rgba(46, 196, 241, 0.25)',
                        color: 'var(--secondary)', borderRadius: 6, cursor: 'pointer'
                      }}
                      onClick={() => {
                        onClose();
                        navigate(`/admin/users?search=${encodeURIComponent(u.email)}`);
                      }}
                      title="Inspect user in Users management table"
                    >
                      <span>Manage</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Permissions Matrix ── */}
      {activeTab === 'permissions' && (
        <div>
          {/* Header Actions & Notice */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
            padding: '12px 16px', background: 'rgba(46, 196, 241, 0.06)', border: '1px solid rgba(46, 196, 241, 0.2)',
            borderRadius: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={18} style={{ color: 'var(--secondary)' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
                  {role.isSystem ? 'System Role Permission Management' : 'Custom Role Permission Management'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Toggle the specific permissions granted to any account holding the {role.name} role.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => setPermissions(PERMISSIONS_CATALOG.map(p => p.key))}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                  color: 'var(--foreground)', fontSize: '0.78rem', padding: '6px 12px', borderRadius: 6, cursor: 'pointer'
                }}
              >
                Select All
              </button>
              <button
                className="btn-secondary"
                onClick={() => setPermissions([])}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                  color: 'var(--muted)', fontSize: '0.78rem', padding: '6px 12px', borderRadius: 6, cursor: 'pointer'
                }}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Categories Matrix */}
          <div className="role-perms-scroll">
            {categories.map(cat => {
              const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat);
              const allActive = catPerms.every(p => permissions.includes(p.key));
              const someActive = catPerms.some(p => permissions.includes(p.key)) && !allActive;
              const activeCount = catPerms.filter(p => permissions.includes(p.key)).length;

              return (
                <div key={cat} className="role-perm-category-card">
                  <div
                    className="role-perm-category-header"
                    onClick={() => toggleCategory(cat)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: allActive ? 'var(--secondary)' : someActive ? 'rgba(46,196,241,0.3)' : '#131b2e',
                        border: `1px solid ${allActive || someActive ? 'var(--secondary)' : 'var(--admin-input-border)'}`,
                      }}>
                        {(allActive || someActive) && <Check size={13} style={{ color: '#fff' }} />}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{cat}</span>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: 12,
                      background: activeCount === catPerms.length ? 'var(--status-active-bg)' : 'rgba(255,255,255,0.05)',
                      color: activeCount === catPerms.length ? 'var(--status-active)' : 'var(--muted)',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {activeCount} of {catPerms.length} enabled
                    </span>
                  </div>

                  <div className="role-perm-items-grid">
                    {catPerms.map(perm => {
                      const isChecked = permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="role-perm-item"
                          style={{
                            background: isChecked ? 'rgba(46, 196, 241, 0.05)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(46, 196, 241, 0.2)' : 'transparent'}`
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(perm.key)}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: isChecked ? 600 : 400, color: isChecked ? 'var(--foreground)' : 'var(--muted)' }}>
                              {perm.label}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(247,248,250,0.4)', fontFamily: 'monospace' }}>
                              {perm.key}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 3: Role Details ── */}
      {activeTab === 'info' && (
        <div style={{ padding: '10px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Role Name {role.isSystem && <span style={{ color: 'var(--secondary)', textTransform: 'none' }}>(System Protected)</span>}
              </label>
              <input
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={role.isSystem}
                placeholder="Role name"
                style={{ opacity: role.isSystem ? 0.7 : 1 }}
              />
              {role.isSystem && (
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                  System role name cannot be renamed to ensure system-level authentication integrity.
                </div>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Role Identifier
              </label>
              <input
                className="form-input"
                value={role.id}
                disabled
                style={{ opacity: 0.6, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Description & Operational Scope
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the duties and privileges of users with this role..."
              style={{ resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div style={{
            padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
            borderRadius: 8, fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>Role Specifications:</div>
            <div>• Current active members: <strong style={{ color: 'var(--foreground)' }}>{users.length}</strong></div>
            <div>• Active permissions: <strong style={{ color: 'var(--foreground)' }}>{permissions.length}</strong> of {PERMISSIONS_CATALOG.length} platform capabilities</div>
            <div>• Role type: {role.isSystem ? 'Immutable core engine role' : 'Custom organization role'}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// Create Custom Role Modal
// ═══════════════════════════════════════════════════════════
function RoleEditorModal({ isOpen, onClose, role, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions([...role.permissions]);
    } else {
      setName('');
      setDescription('');
      setPermissions([]);
    }
  }, [role, isOpen]);

  const togglePerm = (key) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleCategory = (cat) => {
    const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat).map(p => p.key);
    const allActive = catPerms.every(k => permissions.includes(k));
    if (allActive) {
      setPermissions(prev => prev.filter(k => !catPerms.includes(k)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...catPerms])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (role) {
        await api.updateRole(role.id, { name, description, permissions });
      } else {
        await api.createRole({ name, description, permissions });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(PERMISSIONS_CATALOG.map(p => p.category))];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Edit Role' : 'Create Custom Role'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--muted)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer'
          }}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim() || saving} style={{ opacity: (!name.trim() || saving) ? 0.4 : 1 }}>
            <Save size={16} /> {saving ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Curriculum Reviewer" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
          <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this role..." />
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Permissions ({permissions.length}/{PERMISSIONS_CATALOG.length})</span>
        <button
          onClick={() => permissions.length === PERMISSIONS_CATALOG.length ? setPermissions([]) : setPermissions(PERMISSIONS_CATALOG.map(p => p.key))}
          style={{
            background: 'transparent', border: 'none', color: 'var(--secondary)',
            fontSize: '0.78rem', cursor: 'pointer', padding: 0, fontWeight: 500,
          }}
        >
          {permissions.length === PERMISSIONS_CATALOG.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {categories.map(cat => {
          const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat);
          const allActive = catPerms.every(p => permissions.includes(p.key));
          const someActive = catPerms.some(p => permissions.includes(p.key)) && !allActive;

          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer',
                  borderBottom: '1px solid var(--table-border)', marginBottom: 8,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: allActive ? 'var(--secondary)' : someActive ? 'rgba(46,196,241,0.3)' : '#131b2e',
                  border: `1px solid ${allActive || someActive ? 'var(--secondary)' : 'var(--admin-input-border)'}`,
                }}>
                  {(allActive || someActive) && <Check size={12} style={{ color: '#fff' }} />}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>({catPerms.filter(p => permissions.includes(p.key)).length}/{catPerms.length})</span>
              </div>
              <div style={{ paddingLeft: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {catPerms.map(perm => (
                  <label
                    key={perm.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                      cursor: 'pointer', fontSize: '0.85rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.key)}
                      onChange={() => togglePerm(perm.key)}
                      style={{ accentColor: 'var(--secondary)', width: 15, height: 15 }}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
