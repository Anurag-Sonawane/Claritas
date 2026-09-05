import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'claritas.sqlite');

export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys, WAL Mode, and 5-second Busy Timeout for concurrency
try {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA journal_mode = WAL;');
} catch (err) {
  // Gracefully handle existing locks or unsupported environments
  console.warn('SQLite PRAGMA initialization notice:', err.message);
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions_json TEXT DEFAULT '[]',
      is_system INTEGER DEFAULT 0,
      user_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      role_name TEXT NOT NULL,
      department TEXT,
      organization TEXT DEFAULT 'Claritas University',
      status TEXT DEFAULT 'active',
      last_active_at TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_permissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      permission TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, permission)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      instructor_id TEXT,
      students_count INTEGER DEFAULT 0,
      term TEXT,
      schedule TEXT,
      description TEXT,
      status TEXT DEFAULT 'draft',
      category TEXT,
      level TEXT,
      thumbnail_gradient TEXT,
      tags TEXT,
      modules_json TEXT,
      created_at TEXT,
      updated_at TEXT,
      published_at TEXT,
      manager_id TEXT,
      manager_name TEXT,
      total_modules INTEGER DEFAULT 0,
      total_lessons INTEGER DEFAULT 0,
      total_duration TEXT DEFAULT '0min',
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS course_versions (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      label TEXT,
      author TEXT NOT NULL,
      changes_json TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS media_library (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      folder TEXT DEFAULT 'Course Assets',
      type TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      cdn_url TEXT NOT NULL,
      thumbnail_url TEXT,
      uploaded_by TEXT NOT NULL,
      used_in_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scorm_packages (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      file_name TEXT NOT NULL,
      title TEXT,
      version TEXT DEFAULT '1.0',
      type TEXT DEFAULT 'SCORM 2004',
      status TEXT DEFAULT 'queued',
      sco_count INTEGER DEFAULT 0,
      file_size INTEGER NOT NULL,
      errors_json TEXT DEFAULT '[]',
      warnings_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      validated_at TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS question_bank (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      text TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      tags_json TEXT DEFAULT '[]',
      options_json TEXT DEFAULT '[]',
      answer TEXT,
      points INTEGER DEFAULT 10,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS assessment_submissions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT DEFAULT 'Student User',
      course_title TEXT DEFAULT 'Course',
      type TEXT DEFAULT 'Essay/File',
      status TEXT DEFAULT 'Pending',
      submitted_at TEXT NOT NULL,
      score REAL,
      feedback TEXT,
      content TEXT,
      answers_json TEXT DEFAULT '{}',
      time_spent_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      time_spent_seconds INTEGER DEFAULT 0,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      prefix TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      url TEXT NOT NULL,
      payload_json TEXT,
      response_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scheduled_reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      frequency TEXT NOT NULL,
      recipients_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      next_run_at TEXT
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      rules TEXT NOT NULL,
      last_edited TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      attendance_rate REAL DEFAULT 100.0,
      gpa REAL DEFAULT 4.0,
      status TEXT DEFAULT 'Good Standing',
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      max_score INTEGER DEFAULT 100,
      status TEXT DEFAULT 'Active',
      instructions TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT DEFAULT 'Pending Review',
      current_score REAL,
      feedback TEXT,
      content TEXT,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      lecture_date TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT NOT NULL,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(course_id, lecture_date, student_id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fee_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      semester TEXT NOT NULL,
      tuition_fee REAL NOT NULL,
      lab_fee REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      due_date TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      total_questions INTEGER DEFAULT 10,
      duration_mins INTEGER DEFAULT 30,
      passing_score INTEGER DEFAULT 70,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- ── Database Indexes ──
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
    CREATE INDEX IF NOT EXISTS idx_course_versions_course ON course_versions(course_id);
    CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
    CREATE INDEX IF NOT EXISTS idx_scorm_course ON scorm_packages(course_id);
    CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(type);
    CREATE INDEX IF NOT EXISTS idx_assessment_subs_status ON assessment_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);
    CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_course_date ON attendance_records(course_id, lecture_date);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  `);
}

export function runTransaction(callback) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = callback(db);
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}
