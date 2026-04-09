import { Globe, GlobeLock, Users, BookOpen, AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import * as api from '../services/courseApi.js';

export default function PublishModal({ course, onClose }) {
  const isPublished = course.status === 'published';
  const incompleteLessons = course.modules.reduce((count, m) => count + m.lessons.filter(l => !l.contentBlocks || l.contentBlocks.length === 0).length, 0);

  const handleAction = async () => {
    if (isPublished) {
      await api.unpublishCourse(course.id);
    } else {
      await api.publishCourse(course.id);
    }
    onClose();
    window.location.reload(); // Simple reload to update state
  };

  return (
    <Modal onClose={onClose} title={isPublished ? 'Unpublish Course' : 'Publish Course'} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Impact summary */}
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Impact Summary
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem' }}>
              <Users size={16} style={{ color: 'var(--secondary)' }} />
              <span><strong>{course.enrollmentCount}</strong> enrolled students will be affected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem' }}>
              <BookOpen size={16} style={{ color: 'var(--primary)' }} />
              <span><strong>{course.totalModules}</strong> modules, <strong>{course.totalLessons}</strong> lessons</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {incompleteLessons > 0 && (
          <div style={{ padding: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: 'var(--course-review)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong style={{ color: 'var(--course-review)' }}>{incompleteLessons} lesson(s)</strong> have no content blocks. Consider adding content before publishing.
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {isPublished
            ? 'Unpublishing will remove this course from the student catalog. Enrolled students will retain access but cannot re-enroll.'
            : 'Publishing will make this course available in the student catalog. All enrolled students will be notified.'}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleAction}>
            {isPublished ? <><GlobeLock size={14} /> Unpublish</> : <><Globe size={14} /> Publish Course</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
