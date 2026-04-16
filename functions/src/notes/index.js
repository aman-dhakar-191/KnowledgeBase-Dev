const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const { saveFileToGitHub, deleteFileFromGitHub } = require('../services/github');
const admin = require('firebase-admin');

// Helpers
function buildGithubPath(note) {
  const category = (note.categoryId || 'uncategorized').toLowerCase().replace(/\s+/g, '-');
  const section = (note.sectionId || 'general').toLowerCase().replace(/\s+/g, '-');
  return `data/${category}/${section}/${note.id}.json`;
}

async function syncToGitHub(note) {
  const githubContent = {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.categoryId,
    section: note.sectionId,
    tags: note.tags || [],
    createdAt: note.createdAt?.toDate?.() || note.createdAt,
    updatedAt: note.updatedAt?.toDate?.() || note.updatedAt,
    version: note.version,
  };
  const path = note.githubPath || buildGithubPath(note);
  await saveFileToGitHub(path, githubContent, `Update note: ${note.title}`);
  return path;
}

// GET /notes
router.get('/', async (req, res) => {
  try {
    let query = db.collection('notes').where('isDeleted', '==', false);

    if (req.query.categoryId) query = query.where('categoryId', '==', req.query.categoryId);
    if (req.query.sectionId) query = query.where('sectionId', '==', req.query.sectionId);

    const snapshot = await query.orderBy('updatedAt', 'desc').get();
    const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Client-side tag filter (Firestore limitation)
    let filtered = notes;
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filtered = notes.filter((n) => tags.some((t) => n.tags?.includes(t)));
    }
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      filtered = filtered.filter(
        (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (err) {
    console.error('GET /notes error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /notes/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('notes').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Note not found' });
    return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('GET /notes/:id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /notes
router.post('/', async (req, res) => {
  try {
    const { title, content, categoryId, sectionId, tags } = req.body;

    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category is required' });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const noteRef = db.collection('notes').doc();
    const noteId = noteRef.id;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      categoryId,
      sectionId: sectionId || '',
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDeleted: false,
      syncStatus: 'PENDING',
      githubPath: '',
    };

    noteData.githubPath = buildGithubPath({ ...noteData, id: noteId });

    await noteRef.set(noteData);

    // Sync to GitHub asynchronously (don't block response)
    const noteWithId = { id: noteId, ...noteData };
    syncToGitHub(noteWithId)
      .then(async (path) => {
        await noteRef.update({ syncStatus: 'SYNCED', githubPath: path });
      })
      .catch(async (err) => {
        console.error('GitHub sync failed:', err.message);
        await noteRef.update({ syncStatus: 'FAILED' });
      });

    return res.status(201).json({ success: true, data: { id: noteId, ...noteData } });
  } catch (err) {
    console.error('POST /notes error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /notes/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, content, categoryId, sectionId, tags } = req.body;
    const noteRef = db.collection('notes').doc(req.params.id);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) return res.status(404).json({ success: false, message: 'Note not found' });

    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category is required' });

    const existing = noteDoc.data();
    const updates = {
      title: title.trim(),
      content: content.trim(),
      categoryId,
      sectionId: sectionId || '',
      tags: tags || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: (existing.version || 1) + 1,
      syncStatus: 'PENDING',
    };

    await noteRef.update(updates);

    const updated = { id: req.params.id, ...existing, ...updates };

    syncToGitHub(updated)
      .then(async (path) => {
        await noteRef.update({ syncStatus: 'SYNCED', githubPath: path });
      })
      .catch(async (err) => {
        console.error('GitHub sync failed:', err.message);
        await noteRef.update({ syncStatus: 'FAILED' });
      });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /notes/:id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /notes/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const noteRef = db.collection('notes').doc(req.params.id);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) return res.status(404).json({ success: false, message: 'Note not found' });

    await noteRef.update({
      isDeleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    console.error('DELETE /notes/:id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
