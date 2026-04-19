// When deployed to Firebase Hosting, the /api/** rewrite in firebase.json routes requests
// to the Cloud Function automatically — no VITE_FUNCTIONS_URL needed in production.
// For local development with the Firebase Emulator set VITE_FUNCTIONS_URL in .env.local:
//   VITE_FUNCTIONS_URL=http://127.0.0.1:5001/<your-project-id>/us-central1/api
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || '/api';
const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

async function getAuthHeader(method) {
  if (!WRITE_METHODS.has((method || 'GET').toUpperCase())) return {};
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const authHeader = await getAuthHeader(options.method);
  const config = {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
  };
  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error(
      `Network error: unable to reach the API at "${API_BASE_URL}". ` +
      'For local development set VITE_FUNCTIONS_URL in frontend/.env.local and start the Firebase Emulator. ' +
      `(${networkError.message})`
    );
  }
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `API returned an unexpected response (HTTP ${response.status}). ` +
        'Make sure the Firebase Cloud Function is deployed and VITE_FUNCTIONS_URL is correct.'
      );
    }
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

// Image upload — sends file as base64 JSON, returns { url }
export const uploadImage = (filename, contentType, base64Data) =>
  request('/upload', {
    method: 'POST',
    body: JSON.stringify({ filename, contentType, data: base64Data }),
  });
