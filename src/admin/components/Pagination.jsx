import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({ page, totalPages, total, perPage, onPageChange, onPerPageChange }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> results
      </span>

      <div className="pagination-controls">
        <button className="pagination-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft size={16} />
        </button>

        {start > 1 && (
          <>
            <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
            {start > 2 && <span style={{ color: 'var(--muted)', padding: '0 4px' }}>…</span>}
          </>
        )}

        {pages.map(p => (
          <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span style={{ color: 'var(--muted)', padding: '0 4px' }}>…</span>}
            <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}

        <button className="pagination-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="pagination-per-page">
        <span>Rows:</span>
        <select value={perPage} onChange={e => onPerPageChange(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
