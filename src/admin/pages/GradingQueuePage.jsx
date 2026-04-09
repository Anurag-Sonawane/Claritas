import { useState, useEffect } from 'react';
import { Search, Filter, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../components/AdminTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getGradingQueue } from '../services/assessmentMockService.js';

const STATUS_MAP = {
  'Pending': { bg: 'var(--course-review-bg)', color: 'var(--course-review)' },
  'Graded': { bg: 'var(--course-published-bg)', color: 'var(--course-published)' },
};

export default function GradingQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getGradingQueue().then(data => {
      setQueue(data);
      setLoading(false);
    });
  }, []);

  const filtered = queue.filter(sub => 
    sub.student.toLowerCase().includes(query.toLowerCase()) || 
    sub.assessment.toLowerCase().includes(query.toLowerCase())
  );

  const columns = [
    { key: 'student', label: 'Student', sortable: true, render: (row) => (
      <div style={{ fontWeight: 500 }}>{row.student}</div>
    )},
    { key: 'assessment', label: 'Assessment', sortable: true },
    { key: 'course', label: 'Course', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'submittedAt', label: 'Submitted', sortable: true, render: (row) => new Date(row.submittedAt).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (row) => (
      <StatusBadge status={row.status} customStyle={STATUS_MAP[row.status]} />
    )}
  ];

  return (
    <div>
      <div className="courses-header">
        <h1>
          <CheckSquare size={24} style={{ color: 'var(--primary)' }} />
          Grading Queue <span className="count-badge">{queue.length}</span>
        </h1>
      </div>

      <div className="courses-filters">
        <div className="search-input">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by student or assessment..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
        </div>
        <button className="btn-outline btn-sm">
          <Filter size={14} /> Filter Course
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={(row) => navigate(`/admin/grading/${row.id}`)}
        emptyMessage="No pending submissions to grade."
      />
    </div>
  );
}
