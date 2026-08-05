import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

console.log('🌱 Seeding Claritas Database...');
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

initDatabase();

// Insert Users
const passHash = bcrypt.hashSync('password', 10);

const insertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, name, role, role_name, department, organization, status, last_active_at, avatar_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = new Date().toISOString();

insertUser.run('user-001', 'admin@claritas.edu', passHash, 'Aarav Sharma', 'admin', 'Super Admin', 'Administration', 'Claritas University', 'active', now, 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=f87171&color=fff&rounded=true');
insertUser.run('faculty-001', 'teacher@claritas.edu', passHash, 'Dr. Vikram Patel', 'faculty', 'Associate Professor', 'Computer Science & Engineering', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Vikram+Patel&background=0d9488&color=fff&rounded=true');
insertUser.run('student-001', 'student@claritas.edu', passHash, 'Anurag Sonawane', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Anurag+Sonawane&background=2ec4f1&color=fff&rounded=true');
insertUser.run('student-002', 'rohan.s@claritas.edu', passHash, 'Rohan Sharma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=6366f1&color=fff&rounded=true');
insertUser.run('student-003', 'priya.v@claritas.edu', passHash, 'Priya Verma', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff&rounded=true');
insertUser.run('student-004', 'karan.m@claritas.edu', passHash, 'Karan Malhotra', 'student', 'Student', 'Computer Science', 'School of Engineering', 'suspended', now, 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=f87171&color=fff&rounded=true');
insertUser.run('student-005', 'sneha.g@claritas.edu', passHash, 'Sneha Gupta', 'student', 'Student', 'Computer Science', 'School of Engineering', 'active', now, 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=8b5cf6&color=fff&rounded=true');

// Insert Courses
const insertCourse = db.prepare(`
  INSERT INTO courses (
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
      }
    ]
  }
]);

const osModules = JSON.stringify([
  {
    id: 'mod-2',
    title: 'Introduction to Kernels',
    isExpanded: true,
    lessons: [
      {
        id: 'les-2',
        title: 'Monolithic vs Microkernels',
        type: 'text',
        duration: '20min',
        contentBlocks: [
          { id: 'b-2', type: 'text', content: '<h2>Kernel Architectures</h2><p>This lesson explores monolithic and microkernels.</p>' }
        ]
      }
    ]
  }
]);

const mlModules = JSON.stringify([
  {
    id: 'mod-3',
    title: 'Machine Learning Basics',
    isExpanded: true,
    lessons: [
      {
        id: 'les-3',
        title: 'Supervised Learning Overview',
        type: 'text',
        duration: '25min',
        contentBlocks: [
          { id: 'b-3', type: 'text', content: '<h2>Supervised Learning</h2><p>Introduction to classification and regression models.</p>' }
        ]
      }
    ]
  }
]);

insertCourse.run(
  'cs301', 'CS301', 'Data Structures & Algorithms', 'Computer Science', 'faculty-001', 42, 'Fall 2026', 'Mon, Wed 09:00 AM',
  'Master data structures and algorithms, complexity, trees, graphs, and dynamic programming.', 'published', 'Computer Science', 'Intermediate',
  'linear-gradient(135deg, #667eea, #764ba2)', '["dsa","basics"]', dsaModules,
  now, now, now, 'user-001', 'Aarav Sharma', 1, 1, '15min'
);

insertCourse.run(
  'cs402', 'CS402', 'Operating Systems & Kernels', 'Computer Science', 'faculty-001', 38, 'Fall 2026', 'Tue, Thu 11:30 AM',
  'Introduction to scheduling, process management, file systems, and operating system design.', 'published', 'Computer Science', 'Advanced',
  'linear-gradient(135deg, #2af598, #009efd)', '["operating-systems","systems"]', osModules,
  now, now, now, 'user-001', 'Aarav Sharma', 1, 1, '20min'
);

insertCourse.run(
  'ai501', 'AI501', 'Applied Machine Learning', 'Artificial Intelligence', 'faculty-001', 62, 'Fall 2026', 'Wed, Fri 02:30 PM',
  'Apply regression, classification, clustering algorithms, and neural networks using Python.', 'published', 'Artificial Intelligence', 'Advanced',
  'linear-gradient(135deg, #f093fb, #f5576c)', '["machine-learning","ai"]', mlModules,
  now, now, now, 'user-001', 'Aarav Sharma', 1, 1, '25min'
);

// Insert Enrollments
const insertEnrollment = db.prepare(`
  INSERT INTO enrollments (id, student_id, course_id, attendance_rate, gpa, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertEnrollment.run('enr-1', 'student-001', 'cs301', 92.5, 3.8, 'Good Standing');
insertEnrollment.run('enr-2', 'student-002', 'cs301', 88.0, 3.6, 'Good Standing');
insertEnrollment.run('enr-3', 'student-003', 'cs301', 95.0, 3.9, 'Top Performer');
insertEnrollment.run('enr-4', 'student-004', 'cs301', 68.0, 2.9, 'Low Attendance');
insertEnrollment.run('enr-5', 'student-005', 'cs301', 84.0, 3.4, 'Good Standing');

// Insert Assignments
const insertAssignment = db.prepare(`
  INSERT INTO assignments (id, course_id, title, due_date, max_score, status, instructions)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertAssignment.run('asg-1', 'cs301', 'Binary Search Tree Implementation', '2026-08-05', 50, 'Active', 'Implement insertion, deletion, and traversal methods for Binary Search Tree.');
insertAssignment.run('asg-2', 'cs402', 'Round Robin CPU Scheduler Simulation', '2026-08-08', 100, 'Active', 'Simulate Round Robin process scheduling with quantum = 4ms.');

// Insert Submissions
const insertSubmission = db.prepare(`
  INSERT INTO submissions (id, assignment_id, student_id, submitted_at, status, current_score, feedback, content)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertSubmission.run(
  'sub-101', 'asg-1', 'student-002', '2026-07-30 10:15', 'Pending Review', null, null,
  'class Node {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n// BST Implementation...'
);

insertSubmission.run(
  'sub-102', 'asg-2', 'student-003', '2026-07-30 09:40', 'Pending Review', null, null,
  'Round Robin Execution Simulation Details:\nProcess P1 (Burst Time 10ms)\nProcess P2 (Burst Time 4ms)...'
);

insertSubmission.run(
  'sub-103', 'asg-1', 'student-001', '2026-07-29 23:30', 'Graded', 48, 'Excellent work! Clean graph adjacency list implementation and O(V+E) algorithm efficiency.',
  'class BinarySearchTree {\n  // Implementation by Anurag Sonawane\n}'
);

// Insert Initial Audit Log
const insertLog = db.prepare(`
  INSERT INTO audit_logs (id, timestamp, user_id, action, details, ip_address)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertLog.run('log-1', new Date().toISOString(), 'user-001', 'SYSTEM_INIT', 'Database seeded with default accounts', '127.0.0.1');

// Insert Announcements
const insertAnn = db.prepare(`
  INSERT INTO announcements (id, title, category, content, author, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertAnn.run('ann-1', 'Fall 2026 Midterm Exam Schedule Released', 'Academic', 'The midterm exam timetable for CS301, CS402, and AI501 is now published.', 'Academic Affairs', '2026-07-28');
insertAnn.run('ann-2', 'Campus AI & Cloud Computing Hackathon 2026', 'Event', 'Registration is open for the annual 48-hour student hackathon. Prize pool $10,000.', 'Department of CSE', '2026-07-29');

// Insert Tickets (Grievances)
const insertTicket = db.prepare(`
  INSERT INTO tickets (id, student_id, title, category, priority, status, description, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertTicket.run('tkt-1', 'student-001', 'Unable to access CS402 Lab Material PDF', 'Academic', 'High', 'In Progress', 'The lecture 4 PDF link gives a 404 error.', '2026-07-29');

// Insert Fee Records
const insertFee = db.prepare(`
  INSERT INTO fee_records (id, student_id, semester, tuition_fee, lab_fee, paid_amount, status, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertFee.run('fee-1', 'student-001', 'Fall 2026', 4200, 350, 0, 'Pending', '2026-08-15');
insertFee.run('fee-2', 'student-002', 'Fall 2026', 4200, 350, 4550, 'Paid', '2026-08-15');

// Insert Assessments
const insertAssessment = db.prepare(`
  INSERT INTO assessments (id, course_id, title, total_questions, duration_mins, passing_score, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
insertAssessment.run('ast-1', 'cs301', 'Data Structures Midterm Quiz', 15, 30, 70, 'Active');
insertAssessment.run('ast-2', 'cs402', 'Operating Systems Kernel Quiz', 20, 45, 75, 'Active');

// Insert Certificates
const insertCert = db.prepare(`
  INSERT INTO certificates (id, name, course, rules, last_edited)
  VALUES (?, ?, ?, ?, ?)
`);
insertCert.run('cert-1', 'Course Completion Certificate', 'All Courses', 'Score > 80%', '2026-03-15');
insertCert.run('cert-2', 'Honor Roll Certificate', 'UI/UX Design', 'Score > 95%', '2026-01-20');

console.log('✅ Database Seeding Complete!');
