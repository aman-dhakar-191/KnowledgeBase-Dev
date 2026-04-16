import { Link } from 'react-router-dom';
import { FiPlus, FiFileText, FiFolder, FiTag } from 'react-icons/fi';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import NoteCard from '../components/NoteCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { createCategory, createSection, deleteNote } from '../services/api';

export default function Dashboard() {
  const { categories, sections, tags, notes, loading, error, setCategories, setSections, refreshNotes } = useApp();
  const [catModal, setCatModal] = useState(false);
  const [secModal, setSecModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [secForm, setSecForm] = useState({ name: '', categoryId: '', order: 1 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const recentNotes = notes
    .filter((n) => !n.isDeleted)
    .sort((a, b) => {
      const aTime = a.updatedAt?.seconds || new Date(a.updatedAt || 0).getTime() / 1000;
      const bTime = b.updatedAt?.seconds || new Date(b.updatedAt || 0).getTime() / 1000;
      return bTime - aTime;
    })
    .slice(0, 6);

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      await refreshNotes();
    } catch (err) {
      alert('Failed to delete note: ' + err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { setFormError('Name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const result = await createCategory(catForm);
      setCategories((prev) => [...prev, result.data || result]);
      setCatModal(false);
      setCatForm({ name: '', description: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!secForm.name.trim() || !secForm.categoryId) { setFormError('Name and category are required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const result = await createSection(secForm);
      setSections((prev) => [...prev, result.data || result]);
      setSecModal(false);
      setSecForm({ name: '', categoryId: '', order: 1 });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading knowledge base..." />;
  if (error) return <div className="error-banner">⚠ {error}</div>;

  return (
    <div className="page">
      <div className="page__hero">
        <div>
          <h1 className="page__title">📚 Knowledge Base</h1>
          <p className="page__subtitle">Your personal knowledge hub — organized, searchable, and version-controlled.</p>
        </div>
        <Link to="/new" className="btn btn--primary">
          <FiPlus /> New Note
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <FiFileText className="stat-card__icon" />
          <div className="stat-card__value">{notes.filter((n) => !n.isDeleted).length}</div>
          <div className="stat-card__label">Notes</div>
        </div>
        <div className="stat-card">
          <FiFolder className="stat-card__icon" />
          <div className="stat-card__value">{categories.length}</div>
          <div className="stat-card__label">Categories</div>
        </div>
        <div className="stat-card">
          <FiFolder className="stat-card__icon" />
          <div className="stat-card__value">{sections.length}</div>
          <div className="stat-card__label">Sections</div>
        </div>
        <div className="stat-card">
          <FiTag className="stat-card__icon" />
          <div className="stat-card__value">{tags.length}</div>
          <div className="stat-card__label">Tags</div>
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Categories</h2>
          <button className="btn btn--outline btn--sm" onClick={() => { setCatModal(true); setFormError(''); }}>
            <FiPlus /> Add Category
          </button>
        </div>
        {categories.length === 0 ? (
          <div className="empty-state">
            <FiFolder className="empty-state__icon" />
            <p>No categories yet. Create one to organize your notes.</p>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => {
              const catSections = sections.filter((s) => s.categoryId === cat.id);
              const catNotes = notes.filter((n) => n.categoryId === cat.id && !n.isDeleted);
              return (
                <Link to={`/notes?category=${cat.id}`} key={cat.id} className="category-card">
                  <h3 className="category-card__name">{cat.name}</h3>
                  {cat.description && <p className="category-card__desc">{cat.description}</p>}
                  <div className="category-card__meta">
                    <span>{catNotes.length} notes</span>
                    <span>{catSections.length} sections</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Sections */}
      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Sections</h2>
          <button className="btn btn--outline btn--sm" onClick={() => { setSecModal(true); setFormError(''); }}>
            <FiPlus /> Add Section
          </button>
        </div>
        {sections.length === 0 ? (
          <div className="empty-state">
            <p>No sections yet.</p>
          </div>
        ) : (
          <div className="section-list">
            {sections.map((sec) => {
              const cat = categories.find((c) => c.id === sec.categoryId);
              const secNotes = notes.filter((n) => n.sectionId === sec.id && !n.isDeleted);
              return (
                <Link to={`/notes?section=${sec.id}`} key={sec.id} className="section-item">
                  <span className="section-item__name">{sec.name}</span>
                  {cat && <span className="section-item__cat">{cat.name}</span>}
                  <span className="section-item__count">{secNotes.length} notes</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Recent Notes</h2>
            <Link to="/notes" className="btn btn--outline btn--sm">View all</Link>
          </div>
          <div className="notes-grid">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
            ))}
          </div>
        </section>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Add Category">
        <form onSubmit={handleAddCategory}>
          {formError && <div className="form-error form-error--block">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">Name *</label>
            <input id="cat-name" type="text" className="form-input" value={catForm.name}
              onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" className="form-textarea" rows={3} value={catForm.description}
              onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} disabled={saving} />
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={() => setCatModal(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={secModal} onClose={() => setSecModal(false)} title="Add Section">
        <form onSubmit={handleAddSection}>
          {formError && <div className="form-error form-error--block">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="sec-cat">Category *</label>
            <select id="sec-cat" className="form-select" value={secForm.categoryId}
              onChange={(e) => setSecForm((p) => ({ ...p, categoryId: e.target.value }))} disabled={saving}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sec-name">Name *</label>
            <input id="sec-name" type="text" className="form-input" value={secForm.name}
              onChange={(e) => setSecForm((p) => ({ ...p, name: e.target.value }))} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sec-order">Order</label>
            <input id="sec-order" type="number" className="form-input" value={secForm.order}
              onChange={(e) => setSecForm((p) => ({ ...p, order: Number(e.target.value) }))} min={1} disabled={saving} />
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={() => setSecModal(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Add Section'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
