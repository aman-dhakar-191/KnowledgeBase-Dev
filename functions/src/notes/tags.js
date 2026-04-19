const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const admin = require('firebase-admin');
const { requireAdmin } = require('../middleware/auth');

// GET /tags
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tags').orderBy('name').get();
    return res.json({ success: true, data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /tags
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const id = name.trim().toLowerCase().replace(/\s+/g, '-');
    const data = { name: name.trim(), color: color || '#4CAF50', createdAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection('tags').doc(id).set(data);
    return res.status(201).json({ success: true, data: { id, ...data } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
