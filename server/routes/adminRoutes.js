import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = express.Router();

// Enforce Admin RBAC for ALL routes in this router
router.use(authenticateToken, requireRole(['admin']));

// ── Admin Users Management ──
router.get('/users', async (req, res) => {
  try {
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

    const allFiltered = await db.all(query, params);
    const total = allFiltered.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    const paginatedUsers = allFiltered.slice(offset, offset + limitNum);

    // Compute metrics
    const allUsers = await db.all('SELECT role, status, last_active_at FROM users');
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

    const deptRows = await db.all('SELECT department FROM users WHERE department IS NOT NULL');
    const departments = [...new Set(deptRows.map(r => r.department))];

    res.json({
      users: paginatedUsers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      metrics,
      departments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', recordAuditLog('USER_CREATED', req => `Created user ${req.body?.email}`), async (req, res) => {
  try {
    const { name, email, role, role_name, department, organization, password = 'password' } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const passHash = bcrypt.hashSync(password, 10);
    const resolvedRoleName = role_name || (role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Associate Professor' : 'Student');
    const bg = role === 'admin' ? 'f87171' : role === 'faculty' ? '0d9488' : '2ec4f1';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&rounded=true`;

    await db.run(`
      INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL, ?)
    `, [id, email, passHash, name, role, resolvedRoleName, department || 'General', organization || 'Claritas University', avatarUrl]);

    const created = await db.get('SELECT id, email, name, role, role_name, department, status, avatar_url FROM users WHERE id = ?', id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', recordAuditLog('USER_UPDATED', req => `Updated user ${req.params.id}`), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, role_name, department, organization, status } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await db.run(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        role_name = COALESCE(?, role_name),
        department = COALESCE(?, department),
        organization = COALESCE(?, organization),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [name, email, role, role_name, department, organization, status, id]);

    const updated = await db.get('SELECT id, email, name, role, role_name, department, organization, status, avatar_url FROM users WHERE id = ?', id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/approve', recordAuditLog('USER_APPROVED', req => `Approved registration for ${req.params.id}`), async (req, res) => {
  try {
    await db.run("UPDATE users SET status = 'active' WHERE id = ?", req.params.id);
    res.json({ success: true, message: 'User approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/reject', recordAuditLog('USER_REJECTED', req => `Rejected registration for ${req.params.id}`), async (req, res) => {
  try {
    await db.run('DELETE FROM users WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'User registration rejected and removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', recordAuditLog('USER_DELETED', req => `Deleted user ${req.params.id}`), async (req, res) => {
  try {
    await db.run('DELETE FROM users WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Audit Logs ──
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const totalRow = await db.get('SELECT COUNT(*) as count FROM audit_logs');
    const total = Number(totalRow?.count || 0);
    const logs = await db.all(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT ? OFFSET ?
    `, [limitNum, offset]);

    res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Courses ──
router.get('/courses', async (req, res) => {
  try {
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

    const allCourses = await db.all(sql, params);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({
      data: {
        ...course,
        modules: course.modules_json ? JSON.parse(course.modules_json) : [],
        tags: course.tags ? JSON.parse(course.tags) : []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { code, title, department = 'Computer Science', description = '', status = 'draft', category = 'Technology', level = 'Beginner', managerId = null, managerName = null } = req.body;
    if (!code || !title) {
      return res.status(400).json({ error: 'Code and title are required' });
    }

    const id = `crs-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO courses (id, code, title, department, description, status, category, level, manager_id, manager_name, modules_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)
    `, [id, code, title, department, description, status, category, level, managerId, managerName, now, now]);

    const created = await db.get('SELECT * FROM courses WHERE id = ?', id);
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const course = await db.get('SELECT * FROM courses WHERE id = ?', id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const modulesJson = updates.modules ? JSON.stringify(updates.modules) : course.modules_json;
    const tagsJson = updates.tags ? JSON.stringify(updates.tags) : course.tags;
    const now = new Date().toISOString();

    await db.run(`
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
    `, [
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
    ]);

    const updated = await db.get('SELECT * FROM courses WHERE id = ?', id);
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM courses WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Course Versions & Rollback ──
router.get('/courses/:id/versions', async (req, res) => {
  try {
    const versions = await db.all('SELECT * FROM course_versions WHERE course_id = ? ORDER BY version DESC', req.params.id);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { label = '', changes = [] } = req.body;
    const course = await db.get('SELECT * FROM courses WHERE id = ?', id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const latestVerRow = await db.get('SELECT MAX(version) as max_v FROM course_versions WHERE course_id = ?', id);
    const latestVer = Number(latestVerRow?.max_v || 0);
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

    await db.run(`
      INSERT INTO course_versions (id, course_id, version, label, author, changes_json, snapshot_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [verId, id, nextVer, label, req.user.name || 'Admin', JSON.stringify(changes), JSON.stringify(snapshot), now]);

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses/:id/rollback', recordAuditLog('COURSE_ROLLBACK', req => `Rolled back course ${req.params.id} to version ${req.body?.versionId}`), async (req, res) => {
  try {
    const { versionId } = req.body;
    const targetVer = await db.get('SELECT * FROM course_versions WHERE id = ?', versionId);
    if (!targetVer) return res.status(404).json({ error: 'Version snapshot not found' });

    const snapshot = JSON.parse(targetVer.snapshot_json);
    const now = new Date().toISOString();

    await db.run(`
      UPDATE courses SET
        title = COALESCE(?, title),
        modules_json = ?,
        updated_at = ?
      WHERE id = ?
    `, [snapshot.title, JSON.stringify(snapshot.modules || []), now, req.params.id]);

    res.json({ success: true, message: `Course successfully rolled back to v${targetVer.version}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Media Library ──
router.get('/media', async (req, res) => {
  try {
    const { folder, query: search, type } = req.query;
    let sql = 'SELECT * FROM media_library WHERE 1=1';
    const params = [];

    if (folder) { sql += ' AND folder = ?'; params.push(folder); }
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }

    sql += ' ORDER BY created_at DESC';
    const items = await db.all(sql, params);
    const folderRows = await db.all('SELECT folder FROM media_library');
    const folders = [...new Set(folderRows.map(m => m.folder))];

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/media', async (req, res) => {
  try {
    const { name, folder = 'Course Assets', type = 'pdf', mime = 'application/pdf', size = 50000, cdnUrl } = req.body;
    const id = `media-${Date.now()}`;
    const now = new Date().toISOString();
    const resolvedUrl = cdnUrl || `https://cdn.claritas.edu/media/${name || 'asset.pdf'}`;

    await db.run(`
      INSERT INTO media_library (id, name, folder, type, mime, size, cdn_url, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name || 'asset.pdf', folder, type, mime, size, resolvedUrl, req.user.name || 'Admin', now]);

    const created = await db.get('SELECT * FROM media_library WHERE id = ?', id);
    res.status(201).json({ data: { ...created, cdnUrl: created.cdn_url, usedIn: [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM media_library WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Media item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SCORM Packages ──
router.get('/scorm', async (req, res) => {
  try {
    const { courseId } = req.query;
    let sql = 'SELECT * FROM scorm_packages WHERE 1=1';
    const params = [];
    if (courseId) { sql += ' AND course_id = ?'; params.push(courseId); }

    sql += ' ORDER BY created_at DESC';
    const packages = await db.all(sql, params);

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scorm/upload', async (req, res) => {
  try {
    const { courseId, fileName = 'package.zip', fileSize = 50000 } = req.body;
    const id = `scorm-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO scorm_packages (id, course_id, file_name, title, version, type, status, sco_count, file_size, errors_json, warnings_json, created_at, validated_at)
      VALUES (?, ?, ?, ?, '1.0', 'SCORM 2004', 'valid', 4, ?, '[]', '[]', ?, ?)
    `, [id, courseId || null, fileName, fileName.replace('.zip', ''), fileSize, now, now]);

    res.status(201).json({ data: { jobId: id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scorm/:id/status', async (req, res) => {
  try {
    const pkg = await db.get('SELECT * FROM scorm_packages WHERE id = ?', req.params.id);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Certificates ──
router.get('/certificates', async (req, res) => {
  try {
    const certificates = await db.all('SELECT * FROM certificates ORDER BY last_edited DESC');
    res.json({ data: certificates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/certificates', async (req, res) => {
  try {
    const { name, course, rules } = req.body;
    const id = `cert-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run('INSERT INTO certificates (id, name, course, rules, last_edited) VALUES (?, ?, ?, ?, ?)', [id, name, course, rules, now]);
    res.status(201).json({ data: { id, name, course, rules, last_edited: now } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Roles & Permissions ──
router.get('/roles', async (req, res) => {
  try {
    const roles = await db.all('SELECT * FROM roles ORDER BY is_system DESC, name ASC');

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/roles', recordAuditLog('ROLE_CREATED', req => `Created role ${req.body?.name}`), async (req, res) => {
  try {
    const { name, description = '', permissions = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Role name is required' });

    const id = `role-${Date.now()}`;
    await db.run(`
      INSERT INTO roles (id, name, description, permissions_json, is_system, user_count)
      VALUES (?, ?, ?, ?, 0, 0)
    `, [id, name, description, JSON.stringify(permissions)]);

    res.status(201).json({
      data: { id, name, description, permissions, isSystem: false, userCount: 0, colorVar: '--role-custom' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/roles/:id', recordAuditLog('ROLE_UPDATED', req => `Updated role ${req.params.id}`), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await db.get('SELECT * FROM roles WHERE id = ?', id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.is_system) return res.status(403).json({ error: 'Cannot modify a protected system role' });

    await db.run(`
      UPDATE roles SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        permissions_json = COALESCE(?, permissions_json)
      WHERE id = ?
    `, [name, description, permissions ? JSON.stringify(permissions) : null, id]);

    const updated = await db.get('SELECT * FROM roles WHERE id = ?', id);
    res.json({
      data: { ...updated, permissions: JSON.parse(updated.permissions_json || '[]'), isSystem: false }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/roles/:id', recordAuditLog('ROLE_DELETED', req => `Deleted role ${req.params.id}`), async (req, res) => {
  try {
    const { id } = req.params;
    const role = await db.get('SELECT * FROM roles WHERE id = ?', id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.is_system) return res.status(403).json({ error: 'Cannot delete a protected system role' });

    await db.run('DELETE FROM roles WHERE id = ?', id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
