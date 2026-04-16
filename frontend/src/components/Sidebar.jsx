import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiPlusCircle, FiChevronDown, FiChevronRight, FiTag, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { categories, sections, tags, selectedCategory, setSelectedCategory, selectedSection, setSelectedSection, selectedTags, toggleTag } = useApp();
  const [expandedCats, setExpandedCats] = useState({});

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

        <div className="sidebar__section-title">Categories</div>
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
    </>
  );
}
