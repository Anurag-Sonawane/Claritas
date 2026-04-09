import { FileText, Download, Search, X } from 'lucide-react';
import useAuditLog from '../hooks/useAuditLog.js';
import AdminTable from '../components/AdminTable.jsx';
import Pagination from '../components/Pagination.jsx';

const actionLabels = {
  'user.created': { label: 'Created', color: 'var(--status-active)', bg: 'var(--status-active-bg)' },
  'user.updated': { label: 'Updated', color: 'var(--secondary)', bg: 'rgba(46,196,241,0.1)' },
  'user.suspended': { label: 'Suspended', color: 'var(--status-suspended)', bg: 'var(--status-suspended-bg)' },
  'user.reactivated': { label: 'Reactivated', color: 'var(--status-active)', bg: 'var(--status-active-bg)' },
  'user.deleted': { label: 'Deleted', color: 'var(--status-deleted)', bg: 'var(--status-deleted-bg)' },
  'user.impersonated': { label: 'Impersonated', color: 'var(--status-suspended)', bg: 'var(--status-suspended-bg)' },
  'user.invited': { label: 'Invited', color: 'var(--status-invited)', bg: 'var(--status-invited-bg)' },
  'user.bulk_imported': { label: 'Bulk Import', color: 'var(--role-custom)', bg: 'var(--role-custom-bg)' },
  'role.created': { label: 'Role Created', color: 'var(--status-active)', bg: 'var(--status-active-bg)' },
  'role.updated': { label: 'Role Updated', color: 'var(--secondary)', bg: 'rgba(46,196,241,0.1)' },
  'login.success': { label: 'Login', color: 'var(--status-active)', bg: 'var(--status-active-bg)' },
  'login.failed': { label: 'Failed Login', color: 'var(--status-deleted)', bg: 'var(--status-deleted-bg)' },
  'export.users': { label: 'Export', color: 'var(--secondary)', bg: 'rgba(46,196,241,0.1)' },
  'settings.updated': { label: 'Settings', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
};

const actionOptions = Object.entries(actionLabels).map(([key, val]) => ({ value: key, label: val.label }));

export default function AuditLogPage() {
  const {
    logs, loading, meta,
    actorFilter, setActorFilter,
    actionFilter, setActionFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    setPage, clearFilters,
  } = useAuditLog();

  const hasFilters = actorFilter || actionFilter || dateFrom || dateTo;

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      width: 170,
      render: (row) => (
        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--muted)' }}>
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actorName',
      label: 'Actor',
      render: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.actorName === 'System'
            ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>System</span>
            : row.actorName}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => {
        const config = actionLabels[row.action] || { label: row.action, color: 'var(--muted)', bg: 'var(--admin-input-bg)' };
        return (
          <span style={{
            padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem',
            fontWeight: 600, background: config.bg, color: config.color,
            display: 'inline-block',
          }}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'targetName',
      label: 'Target',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{row.targetName}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 6 }}>({row.targetType})</span>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address',
      muted: true,
      render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.ip}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => row.reason ? (
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.reason}>
          {row.reason}
        </span>
      ) : <span style={{ color: 'var(--muted)', opacity: 0.4 }}>—</span>,
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>
          <FileText size={24} style={{ color: 'var(--secondary)' }} />
          Audit Logs
          <span className="count-badge">{meta.total}</span>
        </h1>
        <div className="admin-page-actions">
          <button className="btn-outline btn-sm">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none'
          }} />
          <input
            type="text"
            value={actorFilter}
            onChange={e => setActorFilter(e.target.value)}
            placeholder="Search by actor..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)',
              borderRadius: 'var(--admin-input-radius)', color: 'var(--foreground)',
              fontSize: '0.88rem', outline: 'none',
            }}
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '10px 36px 10px 14px', background: 'var(--admin-input-bg)',
            border: '1px solid var(--admin-input-border)', borderRadius: 'var(--admin-input-radius)',
            color: 'var(--foreground)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(247,248,250,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          <option value="">All Actions</option>
          {actionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{
              padding: '9px 12px', background: 'var(--admin-input-bg)',
              border: '1px solid var(--admin-input-border)', borderRadius: 'var(--admin-input-radius)',
              color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none',
              colorScheme: 'dark',
            }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{
              padding: '9px 12px', background: 'var(--admin-input-bg)',
              border: '1px solid var(--admin-input-border)', borderRadius: 'var(--admin-input-radius)',
              color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'transparent', border: '1px solid var(--glass-border)',
            borderRadius: 20, color: 'var(--muted)', fontSize: '0.82rem',
            cursor: 'pointer',
          }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <AdminTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit log entries found"
        />

        <div style={{ padding: '0 16px 16px' }}>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            perPage={meta.perPage}
            onPageChange={setPage}
            onPerPageChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
