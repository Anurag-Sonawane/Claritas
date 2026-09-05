import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce Student or Admin role for student routes
router.use(authenticateToken, requireRole(['student', 'admin']));

// ── Student Dashboard ──
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await db.all(`
      SELECT e.*, c.title, c.code, c.description, c.department, c.schedule
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
    `, [studentId]);

    const upcomingAssignments = await db.all(`
      SELECT a.id, a.title, a.due_date, a.max_score, c.code as course_code
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ? AND a.due_date >= CURRENT_DATE
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [studentId]);

    const attendanceRows = await db.all('SELECT status FROM attendance_records WHERE student_id = ?', [studentId]);
    const presentCount = attendanceRows.filter(r => r.status === 'Present').length;
    const attendanceRate = attendanceRows.length > 0 ? ((presentCount / attendanceRows.length) * 100).toFixed(1) : 100.0;

    const pendingRow = await db.get(`
      SELECT COUNT(*) as count FROM assignments a
      JOIN enrollments e ON e.course_id = a.course_id
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      WHERE e.student_id = ? AND s.id IS NULL
    `, [studentId, studentId]);
    const pendingSubmissions = Number(pendingRow?.count || 0);

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Lesson Progress Completion ──
router.post(['/courses/:courseId/lessons/:lessonId/complete', '/lessons/:lessonId/progress'], async (req, res) => {
  try {
    const { courseId = 'crs-001', lessonId } = req.params;
    const { timeSpentSeconds = 0, completed = true } = req.body;
    const studentId = req.user.id;
    const id = `prog-${studentId}-${lessonId}`;
    const now = new Date().toISOString();
    const status = completed ? 'completed' : 'in_progress';

    await db.run(`
      INSERT INTO lesson_progress (id, student_id, course_id, lesson_id, status, time_spent_seconds, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, course_id, lesson_id) DO UPDATE SET status = excluded.status, time_spent_seconds = lesson_progress.time_spent_seconds + excluded.time_spent_seconds, completed_at = excluded.completed_at
    `, [id, studentId, courseId, lessonId, status, timeSpentSeconds, now]);

    res.json({ success: true, message: 'Lesson progress updated', lessonId, status, completedAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:courseId/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const completed = await db.all("SELECT lesson_id, completed_at FROM lesson_progress WHERE student_id = ? AND course_id = ? AND status = 'completed'", [studentId, courseId]);
    res.json({ completedLessons: completed.map(c => c.lesson_id), details: completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Attendance ──
router.get('/attendance', async (req, res) => {
  try {
    const studentId = req.user.id;
    const records = await db.all(`
      SELECT ar.*, c.title as course_title, c.code as course_code
      FROM attendance_records ar
      JOIN courses c ON ar.course_id = c.id
      WHERE ar.student_id = ?
      ORDER BY ar.lecture_date DESC
    `, [studentId]);

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Calendar ──
router.get('/calendar', async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await db.all(`
      SELECT c.id, c.code, c.title, c.schedule
      FROM courses c
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ?
    `, [studentId]);

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fees ──
router.get('/fees', async (req, res) => {
  try {
    const studentId = req.user.id;
    const fees = await db.all('SELECT * FROM fee_records WHERE student_id = ?', [studentId]);
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/fees/pay', async (req, res) => {
  try {
    let { feeId } = req.body || {};
    const studentId = req.user.id;

    if (!feeId) {
      // Fallback: look for the student's pending fee record
      const pending = await db.get("SELECT id FROM fee_records WHERE student_id = ? AND status != 'Paid' LIMIT 1", [studentId]);
      if (pending) feeId = pending.id;
    }

    if (!feeId) return res.status(400).json({ error: 'Fee record ID is required' });

    const record = await db.get('SELECT * FROM fee_records WHERE id = ? AND student_id = ?', [feeId, studentId]);
    if (!record) return res.status(404).json({ error: 'Fee record not found or access denied' });

    const total = record.tuition_fee + (record.lab_fee || 0);
    await db.run("UPDATE fee_records SET paid_amount = ?, status = 'Paid', paid_at = ? WHERE id = ?", [total, new Date().toISOString(), feeId]);

    res.json({ success: true, message: 'Fee paid successfully', paidAmount: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Grievance Tickets ──
router.get('/tickets', async (req, res) => {
  try {
    const studentId = req.user.id;
    const tickets = await db.all('SELECT * FROM tickets WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { title, category, description, priority = 'Medium' } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required' });
    }

    const id = `tkt-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO tickets (id, student_id, title, category, priority, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)
    `, [id, req.user.id, title, category, priority, description, now]);

    const created = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
