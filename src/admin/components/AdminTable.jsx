import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, MoreVertical, Users } from 'lucide-react';
import './AdminTable.css';

export default function AdminTable({
  columns,
  data,
  loading,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
  renderActions,
  emptyMessage = 'No results found',
}) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {onSelectAll && (
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={onSelectAll}
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={`${col.sortable ? 'sortable' : ''} ${sortBy === col.key ? 'sorted' : ''}`}
                style={{ width: col.width || 'auto' }}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {col.sortable && (
                  <span className="sort-icon">
                    {sortBy === col.key
                      ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)
                      : <ArrowUp size={14} />
                    }
                  </span>
                )}
              </th>
            ))}
            {renderActions && <th style={{ width: 52 }}></th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={`skel-${i}`} className="skeleton-row">
                {onSelectAll && <td><div className="skeleton-cell" style={{ width: 16, height: 16 }} /></td>}
                {columns.map(col => (
                  <td key={col.key}>
                    <div className="skeleton-cell" style={{ width: col.skelWidth || '70%', height: 14 }} />
                  </td>
                ))}
                {renderActions && <td><div className="skeleton-cell" style={{ width: 24, height: 14 }} /></td>}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectAll ? 1 : 0) + (renderActions ? 1 : 0)}>
                <div className="table-empty">
                  <div className="table-empty-icon"><Users size={48} /></div>
                  <h3>{emptyMessage}</h3>
                  <p>Try adjusting your filters or search terms.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={row.id}
                className={selectedIds.includes(row.id) ? 'selected' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {onSelectAll && (
                  <td className="col-check" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => onSelectRow?.(row.id)}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className={col.muted ? 'cell-muted' : ''}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="actions-cell" onClick={e => e.stopPropagation()}>
                    <ActionsMenu renderActions={renderActions} row={row} />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActionsMenu({ renderActions, row }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="actions-trigger" onClick={() => setOpen(!open)}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="actions-menu">
          {renderActions(row, () => setOpen(false))}
        </div>
      )}
    </div>
  );
}
