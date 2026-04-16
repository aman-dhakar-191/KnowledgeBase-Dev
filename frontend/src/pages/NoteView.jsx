import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { FiEdit, FiTrash2, FiArrowLeft, FiGitBranch, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import NoteEditor from '../components/NoteEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import { getNoteById, updateNote, deleteNote } from '../services/api';
import { useApp } from '../contexts/AppContext';

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, sections, refreshNotes } = useApp();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getNoteById(id)
      .then((data) => setNote(data.data || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const result = await updateNote(id, formData);
      setNote(result.data || result);
      await refreshNotes();
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note? This action cannot be undone.')) return;
    try {
      await deleteNote(id);
      await refreshNotes();
      navigate('/notes');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading note..." />;
  if (error && !note) return (
    <div className="page">
      <div className="error-banner">⚠ {error}</div>
      <Link to="/notes" className="btn btn--secondary">← Back to Notes</Link>
    </div>
  );
  if (!note) return (
    <div className="page">
      <div className="empty-state"><p>Note not found.</p></div>
      <Link to="/notes" className="btn btn--secondary">← Back to Notes</Link>
    </div>
  );

  const category = categories.find((c) => c.id === note.categoryId);
  const section = sections.find((s) => s.id === note.sectionId);
  const updatedAt = note.updatedAt?.toDate
    ? note.updatedAt.toDate()
    : note.updatedAt
    ? new Date(note.updatedAt)
    : null;
  const syncColor = note.syncStatus === 'SYNCED' ? '#4CAF50' : note.syncStatus === 'FAILED' ? '#f44336' : '#FF9800';

  return (
    <div className="page">
      {/* Back nav */}
      <div className="note-view__nav">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="breadcrumb">
          {category && <span className="breadcrumb__item">{category.name}</span>}
          {section && <span className="breadcrumb__sep">/</span>}
          {section && <span className="breadcrumb__item">{section.name}</span>}
        </div>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {editing ? (
        <>
          <h2 className="page__title">Edit Note</h2>
          <NoteEditor
            initialNote={note}
            onSave={handleUpdate}
            onCancel={() => setEditing(false)}
            isSaving={saving}
          />
        </>
      ) : (
        <article className="note-view">
          <header className="note-view__header">
            <h1 className="note-view__title">{note.title}</h1>
            <div className="note-view__actions">
              <button className="btn btn--outline btn--sm" onClick={() => setEditing(true)}>
                <FiEdit /> Edit
              </button>
              <button className="btn btn--danger btn--sm" onClick={handleDelete}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </header>

          <div className="note-view__meta">
            {updatedAt && (
              <span className="note-view__meta-item">
                <FiClock /> Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
              </span>
            )}
            <span className="note-view__meta-item" style={{ color: syncColor }}>
              <FiGitBranch /> {note.syncStatus || 'PENDING'}
            </span>
            {note.version && <span className="note-view__meta-item">Version {note.version}</span>}
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="note-view__tags">
              {note.tags.map((tag) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}

          <div className="note-view__content" data-color-mode="light">
            <MDEditor.Markdown source={note.content} />
          </div>
        </article>
      )}
    </div>
  );
}
