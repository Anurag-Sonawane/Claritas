import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = express.Router();

// Enforce Admin RBAC for ALL routes in this router
router.use(authenticateToken, requireRole(['admin']));

// ── Admin Users Management ──
router.get('/users', (req, res) => {
  const { role, status, department, search, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;

  let query = 'SELECT id, email, name, role, role_name, department, organization, status, last_active_at, avatar_url, created_at FROM users WHERE 1=1';
  const params = [];

  if (role && role !== 'all') { query += ' AND role = ?'; params.push(role); }
  if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
  if (department && department !== 'all') { query += ' AND department = ?'; params.push(department); }
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const validSortCols = ['name', 'email', 'role', 'status', 'created_at', 'last_active_at'];
  const sortCol = validSortCols.includes(sort) ? sort : 'name';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortCol} ${sortOrder}`;

  const allFiltered = db.prepare(query).all(...params);
  const total = allFiltered.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;
  const paginatedUsers = allFiltered.slice(offset, offset + limitNum);

  // Compute metrics
  const allUsers = db.prepare('SELECT role, status, last_active_at FROM users').all();
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const metrics = {
    totalUsers: allUsers.length,
    activeStudents: allUsers.filter(u => u.role === 'student' && u.status === 'active').length,
    facultyMembers: allUsers.filter(u => u.role === 'faculty').length,
    pendingApprovals: allUsers.filter(u => u.status === 'pending').length,
    suspendedUsers: allUsers.filter(u => u.status === 'suspended').length,
    monthlyActiveUsers: allUsers.filter(u => u.last_active_at && u.last_active_at >= thirtyDaysAgo).length,
  };

  const departments = [...new Set(db.prepare('SELECT department FROM users WHERE department IS NOT NULL').all().map(r => r.department))];

  res.json({
    users: paginatedUsers,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    metrics,
    departments
  });
});

router.post('/users', recordAuditLog('USER_CREATED', req => `Created user ${req.body?.email}`), (req, res) => {
  const { name, email, role, role_name, department, organization, password = 'password' } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const passHash = bcrypt.hashSync(password, 10);
  const resolvedRoleName = role_name || (role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Associate Professor' : 'Student');
  const bg = role === 'admin' ? 'f87171' : role === 'faculty' ? '0d9488' : '2ec4f1';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&rounded=true`;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL, ?)
  `).run(id, email, passHash, name, role, resolvedRoleName, department || 'General', organization || 'Claritas University', avatarUrl);

  const created = db.prepare('SELECT id, email, name, role, role_name, department, status, avatar_url FROM users WHERE id = ?').get(id);
  res.status(201).json(created);
});

router.put('/users/:id', recordAuditLog('USER_UPDATED', req => `Updated user ${req.params.id}`), (req, res) => {
  const { id } = req.params;
  const { name, email, role, role_name, department, organization, status } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      role = COALESCE(?, role),
      role_name = COALESCE(?, role_name),
      department = COALESCE(?, department),
      organization = COALESCE(?, organization),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, email, role, role_name, department, organization, status, id);

  const updated = db.prepare('SELECT id, email, name, role, role_name, department, organization, status, avatar_url FROM users WHERE id = ?').get(id);
  res.json(updated);
});

router.patch('/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true, id, status });
});

router.patch('/users/:id/approve', recordAuditLog('USER_APPROVED', req => `Approved registration for ${req.params.id}`), (req, res) => {
  db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: 'User approved' });
});

router.patch('/users/:id/reject', recordAuditLog('USER_REJECTED', req => `Rejected registration for ${req.params.id}`), (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'User registration rejected and removed' });
});

router.delete('/users/:id', recordAuditLog('USER_DELETED', req => `Deleted user ${req.params.id}`), (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

// ── Admin Audit Logs ──
router.get('/audit-logs', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const logs = db.prepare(`
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC
    LIMIT ? OFFSET ?
  `).all(limitNum, offset);

  res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
});

// ── Admin Courses ──
router.get('/courses', (req, res) => {
  const { query = '', status = '', category = '', page = 1, perPage = 12, sortBy = 'updated_at', sortDir = 'desc' } = req.query;

  let sql = 'SELECT * FROM courses WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (query) { sql += ' AND (title LIKE ? OR code LIKE ? OR description LIKE ?)'; params.push(`%${query}%`, `%${query}%`, `%${query}%`); }

  const validSortCols = ['updated_at', 'created_at', 'title', 'students_count'];
  const sCol = validSortCols.includes(sortBy) ? sortBy : 'updated_at';
  const sDir = sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${sCol} ${sDir}`;

  const allCourses = db.prepare(sql).all(...params);
  const total = allCourses.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(perPage, 10));
  const offset = (pageNum - 1) * limitNum;

  const parsed = allCourses.slice(offset, offset + limitNum).map(c => ({
    ...c,
    modules: c.modules_json ? JSON.parse(c.modules_json) : [],
    tags: c.tags ? JSON.parse(c.tags) : []
  }));

  res.json({ data: parsed, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
});

router.get('/courses/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({
    data: {
      ...course,
      modules: course.modules_json ? JSON.parse(course.modules_json) : [],
      tags: course.tags ? JSON.parse(course.tags) : []
    }
  });
});

router.post('/courses', (req, res) => {
  const { code, title, department = 'Computer Science', description = '', status = 'draft', category = 'Technology', level = 'Beginner', managerId = null, managerName = null } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: 'Code and title are required' });
  }

  const id = `crs-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO courses (id, code, title, department, description, status, category, level, manager_id, manager_name, modules_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)
  `).run(id, code, title, department, description, status, category, level, managerId, managerName, now, now);

  const created = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  res.status(201).json({ data: created });
});

router.put('/courses/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const modulesJson = updates.modules ? JSON.stringify(updates.modules) : course.modules_json;
  const tagsJson = updates.tags ? JSON.stringify(updates.tags) : course.tags;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE courses SET
      title = COALESCE(?, title),
      department = COALESCE(?, department),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      category = COALESCE(?, category),
      level = COALESCE(?, level),
      manager_id = COALESCE(?, manager_id),
      manager_name = COALESCE(?, manager_name),
      modules_json = ?,
      tags = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    updates.title ?? null,
    updates.department ?? null,
    updates.description ?? null,
    updates.status ?? null,
    updates.category ?? null,
    updates.level ?? null,
    updates.managerId ?? null,
    updates.managerName ?? null,
    modulesJson,
    tagsJson,
    now,
    id
  );

  const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  res.json({ data: updated });
});

router.delete('/courses/:id', (req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Course deleted' });
});

// ── Course Versions & Rollback ──
router.get('/courses/:id/versions', (req, res) => {
  const versions = db.prepare('SELECT * FROM course_versions WHERE course_id = ? ORDER BY version DESC').all(req.params.id);
  const parsed = versions.map(v => ({
    id: v.id,
    version: v.version,
    label: v.label,
    author: v.author,
    createdAt: v.created_at,
    changes: JSON.parse(v.changes_json || '[]'),
    snapshot: JSON.parse(v.snapshot_json || '{}')
  }));
  res.json({ data: parsed });
});

router.post('/courses/:id/versions', (req, res) => {
  const { id } = req.params;
  const { label = '', changes = [] } = req.body;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const latestVer = db.prepare('SELECT MAX(version) as max_v FROM course_versions WHERE course_id = ?').get(id)?.max_v || 0;
  const nextVer = latestVer + 1;
  const verId = `v-${id}-${nextVer}`;
  const now = new Date().toISOString();

  const modules = course.modules_json ? JSON.parse(course.modules_json) : [];
  const snapshot = {
    title: course.title,
    modules,
    moduleCount: modules.length,
    lessonCount: modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  };

  db.prepare(`
    INSERT INTO course_versions (id, course_id, version, label, author, changes_json, snapshot_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(verId, id, nextVer, label, req.user.name || 'Admin', JSON.stringify(changes), JSON.stringify(snapshot), now);

  res.status(201).json({
    data: {
      id: verId,
      version: nextVer,
      label,
      author: req.user.name || 'Admin',
      createdAt: now,
      changes,
      snapshot
    }
  });
});

router.post('/courses/:id/rollback', recordAuditLog('COURSE_ROLLBACK', req => `Rolled back course ${req.params.id} to version ${req.body?.versionId}`), (req, res) => {
  const { versionId } = req.body;
  const targetVer = db.prepare('SELECT * FROM course_versions WHERE id = ?').get(versionId);
  if (!targetVer) return res.status(404).json({ error: 'Version snapshot not found' });

  const snapshot = JSON.parse(targetVer.snapshot_json);
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE courses SET
      title = COALESCE(?, title),
      modules_json = ?,
      updated_at = ?
    WHERE id = ?
  `).run(snapshot.title, JSON.stringify(snapshot.modules || []), now, req.params.id);

  res.json({ success: true, message: `Course successfully rolled back to v${targetVer.version}` });
});

// ── Media Library ──
router.get('/media', (req, res) => {
  const { folder, query: search, type } = req.query;
  let sql = 'SELECT * FROM media_library WHERE 1=1';
  const params = [];

  if (folder) { sql += ' AND folder = ?'; params.push(folder); }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }

  sql += ' ORDER BY created_at DESC';
  const items = db.prepare(sql).all(...params);
  const folders = [...new Set(db.prepare('SELECT folder FROM media_library').all().map(m => m.folder))];

  res.json({
    data: items.map(m => ({
      ...m,
      cdnUrl: m.cdn_url,
      thumbnailUrl: m.thumbnail_url,
      usedIn: JSON.parse(m.used_in_json || '[]')
    })),
    folders,
    storage: { used: '1.2 GB', quota: '10 GB' }
  });
});

router.post('/media', (req, res) => {
  const { name, folder = 'Course Assets', type = 'pdf', mime = 'application/pdf', size = 50000, cdnUrl } = req.body;
  const id = `media-${Date.now()}`;
  const now = new Date().toISOString();
  const resolvedUrl = cdnUrl || `https://cdn.claritas.edu/media/${name || 'asset.pdf'}`;

  db.prepare(`
    INSERT INTO media_library (id, name, folder, type, mime, size, cdn_url, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name || 'asset.pdf', folder, type, mime, size, resolvedUrl, req.user.name || 'Admin', now);

  const created = db.prepare('SELECT * FROM media_library WHERE id = ?').get(id);
  res.status(201).json({ data: { ...created, cdnUrl: created.cdn_url, usedIn: [] } });
});

router.delete('/media/:id', (req, res) => {
  db.prepare('DELETE FROM media_library WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Media item deleted' });
});

// ── SCORM Packages ──
router.get('/scorm', (req, res) => {
  const { courseId } = req.query;
  let sql = 'SELECT * FROM scorm_packages WHERE 1=1';
  const params = [];
  if (courseId) { sql += ' AND course_id = ?'; params.push(courseId); }

  sql += ' ORDER BY created_at DESC';
  const packages = db.prepare(sql).all(...params);

  res.json({
    data: packages.map(p => ({
      id: p.id,
      courseId: p.course_id,
      fileName: p.file_name,
      title: p.title,
      version: p.version,
      type: p.type,
      status: p.status,
      scoCount: p.sco_count,
      fileSize: p.file_size,
      errors: JSON.parse(p.errors_json || '[]'),
      warnings: JSON.parse(p.warnings_json || '[]'),
      uploadedAt: p.created_at,
      validatedAt: p.validated_at
    }))
  });
});

router.post('/scorm/upload', (req, res) => {
  const { courseId, fileName = 'package.zip', fileSize = 50000 } = req.body;
  const id = `scorm-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO scorm_packages (id, course_id, file_name, title, version, type, status, sco_count, file_size, errors_json, warnings_json, created_at, validated_at)
    VALUES (?, ?, ?, ?, '1.0', 'SCORM 2004', 'valid', 4, ?, '[]', '[]', ?, ?)
  `).run(id, courseId || null, fileName, fileName.replace('.zip', ''), fileSize, now, now);

  res.status(201).json({ data: { jobId: id } });
});

router.get('/scorm/:id/status', (req, res) => {
  const pkg = db.prepare('SELECT * FROM scorm_packages WHERE id = ?').get(req.params.id);
  if (!pkg) return res.status(404).json({ error: 'SCORM package not found' });

  res.json({
    data: {
      id: pkg.id,
      courseId: pkg.course_id,
      fileName: pkg.file_name,
      title: pkg.title,
      version: pkg.version,
      type: pkg.type,
      status: pkg.status,
      scoCount: pkg.sco_count,
      fileSize: pkg.file_size,
      errors: JSON.parse(pkg.errors_json || '[]'),
      warnings: JSON.parse(pkg.warnings_json || '[]'),
      uploadedAt: pkg.created_at,
      validatedAt: pkg.validated_at
    }
  });
});

// ── Admin Certificates ──
router.get('/certificates', (req, res) => {
  const certificates = db.prepare('SELECT * FROM certificates ORDER BY last_edited DESC').all();
  res.json({ data: certificates });
});

router.post('/certificates', (req, res) => {
  const { name, course, rules } = req.body;
  const id = `cert-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO certificates (id, name, course, rules, last_edited) VALUES (?, ?, ?, ?, ?)').run(id, name, course, rules, now);
  res.status(201).json({ data: { id, name, course, rules, last_edited: now } });
});

// ── Admin Roles & Permissions ──
router.get('/roles', (req, res) => {
  const roles = db.prepare('SELECT * FROM roles ORDER BY is_system DESC, name ASC').all();
  if (roles.length === 0) {
    const defaultRoles = [
      {
        id: 'role-super-admin',
        name: 'Super Admin',
        description: 'Full system access with all administrative privileges.',
        permissions_json: JSON.stringify(['users.view', 'users.create', 'users.edit', 'users.delete', 'courses.view', 'courses.create', 'courses.edit', 'reports.view', 'settings.manage', 'roles.manage']),
        is_system: 1,
        user_count: 1
      },
      {
        id: 'role-org-admin',
        name: 'Org Admin',
        description: 'Manages users, courses, and department academic operations.',
        permissions_json: JSON.stringify(['users.view', 'users.create', 'users.edit', 'courses.view', 'courses.create', 'courses.edit', 'reports.view']),
        is_system: 1,
        user_count: 2
      },
      {
        id: 'role-course-mgr',
        name: 'Course Manager',
        description: 'Curates modules, review syllabi, assessments, and gradebooks.',
        permissions_json: JSON.stringify(['courses.view', 'courses.create', 'courses.edit', 'content.edit']),
        is_system: 1,
        user_count: 4
      },
      {
        id: 'role-support',
        name: 'Support',
        description: 'Handles support inquiries, student tickets, and audit monitoring.',
        permissions_json: JSON.stringify(['users.view', 'audit.view', 'reports.view']),
        is_system: 1,
        user_count: 2
      }
    ];

    const insertRole = db.prepare('INSERT INTO roles (id, name, description, permissions_json, is_system, user_count) VALUES (?, ?, ?, ?, ?, ?)');
    for (const r of defaultRoles) {
      insertRole.run(r.id, r.name, r.description, r.permissions_json, r.is_system, r.user_count);
    }
    return res.json({
      data: defaultRoles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: JSON.parse(r.permissions_json),
        isSystem: true,
        userCount: r.user_count,
        createdAt: new Date().toISOString(),
        colorVar: r.name === 'Super Admin' ? '--role-super-admin' : r.name === 'Org Admin' ? '--role-org-admin' : '--role-course-mgr'
      }))
    });
  }

  const parsed = roles.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: JSON.parse(r.permissions_json || '[]'),
    isSystem: Boolean(r.is_system),
    userCount: r.user_count,
    createdAt: r.created_at,
    colorVar: r.name === 'Super Admin' ? '--role-super-admin' : r.name === 'Org Admin' ? '--role-org-admin' : '--role-course-mgr'
  }));

  res.json({ data: parsed });
});

router.post('/roles', recordAuditLog('ROLE_CREATED', req => `Created role ${req.body?.name}`), (req, res) => {
  const { name, description = '', permissions = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Role name is required' });

  const id = `role-${Date.now()}`;
  db.prepare(`
    INSERT INTO roles (id, name, description, permissions_json, is_system, user_count)
    VALUES (?, ?, ?, ?, 0, 0)
  `).run(id, name, description, JSON.stringify(permissions));

  res.status(201).json({
    data: { id, name, description, permissions, isSystem: false, userCount: 0, colorVar: '--role-custom' }
  });
});

router.put('/roles/:id', recordAuditLog('ROLE_UPDATED', req => `Updated role ${req.params.id}`), (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  if (role.is_system) return res.status(403).json({ error: 'Cannot modify a protected system role' });

  db.prepare(`
    UPDATE roles SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      permissions_json = COALESCE(?, permissions_json)
    WHERE id = ?
  `).run(name, description, permissions ? JSON.stringify(permissions) : null, id);

  const updated = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
  res.json({
    data: { ...updated, permissions: JSON.parse(updated.permissions_json || '[]'), isSystem: false }
  });
});

router.delete('/roles/:id', recordAuditLog('ROLE_DELETED', req => `Deleted role ${req.params.id}`), (req, res) => {
  const { id } = req.params;
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  if (role.is_system) return res.status(403).json({ error: 'Cannot delete a protected system role' });

  db.prepare('DELETE FROM roles WHERE id = ?').run(id);
  res.json({ success: true, message: 'Role deleted successfully' });
});

export default router;
