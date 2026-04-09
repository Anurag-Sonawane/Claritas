import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, Upload, Download, Eye, MoreHorizontal, UserX, UserCheck, Trash2, Edit } from 'lucide-react';
import useAdminUsers from '../hooks/useAdminUsers.js';
import AdminTable from '../components/AdminTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ColumnChooser from '../components/ColumnChooser.jsx';
import UserDetailSlideOver from '../components/UserDetailSlideOver.jsx';
import InviteModal from '../components/InviteModal.jsx';
import BulkImportModal from '../components/BulkImportModal.jsx';
import { roles } from '../data/adminMockData.js';
import { getOrganizations } from '../services/adminApi.js';

const allColumns = [
  { key: 'name', label: 'Name', sortable: true, skelWidth: '60%' },
  { key: 'email', label: 'Email', sortable: true, muted: true, skelWidth: '70%' },
  { key: 'roleName', label: 'Role', skelWidth: '50%' },
  { key: 'organization', label: 'Organization', skelWidth: '55%' },
  { key: 'status', label: 'Status', skelWidth: '40%' },
  { key: 'lastActiveAt', label: 'Last Active', sortable: true, muted: true, skelWidth: '45%' },
];

const roleColors = {
  'Super Admin': { bg: 'var(--role-super-admin-bg)', color: 'var(--role-super-admin)' },
  'Org Admin': { bg: 'var(--role-org-admin-bg)', color: 'var(--role-org-admin)' },
  'Course Manager': { bg: 'var(--role-course-mgr-bg)', color: 'var(--role-course-mgr)' },
  'Support': { bg: 'var(--role-support-bg)', color: 'var(--role-support)' },
};

export default function UsersPage() {
  const {
    users, loading, meta,
    query, setQuery,
    filters, setFilter, clearFilters,
    sortBy, sortDir, handleSort,
    selectedIds, selectAll, selectRow,
    setPage, setPerPage,
    suspendUser, reactivateUser, deleteUser,
    bulkSuspend, bulkDelete, refresh,
  } = useAdminUsers();

  const { impersonation } = useOutletContext();

  const [slideOverUser, setSlideOverUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.key));

  const orgs = getOrganizations();

  const filterConfig = [
    {
      key: 'role',
      label: 'All Roles',
      options: roles.map(r => ({ value: r.id, label: r.name })),
    },
    {
      key: 'org',
      label: 'All Organizations',
      options: orgs.map(o => ({ value: o, label: o })),
    },
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'invited', label: 'Invited' },
        { value: 'deleted', label: 'Deleted' },
      ],
    },
  ];

  const visibleCols = allColumns
    .filter(c => visibleColumns.includes(c.key))
    .map(col => ({
      ...col,
      render: col.key === 'name' ? (row) => (
        <div className="user-cell">
          <img src={row.avatarUrl} alt="" className="user-cell-avatar" />
          <div className="user-cell-info">
            <span className="user-cell-name">{row.name}</span>
            <span className="user-cell-email-sub">{row.department}</span>
          </div>
        </div>
      )
      : col.key === 'roleName' ? (row) => {
        const rc = roleColors[row.roleName] || { bg: 'var(--role-custom-bg)', color: 'var(--role-custom)' };
        return <span className="role-badge" style={{ background: rc.bg, color: rc.color }}>{row.roleName}</span>;
      }
      : col.key === 'status' ? (row) => <StatusBadge status={row.status} />
      : col.key === 'lastActiveAt' ? (row) => (
        <span style={{ fontSize: '0.85rem' }}>{row.lastActiveAt ? formatRelative(row.lastActiveAt) : '—'}</span>
      )
      : undefined,
    }));

  const renderActions = (row, close) => (
    <>
      <button className="actions-menu-item" onClick={() => { setSlideOverUser(row); close(); }}>
        <Edit size={15} /> Edit Profile
      </button>
      <button className="actions-menu-item" onClick={() => { impersonation.startImpersonation(row); close(); }}>
        <Eye size={15} /> Impersonate
      </button>
      <div className="actions-menu-divider" />
      {row.status === 'active' ? (
        <button className="actions-menu-item" onClick={async () => { await suspendUser(row.id, 'Admin action'); close(); }}>
          <UserX size={15} /> Suspend
        </button>
      ) : row.status === 'suspended' ? (
        <button className="actions-menu-item" onClick={async () => { await reactivateUser(row.id); close(); }}>
          <UserCheck size={15} /> Reactivate
        </button>
      ) : null}
      <button className="actions-menu-item danger" onClick={async () => { if (confirm(`Delete ${row.name}?`)) { await deleteUser(row.id); close(); } }}>
        <Trash2 size={15} /> Delete
      </button>
    </>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <h1>
          Users
          <span className="count-badge">{meta.total}</span>
        </h1>
        <div className="admin-page-actions">
          <ColumnChooser columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} />
          <button className="btn-outline btn-sm" onClick={() => setShowImportModal(true)}>
            <Upload size={15} /> Import CSV
          </button>
          <button className="btn-outline btn-sm">
            <Download size={15} /> Export
          </button>
          <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={16} /> Invite User
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: 20 }}>
        <FilterBar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search by name, email, or organization..."
          filters={filterConfig}
          activeFilters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">{selectedIds.length} selected</span>
          <button className="btn-outline btn-sm" onClick={bulkSuspend}>
            <UserX size={14} /> Suspend
          </button>
          <button className="btn-outline btn-sm" style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--status-deleted)' }} onClick={() => { if (confirm(`Delete ${selectedIds.length} user(s)?`)) bulkDelete(); }}>
            <Trash2 size={14} /> Delete
          </button>
          <button className="btn-outline btn-sm">
            <Download size={14} /> Export Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <AdminTable
          columns={visibleCols}
          data={users}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={selectAll}
          onSelectRow={selectRow}
          onRowClick={(row) => setSlideOverUser(row)}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          renderActions={renderActions}
          emptyMessage="No users found"
        />

        <div style={{ padding: '0 16px 16px' }}>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            perPage={meta.perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>

      {/* Slide Over */}
      <UserDetailSlideOver
        user={slideOverUser}
        onClose={() => setSlideOverUser(null)}
        onUpdate={refresh}
        onImpersonate={(user) => impersonation.startImpersonation(user)}
      />

      {/* Modals */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={refresh}
      />
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={refresh}
      />
    </div>
  );
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
