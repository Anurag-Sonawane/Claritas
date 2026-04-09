// ═══════════════════════════════════════════════════════════
// Claritas Admin — Mock Data Fixtures
// 50+ users, roles, audit events, import jobs
// ═══════════════════════════════════════════════════════════

const ORGS = [
  'Claritas University', 'School of Engineering', 'School of Business',
  'School of Medicine', 'School of Arts & Sciences', 'Graduate Studies'
];

// ── Roles ──────────────────────────────────────────────────
export const PERMISSIONS_CATALOG = [
  { key: 'users.view', label: 'View Users', category: 'Users' },
  { key: 'users.create', label: 'Create Users', category: 'Users' },
  { key: 'users.edit', label: 'Edit Users', category: 'Users' },
  { key: 'users.delete', label: 'Delete Users', category: 'Users' },
  { key: 'users.suspend', label: 'Suspend Users', category: 'Users' },
  { key: 'users.impersonate', label: 'Impersonate Users', category: 'Users' },
  { key: 'users.export', label: 'Export Users', category: 'Users' },
  { key: 'users.import', label: 'Bulk Import Users', category: 'Users' },
  { key: 'courses.view', label: 'View Courses', category: 'Courses' },
  { key: 'courses.create', label: 'Create Courses', category: 'Courses' },
  { key: 'courses.edit', label: 'Edit Courses', category: 'Courses' },
  { key: 'courses.delete', label: 'Delete Courses', category: 'Courses' },
  { key: 'courses.enroll', label: 'Manage Enrollments', category: 'Courses' },
  { key: 'content.view', label: 'View Content', category: 'Content' },
  { key: 'content.create', label: 'Create Content', category: 'Content' },
  { key: 'content.edit', label: 'Edit Content', category: 'Content' },
  { key: 'content.delete', label: 'Delete Content', category: 'Content' },
  { key: 'reports.view', label: 'View Reports', category: 'Reports' },
  { key: 'reports.export', label: 'Export Reports', category: 'Reports' },
  { key: 'settings.view', label: 'View Settings', category: 'Settings' },
  { key: 'settings.edit', label: 'Edit Settings', category: 'Settings' },
  { key: 'roles.manage', label: 'Manage Roles', category: 'Settings' },
  { key: 'audit.view', label: 'View Audit Logs', category: 'Settings' },
];

const ALL_PERMS = PERMISSIONS_CATALOG.map(p => p.key);

export const roles = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions. Reserved for platform administrators.',
    permissions: ALL_PERMS,
    isSystem: true,
    userCount: 3,
    createdAt: '2025-01-15T10:00:00Z',
    colorVar: '--role-super-admin',
  },
  {
    id: 'role-org-admin',
    name: 'Org Admin',
    description: 'Manages users, courses, and settings within their organization.',
    permissions: ALL_PERMS.filter(p => !p.startsWith('settings.') && p !== 'roles.manage'),
    isSystem: true,
    userCount: 8,
    createdAt: '2025-01-15T10:00:00Z',
    colorVar: '--role-org-admin',
  },
  {
    id: 'role-course-mgr',
    name: 'Course Manager',
    description: 'Creates and manages courses, content, and enrollments.',
    permissions: ['users.view', 'courses.view', 'courses.create', 'courses.edit', 'courses.enroll', 'content.view', 'content.create', 'content.edit', 'reports.view'],
    isSystem: true,
    userCount: 15,
    createdAt: '2025-01-15T10:00:00Z',
    colorVar: '--role-course-mgr',
  },
  {
    id: 'role-support',
    name: 'Support',
    description: 'View-only access to users and courses for helpdesk support.',
    permissions: ['users.view', 'courses.view', 'content.view', 'reports.view', 'users.impersonate'],
    isSystem: true,
    userCount: 12,
    createdAt: '2025-01-15T10:00:00Z',
    colorVar: '--role-support',
  },
  {
    id: 'role-content-editor',
    name: 'Content Editor',
    description: 'Custom role for content creation and management.',
    permissions: ['content.view', 'content.create', 'content.edit', 'courses.view'],
    isSystem: false,
    userCount: 6,
    createdAt: '2025-09-20T14:30:00Z',
    colorVar: '--role-custom',
  },
  {
    id: 'role-analyst',
    name: 'Data Analyst',
    description: 'Custom role for viewing and exporting reports and analytics.',
    permissions: ['users.view', 'users.export', 'courses.view', 'reports.view', 'reports.export', 'audit.view'],
    isSystem: false,
    userCount: 4,
    createdAt: '2025-11-05T09:15:00Z',
    colorVar: '--role-custom',
  },
];

// ── Users ──────────────────────────────────────────────────
const firstNames = [
  'Aarav', 'Priya', 'Arjun', 'Diya', 'Rohan', 'Ananya', 'Vikram', 'Ishita',
  'Aditya', 'Kavya', 'Siddharth', 'Meera', 'Karthik', 'Nisha', 'Rahul',
  'Pooja', 'Nikhil', 'Shruti', 'Amit', 'Riya', 'Varun', 'Tanya', 'Manish',
  'Neha', 'Suresh', 'Lakshmi', 'Dev', 'Anjali', 'Rajesh', 'Simran',
  'Harsh', 'Deepika', 'Gaurav', 'Sneha', 'Pranav', 'Ritika', 'Sahil',
  'Divya', 'Akash', 'Pallavi', 'Yash', 'Swati', 'Kunal', 'Megha',
  'Aryan', 'Jyoti', 'Vivek', 'Aditi', 'Naveen', 'Sakshi'
];

const lastNames = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Mehta', 'Joshi',
  'Verma', 'Nair', 'Malhotra', 'Desai', 'Chatterjee', 'Iyer', 'Kapoor',
  'Bhat', 'Rao', 'Mishra', 'Das', 'Pillai', 'Agarwal', 'Shah', 'Menon',
  'Chopra', 'Kulkarni', 'Pandey', 'Srinivasan', 'Dutta', 'Banerjee', 'Jain',
  'Naidu', 'Saxena', 'Tiwari', 'Mukherjee', 'Chauhan', 'Ghosh', 'Patil',
  'Rajan', 'Sethi', 'Thakur', 'Bose', 'Khanna', 'Anand', 'Goyal',
  'Prakash', 'Hegde', 'Khatri', 'Shukla', 'Walia', 'Bhatt'
];

const statuses = ['active', 'active', 'active', 'active', 'suspended', 'invited', 'deleted'];
const roleIds = ['role-super-admin', 'role-org-admin', 'role-org-admin', 'role-course-mgr', 'role-course-mgr', 'role-course-mgr', 'role-support', 'role-support', 'role-content-editor', 'role-analyst'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateUsers(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const status = statuses[i % statuses.length];
    const roleId = roleIds[i % roleIds.length];
    const org = ORGS[i % ORGS.length];

    result.push({
      id: `user-${String(i + 1).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@claritas.edu`,
      avatarUrl: `https://i.pravatar.cc/150?u=admin${i + 1}`,
      roleId,
      roleName: roles.find(r => r.id === roleId)?.name || 'Unknown',
      organization: org,
      status,
      lastActiveAt: status === 'active'
        ? randomDate(new Date('2026-03-01'), new Date('2026-04-08'))
        : status === 'suspended'
          ? randomDate(new Date('2026-01-01'), new Date('2026-02-28'))
          : null,
      createdAt: randomDate(new Date('2025-01-01'), new Date('2026-01-01')),
      phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      department: ['Computer Science', 'Electrical Engineering', 'Business Administration', 'Medicine', 'Physics', 'Mathematics'][i % 6],
      enrollments: [
        { courseId: 'course-1', courseName: 'Introduction to AI', progress: Math.floor(Math.random() * 100), status: 'enrolled' },
        { courseId: 'course-2', courseName: 'Data Structures', progress: Math.floor(Math.random() * 100), status: 'completed' },
        { courseId: 'course-3', courseName: 'Database Systems', progress: Math.floor(Math.random() * 100), status: 'enrolled' },
      ].slice(0, 1 + (i % 3)),
      activityTimeline: generateActivityTimeline(i),
    });
  }
  return result;
}

function generateActivityTimeline(seed) {
  const actions = [
    { action: 'Logged in', detail: 'Chrome on Windows' },
    { action: 'Viewed course', detail: 'Introduction to AI' },
    { action: 'Submitted assignment', detail: 'Lab Report #3' },
    { action: 'Downloaded resource', detail: 'Lecture Notes Week 5' },
    { action: 'Updated profile', detail: 'Changed email address' },
    { action: 'Completed quiz', detail: 'Mid-term Practice Quiz — Score: 85%' },
    { action: 'Posted in discussion', detail: 'Q&A Forum: Machine Learning Basics' },
    { action: 'Logged out', detail: '' },
  ];

  const timeline = [];
  for (let i = 0; i < 12; i++) {
    const act = actions[(seed + i) % actions.length];
    timeline.push({
      id: `activity-${seed}-${i}`,
      ...act,
      timestamp: randomDate(new Date('2026-03-01'), new Date('2026-04-08')),
    });
  }
  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export const users = generateUsers(52);

// ── Audit Logs ─────────────────────────────────────────────
const auditActions = [
  'user.created', 'user.updated', 'user.suspended', 'user.reactivated',
  'user.deleted', 'user.impersonated', 'user.invited', 'user.bulk_imported',
  'role.created', 'role.updated', 'login.success', 'login.failed',
  'export.users', 'settings.updated'
];

const auditActors = [
  { id: 'user-001', name: 'Aarav Sharma' },
  { id: 'user-002', name: 'Priya Patel' },
  { id: 'user-003', name: 'Arjun Gupta' },
  { id: 'system', name: 'System' },
];

const ips = ['192.168.1.45', '10.0.0.12', '172.16.0.88', '192.168.2.100', '10.0.1.55'];

function generateAuditLogs(count) {
  const logs = [];
  for (let i = 0; i < count; i++) {
    const action = auditActions[i % auditActions.length];
    const actor = auditActors[i % auditActors.length];
    const target = users[i % users.length];

    logs.push({
      id: `audit-${String(i + 1).padStart(4, '0')}`,
      actorAdminId: actor.id,
      actorName: actor.name,
      action,
      targetType: action.startsWith('role.') ? 'role' : action.startsWith('login.') ? 'session' : 'user',
      targetId: target.id,
      targetName: target.name,
      ip: ips[i % ips.length],
      reason: action === 'user.impersonated' ? 'Investigating support ticket #' + (1000 + i)
        : action === 'user.suspended' ? 'Policy violation — multiple failed assessments'
        : action === 'user.deleted' ? 'Account cleanup — user requested deletion'
        : '',
      metadata: {},
      createdAt: randomDate(new Date('2026-01-01'), new Date('2026-04-08')),
    });
  }
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const auditLogs = generateAuditLogs(120);

// ── Import Jobs ────────────────────────────────────────────
export const importJobs = [
  {
    id: 'import-001',
    requestedBy: 'user-001',
    requestedByName: 'Aarav Sharma',
    status: 'completed',
    totalRows: 150,
    processedRows: 150,
    successRows: 147,
    errorRows: 3,
    errors: [
      { row: 23, field: 'email', message: 'Duplicate email: duplicate@claritas.edu' },
      { row: 67, field: 'role', message: 'Unknown role: "reviewer"' },
      { row: 112, field: 'email', message: 'Invalid email format' },
    ],
    fileRef: 'users_batch_march_2026.csv',
    createdAt: '2026-03-15T14:30:00Z',
    completedAt: '2026-03-15T14:32:45Z',
  },
  {
    id: 'import-002',
    requestedBy: 'user-002',
    requestedByName: 'Priya Patel',
    status: 'processing',
    totalRows: 85,
    processedRows: 42,
    successRows: 41,
    errorRows: 1,
    errors: [
      { row: 18, field: 'name', message: 'Name field is required' },
    ],
    fileRef: 'new_students_april.csv',
    createdAt: '2026-04-08T10:15:00Z',
    completedAt: null,
  },
  {
    id: 'import-003',
    requestedBy: 'user-003',
    requestedByName: 'Arjun Gupta',
    status: 'failed',
    totalRows: 200,
    processedRows: 12,
    successRows: 10,
    errorRows: 2,
    errors: [
      { row: 0, field: 'file', message: 'CSV parsing failed: unexpected delimiter at row 13' },
    ],
    fileRef: 'faculty_import_broken.csv',
    createdAt: '2026-04-01T09:00:00Z',
    completedAt: '2026-04-01T09:00:15Z',
  },
];

// ── Invite Templates ───────────────────────────────────────
export const inviteTemplates = [
  {
    id: 'tpl-default',
    name: 'Default Welcome',
    subject: 'Welcome to Claritas LMS — Your Account is Ready',
    body: `Hi {{name}},\n\nYou've been invited to join Claritas LMS as a {{role}}.\n\nClick the link below to set up your account:\n{{link}}\n\nIf you have any questions, please contact your administrator.\n\nBest regards,\nClaritas Admin Team`,
  },
  {
    id: 'tpl-course',
    name: 'Course Enrollment',
    subject: 'You\'ve been enrolled — {{course_name}}',
    body: `Hi {{name}},\n\nYou have been enrolled in {{course_name}} on Claritas LMS.\n\nAccess your course here:\n{{link}}\n\nHappy learning!\nClaritas Admin Team`,
  },
];

// ── Current Admin (logged-in user) ─────────────────────────
export const currentAdmin = {
  id: 'user-001',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@claritas.edu',
  avatarUrl: 'https://i.pravatar.cc/150?u=admin1',
  roleId: 'role-super-admin',
  roleName: 'Super Admin',
  organization: 'Claritas University',
};
