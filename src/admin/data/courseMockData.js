// ═══════════════════════════════════════════════════════════
// Claritas Admin — Course & Content Mock Data
// 30 courses, media library, SCORM packages, versions
// ═══════════════════════════════════════════════════════════

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// ── Course Categories & Tags ──
export const COURSE_CATEGORIES = [
  'Computer Science', 'Data Science', 'Engineering', 'Business',
  'Mathematics', 'Medicine', 'Arts & Humanities', 'Natural Sciences',
];

export const COURSE_TAGS = [
  'beginner', 'intermediate', 'advanced', 'self-paced', 'instructor-led',
  'certification', 'lab-required', 'project-based', 'AI', 'machine-learning',
  'web-dev', 'mobile', 'database', 'security', 'cloud', 'devops',
];

export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

// ── Instructors ──
export const instructors = [
  { id: 'inst-001', name: 'Dr. Aarav Sharma', avatarUrl: 'https://i.pravatar.cc/150?u=inst1', department: 'Computer Science' },
  { id: 'inst-002', name: 'Prof. Priya Patel', avatarUrl: 'https://i.pravatar.cc/150?u=inst2', department: 'Data Science' },
  { id: 'inst-003', name: 'Dr. Arjun Gupta', avatarUrl: 'https://i.pravatar.cc/150?u=inst3', department: 'Engineering' },
  { id: 'inst-004', name: 'Dr. Diya Singh', avatarUrl: 'https://i.pravatar.cc/150?u=inst4', department: 'Mathematics' },
  { id: 'inst-005', name: 'Prof. Rohan Kumar', avatarUrl: 'https://i.pravatar.cc/150?u=inst5', department: 'Business' },
  { id: 'inst-006', name: 'Dr. Ananya Reddy', avatarUrl: 'https://i.pravatar.cc/150?u=inst6', department: 'Medicine' },
  { id: 'inst-007', name: 'Prof. Vikram Mehta', avatarUrl: 'https://i.pravatar.cc/150?u=inst7', department: 'Computer Science' },
  { id: 'inst-008', name: 'Dr. Ishita Joshi', avatarUrl: 'https://i.pravatar.cc/150?u=inst8', department: 'Arts & Humanities' },
];

// ── Content Block Types ──
export const BLOCK_TYPES = [
  { type: 'text', label: 'Text Content', icon: 'Type' },
  { type: 'video', label: 'Video Embed', icon: 'Play' },
  { type: 'file', label: 'File Attachment', icon: 'Paperclip' },
  { type: 'quiz', label: 'Quiz', icon: 'HelpCircle' },
  { type: 'scorm', label: 'SCORM/xAPI Package', icon: 'Package' },
];

// ── Generate Lessons ──
function generateLessons(moduleIndex, lessonCount) {
  const lessonTitles = [
    ['Introduction & Overview', 'Core Concepts', 'Hands-on Lab #1', 'Practice Exercises', 'Summary & Review'],
    ['Theory Foundations', 'Advanced Techniques', 'Case Study Analysis', 'Lab Session #2', 'Quiz & Assessment'],
    ['Deep Dive', 'Real-world Applications', 'Group Project', 'Peer Review', 'Module Wrap-up'],
    ['Getting Started', 'Key Principles', 'Workshop', 'Discussion Forum', 'Final Assessment'],
  ];
  const titles = lessonTitles[moduleIndex % lessonTitles.length];

  return Array.from({ length: lessonCount }, (_, i) => ({
    id: `lesson-${moduleIndex}-${i}`,
    title: titles[i % titles.length] + (i >= titles.length ? ` (Part ${Math.floor(i / titles.length) + 1})` : ''),
    type: ['text', 'video', 'text', 'quiz', 'text'][i % 5],
    duration: (5 + Math.floor(Math.random() * 25)) + 'min',
    isCompleted: Math.random() > 0.4,
    contentBlocks: [
      {
        id: `block-${moduleIndex}-${i}-0`,
        type: 'text',
        content: `<h2>${titles[i % titles.length]}</h2><p>This lesson covers the fundamental concepts and practical applications. Students will learn through interactive examples and hands-on exercises.</p><p>Key learning objectives include understanding core principles, applying them to real-world scenarios, and developing critical thinking skills.</p>`,
      },
      ...(i % 3 === 1 ? [{
        id: `block-${moduleIndex}-${i}-1`,
        type: 'video',
        content: '',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoTitle: `Lecture ${moduleIndex + 1}.${i + 1} — ${titles[i % titles.length]}`,
      }] : []),
      ...(i % 4 === 2 ? [{
        id: `block-${moduleIndex}-${i}-2`,
        type: 'file',
        content: '',
        fileId: `media-${(moduleIndex * 5 + i) % 40 + 1}`,
        fileName: `lecture-notes-m${moduleIndex + 1}-l${i + 1}.pdf`,
        fileSize: Math.floor(Math.random() * 5000) + 500,
      }] : []),
      ...(i % 5 === 3 ? [{
        id: `block-${moduleIndex}-${i}-3`,
        type: 'quiz',
        content: '',
        quizTitle: `Quiz: ${titles[i % titles.length]}`,
        questionCount: 5 + Math.floor(Math.random() * 10),
        timeLimit: (10 + Math.floor(Math.random() * 20)) + 'min',
      }] : []),
    ],
  }));
}

// ── Generate Modules ──
function generateModules(courseIndex, moduleCount) {
  const moduleNames = [
    ['Foundations', 'Core Theory', 'Practical Applications', 'Advanced Topics', 'Capstone Project'],
    ['Getting Started', 'Intermediate Concepts', 'Expert Techniques', 'Industry Practices', 'Final Project'],
    ['Introduction', 'Key Frameworks', 'Hands-on Labs', 'Case Studies', 'Assessment & Review'],
  ];
  const names = moduleNames[courseIndex % moduleNames.length];

  return Array.from({ length: moduleCount }, (_, i) => ({
    id: `module-${courseIndex}-${i}`,
    title: `Module ${i + 1}: ${names[i % names.length]}`,
    description: `Comprehensive coverage of ${names[i % names.length].toLowerCase()} for this course.`,
    isExpanded: i === 0,
    lessons: generateLessons(courseIndex * 10 + i, 3 + Math.floor(Math.random() * 3)),
  }));
}

// ── Courses ──
const courseTitles = [
  'Introduction to Artificial Intelligence', 'Data Structures & Algorithms',
  'Database Management Systems', 'Full-Stack Web Development',
  'Machine Learning Fundamentals', 'Computer Networks',
  'Operating Systems', 'Software Engineering Principles',
  'Cybersecurity Essentials', 'Cloud Computing with AWS',
  'Mobile App Development', 'Deep Learning & Neural Networks',
  'Natural Language Processing', 'Computer Vision',
  'Blockchain Technology', 'DevOps Engineering',
  'Statistical Analysis', 'Linear Algebra for ML',
  'Digital Signal Processing', 'Embedded Systems',
  'Human-Computer Interaction', 'Distributed Systems',
  'Quantum Computing Basics', 'Ethical AI & Governance',
  'Business Analytics', 'Healthcare Informatics',
  'Bioinformatics', 'Robotics Engineering',
  'Game Development with Unity', 'Internet of Things',
];

const courseDescriptions = [
  'A comprehensive introduction covering foundational concepts, practical applications, and industry best practices.',
  'Master the essential skills and techniques needed for professional success in this rapidly growing field.',
  'Explore advanced topics through hands-on labs, real-world case studies, and expert-led instruction.',
  'Build practical skills with project-based learning and industry-relevant assignments.',
  'From theory to practice — develop a deep understanding through structured lessons and assessments.',
];

const statuses = ['draft', 'published', 'published', 'published', 'archived', 'review'];
const thumbnailColors = [
  'linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)', 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)', 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  'linear-gradient(135deg, #f5576c, #ff6f91)', 'linear-gradient(135deg, #c3cfe2, #f5f7fa)',
];

export const courses = courseTitles.map((title, i) => {
  const status = statuses[i % statuses.length];
  const moduleCount = 3 + Math.floor(Math.random() * 3);
  const modules = generateModules(i, moduleCount);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const instIds = [instructors[i % instructors.length], ...(i % 3 === 0 ? [instructors[(i + 1) % instructors.length]] : [])];

  return {
    id: `course-${String(i + 1).padStart(3, '0')}`,
    title,
    description: courseDescriptions[i % courseDescriptions.length],
    category: COURSE_CATEGORIES[i % COURSE_CATEGORIES.length],
    level: COURSE_LEVELS[i % COURSE_LEVELS.length],
    tags: [COURSE_TAGS[i % COURSE_TAGS.length], COURSE_TAGS[(i + 3) % COURSE_TAGS.length], COURSE_TAGS[(i + 7) % COURSE_TAGS.length]],
    instructors: instIds,
    thumbnailGradient: thumbnailColors[i % thumbnailColors.length],
    status,
    enrollmentCount: status === 'published' ? 50 + Math.floor(Math.random() * 450) : status === 'archived' ? 200 + Math.floor(Math.random() * 300) : 0,
    completionRate: status === 'published' ? Math.floor(40 + Math.random() * 55) : status === 'archived' ? Math.floor(70 + Math.random() * 28) : 0,
    modules,
    totalModules: moduleCount,
    totalLessons,
    totalDuration: `${Math.floor(totalLessons * 12 + Math.random() * 30)}min`,
    createdAt: randomDate(new Date('2025-06-01'), new Date('2026-02-01')),
    updatedAt: randomDate(new Date('2026-03-01'), new Date('2026-04-08')),
    publishedAt: status === 'published' ? randomDate(new Date('2026-01-01'), new Date('2026-03-15')) : null,
    managerId: 'user-001',
    managerName: 'Aarav Sharma',
  };
});

// ── Media Library ──
const mediaFolders = ['Course Assets', 'Lecture Slides', 'Lab Files', 'Video Thumbnails', 'Student Uploads', 'Templates'];
const fileTypes = [
  { ext: 'pdf', mime: 'application/pdf', icon: 'FileText' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats', icon: 'FileText' },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats', icon: 'Presentation' },
  { ext: 'mp4', mime: 'video/mp4', icon: 'Video' },
  { ext: 'png', mime: 'image/png', icon: 'Image' },
  { ext: 'jpg', mime: 'image/jpeg', icon: 'Image' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats', icon: 'Table' },
  { ext: 'zip', mime: 'application/zip', icon: 'Archive' },
];

const mediaNames = [
  'Lecture Notes Week', 'Lab Manual', 'Assignment Template', 'Course Syllabus',
  'Presentation Slides', 'Research Paper', 'Data Set', 'Tutorial Video',
  'Quiz Template', 'Project Guidelines', 'Reference Sheet', 'Cheat Sheet',
  'Workshop Materials', 'Exam Preparation', 'Study Guide',
];

export const mediaLibrary = Array.from({ length: 50 }, (_, i) => {
  const ft = fileTypes[i % fileTypes.length];
  const folder = mediaFolders[i % mediaFolders.length];
  const name = `${mediaNames[i % mediaNames.length]} ${Math.floor(i / mediaNames.length) + 1}`;

  return {
    id: `media-${i + 1}`,
    name: `${name}.${ft.ext}`,
    folder,
    type: ft.ext,
    mime: ft.mime,
    icon: ft.icon,
    size: Math.floor(100 + Math.random() * 50000), // KB
    cdnUrl: `https://cdn.claritas.edu/media/${name.toLowerCase().replace(/\s/g, '-')}.${ft.ext}`,
    thumbnailUrl: ft.ext === 'png' || ft.ext === 'jpg' ? `https://picsum.photos/200/150?random=${i}` : null,
    uploadedBy: 'Aarav Sharma',
    uploadedAt: randomDate(new Date('2025-06-01'), new Date('2026-04-08')),
    usedIn: i < 30 ? [`course-${String((i % 30) + 1).padStart(3, '0')}`] : [],
  };
});

export const MEDIA_STORAGE_USED = 2.4; // GB
export const MEDIA_STORAGE_QUOTA = 10; // GB

// ── SCORM/xAPI Packages ──
export const scormPackages = [
  {
    id: 'scorm-001', courseId: 'course-001', fileName: 'ai-foundations-v2.zip',
    title: 'AI Foundations Interactive Module', version: '2.0.1', type: 'SCORM 2004',
    status: 'valid', scoCount: 5,
    uploadedAt: '2026-03-15T10:30:00Z', validatedAt: '2026-03-15T10:32:00Z',
    fileSize: 45000, errors: [], warnings: [{ code: 'W001', message: 'Optional metadata field "description" is empty' }],
  },
  {
    id: 'scorm-002', courseId: 'course-005', fileName: 'ml-lab-exercises.zip',
    title: 'ML Lab Exercise Package', version: '1.3', type: 'xAPI',
    status: 'valid', scoCount: 8,
    uploadedAt: '2026-03-20T14:00:00Z', validatedAt: '2026-03-20T14:03:00Z',
    fileSize: 120000, errors: [], warnings: [],
  },
  {
    id: 'scorm-003', courseId: 'course-012', fileName: 'deep-learning-sim.zip',
    title: 'Deep Learning Simulator', version: '0.9-beta', type: 'SCORM 1.2',
    status: 'invalid', scoCount: 0,
    uploadedAt: '2026-04-01T09:00:00Z', validatedAt: '2026-04-01T09:05:00Z',
    fileSize: 88000,
    errors: [
      { code: 'E001', message: 'Missing imsmanifest.xml in package root', path: '/' },
      { code: 'E002', message: 'SCO launch URL references non-existent file', path: '/content/index.html' },
    ],
    warnings: [{ code: 'W002', message: 'Package exceeds recommended 50MB size limit' }],
  },
  {
    id: 'scorm-004', courseId: 'course-003', fileName: 'db-query-practice.zip',
    title: 'Database Query Practice', version: '1.0', type: 'SCORM 2004',
    status: 'validating', scoCount: 0,
    uploadedAt: '2026-04-08T16:00:00Z', validatedAt: null,
    fileSize: 32000, errors: [], warnings: [],
  },
];

// ── Version History ──
export const courseVersions = {
  'course-001': [
    { id: 'ver-001-5', courseId: 'course-001', version: 5, label: 'Current', author: 'Aarav Sharma', createdAt: '2026-04-07T15:30:00Z',
      changes: ['Updated Module 3 content', 'Added new quiz to Lesson 2.3', 'Fixed typo in Module 1 intro'],
      snapshot: { title: 'Introduction to Artificial Intelligence', moduleCount: 5, lessonCount: 18 },
    },
    { id: 'ver-001-4', courseId: 'course-001', version: 4, label: null, author: 'Priya Patel', createdAt: '2026-03-28T11:20:00Z',
      changes: ['Added SCORM package to Module 4', 'Reordered lessons in Module 2'],
      snapshot: { title: 'Introduction to Artificial Intelligence', moduleCount: 5, lessonCount: 17 },
    },
    { id: 'ver-001-3', courseId: 'course-001', version: 3, label: 'Pre-release', author: 'Aarav Sharma', createdAt: '2026-03-15T09:00:00Z',
      changes: ['Published course for first time', 'Finalized all assessments'],
      snapshot: { title: 'Introduction to Artificial Intelligence', moduleCount: 4, lessonCount: 15 },
    },
    { id: 'ver-001-2', courseId: 'course-001', version: 2, label: null, author: 'Aarav Sharma', createdAt: '2026-02-20T14:45:00Z',
      changes: ['Added Module 4', 'Updated course description', 'Added video embed to Lesson 1.2'],
      snapshot: { title: 'Introduction to AI', moduleCount: 4, lessonCount: 14 },
    },
    { id: 'ver-001-1', courseId: 'course-001', version: 1, label: 'Initial Draft', author: 'Aarav Sharma', createdAt: '2026-01-10T10:00:00Z',
      changes: ['Initial course creation'],
      snapshot: { title: 'Introduction to AI', moduleCount: 3, lessonCount: 10 },
    },
  ],
  // Auto-generate for other courses
  ...Object.fromEntries(
    Array.from({ length: 29 }, (_, i) => {
      const cid = `course-${String(i + 2).padStart(3, '0')}`;
      return [cid, Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, v) => ({
        id: `ver-${cid}-${v + 1}`,
        courseId: cid,
        version: v + 1,
        label: v === 0 ? 'Initial Draft' : null,
        author: ['Aarav Sharma', 'Priya Patel', 'Arjun Gupta'][v % 3],
        createdAt: randomDate(new Date('2025-08-01'), new Date('2026-04-08')),
        changes: v === 0 ? ['Initial course creation'] : ['Content updates', 'Bug fixes'].slice(0, 1 + v % 2),
        snapshot: { title: courseTitles[i + 1], moduleCount: 3 + v, lessonCount: 10 + v * 3 },
      })).reverse()];
    })
  ),
};
