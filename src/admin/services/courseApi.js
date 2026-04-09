// ═══════════════════════════════════════════════════════════
// Claritas Admin — Course & Content API Service
// Mock API with simulated latency for course management
// ═══════════════════════════════════════════════════════════

import {
  courses as _coursesSrc, mediaLibrary as _mediaSrc, scormPackages as _scormSrc,
  courseVersions as _versionsSrc, MEDIA_STORAGE_USED, MEDIA_STORAGE_QUOTA,
  COURSE_CATEGORIES, instructors,
} from '../data/courseMockData.js';

let _courses = JSON.parse(JSON.stringify(_coursesSrc));
let _media = JSON.parse(JSON.stringify(_mediaSrc));
let _scorm = JSON.parse(JSON.stringify(_scormSrc));
let _versions = JSON.parse(JSON.stringify(_versionsSrc));
let _drafts = {};

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

// ── Courses CRUD ───────────────────────────────────────────

export async function getCourses({ query = '', status = '', category = '', instructor = '', page = 1, perPage = 12, sortBy = 'updatedAt', sortDir = 'desc' } = {}) {
  await delay();
  let f = [..._courses];
  if (query) { const q = query.toLowerCase(); f = f.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)); }
  if (status) f = f.filter(c => c.status === status);
  if (category) f = f.filter(c => c.category === category);
  if (instructor) f = f.filter(c => c.instructors.some(inst => inst.id === instructor));

  f.sort((a, b) => {
    let va = a[sortBy] || '', vb = b[sortBy] || '';
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = f.length;
  const start = (page - 1) * perPage;
  return { data: f.slice(start, start + perPage), meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
}

export async function getCourse(courseId) {
  await delay(200);
  const c = _courses.find(x => x.id === courseId);
  if (!c) throw new Error('Course not found');
  return { data: c };
}

export async function createCourse(data) {
  await delay(400);
  const id = `course-${String(_courses.length + 1).padStart(3, '0')}`;
  const newCourse = {
    id, ...data,
    status: 'draft', enrollmentCount: 0, completionRate: 0,
    modules: [], totalModules: 0, totalLessons: 0, totalDuration: '0min',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishedAt: null,
    managerId: 'user-001', managerName: 'Aarav Sharma',
    thumbnailGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    instructors: data.instructorIds ? data.instructorIds.map(iid => instructors.find(i => i.id === iid) || { id: iid, name: 'Unknown' }) : [],
    tags: data.tags || [],
  };
  _courses.unshift(newCourse);
  _versions[id] = [{ id: `ver-${id}-1`, courseId: id, version: 1, label: 'Initial Draft', author: 'Aarav Sharma', createdAt: new Date().toISOString(), changes: ['Course created'], snapshot: { title: data.title, moduleCount: 0, lessonCount: 0 } }];
  return { data: newCourse };
}

export async function updateCourse(courseId, updates) {
  await delay(300);
  const idx = _courses.findIndex(c => c.id === courseId);
  if (idx === -1) throw new Error('Course not found');
  _courses[idx] = { ..._courses[idx], ...updates, updatedAt: new Date().toISOString() };
  return { data: _courses[idx] };
}

export async function deleteCourse(courseId) {
  await delay(400);
  _courses = _courses.filter(c => c.id !== courseId);
  return { success: true };
}

// ── Module/Lesson CRUD ─────────────────────────────────────

export async function addModule(courseId, moduleData) {
  await delay(300);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  const mod = {
    id: `module-new-${Date.now()}`, title: moduleData.title || 'New Module',
    description: '', isExpanded: true, lessons: [],
  };
  course.modules.push(mod);
  course.totalModules = course.modules.length;
  course.updatedAt = new Date().toISOString();
  return { data: mod };
}

export async function reorderModules(courseId, moduleIds) {
  await delay(200);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  const reordered = moduleIds.map(id => course.modules.find(m => m.id === id)).filter(Boolean);
  course.modules = reordered;
  course.updatedAt = new Date().toISOString();
  return { data: course.modules };
}

export async function addLesson(courseId, moduleId, lessonData) {
  await delay(300);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  const mod = course.modules.find(m => m.id === moduleId);
  if (!mod) throw new Error('Module not found');
  const lesson = {
    id: `lesson-new-${Date.now()}`, title: lessonData.title || 'New Lesson',
    type: 'text', duration: '0min', isCompleted: false,
    contentBlocks: [{ id: `block-new-${Date.now()}`, type: 'text', content: '<p>Start writing your lesson content here...</p>' }],
  };
  mod.lessons.push(lesson);
  course.totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  course.updatedAt = new Date().toISOString();
  return { data: lesson };
}

export async function reorderLessons(courseId, moduleId, lessonIds) {
  await delay(200);
  const course = _courses.find(c => c.id === courseId);
  const mod = course?.modules.find(m => m.id === moduleId);
  if (!mod) throw new Error('Module not found');
  mod.lessons = lessonIds.map(id => mod.lessons.find(l => l.id === id)).filter(Boolean);
  course.updatedAt = new Date().toISOString();
  return { data: mod.lessons };
}

export async function updateLesson(courseId, moduleId, lessonId, updates) {
  await delay(200);
  const course = _courses.find(c => c.id === courseId);
  const mod = course?.modules.find(m => m.id === moduleId);
  const lesson = mod?.lessons.find(l => l.id === lessonId);
  if (!lesson) throw new Error('Lesson not found');
  Object.assign(lesson, updates);
  course.updatedAt = new Date().toISOString();
  return { data: lesson };
}

export async function deleteModule(courseId, moduleId) {
  await delay(300);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  course.modules = course.modules.filter(m => m.id !== moduleId);
  course.totalModules = course.modules.length;
  course.totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  course.updatedAt = new Date().toISOString();
  return { success: true };
}

export async function deleteLesson(courseId, moduleId, lessonId) {
  await delay(200);
  const course = _courses.find(c => c.id === courseId);
  const mod = course?.modules.find(m => m.id === moduleId);
  if (!mod) throw new Error('Module not found');
  mod.lessons = mod.lessons.filter(l => l.id !== lessonId);
  course.totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  course.updatedAt = new Date().toISOString();
  return { success: true };
}

// ── Publish Flow ───────────────────────────────────────────

export async function publishCourse(courseId) {
  await delay(500);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  course.status = 'published';
  course.publishedAt = new Date().toISOString();
  course.updatedAt = new Date().toISOString();
  _addVersion(courseId, 'Published course');
  return { data: course };
}

export async function unpublishCourse(courseId) {
  await delay(400);
  const course = _courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  course.status = 'draft';
  course.updatedAt = new Date().toISOString();
  return { data: course };
}

export async function bulkPublish(courseIds) {
  await delay(600);
  courseIds.forEach(id => { const c = _courses.find(x => x.id === id); if (c) { c.status = 'published'; c.publishedAt = new Date().toISOString(); } });
  return { success: true, count: courseIds.length };
}

export async function bulkUnpublish(courseIds) {
  await delay(600);
  courseIds.forEach(id => { const c = _courses.find(x => x.id === id); if (c) c.status = 'draft'; });
  return { success: true, count: courseIds.length };
}

export async function bulkAssignManagers(courseIds, managerId, managerName) {
  await delay(500);
  courseIds.forEach(id => { const c = _courses.find(x => x.id === id); if (c) { c.managerId = managerId; c.managerName = managerName; } });
  return { success: true, count: courseIds.length };
}

// ── Media Library ──────────────────────────────────────────

export async function getMediaLibrary({ folder = '', query = '', type = '' } = {}) {
  await delay(250);
  let f = [..._media];
  if (folder) f = f.filter(m => m.folder === folder);
  if (query) { const q = query.toLowerCase(); f = f.filter(m => m.name.toLowerCase().includes(q)); }
  if (type) f = f.filter(m => m.type === type);
  const folders = [...new Set(_media.map(m => m.folder))];
  return { data: f, folders, storage: { used: MEDIA_STORAGE_USED, quota: MEDIA_STORAGE_QUOTA } };
}

export async function uploadMedia(file, onProgress) {
  // Simulate resumable upload with progress callbacks
  const totalChunks = 20;
  const newMedia = {
    id: `media-${_media.length + 1}`,
    name: file.name || `uploaded-${Date.now()}.pdf`,
    folder: 'Course Assets',
    type: file.name?.split('.').pop() || 'pdf',
    mime: file.type || 'application/pdf',
    icon: 'FileText',
    size: file.size || Math.floor(1000 + Math.random() * 10000),
    cdnUrl: `https://cdn.claritas.edu/media/uploaded-${Date.now()}.pdf`,
    thumbnailUrl: null,
    uploadedBy: 'Aarav Sharma',
    uploadedAt: new Date().toISOString(),
    usedIn: [],
  };

  for (let i = 0; i <= totalChunks; i++) {
    await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
    onProgress?.({ loaded: i, total: totalChunks, percent: Math.round((i / totalChunks) * 100) });
  }

  _media.unshift(newMedia);
  return { data: newMedia };
}

// ── SCORM/xAPI ─────────────────────────────────────────────

export async function uploadScormPackage(courseId, file) {
  await delay(500);
  const id = `scorm-${String(_scorm.length + 1).padStart(3, '0')}`;
  const pkg = {
    id, courseId, fileName: file.name || 'package.zip',
    title: '', version: '', type: 'Unknown', status: 'queued', scoCount: 0,
    uploadedAt: new Date().toISOString(), validatedAt: null,
    fileSize: file.size || 50000, errors: [], warnings: [],
  };
  _scorm.unshift(pkg);

  // Simulate validation job lifecycle
  setTimeout(() => {
    const p = _scorm.find(x => x.id === id);
    if (p) { p.status = 'validating'; }
  }, 1500);

  setTimeout(() => {
    const p = _scorm.find(x => x.id === id);
    if (p) {
      const hasErrors = Math.random() > 0.7;
      p.status = hasErrors ? 'invalid' : 'valid';
      p.validatedAt = new Date().toISOString();
      p.title = file.name?.replace('.zip', '') || 'SCORM Package';
      p.version = '1.0';
      p.type = 'SCORM 2004';
      p.scoCount = hasErrors ? 0 : 3 + Math.floor(Math.random() * 5);
      if (hasErrors) {
        p.errors = [{ code: 'E001', message: 'Missing imsmanifest.xml', path: '/' }];
      }
      p.warnings = Math.random() > 0.5 ? [{ code: 'W001', message: 'Optional metadata is incomplete' }] : [];
    }
  }, 5000);

  return { data: { jobId: id } };
}

export async function getScormValidationStatus(jobId) {
  await delay(200);
  const pkg = _scorm.find(x => x.id === jobId);
  if (!pkg) throw new Error('SCORM job not found');
  return { data: pkg };
}

export async function getScormPackages(courseId) {
  await delay(200);
  return { data: _scorm.filter(s => s.courseId === courseId) };
}

// ── Version History ────────────────────────────────────────

export async function getCourseVersions(courseId) {
  await delay(250);
  return { data: _versions[courseId] || [] };
}

export async function rollbackCourseVersion(courseId, versionId) {
  await delay(500);
  const versions = _versions[courseId];
  if (!versions) throw new Error('No versions found');
  const target = versions.find(v => v.id === versionId);
  if (!target) throw new Error('Version not found');

  const course = _courses.find(c => c.id === courseId);
  if (course && target.snapshot) {
    course.title = target.snapshot.title;
    course.updatedAt = new Date().toISOString();
  }
  _addVersion(courseId, `Rolled back to version ${target.version}`);
  return { data: course };
}

function _addVersion(courseId, changeDesc) {
  if (!_versions[courseId]) _versions[courseId] = [];
  const vl = _versions[courseId];
  const nextVer = vl.length > 0 ? Math.max(...vl.map(v => v.version)) + 1 : 1;
  const course = _courses.find(c => c.id === courseId);
  vl.unshift({
    id: `ver-${courseId}-${nextVer}`, courseId, version: nextVer, label: null,
    author: 'Aarav Sharma', createdAt: new Date().toISOString(),
    changes: [changeDesc],
    snapshot: {
      title: course?.title || '', moduleCount: course?.modules?.length || 0,
      lessonCount: course?.modules?.reduce((s, m) => s + m.lessons.length, 0) || 0,
    },
  });
}

// ── Autosave / Drafts ──────────────────────────────────────

export async function saveDraft(courseId, draftData) {
  await delay(150);
  _drafts[courseId] = { ...draftData, savedAt: new Date().toISOString() };
  return { data: { savedAt: _drafts[courseId].savedAt } };
}

export async function getSavedDraft(courseId) {
  await delay(100);
  return { data: _drafts[courseId] || null };
}

// Re-export for convenience
export { COURSE_CATEGORIES, instructors };
