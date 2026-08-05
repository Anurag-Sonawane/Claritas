// ═══════════════════════════════════════════════════════════
// Claritas Admin — Mock API Service
// Simulates backend API with in-memory data + latency
// ═══════════════════════════════════════════════════════════

import { users as mockUsers, roles as mockRoles, auditLogs as mockAuditLogs, importJobs as mockImportJobs } from '../data/adminMockData.js';

// In-memory mutable copies
let _users = JSON.parse(JSON.stringify(mockUsers));
let _roles = JSON.parse(JSON.stringify(mockRoles));
let _auditLogs = JSON.parse(JSON.stringify(mockAuditLogs));
let _importJobs = JSON.parse(JSON.stringify(mockImportJobs));

// Simulate network latency
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Users ──────────────────────────────────────────────────

export async function getUsers({ query = '', role = '', org = '', status = '', page = 1, perPage = 10, sortBy = 'name', sortDir = 'asc' } = {}) {
  try {
    const params = new URLSearchParams({ query, role, org, status, page, perPage, sortBy, sortDir });
    const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local cache:', err);
    let filtered = [..._users];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
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

export async function deleteUser(userId, hard = false) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return { success: true };
}

export async function suspendUser(userId, reason = '') {
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
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve user');
  return data;
}

export async function rejectUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/reject`, {
    method: 'PATCH',
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
    status: 'processing',
    totalRows: fileData.length,
    processedRows: 0,
    successRows: 0,
    errorRows: 0,
    errors: [],
    fileRef: 'uploaded_file.csv',
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  _importJobs.unshift(job);
  _addAuditLog('user.bulk_imported', 'import_job', jobId, `${fileData.length} rows`);

  // Simulate processing
  setTimeout(() => {
    const j = _importJobs.find(x => x.id === jobId);
    if (j) {
      j.processedRows = j.totalRows;
      j.successRows = j.totalRows - 1;
      j.errorRows = 1;
      j.errors = [{ row: 3, field: 'email', message: 'Duplicate email detected' }];
      j.status = 'completed';
      j.completedAt = new Date().toISOString();
    }
  }, 3000);

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
  await delay(250);

  let filtered = [..._auditLogs];

  if (actor) {
    const q = actor.toLowerCase();
    filtered = filtered.filter(l => l.actorName.toLowerCase().includes(q));
  }
  if (action) filtered = filtered.filter(l => l.action === action);
  if (from) filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(from));
  if (to) filtered = filtered.filter(l => new Date(l.createdAt) <= new Date(to));

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);

  return { data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
}

// ── Invites ────────────────────────────────────────────────

export async function sendInvites({ emails, roleId, orgId, templateId, customSubject, customBody }) {
  await delay(500);
  const invited = emails.map((email, i) => {
    const id = `user-${String(_users.length + i + 1).padStart(3, '0')}`;
    return { id, email, roleId, status: 'invited' };
  });
  invited.forEach(u => {
    _addAuditLog('user.invited', 'user', u.id, u.email);
  });
  return { data: { sent: invited.length, users: invited } };
}

// ── Roles ──────────────────────────────────────────────────

export async function getRoles() {
  await delay(200);
  return { data: _roles };
}

export async function createRole(roleData) {
  await delay(400);
  const id = `role-${Date.now()}`;
  const newRole = {
    id,
    ...roleData,
    isSystem: false,
    userCount: 0,
    createdAt: new Date().toISOString(),
    colorVar: '--role-custom',
  };
  _roles.push(newRole);
  _addAuditLog('role.created', 'role', id, roleData.name);
  return { data: newRole };
}

export async function updateRole(roleId, updates) {
  await delay(350);
  const idx = _roles.findIndex(r => r.id === roleId);
  if (idx === -1) throw new Error('Role not found');
  if (_roles[idx].isSystem) throw new Error('Cannot modify system role');
  _roles[idx] = { ..._roles[idx], ...updates };
  _addAuditLog('role.updated', 'role', roleId, _roles[idx].name);
  return { data: _roles[idx] };
}

export async function deleteRole(roleId) {
  await delay(300);
  const idx = _roles.findIndex(r => r.id === roleId);
  if (idx === -1) throw new Error('Role not found');
  if (_roles[idx].isSystem) throw new Error('Cannot delete system role');
  _roles.splice(idx, 1);
  return { success: true };
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

// ── Export Organizations (for filter dropdowns) ────────────
export function getOrganizations() {
  return ['Claritas University', 'School of Engineering', 'School of Business', 'School of Medicine', 'School of Arts & Sciences', 'Graduate Studies'];
}
