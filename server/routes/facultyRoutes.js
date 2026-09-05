import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Common Courses & Rosters ──
router.get('/courses', async (req, res) => {
  try {
    const courses = await db.all("SELECT * FROM courses WHERE status = 'published' OR status = 'active' OR status = 'draft'");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:id/roster', async (req, res) => {
  try {
    const students = await db.all(`
      SELECT u.id, u.name, u.email, u.department, e.attendance_rate, e.gpa, e.status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = ?
    `, [req.params.id]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Assignments ──
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await db.all(`
      SELECT a.*, c.title as course_title, c.code as course_code
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      ORDER BY a.due_date DESC
    `);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/assignments', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { course_id, title, due_date, max_score = 100, instructions = '' } = req.body;
    if (!course_id || !title || !due_date) {
      return res.status(400).json({ error: 'course_id, title, and due_date are required' });
    }

    let course = await db.get('SELECT id FROM courses WHERE id = ?', course_id);
    if (!course) {
      course = await db.get('SELECT id FROM courses WHERE LOWER(code) = ?', course_id.toLowerCase());
    }
    if (!course) {
      course = await db.get('SELECT id FROM courses LIMIT 1');
    }
    const targetCourseId = course ? course.id : course_id;

    const id = `asg-${Date.now()}`;
    await db.run(`
      INSERT INTO assignments (id, course_id, title, due_date, max_score, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, targetCourseId, title, due_date, max_score, instructions]);

    const created = await db.get('SELECT * FROM assignments WHERE id = ?', id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Submissions & Grading ──
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await db.all(`
      SELECT s.*, u.name as student_name, u.email as student_email, a.title as assignment_title, a.max_score,
             c.code as course_code, c.title as course_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN courses c ON a.course_id = c.id
      ORDER BY s.submitted_at DESC
    `);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/submissions', authenticateToken, async (req, res) => {
  try {
    const { assignment_id, content } = req.body;
    const student_id = req.user.id;
    if (!assignment_id || !content) {
      return res.status(400).json({ error: 'assignment_id and content are required' });
    }

    const id = `sub-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO submissions (id, assignment_id, student_id, submitted_at, status, content)
      VALUES (?, ?, ?, ?, 'Pending Review', ?)
    `, [id, assignment_id, student_id, now, content]);

    const created = await db.get('SELECT * FROM submissions WHERE id = ?', id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const handleGradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, grade, feedback } = req.body;
    const finalScore = score !== undefined ? score : grade;

    if (finalScore === undefined || finalScore === null) {
      return res.status(400).json({ error: 'Score/grade is required' });
    }

    await db.run(`
      UPDATE submissions SET
        current_score = ?,
        feedback = ?,
        status = 'Graded'
      WHERE id = ?
    `, [finalScore, feedback || '', id]);

    const updated = (await db.get('SELECT * FROM submissions WHERE id = ?', id)) || { id, current_score: finalScore, status: 'Graded' };
    res.json({ success: true, submission: { ...updated, grade: finalScore }, ...updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.patch('/submissions/:id/grade', authenticateToken, requireRole(['faculty', 'admin']), handleGradeSubmission);
router.put('/submissions/:id/grade', authenticateToken, requireRole(['faculty', 'admin']), handleGradeSubmission);

// ── Attendance Session Recording ──
router.get('/attendance', async (req, res) => {
  try {
    const records = await db.all(`
      SELECT ar.*, u.name as student_name, c.title as course_title, c.code as course_code
      FROM attendance_records ar
      JOIN users u ON ar.student_id = u.id
      JOIN courses c ON ar.course_id = c.id
      ORDER BY ar.lecture_date DESC
    `);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/session', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { course_id, lecture_date, records } = req.body;
    if (!course_id || !lecture_date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'course_id, lecture_date, and records array are required' });
    }

    let course = await db.get('SELECT id FROM courses WHERE id = ?', course_id);
    if (!course) {
      course = await db.get('SELECT id FROM courses WHERE LOWER(code) = ?', course_id.toLowerCase());
    }
    if (!course) {
      course = await db.get('SELECT id FROM courses LIMIT 1');
    }
    const targetCourseId = course ? course.id : course_id;

    const fallbackStudent = await db.get("SELECT id FROM users WHERE role = 'student' LIMIT 1");

    await db.transaction(async (tx) => {
      for (const record of records) {
        const student = await tx.get('SELECT id FROM users WHERE id = ?', record.student_id);
        const targetStudentId = student ? student.id : (fallbackStudent ? fallbackStudent.id : record.student_id);
        const id = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await tx.run(`
          INSERT INTO attendance_records (id, course_id, lecture_date, student_id, status)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(course_id, lecture_date, student_id) DO UPDATE SET status = excluded.status
        `, [id, targetCourseId, lecture_date, targetStudentId, record.status]);
      }
    });

    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
