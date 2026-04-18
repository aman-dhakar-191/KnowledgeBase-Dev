import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCategories, getSections, getTags, getNotes } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, sects, tagsData, notesData] = await Promise.all([
        getCategories(),
        getSections(),
        getTags(),
        getNotes(),
      ]);
      setCategories(cats.data || cats || []);
      setSections(sects.data || sects || []);
      setTags(tagsData.data || tagsData || []);
      setNotes(notesData.data || notesData || []);
      setApiStatus('online');
    } catch (err) {
      setError(err.message);
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshNotes = useCallback(async (params) => {
    try {
      const data = await getNotes(params);
      setNotes(data.data || data || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const filteredNotes = notes.filter((note) => {
    if (note.isDeleted) return false;
    if (selectedCategory && note.categoryId !== selectedCategory) return false;
    if (selectedSection && note.sectionId !== selectedSection) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => note.tags?.includes(t))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        note.title?.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppContext.Provider
      value={{
        categories,
        sections,
        tags,
        notes,
        filteredNotes,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        selectedSection,
        setSelectedSection,
        selectedTags,
        toggleTag,
        searchQuery,
        setSearchQuery,
        apiStatus,
        refreshNotes,
        loadInitialData,
        setNotes,
        setCategories,
        setSections,
        setTags,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
