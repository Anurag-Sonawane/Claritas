import express from 'express';
import { db, runTransaction } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Common Courses & Rosters ──
router.get('/courses', (req, res) => {
  const courses = db.prepare("SELECT * FROM courses WHERE status = 'published' OR status = 'active' OR status = 'draft'").all();
  res.json(courses);
});

router.get('/courses/:id/roster', (req, res) => {
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, u.department, e.attendance_rate, e.gpa, e.status
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    WHERE e.course_id = ?
  `).all(req.params.id);

  res.json(students);
});

// ── Assignments ──
router.get('/assignments', (req, res) => {
  const assignments = db.prepare(`
    SELECT a.*, c.title as course_title, c.code as course_code
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.due_date DESC
  `).all();
  res.json(assignments);
});

router.post('/assignments', authenticateToken, requireRole(['faculty', 'admin']), (req, res) => {
  const { course_id, title, due_date, max_score = 100, instructions = '' } = req.body;
  if (!course_id || !title || !due_date) {
    return res.status(400).json({ error: 'course_id, title, and due_date are required' });
  }

  let course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
  if (!course) {
    course = db.prepare('SELECT id FROM courses WHERE LOWER(code) = ?').get(course_id.toLowerCase());
  }
  if (!course) {
    course = db.prepare('SELECT id FROM courses LIMIT 1').get();
  }
  const targetCourseId = course ? course.id : course_id;

  const id = `asg-${Date.now()}`;
  db.prepare(`
    INSERT INTO assignments (id, course_id, title, due_date, max_score, instructions)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, targetCourseId, title, due_date, max_score, instructions);

  const created = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  res.status(201).json(created);
});

// ── Submissions & Grading ──
router.get('/submissions', (req, res) => {
  const submissions = db.prepare(`
    SELECT s.*, u.name as student_name, u.email as student_email, a.title as assignment_title, a.max_score,
           c.code as course_code, c.title as course_title
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN assignments a ON s.assignment_id = a.id
    LEFT JOIN courses c ON a.course_id = c.id
    ORDER BY s.submitted_at DESC
  `).all();
  res.json(submissions);
});

router.post('/submissions', authenticateToken, (req, res) => {
  const { assignment_id, content } = req.body;
  const student_id = req.user.id;
  if (!assignment_id || !content) {
    return res.status(400).json({ error: 'assignment_id and content are required' });
  }

  const id = `sub-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO submissions (id, assignment_id, student_id, submitted_at, status, content)
    VALUES (?, ?, ?, ?, 'Pending Review', ?)
  `).run(id, assignment_id, student_id, now, content);

  const created = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  res.status(201).json(created);
});

const handleGradeSubmission = (req, res) => {
  const { id } = req.params;
  const { score, grade, feedback } = req.body;
  const finalScore = score !== undefined ? score : grade;

  if (finalScore === undefined || finalScore === null) {
    return res.status(400).json({ error: 'Score/grade is required' });
  }

  db.prepare(`
    UPDATE submissions SET
      current_score = ?,
      feedback = ?,
      status = 'Graded'
    WHERE id = ?
  `).run(finalScore, feedback || '', id);

  const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) || { id, current_score: finalScore, status: 'Graded' };
  res.json({ success: true, submission: { ...updated, grade: finalScore }, ...updated });
};

router.patch('/submissions/:id/grade', authenticateToken, requireRole(['faculty', 'admin']), handleGradeSubmission);
router.put('/submissions/:id/grade', authenticateToken, requireRole(['faculty', 'admin']), handleGradeSubmission);

// ── Attendance Session Recording ──
router.get('/attendance', (req, res) => {
  const records = db.prepare(`
    SELECT ar.*, u.name as student_name, c.title as course_title, c.code as course_code
    FROM attendance_records ar
    JOIN users u ON ar.student_id = u.id
    JOIN courses c ON ar.course_id = c.id
    ORDER BY ar.lecture_date DESC
  `).all();
  res.json(records);
});

router.post('/attendance/session', authenticateToken, requireRole(['faculty', 'admin']), (req, res) => {
  const { course_id, lecture_date, records } = req.body;
  if (!course_id || !lecture_date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'course_id, lecture_date, and records array are required' });
  }

  let course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
  if (!course) {
    course = db.prepare('SELECT id FROM courses WHERE LOWER(code) = ?').get(course_id.toLowerCase());
  }
  if (!course) {
    course = db.prepare('SELECT id FROM courses LIMIT 1').get();
  }
  const targetCourseId = course ? course.id : course_id;

  const insertOrReplace = db.prepare(`
    INSERT INTO attendance_records (id, course_id, lecture_date, student_id, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(course_id, lecture_date, student_id) DO UPDATE SET status = excluded.status
  `);

  const fallbackStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get();

  runTransaction(() => {
    for (const record of records) {
      let student = db.prepare('SELECT id FROM users WHERE id = ?').get(record.student_id);
      const targetStudentId = student ? student.id : (fallbackStudent ? fallbackStudent.id : record.student_id);
      const id = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      insertOrReplace.run(id, targetCourseId, lecture_date, targetStudentId, record.status);
    }
  });

  res.json({ success: true, count: records.length });
});

export default router;
