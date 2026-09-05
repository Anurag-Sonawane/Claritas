import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce Student or Admin role for student routes
router.use(authenticateToken, requireRole(['student', 'admin']));

// ── Student Dashboard ──
router.get('/dashboard', (req, res) => {
  const studentId = req.user.id;

  const enrollments = db.prepare(`
    SELECT e.*, c.title, c.code, c.description, c.department, c.schedule
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
  `).all(studentId);

  const upcomingAssignments = db.prepare(`
    SELECT a.id, a.title, a.due_date, a.max_score, c.code as course_code
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.student_id = ? AND a.due_date >= date('now')
    ORDER BY a.due_date ASC
    LIMIT 5
  `).all(studentId);

  const attendanceRows = db.prepare('SELECT status FROM attendance_records WHERE student_id = ?').all(studentId);
  const presentCount = attendanceRows.filter(r => r.status === 'Present').length;
  const attendanceRate = attendanceRows.length > 0 ? ((presentCount / attendanceRows.length) * 100).toFixed(1) : 100.0;

  const pendingSubmissions = db.prepare(`
    SELECT COUNT(*) as count FROM assignments a
    JOIN enrollments e ON e.course_id = a.course_id
    LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
    WHERE e.student_id = ? AND s.id IS NULL
  `).get(studentId, studentId)?.count || 0;

  res.json({
    gpa: 3.8,
    attendanceRate: parseFloat(attendanceRate),
    metrics: {
      gpa: 3.8,
      attendance: parseFloat(attendanceRate),
      pendingTasksCount: pendingSubmissions
    },
    upcomingAssignments,
    enrolledCourses: enrollments
  });
});

// ── Lesson Progress Completion ──
router.post(['/courses/:courseId/lessons/:lessonId/complete', '/lessons/:lessonId/progress'], (req, res) => {
  const { courseId = 'crs-001', lessonId } = req.params;
  const { timeSpentSeconds = 0, completed = true } = req.body;
  const studentId = req.user.id;
  const id = `prog-${studentId}-${lessonId}`;
  const now = new Date().toISOString();
  const status = completed ? 'completed' : 'in_progress';

  db.prepare(`
    INSERT INTO lesson_progress (id, student_id, course_id, lesson_id, status, time_spent_seconds, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, course_id, lesson_id) DO UPDATE SET status = excluded.status, time_spent_seconds = time_spent_seconds + excluded.time_spent_seconds, completed_at = excluded.completed_at
  `).run(id, studentId, courseId, lessonId, status, timeSpentSeconds, now);

  res.json({ success: true, message: 'Lesson progress updated', lessonId, status, completedAt: now });
});

router.get('/courses/:courseId/progress', (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.id;

  const completed = db.prepare("SELECT lesson_id, completed_at FROM lesson_progress WHERE student_id = ? AND course_id = ? AND status = 'completed'").all(studentId, courseId);
  res.json({ completedLessons: completed.map(c => c.lesson_id), details: completed });
});

// ── Attendance ──
router.get('/attendance', (req, res) => {
  const studentId = req.user.id;
  const records = db.prepare(`
    SELECT ar.*, c.title as course_title, c.code as course_code
    FROM attendance_records ar
    JOIN courses c ON ar.course_id = c.id
    WHERE ar.student_id = ?
    ORDER BY ar.lecture_date DESC
  `).all(studentId);

  res.json(records);
});

// ── Calendar ──
router.get('/calendar', (req, res) => {
  const studentId = req.user.id;
  const courses = db.prepare(`
    SELECT c.id, c.code, c.title, c.schedule
    FROM courses c
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.student_id = ?
  `).all(studentId);

  res.json({ courses });
});

// ── Fees ──
router.get('/fees', (req, res) => {
  const studentId = req.user.id;
  const fees = db.prepare('SELECT * FROM fee_records WHERE student_id = ?').all(studentId);
  res.json(fees);
});

router.post('/fees/pay', (req, res) => {
  let { feeId } = req.body || {};
  const studentId = req.user.id;

  if (!feeId) {
    // Fallback: look for the student's pending fee record
    const pending = db.prepare("SELECT id FROM fee_records WHERE student_id = ? AND status != 'Paid' LIMIT 1").get(studentId);
    if (pending) feeId = pending.id;
  }

  if (!feeId) return res.status(400).json({ error: 'Fee record ID is required' });

  const record = db.prepare('SELECT * FROM fee_records WHERE id = ? AND student_id = ?').get(feeId, studentId);
  if (!record) return res.status(404).json({ error: 'Fee record not found or access denied' });

  const total = record.tuition_fee + (record.lab_fee || 0);
  db.prepare("UPDATE fee_records SET paid_amount = ?, status = 'Paid', paid_at = ? WHERE id = ?").run(total, new Date().toISOString(), feeId);

  res.json({ success: true, message: 'Fee paid successfully', paidAmount: total });
});

// ── Grievance Tickets ──
router.get('/tickets', (req, res) => {
  const studentId = req.user.id;
  const tickets = db.prepare('SELECT * FROM tickets WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
  res.json(tickets);
});

router.post('/tickets', (req, res) => {
  const { title, category, description, priority = 'Medium' } = req.body;
  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required' });
  }

  const id = `tkt-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tickets (id, student_id, title, category, priority, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)
  `).run(id, req.user.id, title, category, priority, description, now);

  const created = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  res.status(201).json(created);
});

export default router;
