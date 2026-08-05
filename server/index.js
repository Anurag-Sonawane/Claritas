import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'claritas_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize SQLite Database Schema
initDatabase();

// ── Auth Middleware ──
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'SQLite DatabaseSync Online' });
});

// ── Authentication Endpoints ──
app.post('/api/auth/register', (req, res) => {
  const { name, email, role = 'student', department, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const id = `user-${Date.now()}`;
  const passHash = bcrypt.hashSync(password, 10);
  const roleName = role === 'faculty' ? 'Associate Professor' : 'Student';
  const resolvedDept = department || (role === 'faculty' ? 'Computer Science & Engineering' : 'Computer Science');
  const bg = role === 'faculty' ? '0d9488' : '2ec4f1';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&rounded=true`;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Claritas University', 'pending', NULL, ?)
  `).run(id, email, passHash, name, role, roleName, resolvedDept, avatarUrl);

  res.status(201).json({
    message: 'Registration request submitted successfully. Your account is pending Admin approval.',
    status: 'pending'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  // Account Status Checks
  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Your account registration is pending Admin approval. You will be able to log in once approved.' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by the administrator.' });
  }
  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Your registration request was not approved by the administrator.' });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleName: user.role_name,
    department: user.department,
    avatarUrl: user.avatar_url,
  };

  res.json({ user: userResponse, token });
});

// ── Master Admin User Management Endpoints ──
app.get('/api/admin/users', (req, res) => {
  const { query = '', role = '', org = '', status = '', page = 1, perPage = 10, sortBy = 'name', sortDir = 'asc' } = req.query;
  
  let sql = 'SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(organization) LIKE ?)';
    const q = `%${query.toLowerCase()}%`;
    params.push(q, q, q);
  }
  if (role) {
    sql += ' AND (role = ? OR role_name = ?)';
    params.push(role, role);
  }
  if (org) {
    sql += ' AND organization = ?';
    params.push(org);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  // Count total matching
  const countSql = sql.replace('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl', 'SELECT COUNT(*) as total');
  const totalRow = db.prepare(countSql).get(...params);
  const total = totalRow ? totalRow.total : 0;

  // Sorting and Pagination
  const allowedSortCols = ['name', 'email', 'roleName', 'organization', 'status', 'lastActiveAt'];
  const sortCol = allowedSortCols.includes(sortBy) ? (sortBy === 'roleName' ? 'role_name' : sortBy === 'lastActiveAt' ? 'last_active_at' : sortBy) : 'name';
  const order = sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  sql += ` ORDER BY ${sortCol} ${order} LIMIT ? OFFSET ?`;
  const offset = (parseInt(page) - 1) * parseInt(perPage);
  params.push(parseInt(perPage), offset);

  const users = db.prepare(sql).all(...params);

  res.json({
    data: users,
    meta: {
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / parseInt(perPage)) || 1
    }
  });
});

app.post('/api/admin/users', authenticateToken, (req, res) => {
  const { name, email, role = 'student', roleName, department, organization, password = 'password' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const id = `user-${Date.now()}`;
  const passHash = bcrypt.hashSync(password, 10);
  const resolvedRoleName = roleName || (role === 'admin' ? 'Super Admin' : role === 'faculty' ? 'Associate Professor' : 'Student');
  const resolvedDept = department || (role === 'faculty' ? 'Computer Science & Engineering' : 'Computer Science');
  const resolvedOrg = organization || 'Claritas University';
  const bg = role === 'admin' ? 'f87171' : role === 'faculty' ? '0d9488' : '2ec4f1';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&rounded=true`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, email, passHash, name, role, resolvedRoleName, resolvedDept, resolvedOrg, now, avatarUrl);

  const newUser = db.prepare('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE id = ?').get(id);
  res.status(201).json({ data: newUser });
});

app.put('/api/admin/users/:id', authenticateToken, (req, res) => {
  const { name, email, role, roleName, department, organization, status } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updatedName = name || user.name;
  const updatedEmail = email || user.email;
  const updatedRole = role || user.role;
  const updatedRoleName = roleName || user.role_name;
  const updatedDept = department || user.department;
  const updatedOrg = organization || user.organization;
  const updatedStatus = status || user.status;

  db.prepare(`
    UPDATE users
    SET name = ?, email = ?, role = ?, role_name = ?, department = ?, organization = ?, status = ?
    WHERE id = ?
  `).run(updatedName, updatedEmail, updatedRole, updatedRoleName, updatedDept, updatedOrg, updatedStatus, req.params.id);

  const updated = db.prepare('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE id = ?').get(req.params.id);
  res.json({ data: updated });
});

app.patch('/api/admin/users/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE id = ?').get(req.params.id);
  res.json({ data: updated });
});

app.patch('/api/admin/users/:id/approve', authenticateToken, (req, res) => {
  db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(req.params.id);
  const updated = db.prepare('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE id = ?').get(req.params.id);
  res.json({ data: updated, message: 'User account approved successfully' });
});

app.patch('/api/admin/users/:id/reject', authenticateToken, (req, res) => {
  db.prepare("UPDATE users SET status = 'rejected' WHERE id = ?").run(req.params.id);
  const updated = db.prepare('SELECT id, email, name, role, role_name as roleName, department, organization, status, last_active_at as lastActiveAt, avatar_url as avatarUrl FROM users WHERE id = ?').get(req.params.id);
  res.json({ data: updated, message: 'User registration request rejected' });
});

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Courses Endpoints ──
app.get('/api/courses', (req, res) => {
  const courses = db.prepare(`
    SELECT c.*, u.name as instructor_name, u.avatar_url as instructor_avatar
    FROM courses c
    LEFT JOIN users u ON c.instructor_id = u.id
  `).all();
  res.json(courses);
});

app.get('/api/courses/:id/roster', (req, res) => {
  const roster = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar_url, e.attendance_rate, e.gpa, e.status
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    WHERE e.course_id = ?
  `).all(req.params.id);
  res.json(roster);
});

// ── Assignments Endpoints ──
app.get('/api/assignments', (req, res) => {
  const assignments = db.prepare(`
    SELECT a.*, c.code as course_code, c.title as course_title
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.due_date ASC
  `).all();
  res.json(assignments);
});

app.post('/api/assignments', authenticateToken, (req, res) => {
  const { id, course_id, title, due_date, max_score, instructions } = req.body;
  const newId = id || `asg-${Date.now()}`;
  
  db.prepare(`
    INSERT INTO assignments (id, course_id, title, due_date, max_score, status, instructions)
    VALUES (?, ?, ?, ?, ?, 'Active', ?)
  `).run(newId, course_id, title, due_date, max_score || 100, instructions || '');

  const created = db.prepare('SELECT * FROM assignments WHERE id = ?').get(newId);
  res.status(201).json(created);
});

// ── Submissions & Grading Endpoints ──
app.get('/api/submissions', (req, res) => {
  const submissions = db.prepare(`
    SELECT s.*, u.name as student_name, u.email as student_email, u.avatar_url as student_avatar,
           a.title as assignment_title, a.max_score, c.code as course_code, c.title as course_title
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN assignments a ON s.assignment_id = a.id
    JOIN courses c ON a.course_id = c.id
    ORDER BY s.submitted_at DESC
  `).all();
  res.json(submissions);
});

app.patch('/api/submissions/:id/grade', authenticateToken, (req, res) => {
  const { score, feedback } = req.body;
  
  db.prepare(`
    UPDATE submissions
    SET current_score = ?, feedback = ?, status = 'Graded'
    WHERE id = ?
  `).run(score, feedback, req.params.id);

  const updated = db.prepare(`
    SELECT s.*, u.name as student_name, a.title as assignment_title
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN assignments a ON s.assignment_id = a.id
    WHERE s.id = ?
  `).get(req.params.id);

  res.json(updated);
});

app.post('/api/submissions', authenticateToken, (req, res) => {
  const { assignment_id, content } = req.body;
  const newId = `sub-${Date.now()}`;
  const submitted_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

  db.prepare(`
    INSERT INTO submissions (id, assignment_id, student_id, submitted_at, status, content)
    VALUES (?, ?, ?, ?, 'Pending Review', ?)
  `).run(newId, assignment_id, req.user.id, submitted_at, content);

  const created = db.prepare('SELECT * FROM submissions WHERE id = ?').get(newId);
  res.status(201).json(created);
});

// ── Attendance Endpoints ──
app.get('/api/attendance', (req, res) => {
  const { course_id, date } = req.query;
  let records;
  if (course_id && date) {
    records = db.prepare('SELECT * FROM attendance_records WHERE course_id = ? AND lecture_date = ?').all(course_id, date);
  } else {
    records = db.prepare('SELECT * FROM attendance_records').all();
  }
  res.json(records);
});

app.post('/api/attendance/session', authenticateToken, (req, res) => {
  const { course_id, date, records } = req.body; // records: [{ student_id, status }]
  if (!course_id || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'course_id, date, and records array required' });
  }

  const deleteExisting = db.prepare('DELETE FROM attendance_records WHERE course_id = ? AND lecture_date = ?');
  deleteExisting.run(course_id, date);

  const insertStmt = db.prepare(`
    INSERT INTO attendance_records (id, course_id, lecture_date, student_id, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const r of records) {
    insertStmt.run(`att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, course_id, date, r.student_id, r.status);
  }

  res.json({ success: true, count: records.length });
});

// ── Sandbox Compiler Runner Endpoint ──
app.post('/api/compiler/run', (req, res) => {
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  // Safe JavaScript execution evaluation wrapper
  try {
    let logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.join(' '))
    };

    const runFunc = new Function('console', code);
    const startTime = performance.now();
    runFunc(customConsole);
    const executionTime = (performance.now() - startTime).toFixed(2);

    res.json({
      output: logs.join('\n') || 'Program executed successfully with no console output.',
      executionTime: `${executionTime} ms`,
      status: 'Success'
    });
  } catch (err) {
    res.json({
      output: `Runtime Error: ${err.message}`,
      executionTime: '0 ms',
      status: 'Error'
    });
  }
});

// ── Student Panel Specific Endpoints ──
app.get('/api/student/dashboard', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  const enrollments = db.prepare(`
    SELECT e.*, c.code, c.title, c.schedule, u.name as instructor_name
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE e.student_id = ?
  `).all(studentId);

  const avgGpa = enrollments.length ? (enrollments.reduce((sum, e) => sum + e.gpa, 0) / enrollments.length).toFixed(2) : '3.80';
  const avgAtt = enrollments.length ? (enrollments.reduce((sum, e) => sum + e.attendance_rate, 0) / enrollments.length).toFixed(1) : '92.5';

  const assignments = db.prepare(`
    SELECT a.*, c.code as course_code
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.due_date ASC
  `).all();

  const submissions = db.prepare('SELECT assignment_id FROM submissions WHERE student_id = ?').all(studentId);
  const submittedIds = new Set(submissions.map(s => s.assignment_id));
  const pendingTasks = assignments.filter(a => !submittedIds.has(a.id));

  res.json({
    metrics: { gpa: parseFloat(avgGpa), attendance: parseFloat(avgAtt), pendingTasksCount: pendingTasks.length },
    courses: enrollments,
    upcomingAssignments: pendingTasks
  });
});

app.get('/api/student/attendance', authenticateToken, (req, res) => {
  const records = db.prepare(`
    SELECT ar.*, c.code as course_code, c.title as course_title
    FROM attendance_records ar
    JOIN courses c ON ar.course_id = c.id
    WHERE ar.student_id = ?
    ORDER BY ar.lecture_date DESC
  `).all(req.user.id);
  res.json(records);
});

app.get('/api/student/calendar', authenticateToken, (req, res) => {
  const assignments = db.prepare(`
    SELECT a.id, a.title, a.due_date as date, 'Assignment' as type, c.code as course_code
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
  `).all();

  const exams = [
    { id: 'ex-1', title: 'Data Structures Midterm', date: '2026-08-10', type: 'Exam', course_code: 'CS301' },
    { id: 'ex-2', title: 'Operating Systems Final Lab', date: '2026-08-14', type: 'Exam', course_code: 'CS402' }
  ];

  res.json([...assignments, ...exams]);
});

app.get('/api/announcements', (req, res) => {
  const list = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
  res.json(list);
});

app.post('/api/announcements', authenticateToken, (req, res) => {
  const { title, category, content } = req.body;
  const id = `ann-${Date.now()}`;
  const created_at = new Date().toISOString().substring(0, 10);
  db.prepare(`
    INSERT INTO announcements (id, title, category, content, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, category || 'General', content, req.user.name, created_at);
  res.status(201).json(db.prepare('SELECT * FROM announcements WHERE id = ?').get(id));
});

app.get('/api/tickets', authenticateToken, (req, res) => {
  const list = db.prepare('SELECT * FROM tickets WHERE student_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(list);
});

app.post('/api/tickets', authenticateToken, (req, res) => {
  const { title, category, priority, description } = req.body;
  const id = `tkt-${Date.now()}`;
  const created_at = new Date().toISOString().substring(0, 10);
  db.prepare(`
    INSERT INTO tickets (id, student_id, title, category, priority, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)
  `).run(id, req.user.id, title, category || 'General', priority || 'Medium', description, created_at);
  res.status(201).json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(id));
});

app.get('/api/student/fees', authenticateToken, (req, res) => {
  let fee = db.prepare('SELECT * FROM fee_records WHERE student_id = ?').get(req.user.id);
  if (!fee) {
    // Generate default statement if missing
    fee = { id: `fee-${req.user.id}`, student_id: req.user.id, semester: 'Fall 2026', tuition_fee: 4200, lab_fee: 350, paid_amount: 0, status: 'Pending', due_date: '2026-08-15' };
    db.prepare(`
      INSERT INTO fee_records (id, student_id, semester, tuition_fee, lab_fee, paid_amount, status, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(fee.id, fee.student_id, fee.semester, fee.tuition_fee, fee.lab_fee, fee.paid_amount, fee.status, fee.due_date);
  }
  res.json(fee);
});

app.post('/api/student/fees/pay', authenticateToken, (req, res) => {
  const fee = db.prepare('SELECT * FROM fee_records WHERE student_id = ?').get(req.user.id);
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });
  const total = fee.tuition_fee + fee.lab_fee;
  db.prepare("UPDATE fee_records SET paid_amount = ?, status = 'Paid' WHERE student_id = ?").run(total, req.user.id);
  res.json({ message: 'Payment processed successfully', fee: db.prepare('SELECT * FROM fee_records WHERE student_id = ?').get(req.user.id) });
});

app.get('/api/assessments', (req, res) => {
  const list = db.prepare(`
    SELECT a.*, c.code as course_code, c.title as course_title
    FROM assessments a
    JOIN courses c ON a.course_id = c.id
  `).all();
  res.json(list);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Claritas API Server running on http://localhost:${PORT}`);
});
