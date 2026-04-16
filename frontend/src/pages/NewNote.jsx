import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteEditor from '../components/NoteEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import { createNote } from '../services/api';
import { useApp } from '../contexts/AppContext';

export default function NewNote() {
  const navigate = useNavigate();
  const { refreshNotes, loading: appLoading } = useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const result = await createNote(formData);
      await refreshNotes();
      const noteId = result.data?.id || result.id;
      navigate(noteId ? `/note/${noteId}` : '/notes');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (appLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">New Note</h1>
      </div>
      {error && <div className="error-banner">⚠ {error}</div>}
      <NoteEditor
        onSave={handleSave}
        onCancel={() => navigate(-1)}
        isSaving={saving}
      />
    </div>
  );
}
