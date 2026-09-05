/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/purity */
import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, GripVertical, Plus, Trash2, Edit2, Eye, Undo2,
  Type, Play, Paperclip, HelpCircle, Package, ArrowLeft,
  BookOpen, Clock, History, Globe, X, Bold, Italic, Strikethrough,
  List as ListIcon, ListOrdered, Quote, Code, Heading1, Heading2, Image,
  Upload, FileText,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import useCourseEditor from '../hooks/useCourseEditor.js';
import useVersionHistory from '../hooks/useVersionHistory.js';
import MediaManagerModal from '../components/MediaManagerModal.jsx';
import ScormUploader from '../components/ScormUploader.jsx';
import VersionHistoryModal from '../components/VersionHistoryModal.jsx';
import PublishModal from '../components/PublishModal.jsx';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../data/courseMockData.js';
import './CourseEditorPage.css';

const BLOCK_ICONS = { text: Type, video: Play, file: Paperclip, quiz: HelpCircle, scorm: Package };

export default function CourseEditorPage() {
  const { courseId } = useParams();
  
  const editor = useCourseEditor(courseId);
  const versioning = useVersionHistory(courseId);

  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showScorm, setShowScorm] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleName, setEditingModuleName] = useState('');
  const [dragState, setDragState] = useState({ type: null, id: null });

  if (editor.loading) {
    return <div className="course-editor"><div className="editor-empty-state"><div className="course-skeleton" style={{ width: 200, height: 200 }} /></div></div>;
  }

  if (!editor.course) {
    return <div className="course-editor"><div className="editor-empty-state"><h3>Course not found</h3><Link to="/admin/courses">← Back to Courses</Link></div></div>;
  }

  const { course } = editor;
  const activeLesson = editor.getActiveLesson();
  const activeModule = course.modules.find(m => m.id === editor.activeModuleId);

  // Module drag handlers
  const handleModuleDragStart = (e, idx) => { e.dataTransfer.effectAllowed = 'move'; setDragState({ type: 'module', id: idx }); };
  const handleModuleDrop = (e, dropIdx) => { e.preventDefault(); if (dragState.type === 'module') editor.reorderModules(dragState.id, dropIdx); setDragState({ type: null, id: null }); };

  // Lesson drag handlers
  const handleLessonDragStart = (e, modId, idx) => { e.dataTransfer.effectAllowed = 'move'; e.stopPropagation(); setDragState({ type: 'lesson', moduleId: modId, id: idx }); };
  const handleLessonDrop = (e, modId, dropIdx) => { e.preventDefault(); e.stopPropagation(); if (dragState.type === 'lesson' && dragState.moduleId === modId) editor.reorderLessons(modId, dragState.id, dropIdx); setDragState({ type: null, id: null }); };

  const addBlock = (type) => {
    if (!activeLesson) return;
    const newBlock = { id: `block-${Math.floor(Math.random() * 1000000)}`, type, content: type === 'text' ? '<p>Start typing...</p>' : '' };
    if (type === 'video') { newBlock.videoUrl = ''; newBlock.videoTitle = ''; }
    if (type === 'quiz') { newBlock.quizTitle = 'New Quiz'; newBlock.questionCount = 5; newBlock.timeLimit = '10min'; }
    const blocks = [...activeLesson.contentBlocks, newBlock];
     
    
    editor.updateLessonContent(editor.activeModuleId, activeLesson.id, blocks);
    setShowAddBlock(false);
  };

  const removeBlock = (blockId) => {
    if (!activeLesson) return;
    const blocks = activeLesson.contentBlocks.filter(b => b.id !== blockId);
    editor.updateLessonContent(editor.activeModuleId, activeLesson.id, blocks);
  };

  const updateBlock = (blockId, updates) => {
    if (!activeLesson) return;
    const blocks = activeLesson.contentBlocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    editor.updateLessonContent(editor.activeModuleId, activeLesson.id, blocks);
  };

  return (
    <div className="course-editor">
      {/* ── Left: Module Sidebar ── */}
      <aside className="editor-sidebar">
        <div className="editor-sidebar-header">
          <h3><BookOpen size={16} style={{ color: 'var(--primary)' }} /> Modules</h3>
          <button
            className="module-action-btn"
            title="Add Module"
            onClick={() => editor.addModule('New Module')}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="editor-sidebar-list">
          {course.modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className={`module-item ${dragState.type === 'module' && dragState.id === modIdx ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleModuleDragStart(e, modIdx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleModuleDrop(e, modIdx)}
            >
              <div className="module-item-header" onClick={() => editor.toggleModule(mod.id)}>
                <GripVertical size={14} className="module-drag-handle" />
                <ChevronRight size={14} className={`chevron ${mod.isExpanded ? 'expanded' : ''}`} />

                {editingModuleId === mod.id ? (
                  <input
                    className="module-title-input"
                    value={editingModuleName}
                    onChange={e => setEditingModuleName(e.target.value)}
                    onBlur={() => { editor.renameModule(mod.id, editingModuleName); setEditingModuleId(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { editor.renameModule(mod.id, editingModuleName); setEditingModuleId(null); } }}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="module-title">{mod.title}</span>
                )}

                <div className="module-actions" onClick={e => e.stopPropagation()}>
                  <button className="module-action-btn" title="Rename" onClick={() => { setEditingModuleId(mod.id); setEditingModuleName(mod.title); }}>
                    <Edit2 size={12} />
                  </button>
                  <button className="module-action-btn" title="Delete" onClick={() => editor.deleteModule(mod.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {mod.isExpanded && (
                <div className="lesson-list">
                  {mod.lessons.map((lesson, lIdx) => {
                    const LIcon = BLOCK_ICONS[lesson.type] || Type;
                    return (
                      <div
                        key={lesson.id}
                        className={`lesson-item ${lesson.id === editor.activeLessonId ? 'active' : ''} ${dragState.type === 'lesson' && dragState.id === lIdx && dragState.moduleId === mod.id ? 'dragging' : ''}`}
                        onClick={() => { editor.setActiveModuleId(mod.id); editor.setActiveLessonId(lesson.id); }}
                        draggable
                        onDragStart={(e) => handleLessonDragStart(e, mod.id, lIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleLessonDrop(e, mod.id, lIdx)}
                      >
                        <GripVertical size={12} className="lesson-drag-handle" />
                        <LIcon size={14} className="lesson-icon" />
                        <span className="lesson-title-text">{lesson.title}</span>
                        <button className="lesson-delete-btn" onClick={(e) => { e.stopPropagation(); editor.deleteLesson(mod.id, lesson.id); }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  <button className="add-lesson-btn" onClick={() => editor.addLesson(mod.id, 'New Lesson')}>
                    <Plus size={13} /> Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}

          <button className="add-module-btn" onClick={() => editor.addModule('New Module')}>
            <Plus size={14} /> Add Module
          </button>
        </div>
      </aside>

      {/* ── Center: Lesson Editor ── */}
      <main className="editor-center">
        <div className="editor-topbar">
          <div className="editor-breadcrumb">
            <Link to="/admin/courses" style={{ color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Courses
            </Link>
            <ChevronRight size={12} />
            <span>{course.title}</span>
            {activeModule && <><ChevronRight size={12} /><span>{activeModule.title}</span></>}
            {activeLesson && <><ChevronRight size={12} /><span className="active">{activeLesson.title}</span></>}
          </div>

          <div className="editor-toolbar">
            {editor.canUndo && (
              <button className="editor-toolbar-btn" onClick={editor.undo} title="Undo"><Undo2 size={14} /> Undo</button>
            )}
            <button className="editor-toolbar-btn" onClick={() => setShowVersions(true)}><History size={14} /> History</button>
            <button className="editor-toolbar-btn" onClick={() => setShowMedia(true)}><Image size={14} /> Media</button>
            <button className="editor-toolbar-btn" onClick={() => setShowScorm(true)}><Package size={14} /> SCORM</button>
            <button className="btn-primary btn-sm" onClick={() => setShowPublish(true)}>
              <Globe size={14} /> {course.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="editor-content-area">
          {activeLesson ? (
            <>
              {activeLesson.contentBlocks.map((block) => (
                <ContentBlock
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => updateBlock(block.id, updates)}
                  onRemove={() => removeBlock(block.id)}
                  onOpenMedia={() => setShowMedia(true)}
                />
              ))}

              {showAddBlock ? (
                <div className="add-block-menu">
                  {[
                    { type: 'text', label: 'Text', icon: Type },
                    { type: 'video', label: 'Video', icon: Play },
                    { type: 'file', label: 'File', icon: Paperclip },
                    { type: 'quiz', label: 'Quiz', icon: HelpCircle },
                    { type: 'scorm', label: 'SCORM', icon: Package },
                  ].map(opt => (
                    <button key={opt.type} className="add-block-option" onClick={() => addBlock(opt.type)}>
                      <opt.icon size={20} />
                      {opt.label}
                    </button>
                  ))}
                  <button className="add-block-option" onClick={() => setShowAddBlock(false)} style={{ borderColor: 'var(--status-deleted)' }}>
                    <X size={20} /> Cancel
                  </button>
                </div>
              ) : (
                <div className="add-block-area" onClick={() => setShowAddBlock(true)}>
                  <Plus size={18} /> Add Content Block
                </div>
              )}
            </>
          ) : (
            <div className="editor-empty-state">
              <BookOpen size={48} />
              <h3>Select a lesson to start editing</h3>
              <p style={{ fontSize: '0.9rem' }}>Choose a lesson from the module list on the left, or create a new one.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Right: Metadata Rail ── */}
      <aside className="editor-rail">
        <div className="rail-section">
          <h4>Course Details</h4>
          <div className="rail-field">
            <label>Title</label>
            <input type="text" value={course.title} onChange={e => editor.updateMetadata({ title: e.target.value })} />
          </div>
          <div className="rail-field">
            <label>Description</label>
            <textarea value={course.description} onChange={e => editor.updateMetadata({ description: e.target.value })} rows={3} />
          </div>
        </div>

        <div className="rail-section">
          <h4>Thumbnail</h4>
          <div className="rail-thumb-preview" style={{ background: course.thumbnailGradient }}>
            <BookOpen size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
          <button className="btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setShowMedia(true)}>
            <Image size={14} /> Change Thumbnail
          </button>
        </div>

        <div className="rail-section">
          <h4>Settings</h4>
          <div className="rail-field">
            <label>Category</label>
            <select value={course.category} onChange={e => editor.updateMetadata({ category: e.target.value })}>
              {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rail-field">
            <label>Level</label>
            <select value={course.level} onChange={e => editor.updateMetadata({ level: e.target.value })}>
              {COURSE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="rail-section">
          <h4>Tags</h4>
          <div className="rail-tags">
            {course.tags?.map((tag, i) => (
              <span key={i} className="rail-tag">
                {tag}
                <button className="rail-tag-remove" onClick={() => editor.updateMetadata({ tags: course.tags.filter((_, idx) => idx !== i) })}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="rail-section">
          <h4>Status</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
              background: `var(--course-${course.status}-bg)`,
              color: `var(--course-${course.status})`,
            }}>
              {course.status}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {course.totalModules} modules • {course.totalLessons} lessons
          </div>
        </div>

        {/* Autosave Indicator */}
        <div className="autosave-indicator">
          <span className={`autosave-dot ${editor.saving ? 'saving' : editor.hasUnsaved ? 'unsaved' : 'saved'}`} />
          <span style={{ color: 'var(--muted)' }}>
            {editor.saving ? 'Saving...' : editor.hasUnsaved ? 'Unsaved changes' : editor.lastSaved ? `Saved ${formatRelative(editor.lastSaved)}` : 'No changes'}
          </span>
        </div>
      </aside>

      {/* Modals */}
      {showMedia && <MediaManagerModal onClose={() => setShowMedia(false)} onSelect={() => { setShowMedia(false); }} />}
      {showScorm && <ScormUploader courseId={courseId} onClose={() => setShowScorm(false)} />}
      {showVersions && <VersionHistoryModal courseId={courseId} versions={versioning.versions} onRollback={versioning.rollback} onClose={() => setShowVersions(false)} />}
      {showPublish && <PublishModal course={course} onClose={() => setShowPublish(false)} />}
    </div>
  );
}

// ── Content Block Component ──
function ContentBlock({ block, onUpdate, onRemove, onOpenMedia }) {
  const Icon = BLOCK_ICONS[block.type] || Type;
  const typeColors = { text: 'var(--secondary)', video: 'var(--primary)', file: 'var(--course-review)', quiz: 'var(--course-draft)', scorm: 'var(--status-active)' };

  return (
    <div className="content-block">
      <div className="block-header">
        <Icon size={14} style={{ color: typeColors[block.type] }} />
        <span className="block-type-badge" style={{ background: `${typeColors[block.type]}20`, color: typeColors[block.type] }}>
          {block.type}
        </span>
        <GripVertical size={14} className="block-drag-handle" />
        <div className="block-actions">
          <button className="block-action-btn" onClick={onRemove} title="Remove"><Trash2 size={14} /></button>
        </div>
      </div>

      {block.type === 'text' && <TextBlock block={block} onUpdate={onUpdate} />}
      {block.type === 'video' && <VideoBlock block={block} onUpdate={onUpdate} />}
      {block.type === 'file' && <FileBlock block={block} onOpenMedia={onOpenMedia} />}
      {block.type === 'quiz' && <QuizBlock block={block} onUpdate={onUpdate} />}
      {block.type === 'scorm' && <ScormBlock block={block} />}
    </div>
  );
}

// ── Text Block with TipTap ──
function TextBlock({ block, onUpdate }) {
  const tipTapEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your content...' }),
    ],
    content: block.content || '',
    onUpdate: ({ editor: e }) => onUpdate({ content: e.getHTML() }),
  });

  if (!tipTapEditor) return null;

  return (
    <>
      <div className="text-toolbar">
        <button className={tipTapEditor.isActive('bold') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleBold().run()} title="Bold"><Bold size={14} /></button>
        <button className={tipTapEditor.isActive('italic') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={14} /></button>
        <button className={tipTapEditor.isActive('strike') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={14} /></button>
        <div className="sep" />
        <button className={tipTapEditor.isActive('heading', { level: 1 }) ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={14} /></button>
        <button className={tipTapEditor.isActive('heading', { level: 2 }) ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={14} /></button>
        <div className="sep" />
        <button className={tipTapEditor.isActive('bulletList') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleBulletList().run()} title="Bullet List"><ListIcon size={14} /></button>
        <button className={tipTapEditor.isActive('orderedList') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={14} /></button>
        <div className="sep" />
        <button className={tipTapEditor.isActive('blockquote') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote size={14} /></button>
        <button className={tipTapEditor.isActive('code') ? 'active' : ''} onClick={() => tipTapEditor.chain().focus().toggleCode().run()} title="Code"><Code size={14} /></button>
      </div>
      <div className="block-content">
        <EditorContent editor={tipTapEditor} />
      </div>
    </>
  );
}

// ── Video Block ──
function VideoBlock({ block, onUpdate }) {
  return (
    <div className="block-content">
      <div className="video-block-config">
        <div className="rail-field">
          <label>Video URL</label>
          <input type="text" value={block.videoUrl || ''} onChange={e => onUpdate({ videoUrl: e.target.value })} placeholder="https://youtube.com/embed/..." />
        </div>
        <div className="rail-field">
          <label>Video Title</label>
          <input type="text" value={block.videoTitle || ''} onChange={e => onUpdate({ videoTitle: e.target.value })} placeholder="Lecture title..." />
        </div>
        {block.videoUrl && (
          <div className="video-preview">
            <iframe src={block.videoUrl} title={block.videoTitle || 'Video'} allowFullScreen />
          </div>
        )}
      </div>
    </div>
  );
}

// ── File Block ──
function FileBlock({ block, onOpenMedia }) {
  return (
    <div className="block-content">
      {block.fileName ? (
        <div className="file-block-display">
          <FileText size={24} style={{ color: 'var(--course-review)', flexShrink: 0 }} />
          <div className="file-block-info">
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{block.fileName}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{block.fileSize ? `${(block.fileSize / 1024).toFixed(1)}MB` : 'Unknown size'}</div>
          </div>
          <button className="btn-outline btn-sm" onClick={onOpenMedia}>Replace</button>
        </div>
      ) : (
        <button className="btn-outline" onClick={onOpenMedia} style={{ width: '100%', justifyContent: 'center' }}>
          <Upload size={16} /> Attach File from Media Library
        </button>
      )}
    </div>
  );
}

// ── Quiz Block ──
function QuizBlock({ block, onUpdate }) {
  return (
    <div className="block-content">
      <div className="quiz-block-config">
        <div className="rail-field">
          <label>Quiz Title</label>
          <input type="text" value={block.quizTitle || ''} onChange={e => onUpdate({ quizTitle: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="rail-field" style={{ flex: 1 }}>
            <label>Questions</label>
            <input type="number" value={block.questionCount || 5} onChange={e => onUpdate({ questionCount: parseInt(e.target.value) || 0 })} min={1} />
          </div>
          <div className="rail-field" style={{ flex: 1 }}>
            <label>Time Limit</label>
            <input type="text" value={block.timeLimit || ''} onChange={e => onUpdate({ timeLimit: e.target.value })} placeholder="10min" />
          </div>
        </div>
        <div style={{ padding: '12px 16px', background: 'rgba(167,139,250,0.06)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--muted)' }}>
          Quiz editor coming soon — questions will be configured in a dedicated quiz builder.
        </div>
      </div>
    </div>
  );
}

// ── SCORM Block ──
function ScormBlock({ block }) {
  return (
    <div className="block-content">
      <div style={{ padding: '16px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Package size={24} style={{ color: 'var(--status-active)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>SCORM/xAPI Package</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Use the SCORM button in the toolbar to manage packages for this course.</div>
        </div>
      </div>
    </div>
  );
}

function formatRelative(d) {
  if (!d) return '';
  const timestamp = new Date(d).getTime();
  if (isNaN(timestamp)) return '';
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'just now';
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}
