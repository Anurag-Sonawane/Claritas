import { History, RotateCcw, Tag, User, Clock, ChevronRight, Check } from 'lucide-react';
import Modal from './Modal.jsx';

export default function VersionHistoryModal({  versions, onRollback, onClose }) {
  return (
    <Modal onClose={onClose} title="Version History" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
        {versions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <History size={40} style={{ marginBottom: 12 }} />
            <div>No versions found for this course.</div>
          </div>
        ) : (
          versions.map((ver, i) => (
            <div key={ver.id} style={{
              padding: '14px 16px',
              background: i === 0 ? 'rgba(46,196,241,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${i === 0 ? 'rgba(46,196,241,0.15)' : 'var(--glass-border)'}`,
              borderRadius: 10,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>v{ver.version}</span>
                  {i === 0 && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(46,196,241,0.12)', color: 'var(--secondary)', textTransform: 'uppercase' }}>Current</span>}
                  {ver.label && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)' }}>{ver.label}</span>}
                </div>
                {i > 0 && (
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => { onRollback(ver.id); onClose(); }}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <RotateCcw size={12} /> Rollback
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {ver.author}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {new Date(ver.createdAt).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ver.changes.map((change, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <ChevronRight size={10} style={{ color: 'var(--secondary)', flexShrink: 0 }} /> {change}
                  </div>
                ))}
              </div>

              {ver.snapshot && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.72rem', color: 'var(--muted)' }}>
                  <span>Modules: {ver.snapshot.moduleCount}</span>
                  <span>Lessons: {ver.snapshot.lessonCount}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
