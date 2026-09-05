import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.js';

export function runSeed(dropTables = false) {
  if (dropTables) {
    console.log('🌱 Dropping existing tables and rebuilding schema...');
    db.exec('DROP TABLE IF EXISTS scheduled_reports;');
    db.exec('DROP TABLE IF EXISTS webhook_logs;');
    db.exec('DROP TABLE IF EXISTS api_keys;');
    db.exec('DROP TABLE IF EXISTS lesson_progress;');
    db.exec('DROP TABLE IF EXISTS assessment_submissions;');
    db.exec('DROP TABLE IF EXISTS question_bank;');
    db.exec('DROP TABLE IF EXISTS scorm_packages;');
    db.exec('DROP TABLE IF EXISTS media_library;');
    db.exec('DROP TABLE IF EXISTS course_versions;');
    db.exec('DROP TABLE IF EXISTS user_permissions;');
    db.exec('DROP TABLE IF EXISTS refresh_tokens;');
    db.exec('DROP TABLE IF EXISTS audit_logs;');
    db.exec('DROP TABLE IF EXISTS attendance_records;');
    db.exec('DROP TABLE IF EXISTS submissions;');
    db.exec('DROP TABLE IF EXISTS assignments;');
    db.exec('DROP TABLE IF EXISTS enrollments;');
    db.exec('DROP TABLE IF EXISTS courses;');
    db.exec('DROP TABLE IF EXISTS users;');
    db.exec('DROP TABLE IF EXISTS announcements;');
    db.exec('DROP TABLE IF EXISTS tickets;');
    db.exec('DROP TABLE IF EXISTS fee_records;');
    db.exec('DROP TABLE IF EXISTS assessments;');
    db.exec('DROP TABLE IF EXISTS certificates;');
  }

  // Ensure tables and indexes exist
  initDatabase();

  console.log('🌱 Populating initial users, courses, and platform records...');
  const passHash = bcrypt.hashSync('password', 10);
  const now = new Date().toISOString();

  // ── Seed Users ──
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('user-001', 'admin@claritas.edu', passHash, 'Aarav Sharma', 'admin', 'Super Admin', 'Administration', 'Claritas University', 'active', now, 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=f87171&color=fff&rounded=true');
  insertUser.run('faculty-001', 'teacher@claritas.edu', passHash, 'Dr. Vikram Patel', 'faculty', 'Associate Professor', 'Computer Science & Engineering', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Vikram+Patel&background=0d9488&color=fff&rounded=true');
  insertUser.run('faculty-002', 'faculty@claritas.edu', passHash, 'Dr. Robert Vance', 'faculty', 'Associate Professor', 'Computer Science & Engineering', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Robert+Vance&background=0d9488&color=fff&rounded=true');
  insertUser.run('student-001', 'student@claritas.edu', passHash, 'Anurag Sonawane', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Anurag+Sonawane&background=2ec4f1&color=fff&rounded=true');
  insertUser.run('student-002', 'rohan.s@claritas.edu', passHash, 'Rohan Sharma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=6366f1&color=fff&rounded=true');
  insertUser.run('student-003', 'priya.v@claritas.edu', passHash, 'Priya Verma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff&rounded=true');
  insertUser.run('student-004', 'karan.m@claritas.edu', passHash, 'Karan Malhotra', 'student', 'Student', 'Computer Science', 'School of Engineering', 'suspended', now, 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=f87171&color=fff&rounded=true');
  insertUser.run('student-005', 'sneha.g@claritas.edu', passHash, 'Sneha Gupta', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=8b5cf6&color=fff&rounded=true');

  // ── Seed Role Permissions ──
  const insertPerm = db.prepare('INSERT OR IGNORE INTO user_permissions (id, user_id, permission) VALUES (?, ?, ?)');
  const adminPerms = ['users:manage', 'courses:manage', 'certificates:manage', 'reports:view', 'audit:view', 'settings:manage'];
  adminPerms.forEach((p, idx) => insertPerm.run(`perm-adm-${idx}`, 'user-001', p));

  const facultyPerms = ['courses:edit', 'grades:manage', 'attendance:manage', 'assignments:create'];
  facultyPerms.forEach((p, idx) => {
    insertPerm.run(`perm-fac-${idx}`, 'faculty-001', p);
    insertPerm.run(`perm-fac2-${idx}`, 'faculty-002', p);
  });

  // ── Seed Courses ──
  const insertCourse = db.prepare(`
    INSERT OR IGNORE INTO courses (
      id, code, title, department, instructor_id, students_count, term, schedule,
      description, status, category, level, thumbnail_gradient, tags, modules_json,
      created_at, updated_at, published_at, manager_id, manager_name, total_modules, total_lessons, total_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dsaModules = JSON.stringify([
    {
      id: 'mod-1',
      title: 'Foundations of DSA',
      isExpanded: true,
      lessons: [
        {
          id: 'les-1',
          title: 'Introduction to Algorithms',
          type: 'text',
          duration: '15min',
          contentBlocks: [
            { id: 'b-1', type: 'text', content: '<h2>Introduction</h2><p>Welcome to CS301. We start with algorithm complexity.</p>' }
          ]
        },
        {
          id: 'les-2',
          title: 'Asymptotic Analysis & Big-O Notation',
          type: 'video',
          duration: '25min',
          contentBlocks: [
            { id: 'b-2', type: 'video', videoUrl: 'https://cdn.claritas.edu/videos/big-o.mp4', videoTitle: 'Big-O Deep Dive' }
          ]
        }
      ]
    }
  ]);

  insertCourse.run(
    'crs-001', 'CS301', 'Data Structures & Algorithms', 'Computer Science', 'faculty-001', 54, 'Fall 2026', 'Mon/Wed 10:00 AM',
    'Master arrays, trees, graphs, sorting, and dynamic programming with interactive visualizations.',
    'published', 'Computer Science', 'Intermediate', 'linear-gradient(135deg, #FF5A36, #FF8C66)',
    JSON.stringify(['Algorithms', 'Data Structures', 'Python', 'C++']), dsaModules,
    now, now, now, 'user-001', 'Aarav Sharma', 1, 2, '40min'
  );

  insertCourse.run(
    'crs-002', 'CS402', 'Operating Systems Design', 'Computer Science', 'faculty-001', 42, 'Fall 2026', 'Tue/Thu 2:00 PM',
    'Understand kernel architecture, concurrency, memory virtualization, and file systems.',
    'published', 'Computer Science', 'Advanced', 'linear-gradient(135deg, #2EC4F1, #7BE0FF)',
    JSON.stringify(['OS', 'Kernel', 'C', 'Concurrency']), '[]',
    now, now, now, 'user-001', 'Aarav Sharma', 0, 0, '0min'
  );

  // ── Seed Course Versions ──
  const insertVer = db.prepare('INSERT OR IGNORE INTO course_versions (id, course_id, version, label, author, changes_json, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertVer.run('v-crs-001-1', 'crs-001', 1, 'Initial Syllabus Release', 'Aarav Sharma', JSON.stringify(['Created Module 1: Foundations of DSA', 'Added 2 lessons']), dsaModules, now);

  // ── Seed Media Library ──
  const insertMedia = db.prepare('INSERT OR IGNORE INTO media_library (id, name, folder, type, mime, size, cdn_url, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertMedia.run('media-1', 'CS301_Syllabus_Fall2026.pdf', 'Documents', 'pdf', 'application/pdf', 124000, 'https://cdn.claritas.edu/media/cs301-syllabus.pdf', 'Aarav Sharma', now);
  insertMedia.run('media-2', 'BigO_Complexity_CheatSheet.png', 'Images', 'png', 'image/png', 450000, 'https://cdn.claritas.edu/media/big-o-cheatsheet.png', 'Dr. Vikram Patel', now);
  insertMedia.run('media-3', 'Algorithm_Analysis_Lecture1.mp4', 'Videos', 'mp4', 'video/mp4', 12500000, 'https://cdn.claritas.edu/media/lecture1.mp4', 'Dr. Vikram Patel', now);

  // ── Seed SCORM Packages ──
  const insertScorm = db.prepare('INSERT OR IGNORE INTO scorm_packages (id, course_id, file_name, title, version, type, status, sco_count, file_size, created_at, validated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertScorm.run('scorm-001', 'crs-001', 'dsa_interactive_labs.zip', 'DSA Interactive Visualizer Lab', '1.0', 'SCORM 2004', 'valid', 4, 3400000, now, now);

  // ── Seed Question Bank ──
  const insertQ = db.prepare('INSERT OR IGNORE INTO question_bank (id, course_id, text, type, difficulty, tags_json, options_json, answer, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertQ.run('q-1', 'crs-001', 'Which React hook is used for performing side effects in functional components?', 'MCQ', 'Easy', JSON.stringify(['React', 'Hooks', 'Basics']), JSON.stringify(['useState', 'useEffect', 'useReducer', 'useMemo']), 'useEffect', 10);
  insertQ.run('q-2', 'crs-001', 'Explain the differences between process and thread in modern operating systems.', 'Essay', 'Medium', JSON.stringify(['Operating Systems', 'Concurrency']), '[]', '', 15);
  insertQ.run('q-3', 'crs-001', 'Implement Binary Search on a sorted array with O(log n) time complexity.', 'Code', 'Hard', JSON.stringify(['Algorithms', 'Binary Search']), '[]', 'function binarySearch(arr, target) { ... }', 20);

  // ── Seed Assessment Submissions ──
  const insertAsmSub = db.prepare('INSERT OR IGNORE INTO assessment_submissions (id, assessment_id, student_id, student_name, course_title, type, status, submitted_at, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertAsmSub.run('sub-asm-1', 'asm-1', 'student-001', 'Anurag Sonawane', 'CS301 - Data Structures & Algorithms', 'Essay/File', 'Pending', now, null, null);
  insertAsmSub.run('sub-asm-2', 'asm-1', 'student-002', 'Rohan Sharma', 'CS301 - Data Structures & Algorithms', 'Essay/File', 'Pending', now, null, null);

  // ── Seed Lesson Progress ──
  const insertProg = db.prepare('INSERT OR IGNORE INTO lesson_progress (id, student_id, course_id, lesson_id, status, completed_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertProg.run('prog-001', 'student-001', 'crs-001', 'les-1', 'completed', now);

  // ── Seed API Keys ──
  const rawSecret = 'pk_live_8f92a4bc88194ad9b30c18d4';
  const keyHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
  const insertKey = db.prepare('INSERT OR IGNORE INTO api_keys (id, name, prefix, key_hash, created_at, last_used_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertKey.run('key_1', 'Student Information System Sync', 'pk_live_8f92', keyHash, now, now);

  // ── Seed Webhook Logs ──
  const insertWebhook = db.prepare('INSERT OR IGNORE INTO webhook_logs (id, event, status_code, url, payload_json, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertWebhook.run('wh-001', 'user.created', 200, 'https://api.hubapi.com/v1/users', '{"id":"user-001"}', '{"status":"delivered"}', now);
  insertWebhook.run('wh-002', 'course.completed', 200, 'https://api.customcrm.com/v1/certs', '{"courseId":"crs-001"}', '{"status":"delivered"}', now);

  // ── Seed Enrollments ──
  const insertEnrollment = db.prepare('INSERT OR IGNORE INTO enrollments (id, student_id, course_id, attendance_rate, gpa, status) VALUES (?, ?, ?, ?, ?, ?)');
  insertEnrollment.run('enr-001', 'student-001', 'crs-001', 94.5, 3.9, 'Good Standing');
  insertEnrollment.run('enr-002', 'student-001', 'crs-002', 88.0, 3.6, 'Good Standing');
  insertEnrollment.run('enr-003', 'student-002', 'crs-001', 76.0, 2.8, 'Academic Warning');

  // ── Seed Assignments ──
  const insertAssignment = db.prepare('INSERT OR IGNORE INTO assignments (id, course_id, title, due_date, max_score, instructions) VALUES (?, ?, ?, ?, ?, ?)');
  insertAssignment.run('asg-001', 'crs-001', 'Binary Search Tree Implementation', '2026-10-15', 100, 'Implement BST with insert, delete, and traversal methods in C++ or Python.');
  insertAssignment.run('asg-002', 'crs-002', 'Round Robin CPU Scheduler Simulation', '2026-10-20', 100, 'Simulate round-robin scheduling algorithm with variable quantum time.');

  // ── Seed Submissions ──
  const insertSubmission = db.prepare('INSERT OR IGNORE INTO submissions (id, assignment_id, student_id, submitted_at, status, current_score, feedback, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertSubmission.run('sub-001', 'asg-001', 'student-001', now, 'Graded', 95.0, 'Excellent code modularity and comprehensive test cases.', 'https://github.com/anurag/bst-implementation');

  // ── Seed Announcements ──
  const insertAnnouncement = db.prepare('INSERT OR IGNORE INTO announcements (id, title, category, content, author, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertAnnouncement.run('ann-001', 'Midterm Examination Schedule Released', 'Examinations', 'The Fall 2026 midterm examination schedule has been officially published.', 'Office of the Registrar', '2026-09-01');
  insertAnnouncement.run('ann-002', 'Annual Claritas Hackathon 2026', 'Events', 'Register your 4-person teams for the upcoming 48-hour innovation challenge.', 'Student Council', '2026-09-03');

  // ── Seed Certificates ──
  const insertCert = db.prepare('INSERT OR IGNORE INTO certificates (id, name, course, rules, last_edited) VALUES (?, ?, ?, ?, ?)');
  insertCert.run('cert-001', 'Certificate of Full Stack Mastery', 'Full Stack Web Development', 'Pass all 6 modules with score >= 80%', now);
  insertCert.run('cert-002', 'Data Structures & Algorithms Honor Award', 'Data Structures & Algorithms', 'Score 90% or higher in final proctored assessment', now);

  // ── Seed Fees ──
  const insertFee = db.prepare('INSERT OR IGNORE INTO fee_records (id, student_id, semester, tuition_fee, lab_fee, paid_amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertFee.run('fee-001', 'student-001', 'Fall 2026', 4500.0, 500.0, 5000.0, 'Paid', '2026-08-30');
  insertFee.run('fee-002', 'student-001', 'Spring 2027', 4500.0, 500.0, 0.0, 'Pending', '2027-01-15');

  // ── Seed Tickets ──
  const insertTicket = db.prepare('INSERT OR IGNORE INTO tickets (id, student_id, title, category, priority, status, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertTicket.run('tkt-001', 'student-001', 'Lab Access RFID Card Issue', 'Facilities', 'High', 'Open', 'My student RFID card does not unlock the Computer Vision lab during after-hours.', now);

  console.log('✅ Claritas Database successfully seeded with all LMS tables & relational test data.');
}

// Check if run directly via `node server/seed.js`
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && currentFile.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  runSeed(true);
}
