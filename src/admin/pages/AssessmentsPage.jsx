import { useState, useEffect } from 'react';
import { Search, Plus, Filter, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../components/AdminTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getAssessments } from '../services/assessmentMockService.js';
import './CoursesPage.css'; // Reusing established table/header CSS

const STATUS_MAP = {
  'Draft': { bg: 'var(--course-draft-bg)', color: 'var(--course-draft)' },
  'Published': { bg: 'var(--course-published-bg)', color: 'var(--course-published)' },
  'Archived': { bg: 'var(--course-archived-bg)', color: 'var(--course-archived)' }
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAssessments().then(data => {
      setAssessments(data);
      setLoading(false);
    });
  }, []);

  const filtered = assessments.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.course.toLowerCase().includes(query.toLowerCase())
  );

  const columns = [
    { key: 'title', label: 'Assessment Title', sortable: true, render: (row) => (
      <div style={{ fontWeight: 500 }}>{row.title}</div>
    )},
    { key: 'course', label: 'Course', sortable: true },
    { key: 'attempts', label: 'Attempts', sortable: true, render: (row) => row.attempts || '0' },
    { key: 'avgScore', label: 'Avg. Score', sortable: true },
    { key: 'status', label: 'Status', render: (row) => (
      <StatusBadge status={row.status} customStyle={STATUS_MAP[row.status]} />
    )}
  ];

  return (
    <div>
      <div className="courses-header">
        <h1>
          <CheckCircle size={24} style={{ color: 'var(--primary)' }} />
          Assessments <span className="count-badge">{assessments.length}</span>
        </h1>
        <div className="courses-toolbar">
          <button className="btn-primary" onClick={() => navigate('/admin/assessments/new')}>
            <Plus size={16} /> New Assessment
          </button>
        </div>
      </div>

      <div className="courses-filters">
        <div className="search-input">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search assessments..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
        </div>
        <button className="btn-outline btn-sm">
          <Filter size={14} /> Filter Status
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={(row) => navigate(`/admin/assessments/${row.id}/edit`)} // Or just mock builder
        emptyMessage="No assessments found."
      />
    </div>
  );
}
