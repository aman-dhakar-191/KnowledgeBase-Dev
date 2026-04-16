const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const admin = require('firebase-admin');

// GET /sections
router.get('/', async (req, res) => {
  try {
    let query = db.collection('sections');
    if (req.query.categoryId) query = query.where('categoryId', '==', req.query.categoryId);
    const snapshot = await query.orderBy('order').get();
    return res.json({ success: true, data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /sections
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, order } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId is required' });

    const id = `${categoryId}-${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    const data = { name: name.trim(), categoryId, order: order || 1, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection('sections').doc(id).set(data);
    return res.status(201).json({ success: true, data: { id, ...data } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /sections/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('sections').doc(req.params.id).delete();
    return res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
