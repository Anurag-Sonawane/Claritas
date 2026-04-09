import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/courseApi.js';

export default function useVersionHistory(courseId) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const r = await api.getCourseVersions(courseId);
      setVersions(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  const rollback = async (versionId) => {
    const r = await api.rollbackCourseVersion(courseId, versionId);
    await fetchVersions();
    return r.data;
  };

  return { versions, loading, fetchVersions, rollback };
}
