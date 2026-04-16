const API_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://localhost:5001/your-project-id/us-central1/api';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };
  const config = { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } };
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
}

// Notes
export const getNotes = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/notes${query ? `?${query}` : ''}`);
};

export const getNoteById = (id) => request(`/notes/${id}`);

export const createNote = (data) =>
  request('/notes', { method: 'POST', body: JSON.stringify(data) });

export const updateNote = (id, data) =>
  request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => request('/categories');
export const createCategory = (data) =>
  request('/categories', { method: 'POST', body: JSON.stringify(data) });

// Sections
export const getSections = (categoryId) =>
  request(`/sections${categoryId ? `?categoryId=${categoryId}` : ''}`);
export const createSection = (data) =>
  request('/sections', { method: 'POST', body: JSON.stringify(data) });

// Tags
export const getTags = () => request('/tags');
export const createTag = (data) =>
  request('/tags', { method: 'POST', body: JSON.stringify(data) });
