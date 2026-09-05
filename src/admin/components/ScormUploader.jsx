import { useState, useEffect, useRef } from 'react';
import { Upload, Package, CheckCircle, XCircle, AlertTriangle, Clock, Loader } from 'lucide-react';
import Modal from './Modal.jsx';
import * as api from '../services/courseApi.js';

const STATUS_CONFIG = {
  queued: { icon: Clock, color: 'var(--scorm-queued)', label: 'Queued' },
  validating: { icon: Loader, color: 'var(--scorm-validating)', label: 'Validating...' },
  valid: { icon: CheckCircle, color: 'var(--scorm-valid)', label: 'Valid' },
  invalid: { icon: XCircle, color: 'var(--scorm-invalid)', label: 'Invalid' },
};

export default function ScormUploader({ courseId, onClose }) {
  const [packages, setPackages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    api.getScormPackages(courseId).then(r => setPackages(r.data));
    return () => clearInterval(pollRef.current);
  }, [courseId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await api.uploadScormPackage(courseId, file);
      setActiveJobId(r.data.jobId);
      startPolling(r.data.jobId);
    } catch(err) { console.error(err); }
    finally { setUploading(false); }
  };

  const startPolling = (jobId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.getScormValidationStatus(jobId);
        setJobData(r.data);
        if (r.data.status === 'valid' || r.data.status === 'invalid') {
          clearInterval(pollRef.current);
          api.getScormPackages(courseId).then(r2 => setPackages(r2.data));
        }
      } catch { clearInterval(pollRef.current); }
    }, 1500);
  };

  return (
    <Modal onClose={onClose} title="SCORM/xAPI Packages" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Upload area */}
        <div style={{ padding: 24, border: '2px dashed var(--glass-border)', borderRadius: 10, textAlign: 'center' }}>
          <Package size={32} style={{ color: 'var(--muted)', marginBottom: 8 }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>Upload SCORM/xAPI Package</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12 }}>Supports .zip files containing SCORM 1.2, SCORM 2004, or xAPI packages</div>
          <label className="btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Select Package'}
            <input type="file" accept=".zip" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {/* Active validation job */}
        {activeJobId && jobData && (
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {(() => {
                const cfg = STATUS_CONFIG[jobData.status] || STATUS_CONFIG.queued;
                const SIcon = cfg.icon;
                return (
                  <>
                    <SIcon size={20} style={{ color: cfg.color, animation: jobData.status === 'validating' ? 'spin 1s linear infinite' : 'none' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Validation: {cfg.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Job ID: {activeJobId}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {jobData.status === 'valid' && (
              <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--muted)' }}>
                <span>Title: <strong style={{ color: 'var(--foreground)' }}>{jobData.title}</strong></span>
                <span>Version: {jobData.version}</span>
                <span>Type: {jobData.type}</span>
                <span>SCOs: {jobData.scoCount}</span>
              </div>
            )}

            {/* Errors */}
            {jobData.errors?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--scorm-invalid)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={14} /> Errors ({jobData.errors.length})
                </div>
                {jobData.errors.map((err, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 6, fontSize: '0.78rem', marginBottom: 4 }}>
                    <strong>{err.code}</strong>: {err.message} {err.path && <span style={{ color: 'var(--muted)' }}>({err.path})</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {jobData.warnings?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--course-review)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> Warnings ({jobData.warnings.length})
                </div>
                {jobData.warnings.map((w, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 6, fontSize: '0.78rem', marginBottom: 4 }}>
                    <strong>{w.code}</strong>: {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Existing packages */}
        {packages.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Existing Packages
            </h4>
            {packages.map(pkg => {
              const cfg = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.queued;
              const SIcon = cfg.icon;
              return (
                <div key={pkg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 8, marginBottom: 6 }}>
                  <SIcon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.fileName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{pkg.type} • {pkg.title || 'Untitled'} • {formatSize(pkg.fileSize)}</div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: `${cfg.color}20`, color: cfg.color, textTransform: 'uppercase' }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}

function formatSize(kb) {
  if (!kb) return '—';
  if (kb < 1024) return `${kb}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}
