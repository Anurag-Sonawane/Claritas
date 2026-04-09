import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Save } from 'lucide-react';
import Modal from './Modal.jsx';
import AdminTable from './AdminTable.jsx';
import { getQuestionBank } from '../services/assessmentMockService.js';

export default function QuestionBankModal({ onClose, onSelect }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    getQuestionBank().then(data => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  const filtered = questions.filter(q => 
    q.text.toLowerCase().includes(query.toLowerCase()) || 
    q.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const columns = [
    { key: 'text', label: 'Question', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'difficulty', label: 'Difficulty', sortable: true, render: (row) => (
      <span style={{ 
        color: row.difficulty === 'Hard' ? 'var(--status-deleted)' : row.difficulty === 'Medium' ? 'var(--status-review)' : 'var(--status-published)'
      }}>{row.difficulty}</span>
    )},
    { key: 'tags', label: 'Tags', render: (row) => row.tags.join(', ') }
  ];

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(q => q.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleInsert = () => {
    const selectedQs = questions.filter(q => selectedIds.includes(q.id));
    onSelect(selectedQs);
  };

  return (
    <Modal onClose={onClose} title="Question Bank" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="search-input" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by text or tags..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
            />
          </div>
          <button className="btn-outline btn-sm">
            <Filter size={14} /> Difficulty
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          <AdminTable
            columns={columns}
            data={filtered}
            loading={loading}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            emptyMessage="No questions found in bank."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleInsert}
            disabled={selectedIds.length === 0}
            style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}
          >
            <Plus size={16} /> Insert Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}
