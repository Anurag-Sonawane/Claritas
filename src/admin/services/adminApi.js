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

// ── Users ──────────────────────────────────────────────────

export async function getUsers({ query = '', role = '', org = '', status = '', page = 1, perPage = 10, sortBy = 'name', sortDir = 'asc' } = {}) {
  await delay();

  let filtered = [..._users];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.organization.toLowerCase().includes(q)
    );
  }
  if (role) filtered = filtered.filter(u => u.roleId === role);
  if (org) filtered = filtered.filter(u => u.organization === org);
  if (status) filtered = filtered.filter(u => u.status === status);

  // Sort
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
  const data = filtered.slice(start, start + perPage);

  return { data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
}

export async function getUser(userId) {
  await delay(200);
  const user = _users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  return { data: user };
}

export async function createUser(userData) {
  await delay(400);
  const id = `user-${String(_users.length + 1).padStart(3, '0')}`;
  const role = _roles.find(r => r.id === userData.roleId);
  const newUser = {
    id,
    ...userData,
    roleName: role?.name || 'Unknown',
    avatarUrl: `https://i.pravatar.cc/150?u=admin${_users.length + 1}`,
    status: 'invited',
    lastActiveAt: null,
    createdAt: new Date().toISOString(),
    enrollments: [],
    activityTimeline: [],
  };
  _users.unshift(newUser);
  _addAuditLog('user.created', 'user', id, newUser.name);
  return { data: newUser };
}

export async function updateUser(userId, updates) {
  await delay(350);
  const idx = _users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');

  if (updates.roleId) {
    const role = _roles.find(r => r.id === updates.roleId);
    updates.roleName = role?.name || 'Unknown';
  }

  _users[idx] = { ..._users[idx], ...updates };
  _addAuditLog('user.updated', 'user', userId, _users[idx].name);
  return { data: _users[idx] };
}

export async function deleteUser(userId, hard = false) {
  await delay(400);
  const idx = _users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  const name = _users[idx].name;

  if (hard) {
    _users.splice(idx, 1);
  } else {
    _users[idx].status = 'deleted';
  }
  _addAuditLog('user.deleted', 'user', userId, name);
  return { success: true };
}

export async function suspendUser(userId, reason = '') {
  await delay(300);
  const idx = _users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  _users[idx].status = 'suspended';
  _addAuditLog('user.suspended', 'user', userId, _users[idx].name, reason);
  return { data: _users[idx] };
}

export async function reactivateUser(userId) {
  await delay(300);
  const idx = _users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  _users[idx].status = 'active';
  _addAuditLog('user.reactivated', 'user', userId, _users[idx].name);
  return { data: _users[idx] };
}

export async function impersonateUser(userId, reason) {
  await delay(200);
  const user = _users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
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
