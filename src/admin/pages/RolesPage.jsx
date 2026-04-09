import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Save, X, Users, Lock, Check } from 'lucide-react';
import * as api from '../services/adminApi.js';
import { PERMISSIONS_CATALOG } from '../data/adminMockData.js';
import Modal from '../components/Modal.jsx';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const result = await api.getRoles();
    setRoles(result.data);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleDelete = async (roleId) => {
    if (confirm('Delete this custom role? Users with this role will need to be reassigned.')) {
      await api.deleteRole(roleId);
      fetchRoles();
    }
  };

  const categories = [...new Set(PERMISSIONS_CATALOG.map(p => p.category))];

  return (
    <div>
      <div className="admin-page-header">
        <h1>
          <Shield size={24} style={{ color: 'var(--secondary)' }} />
          Roles & Permissions
          <span className="count-badge">{roles.length}</span>
        </h1>
        <div className="admin-page-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Custom Role
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--admin-gutter)', marginBottom: 32 }}>
        {roles.map(role => (
          <div key={role.id} className="surface" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--glass-border)',
              background: `linear-gradient(135deg, var(${role.colorVar}-bg, rgba(167,139,250,0.12)), transparent)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `var(${role.colorVar}-bg, rgba(167,139,250,0.12))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {role.isSystem ? <Lock size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} /> : <Shield size={18} style={{ color: `var(${role.colorVar}, #A78BFA)` }} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{role.name}</h3>
                    {role.isSystem && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Role</span>}
                  </div>
                </div>
                {!role.isSystem && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="actions-trigger" style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => setEditingRole(role)}>
                      <Edit size={14} />
                    </button>
                    <button className="actions-trigger" style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: 'var(--status-deleted)', cursor: 'pointer' }} onClick={() => handleDelete(role.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                {role.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Users size={14} style={{ color: 'var(--muted)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--foreground)' }}>{role.userCount}</strong> users
                </span>
              </div>

              {/* Permission Summary */}
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Permissions ({role.permissions.length}/{PERMISSIONS_CATALOG.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {categories.map(cat => {
                  const catPerms = PERMISSIONS_CATALOG.filter(p => p.category === cat);
                  const activeCount = catPerms.filter(p => role.permissions.includes(p.key)).length;
                  if (activeCount === 0) return null;
                  return (
                    <span key={cat} style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: activeCount === catPerms.length ? 'var(--status-active-bg)' : 'var(--admin-input-bg)',
                      color: activeCount === catPerms.length ? 'var(--status-active)' : 'var(--muted)',
                      fontSize: '0.72rem', fontWeight: 500,
                    }}>
                      {cat} {activeCount}/{catPerms.length}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <RoleEditorModal
        isOpen={showCreateModal || !!editingRole}
        onClose={() => { setShowCreateModal(false); setEditingRole(null); }}
        role={editingRole}
        onSuccess={fetchRoles}
      />
    </div>
  );
}

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
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Content Reviewer" />
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
                background: allActive ? 'var(--secondary)' : someActive ? 'rgba(46,196,241,0.3)' : 'var(--admin-input-bg)',
                border: `1px solid ${allActive || someActive ? 'var(--secondary)' : 'var(--admin-input-border)'}`,
              }}>
                {(allActive || someActive) && <Check size={12} style={{ color: '#fff' }} />}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>({catPerms.filter(p => permissions.includes(p.key)).length}/{catPerms.length})</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
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
    </Modal>
  );
}
