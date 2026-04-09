import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/adminApi.js';

export default function useAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 15, totalPages: 1 });
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const debounceRef = useRef(null);
  const [debouncedActor, setDebouncedActor] = useState('');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedActor(actorFilter), 300);
    return () => clearTimeout(debounceRef.current);
  }, [actorFilter]);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await api.getAuditLogs({
        actor: debouncedActor,
        action: actionFilter,
        from: dateFrom,
        to: dateTo,
        page,
        perPage: meta.perPage,
      });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedActor, actionFilter, dateFrom, dateTo, meta.perPage]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const setPage = (page) => fetchLogs(page);

  const clearFilters = () => {
    setActorFilter('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return {
    logs, loading, meta,
    actorFilter, setActorFilter,
    actionFilter, setActionFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    setPage,
    clearFilters,
    refresh: () => fetchLogs(meta.page),
  };
}
