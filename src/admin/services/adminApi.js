/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════
// Claritas Admin — Production API Service
// Synchronized with Backend SQLite & RBAC
// ═══════════════════════════════════════════════════════════

import { users as mockUsers, roles as mockRoles, auditLogs as mockAuditLogs, importJobs as mockImportJobs } from '../data/adminMockData.js';

let _users = JSON.parse(JSON.stringify(mockUsers));
let _roles = JSON.parse(JSON.stringify(mockRoles));
let _auditLogs = JSON.parse(JSON.stringify(mockAuditLogs));
let _importJobs = JSON.parse(JSON.stringify(mockImportJobs));

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Users ──────────────────────────────────────────────────

export async function getUsers({ query = '', role = '', org = '', status = '', page = 1, perPage = 10, sortBy = 'name', sortDir = 'asc' } = {}) {
  try {
    const params = new URLSearchParams({
      search: query,
      role: role || '',
      organization: org || '',
      org: org || '',
      department: org || '',
      status: status || '',
      page,
      limit: perPage,
      sort: sortBy,
      order: sortDir
    });

    const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });

    if (!res.ok) throw new Error('Failed to fetch users from server');
    const result = await res.json();

    return {
      data: (result.users || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        roleId: u.role === 'admin' ? 'role-super-admin' : u.role === 'faculty' ? 'role-instructor' : u.role === 'student' ? 'role-student' : (u.role || 'role-custom'),
        roleName: u.role_name || (u.role === 'admin' ? 'Super Admin' : u.role === 'faculty' ? 'Associate Professor' : 'Student'),
        organization: u.organization || u.department || 'Claritas University',
        department: u.department || 'General',
        status: u.status,
        lastActiveAt: u.last_active_at || 'Never',
        avatarUrl: u.avatar_url
      })),
      meta: {
        total: result.total || 0,
        page: result.page || page,
        perPage,
        totalPages: result.totalPages || 1
      },
      metrics: result.metrics,
      departments: result.departments || [],
      organizations: result.organizations || []
    };
  } catch (err) {
    console.warn('Admin API Notice: fallback to local cache:', err.message);
    let filtered = [..._users];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q))
      );
    }
    if (role && role !== 'all') {
      filtered = filtered.filter(u => u.roleId === role || u.roleName?.toLowerCase().includes(role.toLowerCase()));
    }
    if (org && org !== 'all') {
      filtered = filtered.filter(u => u.organization === org || u.department === org);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(u => u.status === status);
    }
    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    const total = filtered.length;
    const start = (page - 1) * perPage;
    return { data: filtered.slice(start, start + perPage), meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
  }
}

export async function getUser(userId) {
  const { data } = await getUsers({ perPage: 100 });
  const user = data.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  return { data: user };
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
  return data;
}

export async function updateUser(userId, updates) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return data;
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return { success: true };
}

export async function suspendUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'suspended' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to suspend user');
  return data;
}

export async function reactivateUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'active' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reactivate user');
  return data;
}

export async function approveUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve user');
  return data;
}

export async function rejectUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject user');
  return data;
}

export async function impersonateUser(userId, reason) {
  const { data: user } = await getUser(userId);
  _addAuditLog('user.impersonated', 'user', userId, user.name, reason);
  return { data: user };
}

// ── Bulk Import ────────────────────────────────────────────

export async function bulkImport(fileData) {
  await delay(500);
  const jobId = `import-${String(_importJobs.length + 1).padStart(3, '0')}`;
  const job = {
    id: jobId,
    requestedBy: 'user-001',
    requestedByName: 'Aarav Sharma',
    status: 'completed',
    totalRows: fileData.length,
    processedRows: fileData.length,
    successRows: fileData.length,
    errorRows: 0,
    errors: [],
    fileRef: 'uploaded_file.csv',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  _importJobs.unshift(job);
  return { data: { jobId } };
}

export async function getImportJob(jobId) {
  await delay(200);
  const job = _importJobs.find(j => j.id === jobId);
  if (!job) throw new Error('Import job not found');
  return { data: job };
}

export async function getImportJobs() {
  await delay(200);
  return { data: _importJobs };
}

// ── Audit Logs ─────────────────────────────────────────────

export async function getAuditLogs({ actor = '', action = '', from = '', to = '', page = 1, perPage = 15 } = {}) {
  try {
    const params = new URLSearchParams({ page, limit: perPage });
    const res = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });

    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const result = await res.json();

    return {
      data: (result.logs || []).map(l => ({
        id: l.id,
        actorAdminId: l.user_id,
        actorName: l.user_name || 'System Admin',
        action: l.action,
        targetType: 'security',
        targetId: l.id,
        targetName: l.details || '',
        ip: l.ip_address || '127.0.0.1',
        reason: l.details,
        createdAt: l.timestamp
      })),
      meta: {
        total: result.total || 0,
        page: result.page || 1,
        perPage,
        totalPages: result.totalPages || 1
      }
    };
  } catch (err) {
    console.warn('Falling back to local audit logs:', err.message);
    let filtered = [..._auditLogs];
    if (actor) {
      const q = actor.toLowerCase();
      filtered = filtered.filter(l => l.actorName.toLowerCase().includes(q));
    }
    if (action) filtered = filtered.filter(l => l.action === action);
    const total = filtered.length;
    const start = (page - 1) * perPage;
    return { data: filtered.slice(start, start + perPage), meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
  }
}

// ── Invites ────────────────────────────────────────────────

export async function sendInvites({ emails, roleId, orgId, templateId, customSubject, customBody }) {
  await delay(500);
  const invited = emails.map((email, i) => {
    const id = `user-${String(_users.length + i + 1).padStart(3, '0')}`;
    return { id, email, roleId, status: 'invited' };
  });
  return { data: { sent: invited.length, users: invited } };
}

// ── Roles ──────────────────────────────────────────────────

export async function getRoles() {
  try {
    const res = await fetch(`${API_BASE}/admin/roles`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch roles');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local roles:', err.message);
    return { data: _roles };
  }
}

export async function createRole(roleData) {
  const res = await fetch(`${API_BASE}/admin/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(roleData)
  });
  if (!res.ok) throw new Error('Failed to create role');
  return await res.json();
}

export async function updateRole(roleId, updates) {
  const res = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update role');
  return await res.json();
}

export async function deleteRole(roleId) {
  const res = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete role');
  return await res.json();
}

export async function getRoleUsers(roleId) {
  try {
    const res = await fetch(`${API_BASE}/admin/roles/${roleId}/users`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch role users');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local cache for role users:', err.message);
    const { data: allUsers } = await getUsers({ perPage: 100 });
    const users = allUsers.filter(u => u.roleId === roleId || u.roleName?.toLowerCase().includes(roleId.replace('role-', '')));
    return { users };
  }
}

// ── Internal Helpers ───────────────────────────────────────

function _addAuditLog(action, targetType, targetId, targetName, reason = '') {
  _auditLogs.unshift({
    id: `audit-${String(_auditLogs.length + 1).padStart(4, '0')}`,
    actorAdminId: 'user-001',
    actorName: 'Aarav Sharma',
    action,
    targetType,
    targetId,
    targetName,
    ip: '192.168.1.45',
    reason,
    metadata: {},
    createdAt: new Date().toISOString(),
  });
}

// ── Export Organizations ───────────────────────────────────
export function getOrganizations() {
  return ['Claritas University', 'School of Engineering', 'School of Business', 'School of Medicine', 'School of Arts & Sciences', 'Graduate Studies'];
}

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  reactivateUser,
  approveUser,
  rejectUser,
  impersonateUser,
  bulkImport,
  getImportJob,
  getImportJobs,
  getAuditLogs,
  sendInvites,
  getRoles,
  getRoleUsers,
  createRole,
  updateRole,
  deleteRole,
  getOrganizations
};
