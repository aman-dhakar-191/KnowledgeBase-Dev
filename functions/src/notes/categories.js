const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const admin = require('firebase-admin');
const { requireAdmin } = require('../middleware/auth');

// GET /categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    return res.json({ success: true, data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /categories
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const id = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const docRef = db.collection('categories').doc(id);
    const existing = await docRef.get();
    if (existing.exists) return res.status(409).json({ success: false, message: 'Category already exists' });

    const data = { name: name.trim(), description: description || '', createdAt: admin.firestore.FieldValue.serverTimestamp() };
    await docRef.set(data);
    return res.status(201).json({ success: true, data: { id, ...data } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /categories/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).delete();
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
