import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/courseApi.js';

export default function useCourseEditor(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const autosaveRef = useRef(null);

  // Load course
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api.getCourse(courseId).then(r => {
      setCourse(r.data);
      if (r.data.modules?.length > 0) {
        setActiveModuleId(r.data.modules[0].id);
        if (r.data.modules[0].lessons?.length > 0) setActiveLessonId(r.data.modules[0].lessons[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [courseId]);

  // Autosave
  useEffect(() => {
    if (!hasUnsaved || !course) return;
    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.saveDraft(courseId, { title: course.title, modules: course.modules });
        setLastSaved(new Date());
        setHasUnsaved(false);
      } catch (e) { console.error('Autosave failed:', e); }
      finally { setSaving(false); }
    }, 3000);
    return () => clearTimeout(autosaveRef.current);
  }, [hasUnsaved, course, courseId]);

  const pushUndo = (snapshot) => setUndoStack(prev => [...prev.slice(-20), snapshot]);

  const markDirty = () => setHasUnsaved(true);

  // Module operations
  const addModule = async (title) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    const r = await api.addModule(courseId, { title });
    setCourse(prev => ({ ...prev, modules: [...prev.modules, r.data], totalModules: prev.modules.length + 1 }));
    setActiveModuleId(r.data.id);
    markDirty();
    return r.data;
  };

  const deleteModule = async (moduleId) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    await api.deleteModule(courseId, moduleId);
    setCourse(prev => {
      const mods = prev.modules.filter(m => m.id !== moduleId);
      return { ...prev, modules: mods, totalModules: mods.length, totalLessons: mods.reduce((s, m) => s + m.lessons.length, 0) };
    });
    markDirty();
  };

  const renameModule = (moduleId, newTitle) => {
    setCourse(prev => ({
      ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, title: newTitle } : m),
    }));
    markDirty();
  };

  const toggleModule = (moduleId) => {
    setCourse(prev => ({
      ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m),
    }));
  };

  const reorderModules = async (fromIdx, toIdx) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    setCourse(prev => {
      const mods = [...prev.modules];
      const [moved] = mods.splice(fromIdx, 1);
      mods.splice(toIdx, 0, moved);
      return { ...prev, modules: mods };
    });
    markDirty();
  };

  // Lesson operations
  const addLesson = async (moduleId, title) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    const r = await api.addLesson(courseId, moduleId, { title });
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, r.data], isExpanded: true } : m),
      totalLessons: prev.totalLessons + 1,
    }));
    setActiveModuleId(moduleId);
    setActiveLessonId(r.data.id);
    markDirty();
    return r.data;
  };

  const deleteLesson = async (moduleId, lessonId) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    await api.deleteLesson(courseId, moduleId, lessonId);
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m),
      totalLessons: prev.totalLessons - 1,
    }));
    markDirty();
  };

  const reorderLessons = async (moduleId, fromIdx, toIdx) => {
    pushUndo(JSON.parse(JSON.stringify(course.modules)));
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id !== moduleId) return m;
        const lessons = [...m.lessons];
        const [moved] = lessons.splice(fromIdx, 1);
        lessons.splice(toIdx, 0, moved);
        return { ...m, lessons };
      }),
    }));
    markDirty();
  };

  const updateLessonContent = (moduleId, lessonId, blocks) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, contentBlocks: blocks } : l) }
        : m
      ),
    }));
    markDirty();
  };

  // Course metadata
  const updateMetadata = (updates) => {
    setCourse(prev => ({ ...prev, ...updates }));
    markDirty();
  };

  // Undo
  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setCourse(c => ({ ...c, modules: prev }));
    markDirty();
  };

  // Active lesson helper
  const getActiveLesson = () => {
    if (!course || !activeModuleId || !activeLessonId) return null;
    const mod = course.modules.find(m => m.id === activeModuleId);
    return mod?.lessons.find(l => l.id === activeLessonId) || null;
  };

  return {
    course, loading, saving, lastSaved, hasUnsaved,
    activeModuleId, setActiveModuleId,
    activeLessonId, setActiveLessonId,
    getActiveLesson,
    addModule, deleteModule, renameModule, toggleModule, reorderModules,
    addLesson, deleteLesson, reorderLessons, updateLessonContent,
    updateMetadata, undo, canUndo: undoStack.length > 0,
  };
}
