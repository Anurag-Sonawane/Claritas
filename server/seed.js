import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.js';

export async function runSeed(dropTables = false) {
  if (dropTables) {
    console.log('🌱 Dropping existing tables and rebuilding schema...');
    const tables = [
      'scheduled_reports', 'webhook_logs', 'api_keys', 'lesson_progress',
      'assessment_submissions', 'question_bank', 'scorm_packages', 'media_library',
      'course_versions', 'user_permissions', 'refresh_tokens', 'audit_logs',
      'attendance_records', 'submissions', 'assignments', 'enrollments',
      'courses', 'users', 'announcements', 'tickets', 'fee_records',
      'assessments', 'certificates', 'roles'
    ];
    for (const tbl of tables) {
      try {
        await db.exec(`DROP TABLE IF EXISTS ${tbl} CASCADE;`);
      } catch {
        await db.exec(`DROP TABLE IF EXISTS ${tbl};`);
      }
    }
  }

  // Ensure tables and indexes exist
  await initDatabase();

  console.log('🌱 Populating initial roles, users, courses, and platform records...');
  const passHash = bcrypt.hashSync('password', 10);
  const now = new Date().toISOString();

  // ── Seed Default Roles ──
  const defaultRoles = [
    {
      id: 'role-super-admin',
      name: 'Super Admin',
      description: 'Full platform access with destructive controls and role assignment',
      permissions: ['*'],
      is_system: 1,
      user_count: 1
    },
    {
      id: 'role-org-admin',
      name: 'Org Admin',
      description: 'Manage users, courses, and view reports within organization',
      permissions: ['users:read', 'users:write', 'courses:read', 'courses:write', 'reports:read'],
      is_system: 1,
      user_count: 0
    },
    {
      id: 'role-course-mgr',
      name: 'Course Manager',
      description: 'Create, edit, and publish courses and assessments',
      permissions: ['courses:read', 'courses:write', 'assessments:read', 'assessments:write'],
      is_system: 1,
      user_count: 0
    },
    {
      id: 'role-instructor',
      name: 'Instructor',
      description: 'Grade submissions, view student rosters, and manage course content',
      permissions: ['courses:read', 'courses:edit', 'grades:manage', 'attendance:manage', 'assignments:create'],
      is_system: 1,
      user_count: 2
    },
    {
      id: 'role-support',
      name: 'Support',
      description: 'View users, impersonate for troubleshooting, and handle tickets',
      permissions: ['users:read', 'users:impersonate', 'audit:read', 'tickets:manage'],
      is_system: 1,
      user_count: 0
    },
    {
      id: 'role-student',
      name: 'Student',
      description: 'Enroll in courses, submit assignments, take assessments, view grades',
      permissions: ['courses:read', 'assignments:submit', 'assessments:take'],
      is_system: 1,
      user_count: 5
    }
  ];

  for (const r of defaultRoles) {
    await db.run(`
      INSERT INTO roles (id, name, description, permissions_json, is_system, user_count)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, [r.id, r.name, r.description, JSON.stringify(r.permissions), r.is_system, r.user_count]);
  }

  // ── Seed Users ──
  const users = [
    ['user-001', 'admin@claritas.edu', passHash, 'Aarav Sharma', 'admin', 'Super Admin', 'Administration', 'Claritas University', 'active', now, 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=f87171&color=fff&rounded=true'],
    ['faculty-001', 'teacher@claritas.edu', passHash, 'Dr. Vikram Patel', 'faculty', 'Associate Professor', 'Computer Science & Engineering', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Vikram+Patel&background=0d9488&color=fff&rounded=true'],
    ['faculty-002', 'faculty@claritas.edu', passHash, 'Dr. Robert Vance', 'faculty', 'Associate Professor', 'Computer Science & Engineering', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Robert+Vance&background=0d9488&color=fff&rounded=true'],
    ['student-001', 'student@claritas.edu', passHash, 'Anurag Sonawane', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Anurag+Sonawane&background=2ec4f1&color=fff&rounded=true'],
    ['student-002', 'rohan.s@claritas.edu', passHash, 'Rohan Sharma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=6366f1&color=fff&rounded=true'],
    ['student-003', 'priya.v@claritas.edu', passHash, 'Priya Verma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff&rounded=true'],
    ['student-004', 'karan.m@claritas.edu', passHash, 'Karan Malhotra', 'student', 'Student', 'Computer Science', 'School of Engineering', 'suspended', now, 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=f87171&color=fff&rounded=true'],
    ['student-005', 'sneha.g@claritas.edu', passHash, 'Sneha Gupta', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=8b5cf6&color=fff&rounded=true'],
  ];

  for (const u of users) {
    await db.run(`
      INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, u);
  }

  // ── Seed Role Permissions ──
  const adminPerms = ['users:manage', 'courses:manage', 'certificates:manage', 'reports:view', 'audit:view', 'settings:manage'];
  for (let idx = 0; idx < adminPerms.length; idx++) {
    await db.run(`
      INSERT INTO user_permissions (id, user_id, permission)
      VALUES (?, ?, ?)
      ON CONFLICT DO NOTHING
    `, [`perm-adm-${idx}`, 'user-001', adminPerms[idx]]);
  }

  const facultyPerms = ['courses:edit', 'grades:manage', 'attendance:manage', 'assignments:create'];
  for (let idx = 0; idx < facultyPerms.length; idx++) {
    await db.run(`
      INSERT INTO user_permissions (id, user_id, permission)
      VALUES (?, ?, ?)
      ON CONFLICT DO NOTHING
    `, [`perm-fac-${idx}`, 'faculty-001', facultyPerms[idx]]);

    await db.run(`
      INSERT INTO user_permissions (id, user_id, permission)
      VALUES (?, ?, ?)
      ON CONFLICT DO NOTHING
    `, [`perm-fac2-${idx}`, 'faculty-002', facultyPerms[idx]]);
  }

  // ── Seed Courses ──
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

  const courses = [
    [
      'crs-001', 'CS301', 'Data Structures & Algorithms', 'Computer Science', 'faculty-001', 54, 'Fall 2026', 'Mon/Wed 10:00 AM',
      'Master arrays, trees, graphs, sorting, and dynamic programming with interactive visualizations.',
      'published', 'Computer Science', 'Intermediate', 'linear-gradient(135deg, #FF5A36, #FF8C66)',
      JSON.stringify(['Algorithms', 'Data Structures', 'Python', 'C++']), dsaModules,
      now, now, now, 'user-001', 'Aarav Sharma', 1, 2, '40min'
    ],
    [
      'crs-002', 'CS402', 'Operating Systems Design', 'Computer Science', 'faculty-001', 42, 'Fall 2026', 'Tue/Thu 2:00 PM',
      'Understand kernel architecture, concurrency, memory virtualization, and file systems.',
      'published', 'Computer Science', 'Advanced', 'linear-gradient(135deg, #2EC4F1, #7BE0FF)',
      JSON.stringify(['OS', 'Kernel', 'C', 'Concurrency']), '[]',
      now, now, now, 'user-001', 'Aarav Sharma', 0, 0, '0min'
    ]
  ];

  for (const c of courses) {
    await db.run(`
      INSERT INTO courses (
        id, code, title, department, instructor_id, students_count, term, schedule,
        description, status, category, level, thumbnail_gradient, tags, modules_json,
        created_at, updated_at, published_at, manager_id, manager_name, total_modules, total_lessons, total_duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, c);
  }

  // ── Seed Course Versions ──
  await db.run(`
    INSERT INTO course_versions (id, course_id, version, label, author, changes_json, snapshot_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['v-crs-001-1', 'crs-001', 1, 'Initial Syllabus Release', 'Aarav Sharma', JSON.stringify(['Created Module 1: Foundations of DSA', 'Added 2 lessons']), dsaModules, now]);

  // ── Seed Media Library ──
  const mediaItems = [
    ['media-1', 'CS301_Syllabus_Fall2026.pdf', 'Documents', 'pdf', 'application/pdf', 124000, 'https://cdn.claritas.edu/media/cs301-syllabus.pdf', 'Aarav Sharma', now],
    ['media-2', 'BigO_Complexity_CheatSheet.png', 'Images', 'png', 'image/png', 450000, 'https://cdn.claritas.edu/media/big-o-cheatsheet.png', 'Dr. Vikram Patel', now],
    ['media-3', 'Algorithm_Analysis_Lecture1.mp4', 'Videos', 'mp4', 'video/mp4', 12500000, 'https://cdn.claritas.edu/media/lecture1.mp4', 'Dr. Vikram Patel', now]
  ];
  for (const m of mediaItems) {
    await db.run(`
      INSERT INTO media_library (id, name, folder, type, mime, size, cdn_url, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, m);
  }

  // ── Seed SCORM Packages ──
  await db.run(`
    INSERT INTO scorm_packages (id, course_id, file_name, title, version, type, status, sco_count, file_size, created_at, validated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['scorm-001', 'crs-001', 'dsa_interactive_labs.zip', 'DSA Interactive Visualizer Lab', '1.0', 'SCORM 2004', 'valid', 4, 3400000, now, now]);

  // ── Seed Question Bank ──
  const questions = [
    ['q-1', 'crs-001', 'Which React hook is used for performing side effects in functional components?', 'MCQ', 'Easy', JSON.stringify(['React', 'Hooks', 'Basics']), JSON.stringify(['useState', 'useEffect', 'useReducer', 'useMemo']), 'useEffect', 10],
    ['q-2', 'crs-001', 'Explain the differences between process and thread in modern operating systems.', 'Essay', 'Medium', JSON.stringify(['Operating Systems', 'Concurrency']), '[]', '', 15],
    ['q-3', 'crs-001', 'Implement Binary Search on a sorted array with O(log n) time complexity.', 'Code', 'Hard', JSON.stringify(['Algorithms', 'Binary Search']), '[]', 'function binarySearch(arr, target) { ... }', 20]
  ];
  for (const q of questions) {
    await db.run(`
      INSERT INTO question_bank (id, course_id, text, type, difficulty, tags_json, options_json, answer, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, q);
  }

  // ── Seed Assessment Submissions ──
  await db.run(`
    INSERT INTO assessment_submissions (id, assessment_id, student_id, student_name, course_title, type, status, submitted_at, score, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['sub-asm-1', 'asm-1', 'student-001', 'Anurag Sonawane', 'CS301 - Data Structures & Algorithms', 'Essay/File', 'Pending', now, null, null]);

  await db.run(`
    INSERT INTO assessment_submissions (id, assessment_id, student_id, student_name, course_title, type, status, submitted_at, score, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['sub-asm-2', 'asm-1', 'student-002', 'Rohan Sharma', 'CS301 - Data Structures & Algorithms', 'Essay/File', 'Pending', now, null, null]);

  // ── Seed Lesson Progress ──
  await db.run(`
    INSERT INTO lesson_progress (id, student_id, course_id, lesson_id, status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['prog-001', 'student-001', 'crs-001', 'les-1', 'completed', now]);

  // ── Seed API Keys ──
  const rawSecret = 'pk_live_8f92a4bc88194ad9b30c18d4';
  const keyHash = crypto.createHash('sha256').update(rawSecret).digest('hex');
  await db.run(`
    INSERT INTO api_keys (id, name, prefix, key_hash, created_at, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['key_1', 'Student Information System Sync', 'pk_live_8f92', keyHash, now, now]);

  // ── Seed Webhook Logs ──
  await db.run(`
    INSERT INTO webhook_logs (event, status_code, url, payload_json, response_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['user.created', 200, 'https://api.hubapi.com/v1/users', '{"id":"user-001"}', '{"status":"delivered"}', now]);

  await db.run(`
    INSERT INTO webhook_logs (event, status_code, url, payload_json, response_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['course.completed', 200, 'https://api.customcrm.com/v1/certs', '{"courseId":"crs-001"}', '{"status":"delivered"}', now]);

  // ── Seed Enrollments ──
  const enrollments = [
    ['enr-001', 'student-001', 'crs-001', 94.5, 3.9, 'Good Standing'],
    ['enr-002', 'student-001', 'crs-002', 88.0, 3.6, 'Good Standing'],
    ['enr-003', 'student-002', 'crs-001', 76.0, 2.8, 'Academic Warning']
  ];
  for (const e of enrollments) {
    await db.run(`
      INSERT INTO enrollments (id, student_id, course_id, attendance_rate, gpa, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, e);
  }

  // ── Seed Assignments ──
  await db.run(`
    INSERT INTO assignments (id, course_id, title, due_date, max_score, instructions)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['asg-001', 'crs-001', 'Binary Search Tree Implementation', '2026-10-15', 100, 'Implement BST with insert, delete, and traversal methods in C++ or Python.']);

  await db.run(`
    INSERT INTO assignments (id, course_id, title, due_date, max_score, instructions)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['asg-002', 'crs-002', 'Round Robin CPU Scheduler Simulation', '2026-10-20', 100, 'Simulate round-robin scheduling algorithm with variable quantum time.']);

  // ── Seed Submissions ──
  await db.run(`
    INSERT INTO submissions (id, assignment_id, student_id, submitted_at, status, current_score, feedback, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['sub-001', 'asg-001', 'student-001', now, 'Graded', 95.0, 'Excellent code modularity and comprehensive test cases.', 'https://github.com/anurag/bst-implementation']);

  // ── Seed Announcements ──
  await db.run(`
    INSERT INTO announcements (id, title, category, content, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['ann-001', 'Midterm Examination Schedule Released', 'Examinations', 'The Fall 2026 midterm examination schedule has been officially published.', 'Office of the Registrar', '2026-09-01']);

  await db.run(`
    INSERT INTO announcements (id, title, category, content, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['ann-002', 'Annual Claritas Hackathon 2026', 'Events', 'Register your 4-person teams for the upcoming 48-hour innovation challenge.', 'Student Council', '2026-09-03']);

  // ── Seed Certificates ──
  await db.run(`
    INSERT INTO certificates (id, name, course, rules, last_edited)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['cert-001', 'Certificate of Full Stack Mastery', 'Full Stack Web Development', 'Pass all 6 modules with score >= 80%', now]);

  await db.run(`
    INSERT INTO certificates (id, name, course, rules, last_edited)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['cert-002', 'Data Structures & Algorithms Honor Award', 'Data Structures & Algorithms', 'Score 90% or higher in final proctored assessment', now]);

  // ── Seed Fees ──
  await db.run(`
    INSERT INTO fee_records (id, student_id, semester, tuition_fee, lab_fee, paid_amount, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['fee-001', 'student-001', 'Fall 2026', 4500.0, 500.0, 5000.0, 'Paid', '2026-08-30']);

  await db.run(`
    INSERT INTO fee_records (id, student_id, semester, tuition_fee, lab_fee, paid_amount, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['fee-002', 'student-001', 'Spring 2027', 4500.0, 500.0, 0.0, 'Pending', '2027-01-15']);

  // ── Seed Tickets ──
  await db.run(`
    INSERT INTO tickets (id, student_id, title, category, priority, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `, ['tkt-001', 'student-001', 'Lab Access RFID Card Issue', 'Facilities', 'High', 'Open', 'My student RFID card does not unlock the Computer Vision lab during after-hours.', now]);

  console.log('✅ Claritas Database successfully seeded with all LMS tables & relational test data.');
}

// Auto-run if executed directly via CLI
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && currentFile.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  runSeed(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
