import {
  courses as _coursesSrc, mediaLibrary as _mediaSrc, scormPackages as _scormSrc,
  courseVersions as _versionsSrc, MEDIA_STORAGE_USED, MEDIA_STORAGE_QUOTA,
  COURSE_CATEGORIES, instructors,
} from '../data/courseMockData.js';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Courses CRUD ───────────────────────────────────────────

export async function getCourses({ query = '', status = '', category = '', page = 1, perPage = 12, sortBy = 'updated_at', sortDir = 'desc' } = {}) {
  const params = new URLSearchParams({ query, status, category, page, perPage, sortBy, sortDir });
  const res = await fetch(`${API_BASE}/admin/courses?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return await res.json();
}

export async function getCourse(courseId) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}`);
  if (!res.ok) throw new Error('Failed to fetch course');
  return await res.json();
}

export async function createCourse(data) {
  const res = await fetch(`${API_BASE}/admin/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create course');
  return await res.json();
}

export async function updateCourse(courseId, updates) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update course');
  return await res.json();
}

export async function deleteCourse(courseId) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete course');
  return await res.json();
}

// ── Module/Lesson CRUD ─────────────────────────────────────

export async function addModule(courseId, moduleData) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ title: moduleData.title })
  });
  if (!res.ok) throw new Error('Failed to add module');
  return await res.json();
}

export async function reorderModules(courseId, moduleIds) {
  const courseRes = await getCourse(courseId);
  const course = courseRes.data;
  const reordered = moduleIds.map(id => course.modules.find(m => m.id === id)).filter(Boolean);
  return await updateCourse(courseId, { modules: reordered });
}

export async function addLesson(courseId, moduleId, lessonData) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ title: lessonData.title })
  });
  if (!res.ok) throw new Error('Failed to add lesson');
  return await res.json();
}

export async function reorderLessons(courseId, moduleId, lessonIds) {
  const courseRes = await getCourse(courseId);
  const course = courseRes.data;
  const mod = course.modules.find(m => m.id === moduleId);
  if (!mod) throw new Error('Module not found');
  const reorderedLessons = lessonIds.map(id => mod.lessons.find(l => l.id === id)).filter(Boolean);
  mod.lessons = reorderedLessons;
  return await updateCourse(courseId, { modules: course.modules });
}

export async function updateLesson(courseId, moduleId, lessonId, updates) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update lesson');
  return await res.json();
}

export async function deleteModule(courseId, moduleId) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete module');
  return await res.json();
}

export async function deleteLesson(courseId, moduleId, lessonId) {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete lesson');
  return await res.json();
}

// ── Publish Flow ───────────────────────────────────────────

export async function publishCourse(courseId) {
  return await updateCourse(courseId, { status: 'published' });
}

export async function unpublishCourse(courseId) {
  return await updateCourse(courseId, { status: 'draft' });
}

export async function bulkPublish(courseIds) {
  for (const id of courseIds) {
    await publishCourse(id);
  }
  return { success: true, count: courseIds.length };
}

export async function bulkUnpublish(courseIds) {
  for (const id of courseIds) {
    await unpublishCourse(id);
  }
  return { success: true, count: courseIds.length };
}

export async function bulkAssignManagers(courseIds, managerId, managerName) {
  for (const id of courseIds) {
    await updateCourse(id, { managerId, managerName });
  }
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
  const res = await updateCourse(courseId, { title: draftData.title, modules: draftData.modules });
  return { data: { savedAt: new Date().toISOString() } };
}

export async function getSavedDraft(courseId) {
  const res = await getCourse(courseId);
  return { data: res.data };
}

// Re-export for convenience
export { COURSE_CATEGORIES, instructors };
