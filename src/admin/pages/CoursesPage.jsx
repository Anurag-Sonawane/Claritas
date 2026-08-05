import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, LayoutGrid, List, Plus, Upload, Download, Trash2, Globe, GlobeLock, BookOpen } from 'lucide-react';
import useCourses from '../hooks/useCourses.js';
import CourseCard from '../components/CourseCard.jsx';
import AdminTable from '../components/AdminTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import { COURSE_CATEGORIES } from '../data/courseMockData.js';
import './CoursesPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'archived', label: 'Archived' },
];

const statusMap = {
  draft: { bg: 'var(--course-draft-bg)', color: 'var(--course-draft)' },
  published: { bg: 'var(--course-published-bg)', color: 'var(--course-published)' },
  archived: { bg: 'var(--course-archived-bg)', color: 'var(--course-archived)' },
  review: { bg: 'var(--course-review-bg)', color: 'var(--course-review)' },
};

const TABLE_COLUMNS = [
  { key: 'title', label: 'Course', sortable: true, render: (row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: row.thumbnailGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <BookOpen size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{row.category}</div>
      </div>
    </div>
  )},
  { key: 'instructors', label: 'Instructor', render: (row) => row.instructors?.[0]?.name || '—' },
  { key: 'status', label: 'Status', render: (row) => {
    const s = statusMap[row.status];
    return <StatusBadge status={row.status} customStyle={s} />;
  }},
  { key: 'enrollmentCount', label: 'Enrolled', sortable: true },
  { key: 'completionRate', label: 'Completion', sortable: true, render: (row) => `${row.completionRate}%` },
  { key: 'totalModules', label: 'Modules' },
  { key: 'updatedAt', label: 'Updated', sortable: true, render: (row) => formatDate(row.updatedAt) },
];

export default function CoursesPage() {
  const cm = useCourses();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'Computer Science', level: 'Beginner' });

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreate(true);
    }
  }, [location]);

  const handleCreate = async () => {
    if (!newCourse.title.trim()) return;
    await cm.createCourse(newCourse);
    setNewCourse({ title: '', description: '', category: 'Computer Science', level: 'Beginner' });
    setShowCreate(false);
  };

  const hasFilters = cm.query || cm.filters.status || cm.filters.category;

  return (
    <div>
      {/* Header */}
      <div className="courses-header">
        <h1>
          <BookOpen size={24} style={{ color: 'var(--primary)' }} />
          Courses <span className="count-badge">{cm.meta.total}</span>
        </h1>
        <div className="courses-toolbar">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${cm.viewMode === 'grid' ? 'active' : ''}`} onClick={() => cm.setViewMode('grid')}>
              <LayoutGrid size={16} /> Grid
            </button>
            <button className={`view-toggle-btn ${cm.viewMode === 'table' ? 'active' : ''}`} onClick={() => cm.setViewMode('table')}>
              <List size={16} /> Table
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Course
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <div className="search-input">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search courses..." value={cm.query} onChange={e => cm.setQuery(e.target.value)} />
        </div>
        <select value={cm.filters.status} onChange={e => cm.setFilter('status', e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={cm.filters.category} onChange={e => cm.setFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasFilters && (
          <button className="clear-filters" onClick={cm.clearFilters}>Clear all</button>
        )}
      </div>

      {/* Bulk Actions */}
      {cm.selectedIds.length > 0 && (
        <div className="courses-bulk-bar">
          <span className="bulk-count">{cm.selectedIds.length} selected</span>
          <button className="btn-outline btn-sm" onClick={cm.bulkPublish}><Globe size={14} /> Publish</button>
          <button className="btn-outline btn-sm" onClick={cm.bulkUnpublish}><GlobeLock size={14} /> Unpublish</button>
          <button className="btn-outline btn-sm" onClick={cm.bulkDelete} style={{ color: 'var(--status-deleted)', borderColor: 'rgba(248,113,113,0.3)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Content */}
      {cm.loading ? (
        <div className="courses-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="course-skeleton" />)}
        </div>
      ) : cm.courses.length === 0 ? (
        <div className="courses-empty surface">
          <BookOpen size={48} />
          <h3>No courses found</h3>
          <p>Try adjusting your filters or create a new course.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Course</button>
        </div>
      ) : cm.viewMode === 'grid' ? (
        <div className="courses-grid">
          {cm.courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={cm.selectedIds.includes(course.id)}
              onSelect={cm.selectRow}
              onDelete={cm.deleteCourse}
            />
          ))}
        </div>
      ) : (
        <AdminTable
          columns={TABLE_COLUMNS}
          data={cm.courses}
          sortBy={cm.sortBy}
          sortDir={cm.sortDir}
          onSort={cm.handleSort}
          selectedIds={cm.selectedIds}
          onSelectAll={cm.selectAll}
          onSelectRow={cm.selectRow}
          rowLink={(row) => `/admin/courses/${row.id}/edit`}
        />
      )}

      {/* Pagination */}
      {cm.meta.totalPages > 1 && (
        <Pagination
          page={cm.meta.page}
          totalPages={cm.meta.totalPages}
          total={cm.meta.total}
          perPage={cm.meta.perPage}
          onPageChange={cm.setPage}
          onPerPageChange={cm.setPerPage}
        />
      )}

      {/* Create Course Modal */}
      {showCreate && (
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Course" size="md">
          <div className="create-course-form">
            <label>
              Course Title <span style={{ color: 'var(--primary)' }}>*</span>
              <input type="text" value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Introduction to Machine Learning" autoFocus />
            </label>
            <label>
              Description
              <textarea value={newCourse.description} onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))} placeholder="Brief course description..." />
            </label>
            <label>
              Category
              <select value={newCourse.category} onChange={e => setNewCourse(p => ({ ...p, category: e.target.value }))}>
                {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Level
              <select value={newCourse.level} onChange={e => setNewCourse(p => ({ ...p, level: e.target.value }))}>
                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
              <button className="btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!newCourse.title.trim()} style={{ opacity: newCourse.title.trim() ? 1 : 0.4 }}>
                <Plus size={16} /> Create Course
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}
