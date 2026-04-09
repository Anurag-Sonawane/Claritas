import { useState, useRef, useEffect } from 'react';
import { Settings2, GripVertical } from 'lucide-react';

export default function ColumnChooser({ columns, visibleColumns, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key) => {
    if (visibleColumns.includes(key)) {
      onChange(visibleColumns.filter(k => k !== key));
    } else {
      onChange([...visibleColumns, key]);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="actions-trigger"
        onClick={() => setOpen(!open)}
        title="Choose columns"
        style={{
          width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)',
          borderRadius: 'var(--admin-input-radius)', color: 'var(--muted)', cursor: 'pointer'
        }}
      >
        <Settings2 size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)', minWidth: 220,
          background: 'var(--surface)', border: '1px solid var(--glass-border)',
          borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          zIndex: 20, padding: 8, animation: 'menuSlideIn var(--duration-fast) var(--ease-out-expo)'
        }}>
          <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Toggle Columns
          </div>
          {columns.map(col => (
            <label
              key={col.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 7, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--foreground)',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => toggle(col.key)}
                style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
              />
              <GripVertical size={12} style={{ color: 'var(--muted)', opacity: 0.4 }} />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
