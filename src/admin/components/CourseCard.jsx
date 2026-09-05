import { BookOpen, Edit, Trash2, Eye, Copy, Check, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const statusStyles = {
  draft: { bg: 'var(--course-draft-bg)', color: 'var(--course-draft)', label: 'Draft' },
  published: { bg: 'var(--course-published-bg)', color: 'var(--course-published)', label: 'Published' },
  archived: { bg: 'var(--course-archived-bg)', color: 'var(--course-archived)', label: 'Archived' },
  review: { bg: 'var(--course-review-bg)', color: 'var(--course-review)', label: 'In Review' },
};

export default function CourseCard({ course, isSelected, onSelect, onDelete }) {
  const navigate = useNavigate();
  const st = statusStyles[course.status] || statusStyles.draft;

  const handleClick = (e) => {
    if (e.target.closest('.course-card-check') || e.target.closest('.course-card-action-btn')) return;
    navigate(`/admin/courses/${course.id}/edit`);
  };

  return (
    <div className={`course-card ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      {/* Selection Checkbox */}
      <div className="course-card-check" onClick={(e) => { e.stopPropagation(); onSelect?.(course.id); }}>
        {isSelected && <Check size={14} />}
      </div>

      {/* Thumbnail */}
      <div className="course-card-thumb" style={{ background: course.thumbnailGradient }}>
        <BookOpen size={48} className="course-card-thumb-icon" />
        <span className="course-card-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      {/* Body */}
      <div className="course-card-body">
        <span className="course-card-category">{course.category}</span>
        <h3 className="course-card-title">{course.title}</h3>

        <div className="course-card-instructors">
          {course.instructors?.slice(0, 3).map(inst => (
            <img key={inst.id} src={inst.avatarUrl} alt={inst.name} className="course-card-avatar" title={inst.name} />
          ))}
          <span className="course-card-instructor-name">
            {course.instructors?.map(i => i.name).join(', ')}
          </span>
        </div>

        <div className="course-card-stats">
          <div className="course-card-stat">
            <span className="course-card-stat-label">Enrolled</span>
            <span className="course-card-stat-value">{course.enrollmentCount}</span>
          </div>
          <div className="course-card-stat">
            <span className="course-card-stat-label">Modules</span>
            <span className="course-card-stat-value">{course.totalModules}</span>
          </div>
          <div className="course-card-stat">
            <span className="course-card-stat-label">Completion</span>
            <span className="course-card-stat-value" style={{ color: course.completionRate > 70 ? 'var(--course-published)' : 'var(--foreground)' }}>
              {course.completionRate}%
            </span>
          </div>
        </div>

        {course.completionRate > 0 && (
          <div className="course-completion-bar">
            <div
              className="course-completion-fill"
              style={{
                width: `${course.completionRate}%`,
                background: course.completionRate > 70 ? 'var(--course-published)' : course.completionRate > 40 ? 'var(--secondary)' : 'var(--primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="course-card-footer">
        <span className="course-card-updated">
          Updated {formatRelative(course.updatedAt)}
        </span>
        <div className="course-card-actions">
          <button className="course-card-action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${course.id}/edit`); }}>
            <Edit size={14} />
          </button>
          <button className="course-card-action-btn" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete?.(course.id); }} style={{ color: 'var(--status-deleted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRelative(dateStr) {
  if (!dateStr || dateStr === 'Never' || dateStr === '—') return '—';
  const timestamp = new Date(dateStr).getTime();
  if (isNaN(timestamp)) return '—';
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
