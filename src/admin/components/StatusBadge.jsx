export default function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', className: 'status-badge--active' },
    suspended: { label: 'Suspended', className: 'status-badge--suspended' },
    invited: { label: 'Invited', className: 'status-badge--invited' },
    deleted: { label: 'Deleted', className: 'status-badge--deleted' },
    pending: { label: 'Pending', className: 'status-badge--pending' },
    completed: { label: 'Completed', className: 'status-badge--active' },
    processing: { label: 'Processing', className: 'status-badge--invited' },
    failed: { label: 'Failed', className: 'status-badge--deleted' },
  };

  const c = config[status] || { label: status, className: '' };

  return <span className={`status-badge ${c.className}`}>{c.label}</span>;
}
