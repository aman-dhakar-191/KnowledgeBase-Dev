import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiPlusCircle, FiChevronDown, FiChevronRight, FiTag, FiX, FiPlus } from 'react-icons/fi';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Modal from './Modal';
import { createCategory } from '../services/api';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { categories, sections, tags, selectedCategory, setSelectedCategory, selectedSection, setSelectedSection, selectedTags, toggleTag, setCategories } = useApp();
  const [expandedCats, setExpandedCats] = useState({});
  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  const toggleCat = (id) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategoryClick = (cat) => {
    if (selectedCategory === cat.id) {
      setSelectedCategory(null);
      setSelectedSection(null);
    } else {
      setSelectedCategory(cat.id);
      setSelectedSection(null);
      toggleCat(cat.id);
    }
    navigate('/notes');
  };

  const handleSectionClick = (sec) => {
    setSelectedSection(selectedSection === sec.id ? null : sec.id);
    navigate('/notes');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <span className="sidebar__logo">📚 KnowledgeBase</span>
          <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <FiX />
          </button>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} end onClick={onClose}>
            <FiHome /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onClose}>
            <FiFileText /> <span>All Notes</span>
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={onClose}>
            <FiPlusCircle /> <span>New Note</span>
          </NavLink>
        </nav>

        <div className="sidebar__section-title">
          <span>Categories</span>
          <button
            className="sidebar__add-btn"
            onClick={() => { setCatModal(true); setFormError(''); }}
            aria-label="Add category"
            title="Add category"
          >
            <FiPlus />
          </button>
        </div>
        <ul className="sidebar__categories">
          {categories.map((cat) => {
            const catSections = sections.filter((s) => s.categoryId === cat.id);
            const isExpanded = expandedCats[cat.id];
            const isSelected = selectedCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  className={`sidebar__cat-btn ${isSelected ? 'sidebar__cat-btn--active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span className="sidebar__cat-icon">
                    {catSections.length > 0 ? (isExpanded ? <FiChevronDown /> : <FiChevronRight />) : null}
                  </span>
                  <span>{cat.name}</span>
                </button>
                {isExpanded && catSections.length > 0 && (
                  <ul className="sidebar__sections">
                    {catSections.map((sec) => (
                      <li key={sec.id}>
                        <button
                          className={`sidebar__sec-btn ${selectedSection === sec.id ? 'sidebar__sec-btn--active' : ''}`}
                          onClick={() => handleSectionClick(sec)}
                        >
                          {sec.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {tags.length > 0 && (
          <>
            <div className="sidebar__section-title">
              <FiTag /> Tags
            </div>
            <div className="sidebar__tags">
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
          </>
        )}
      </aside>

      {/* Add Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Add Category">
        <form onSubmit={handleAddCategory}>
          {formError && <div className="form-error form-error--block">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="sidebar-cat-name">Name *</label>
            <input id="sidebar-cat-name" type="text" className="form-input" value={catForm.name}
              onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} disabled={saving} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sidebar-cat-desc">Description</label>
            <textarea id="sidebar-cat-desc" className="form-textarea" rows={3} value={catForm.description}
              onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} disabled={saving} />
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={() => setCatModal(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
