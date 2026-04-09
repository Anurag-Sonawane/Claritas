import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/adminApi.js';

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ role: '', org: '', status: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);

  const debounceRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await api.getUsers({
        query: debouncedQuery,
        role: filters.role,
        org: filters.org,
        status: filters.status,
        page,
        perPage: meta.perPage,
        sortBy,
        sortDir,
      });
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters, meta.perPage, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const setPage = (page) => fetchUsers(page);

  const setPerPage = (perPage) => {
    setMeta(prev => ({ ...prev, perPage }));
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedIds([]);
  };

  const clearFilters = () => {
    setFilters({ role: '', org: '', status: '' });
    setQuery('');
    setSelectedIds([]);
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const selectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const selectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const createUser = async (userData) => {
    const result = await api.createUser(userData);
    fetchUsers(meta.page);
    return result.data;
  };

  const updateUser = async (userId, updates) => {
    const result = await api.updateUser(userId, updates);
    setUsers(prev => prev.map(u => u.id === userId ? result.data : u));
    return result.data;
  };

  const deleteUser = async (userId) => {
    await api.deleteUser(userId);
    fetchUsers(meta.page);
  };

  const suspendUser = async (userId, reason) => {
    const result = await api.suspendUser(userId, reason);
    setUsers(prev => prev.map(u => u.id === userId ? result.data : u));
    return result.data;
  };

  const reactivateUser = async (userId) => {
    const result = await api.reactivateUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? result.data : u));
    return result.data;
  };

  const bulkSuspend = async () => {
    for (const id of selectedIds) {
      await api.suspendUser(id, 'Bulk action');
    }
    setSelectedIds([]);
    fetchUsers(meta.page);
  };

  const bulkDelete = async () => {
    for (const id of selectedIds) {
      await api.deleteUser(id);
    }
    setSelectedIds([]);
    fetchUsers(meta.page);
  };

  return {
    users, loading, meta,
    query, setQuery,
    filters, setFilter, clearFilters,
    sortBy, sortDir, handleSort,
    selectedIds, selectAll, selectRow,
    setPage, setPerPage,
    createUser, updateUser, deleteUser,
    suspendUser, reactivateUser,
    bulkSuspend, bulkDelete,
    refresh: () => fetchUsers(meta.page),
  };
}
