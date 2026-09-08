import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/courseApi.js';

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 12, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', instructor: '' });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const debounceRef = useRef(null);

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const pageToFetch = params.page || meta?.page || 1;
      const perPageToFetch = params.perPage || meta?.perPage || 12;
      const result = await api.getCourses({
        query, ...filters, sortBy, sortDir, page: pageToFetch, perPage: perPageToFetch, ...params,
      });
      setCourses(result.data || []);
      if (result.meta) {
        setMeta(result.meta);
      } else {
        setMeta({
          total: result.total ?? (result.data || []).length,
          page: result.page ?? pageToFetch,
          perPage: perPageToFetch,
          totalPages: result.totalPages ?? (Math.ceil((result.total ?? (result.data || []).length) / perPageToFetch) || 1)
        });
      }
    } catch (err) {
      console.error('Fetch courses failed:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortBy, sortDir, meta?.page, meta?.perPage]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(), 250);
    return () => clearTimeout(debounceRef.current);
  }, [fetchCourses]);

  const setPage = (p) => setMeta(prev => ({ ...prev, page: p }));
  const setPerPage = (pp) => setMeta(prev => ({ ...prev, perPage: pp, page: 1 }));
  const setFilter = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setMeta(prev => ({ ...prev, page: 1 })); };
  const clearFilters = () => { setFilters({ status: '', category: '', instructor: '' }); setQuery(''); };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const selectAll = () => setSelectedIds(selectedIds.length === courses.length ? [] : courses.map(c => c.id));
  const selectRow = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const createCourse = async (data) => { const r = await api.createCourse(data); await fetchCourses(); return r.data; };
  const deleteCourse = async (id) => { await api.deleteCourse(id); await fetchCourses(); };
  const bulkPublish = async () => { await api.bulkPublish(selectedIds); setSelectedIds([]); await fetchCourses(); };
  const bulkUnpublish = async () => { await api.bulkUnpublish(selectedIds); setSelectedIds([]); await fetchCourses(); };
  const bulkDelete = async () => { for (const id of selectedIds) await api.deleteCourse(id); setSelectedIds([]); await fetchCourses(); };

  return {
    courses, loading, meta, query, setQuery, filters, setFilter, clearFilters,
    sortBy, sortDir, handleSort, selectedIds, selectAll, selectRow,
    setPage, setPerPage, viewMode, setViewMode,
    createCourse, deleteCourse, bulkPublish, bulkUnpublish, bulkDelete,
    refresh: fetchCourses,
  };
}
