import { useState, useRef } from 'react';
import { FiX, FiCheck, FiImage, FiLock } from 'react-icons/fi';
import MDEditor from '@uiw/react-md-editor';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { createCategory, createSection, uploadImage } from '../services/api';

const CREATE_NEW = '__create_new__';

function getInitialForm(initialNote) {
  if (!initialNote) {
    return { title: '', content: '', categoryId: '', sectionId: '', tags: [], isPrivate: false };
  }
  return {
    title: initialNote.title || '',
    content: initialNote.content || '',
    categoryId: initialNote.categoryId || '',
    sectionId: initialNote.sectionId || '',
    tags: initialNote.tags || [],
    isPrivate: Boolean(initialNote.isPrivate),
  };
}

export default function NoteEditor({ initialNote, onSave, onCancel, isSaving }) {
  const { categories, sections, setCategories, setSections } = useApp();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(() => getInitialForm(initialNote));
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catCreating, setCatCreating] = useState(false);
  const [catError, setCatError] = useState('');

  const [addingSec, setAddingSec] = useState(false);
  const [newSecName, setNewSecName] = useState('');
  const [secCreating, setSecCreating] = useState(false);
  const [secError, setSecError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleCategoryChange = (e) => {
    if (e.target.value === CREATE_NEW) {
      setAddingCat(true);
      setNewCatName('');
      setCatError('');
    } else {
      setAddingCat(false);
      handleChange('categoryId', e.target.value);
    }
  };

  const handleSectionChange = (e) => {
    if (e.target.value === CREATE_NEW) {
      setAddingSec(true);
      setNewSecName('');
      setSecError('');
    } else {
      setAddingSec(false);
      handleChange('sectionId', e.target.value);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) { setCatError('Name is required'); return; }
    setCatCreating(true);
    setCatError('');
    try {
      const result = await createCategory({ name: newCatName.trim() });
      const created = result.data || result;
      setCategories((prev) => [...prev, created]);
      handleChange('categoryId', created.id);
      setAddingCat(false);
      setNewCatName('');
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatCreating(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSecName.trim()) { setSecError('Name is required'); return; }
    setSecCreating(true);
    setSecError('');
    try {
      const result = await createSection({ name: newSecName.trim(), categoryId: form.categoryId });
      const created = result.data || result;
      setSections((prev) => [...prev, created]);
      handleChange('sectionId', created.id);
      setAddingSec(false);
      setNewSecName('');
    } catch (err) {
      setSecError(err.message);
    } finally {
      setSecCreating(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10 MB)');
      return;
    }
    setUploading(true);
    setUploadError('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target.result.split(',')[1];
        const result = await uploadImage(file.name, file.type, base64);
        const md = `\n![${file.name}](${result.url})\n`;
        handleChange('content', (form.content || '') + md);
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
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
        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="note-category">Category *</label>
          <select
            id="note-category"
            className={`form-select ${errors.categoryId ? 'form-input--error' : ''}`}
            value={addingCat ? CREATE_NEW : form.categoryId}
            onChange={handleCategoryChange}
            disabled={isSaving}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value={CREATE_NEW}>+ Add new category</option>
          </select>
          {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          {addingCat && (
            <div className="inline-create">
              <input
                className="inline-create__input"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                placeholder="Category name..."
                autoFocus
                disabled={catCreating}
              />
              <button type="button" className="inline-create__confirm" onClick={handleCreateCategory} disabled={catCreating} title="Create">
                <FiCheck />
              </button>
              <button type="button" className="inline-create__cancel" onClick={() => setAddingCat(false)} disabled={catCreating} title="Cancel">
                <FiX />
              </button>
              {catError && <span className="form-error inline-create__error">{catError}</span>}
            </div>
          )}
        </div>

        {/* Section */}
        <div className="form-group">
          <label className="form-label" htmlFor="note-section">Section</label>
          <select
            id="note-section"
            className="form-select"
            value={addingSec ? CREATE_NEW : form.sectionId}
            onChange={handleSectionChange}
            disabled={!form.categoryId || isSaving}
          >
            <option value="">Select section...</option>
            {availableSections.map((sec) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
            {form.categoryId && <option value={CREATE_NEW}>+ Add new section</option>}
          </select>
          {addingSec && (
            <div className="inline-create">
              <input
                className="inline-create__input"
                value={newSecName}
                onChange={(e) => setNewSecName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSection())}
                placeholder="Section name..."
                autoFocus
                disabled={secCreating}
              />
              <button type="button" className="inline-create__confirm" onClick={handleCreateSection} disabled={secCreating} title="Create">
                <FiCheck />
              </button>
              <button type="button" className="inline-create__cancel" onClick={() => setAddingSec(false)} disabled={secCreating} title="Cancel">
                <FiX />
              </button>
              {secError && <span className="form-error inline-create__error">{secError}</span>}
            </div>
          )}
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
        <div className="form-label-row">
          <label className="form-label">Content * (Markdown supported)</label>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => fileInputRef.current.click()}
            disabled={isSaving || uploading}
          >
            <FiImage /> {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {uploadError && <span className="form-error">{uploadError}</span>}
        {errors.content && <span className="form-error">{errors.content}</span>}
        <div data-color-mode="light">
          <MDEditor
            value={form.content}
            onChange={(val) => handleChange('content', val || '')}
            height={400}
            preview="edit"
            visibleDragbar={false}
            textareaProps={{ style: { verticalAlign: 'top' } }}
          />
        </div>
      </div>

      {isAdmin && (
        <label className="private-toggle">
          <input
            type="checkbox"
            checked={form.isPrivate}
            onChange={(e) => setForm((p) => ({ ...p, isPrivate: e.target.checked }))}
            disabled={isSaving}
          />
          <FiLock />
          <span>Private — only visible to you</span>
        </label>
      )}

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
