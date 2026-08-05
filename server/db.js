import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'claritas.sqlite');

export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
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
      avatar_url TEXT
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

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      rules TEXT NOT NULL,
      last_edited TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      attendance_rate REAL DEFAULT 100.0,
      gpa REAL DEFAULT 4.0,
      status TEXT DEFAULT 'Good Standing',
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
      ip_address TEXT
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
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);
}
