import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import MDEditor from '@uiw/react-md-editor';
import { useApp } from '../contexts/AppContext';

function getInitialForm(initialNote) {
  if (!initialNote) {
    return { title: '', content: '', categoryId: '', sectionId: '', tags: [] };
  }
  return {
    title: initialNote.title || '',
    content: initialNote.content || '',
    categoryId: initialNote.categoryId || '',
    sectionId: initialNote.sectionId || '',
    tags: initialNote.tags || [],
  };
}

export default function NoteEditor({ initialNote, onSave, onCancel, isSaving }) {
  const { categories, sections } = useApp();
  const [form, setForm] = useState(() => getInitialForm(initialNote));
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const availableSections = sections.filter((s) => s.categoryId === form.categoryId);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    if (!form.categoryId) errs.categoryId = 'Category is required';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'categoryId') updated.sectionId = '';
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags.includes(tag)) {
      handleChange('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    handleChange('tags', form.tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <form className="note-editor" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="note-title">Title *</label>
        <input
          id="note-title"
          type="text"
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter note title..."
          disabled={isSaving}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="note-category">Category *</label>
          <select
            id="note-category"
            className={`form-select ${errors.categoryId ? 'form-input--error' : ''}`}
            value={form.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            disabled={isSaving}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note-section">Section</label>
          <select
            id="note-section"
            className="form-select"
            value={form.sectionId}
            onChange={(e) => handleChange('sectionId', e.target.value)}
            disabled={!form.categoryId || isSaving}
          >
            <option value="">Select section...</option>
            {availableSections.map((sec) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note-tags">Tags</label>
        <div className="tag-input-wrapper">
          {form.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button type="button" className="tag-chip__remove" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                <FiX />
              </button>
            </span>
          ))}
          <input
            id="note-tags"
            type="text"
            className="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={addTag}
            placeholder="Add tag and press Enter..."
            disabled={isSaving}
          />
        </div>
        <div className="form-hint">Press Enter or comma to add a tag</div>
      </div>

      <div className="form-group">
        <label className="form-label">Content * (Markdown supported)</label>
        {errors.content && <span className="form-error">{errors.content}</span>}
        <div data-color-mode="light">
          <MDEditor
            value={form.content}
            onChange={(val) => handleChange('content', val || '')}
            height={400}
            preview="edit"
          />
        </div>
      </div>

      <div className="note-editor__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </form>
  );
}
