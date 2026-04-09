import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import Modal from './Modal.jsx';
import * as api from '../services/adminApi.js';

const STEPS = ['Upload', 'Map Columns', 'Preview', 'Import'];
const SYSTEM_FIELDS = ['name', 'email', 'role', 'organization', 'phone', 'department'];

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [jobResult, setJobResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      hdrs.forEach((h, i) => obj[h] = vals[i] || '');
      return obj;
    });
    return { headers: hdrs, rows };
  };

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers: hdrs, rows } = parseCSV(e.target.result);
      setHeaders(hdrs);
      setCsvData(rows);
      // Auto-map columns
      const autoMap = {};
      hdrs.forEach(h => {
        const lower = h.toLowerCase();
        SYSTEM_FIELDS.forEach(sf => {
          if (lower.includes(sf) || lower === sf) autoMap[h] = sf;
        });
      });
      setMapping(autoMap);
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await api.bulkImport(csvData);
      setJobResult(result.data);
      // Poll for completion
      const pollId = setInterval(async () => {
        const jobStatus = await api.getImportJob(result.data.jobId);
        setJobResult(jobStatus.data);
        if (jobStatus.data.status === 'completed' || jobStatus.data.status === 'failed') {
          clearInterval(pollId);
          setImporting(false);
        }
      }, 1000);
    } catch (err) {
      console.error('Import failed:', err);
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setImporting(false);
    setJobResult(null);
    onClose();
    if (jobResult?.status === 'completed') onSuccess?.();
  };

  const canNext = () => {
    if (step === 0) return file && csvData.length > 0;
    if (step === 1) return Object.values(mapping).includes('name') && Object.values(mapping).includes('email');
    if (step === 2) return true;
    return false;
  };

  const previewRows = csvData.slice(0, 50);
  const validRows = previewRows.filter(r => {
    const emailCol = Object.keys(mapping).find(k => mapping[k] === 'email');
    return emailCol && r[emailCol]?.includes('@');
  });
  const invalidRows = previewRows.length - validRows.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Users"
      size="xl"
      footer={
        step === 3 && jobResult ? (
          <button className="btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            {step > 0 && step < 3 && (
              <button className="btn-outline" onClick={() => setStep(s => s - 1)} style={{ marginRight: 'auto' }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button className="btn-secondary" onClick={handleClose} style={{
              background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--muted)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer'
            }}>Cancel</button>
            {step < 2 && (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.4 }}>
                Next <ArrowRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button className="btn-primary" onClick={() => { setStep(3); handleImport(); }}>
                <Upload size={16} /> Start Import ({validRows.length} rows)
              </button>
            )}
          </>
        )
      }
    >
      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= step ? 'var(--primary)' : 'var(--admin-input-bg)',
              color: i <= step ? '#fff' : 'var(--muted)', fontWeight: 600, fontSize: '0.82rem',
              border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--admin-input-border)'}`,
              transition: 'all 300ms',
            }}>
              {i < step ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span style={{ fontSize: '0.72rem', color: i <= step ? 'var(--foreground)' : 'var(--muted)', fontWeight: 500 }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '48px 24px', textAlign: 'center', borderRadius: 14,
              border: `2px dashed ${dragOver ? 'var(--secondary)' : 'var(--admin-input-border)'}`,
              background: dragOver ? 'rgba(46,196,241,0.06)' : 'var(--admin-input-bg)',
              cursor: 'pointer', transition: 'all 200ms',
            }}
          >
            <FileSpreadsheet size={48} style={{ color: 'var(--muted)', marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px' }}>Drop your CSV file here</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: 0 }}>or click to browse • CSV format only</p>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>

          {file && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 10,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <CheckCircle size={20} style={{ color: 'var(--status-active)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB • {csvData.length} rows • {headers.length} columns
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Column Mapping */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 20 }}>
            Map your CSV columns to the system fields. <strong style={{ color: 'var(--foreground)' }}>Name</strong> and <strong style={{ color: 'var(--foreground)' }}>Email</strong> are required.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px 16px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CSV Column</div>
            <div />
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Field</div>
            {headers.map(h => (
              <React.Fragment key={h}>
                <div style={{
                  padding: '10px 14px', background: 'var(--admin-input-bg)', borderRadius: 8,
                  border: '1px solid var(--admin-input-border)', fontSize: '0.88rem',
                }}>{h}</div>
                <ArrowRight size={16} style={{ color: 'var(--muted)' }} />
                <select
                  className="form-input"
                  value={mapping[h] || ''}
                  onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                >
                  <option value="">— Skip —</option>
                  {SYSTEM_FIELDS.map(sf => (
                    <option key={sf} value={sf}>{sf.charAt(0).toUpperCase() + sf.slice(1)}</option>
                  ))}
                </select>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{
              padding: '12px 18px', borderRadius: 10, background: 'var(--status-active-bg)',
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <CheckCircle size={20} style={{ color: 'var(--status-active)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--status-active)' }}>{validRows.length}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Valid rows</div>
              </div>
            </div>
            {invalidRows > 0 && (
              <div style={{
                padding: '12px 18px', borderRadius: 10, background: 'var(--status-deleted-bg)',
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <AlertCircle size={20} style={{ color: 'var(--status-deleted)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--status-deleted)' }}>{invalidRows}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Invalid rows</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--table-border)' }}>
            <table className="admin-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  {Object.entries(mapping).filter(([, v]) => v).map(([csvCol, sysField]) => (
                    <th key={csvCol}>{sysField}</th>
                  ))}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 15).map((row, i) => {
                  const emailCol = Object.keys(mapping).find(k => mapping[k] === 'email');
                  const isValid = emailCol && row[emailCol]?.includes('@');
                  return (
                    <tr key={i} style={{ background: isValid ? 'transparent' : 'rgba(248,113,113,0.04)' }}>
                      <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                      {Object.entries(mapping).filter(([, v]) => v).map(([csvCol]) => (
                        <td key={csvCol}>{row[csvCol]}</td>
                      ))}
                      <td>
                        {isValid
                          ? <span style={{ color: 'var(--status-active)', fontSize: '0.8rem' }}>✓ Valid</span>
                          : <span style={{ color: 'var(--status-deleted)', fontSize: '0.8rem' }}>✗ Invalid email</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {previewRows.length > 15 && (
            <div style={{ textAlign: 'center', padding: 12, color: 'var(--muted)', fontSize: '0.8rem' }}>
              Showing 15 of {previewRows.length} preview rows
            </div>
          )}
        </div>
      )}

      {/* Step 3: Import Progress */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          {importing && !jobResult?.status?.match(/completed|failed/) ? (
            <>
              <Loader size={48} style={{ color: 'var(--secondary)', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
              <h3 style={{ margin: '0 0 8px' }}>Importing Users...</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
                {jobResult ? `${jobResult.processedRows || 0} / ${jobResult.totalRows || csvData.length} rows processed` : 'Starting import...'}
              </p>
              {jobResult && (
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, background: 'var(--secondary)',
                      width: `${((jobResult.processedRows || 0) / (jobResult.totalRows || 1)) * 100}%`,
                      transition: 'width 500ms', boxShadow: '0 0 10px var(--secondary)',
                    }} />
                  </div>
                </div>
              )}
            </>
          ) : jobResult?.status === 'completed' ? (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} style={{ color: 'var(--status-active)' }} />
              </div>
              <h3 style={{ margin: '0 0 8px' }}>Import Complete!</h3>
              <p style={{ color: 'var(--muted)' }}>
                {jobResult.successRows} users imported successfully
                {jobResult.errorRows > 0 && <>, <span style={{ color: 'var(--status-deleted)' }}>{jobResult.errorRows} errors</span></>}
              </p>
              {jobResult.errors?.length > 0 && (
                <div style={{ marginTop: 20, textAlign: 'left', maxWidth: 500, margin: '20px auto 0' }}>
                  {jobResult.errors.map((err, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)',
                      borderRadius: 8, marginBottom: 8, fontSize: '0.82rem',
                    }}>
                      <span style={{ color: 'var(--status-deleted)', fontWeight: 600 }}>Row {err.row}</span>
                      <span style={{ color: 'var(--muted)' }}> — {err.field}: </span>
                      {err.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-deleted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertCircle size={32} style={{ color: 'var(--status-deleted)' }} />
              </div>
              <h3 style={{ margin: '0 0 8px' }}>Import Failed</h3>
              <p style={{ color: 'var(--muted)' }}>An error occurred during the import process.</p>
            </>
          )}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </Modal>
  );
}
