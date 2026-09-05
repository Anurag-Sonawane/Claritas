import { useEffect, useState } from 'react';
import { X, Search, Upload, Folder, FileText, Image, Video, Table, Archive, HardDrive, Check } from 'lucide-react';
import useMediaManager from '../hooks/useMediaManager.js';
import Modal from './Modal.jsx';

const typeIcons = { pdf: FileText, docx: FileText, pptx: FileText, mp4: Video, png: Image, jpg: Image, xlsx: Table, zip: Archive };

export default function MediaManagerModal({ onClose, onSelect }) {
  const mm = useMediaManager();
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { mm.fetchMedia(); }, [mm.activeFolder, mm.query, mm.typeFilter]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) mm.uploadFile(file);
  };

  return (
    <Modal onClose={onClose} title="Media Manager" size="lg">
      <div style={{ display: 'flex', gap: 16, height: 500 }}>
        {/* Folder tree */}
        <div style={{ width: 180, flexShrink: 0, borderRight: '1px solid var(--glass-border)', paddingRight: 12, overflowY: 'auto' }}>
          <div
            style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', marginBottom: 4, background: !mm.activeFolder ? 'rgba(46,196,241,0.08)' : 'transparent', color: !mm.activeFolder ? 'var(--foreground)' : 'var(--muted)' }}
            onClick={() => mm.setActiveFolder('')}
          >
            All Files
          </div>
          {mm.folders.map(f => (
            <div
              key={f}
              style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, background: mm.activeFolder === f ? 'rgba(46,196,241,0.08)' : 'transparent', color: mm.activeFolder === f ? 'var(--foreground)' : 'var(--muted)' }}
              onClick={() => mm.setActiveFolder(f)}
            >
              <Folder size={14} style={{ color: 'var(--media-folder-color)' }} /> {f}
            </div>
          ))}

          {/* Storage meter */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><HardDrive size={12} /> Storage</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(mm.storage.used / mm.storage.quota) * 100}%`, background: 'var(--secondary)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{mm.storage.used}GB / {mm.storage.quota}GB</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search files..."
                value={mm.query}
                onChange={e => mm.setQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', borderRadius: 6, color: 'var(--foreground)', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
            <select value={mm.typeFilter} onChange={e => mm.setTypeFilter(e.target.value)} style={{ padding: '8px 12px', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', borderRadius: 6, color: 'var(--foreground)', fontSize: '0.82rem' }}>
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="pptx">PowerPoint</option>
              <option value="mp4">Video</option>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
            </select>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              padding: mm.uploading ? '12px 16px' : '16px',
              border: `2px dashed ${dragOver ? 'var(--secondary)' : 'var(--glass-border)'}`,
              borderRadius: 8,
              background: dragOver ? 'var(--dnd-drop-zone)' : 'transparent',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {mm.uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: 'var(--upload-progress-bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${mm.uploadProgress}%`, background: 'var(--upload-progress-color)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{mm.uploadProgress}%</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.82rem' }}>
                <Upload size={16} /> Drop files here or <label style={{ color: 'var(--secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
                  browse
                  <input type="file" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) mm.uploadFile(e.target.files[0]); }} />
                </label>
              </div>
            )}
          </div>

          {/* File grid */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${mm.selectedFile ? '100px' : '120px'}, 1fr))`, gap: 8, alignContent: 'start' }}>
            {mm.files.map(file => {
              const FIcon = typeIcons[file.type] || FileText;
              const isSelected = mm.selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => mm.setSelectedFile(file)}
                  onDoubleClick={() => onSelect?.(file)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: 10, borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${isSelected ? 'var(--secondary)' : 'var(--glass-border)'}`,
                    background: isSelected ? 'rgba(46,196,241,0.06)' : 'transparent',
                    position: 'relative',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSelected && <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 4, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={10} color="#000" /></div>}
                  {file.thumbnailUrl ? (
                    <img src={file.thumbnailUrl} alt={file.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <FIcon size={28} style={{ color: 'var(--muted)' }} />
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--foreground)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{formatSize(file.size)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview panel */}
        {mm.selectedFile && (
          <div style={{ width: 200, flexShrink: 0, borderLeft: '1px solid var(--glass-border)', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.82rem', margin: 0 }}>Preview</h4>
            {mm.selectedFile.thumbnailUrl ? (
              <img src={mm.selectedFile.thumbnailUrl} alt="" style={{ width: '100%', borderRadius: 6, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: 100, background: 'rgba(255,255,255,0.02)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(() => { const I = typeIcons[mm.selectedFile.type] || FileText; return <I size={32} style={{ color: 'var(--muted)' }} />; })()}
              </div>
            )}
            <div style={{ fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{mm.selectedFile.name}</div>
              <div style={{ color: 'var(--muted)' }}>Type: {mm.selectedFile.type.toUpperCase()}</div>
              <div style={{ color: 'var(--muted)' }}>Size: {formatSize(mm.selectedFile.size)}</div>
              <div style={{ color: 'var(--muted)' }}>Folder: {mm.selectedFile.folder}</div>
              <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.72rem', wordBreak: 'break-all' }}>CDN: {mm.selectedFile.cdnUrl}</div>
            </div>
            <button className="btn-primary btn-sm" style={{ width: '100%', marginTop: 'auto' }} onClick={() => onSelect?.(mm.selectedFile)}>
              <Check size={14} /> Select File
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function formatSize(kb) {
  if (kb < 1024) return `${kb}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}
