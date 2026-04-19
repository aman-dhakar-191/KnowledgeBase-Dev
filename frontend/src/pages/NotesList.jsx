import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import NoteCard from '../components/NoteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { deleteNote } from '../services/api';
import { FiFilter, FiX } from 'react-icons/fi';

export default function NotesList() {
  const [searchParams] = useSearchParams();
  const {
    filteredNotes, categories, sections, tags,
    selectedCategory, setSelectedCategory,
    selectedSection, setSelectedSection,
    selectedTags, toggleTag,
    loading, error, refreshNotes,
  } = useApp();
  const { user, isAdmin } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params into context
  useEffect(() => {
    const cat = searchParams.get('category');
    const sec = searchParams.get('section');
    if (cat) setSelectedCategory(cat);
    if (sec) setSelectedSection(sec);
  }, [searchParams, setSelectedCategory, setSelectedSection]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      await refreshNotes();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSection(null);
  };

  const hasFilters = selectedCategory || selectedSection || selectedTags.length > 0;
  const activeCatName = categories.find((c) => c.id === selectedCategory)?.name;
  const activeSecName = sections.find((s) => s.id === selectedSection)?.name;

  if (loading) return <LoadingSpinner message="Loading notes..." />;
  if (error) return <div className="error-banner">⚠ {error}</div>;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Notes</h1>
        <div className="page__header-actions">
          <button
            className={`btn btn--outline btn--sm ${showFilters ? 'btn--active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <FiFilter /> Filters {hasFilters && <span className="badge">{[selectedCategory, selectedSection, ...selectedTags].filter(Boolean).length}</span>}
          </button>
          {user && <Link to="/new" className="btn btn--primary btn--sm">+ New Note</Link>}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-panel__row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={selectedCategory || ''} onChange={(e) => { setSelectedCategory(e.target.value || null); setSelectedSection(null); }}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select className="form-select" value={selectedSection || ''} onChange={(e) => setSelectedSection(e.target.value || null)} disabled={!selectedCategory}>
                <option value="">All sections</option>
                {sections.filter((s) => s.categoryId === selectedCategory).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="filter-panel__tags">
            <label className="form-label">Tags</label>
            <div className="tag-list">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`tag-chip ${selectedTags.includes(tag.id) ? 'tag-chip--active' : ''}`}
                  style={{ '--tag-color': tag.color || '#4CAF50' }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
              <FiX /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters */}
      {hasFilters && (
        <div className="active-filters">
          {activeCatName && <span className="filter-chip">{activeCatName} <button onClick={() => { setSelectedCategory(null); setSelectedSection(null); }}><FiX /></button></span>}
          {activeSecName && <span className="filter-chip">{activeSecName} <button onClick={() => setSelectedSection(null)}><FiX /></button></span>}
          {selectedTags.map((tid) => {
            const tag = tags.find((t) => t.id === tid);
            return tag ? <span key={tid} className="filter-chip">{tag.name} <button onClick={() => toggleTag(tid)}><FiX /></button></span> : null;
          })}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <p>No notes found. <Link to="/new">Create your first note</Link>.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={isAdmin ? handleDelete : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
