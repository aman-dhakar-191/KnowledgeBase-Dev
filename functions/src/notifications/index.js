const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const { requireAuth } = require('../middleware/auth');

// GET /notifications — latest 50 notifications for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    return res.json({ success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('GET /notifications error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /notifications/read-all — mark all unread as read
// Defined before /:id/read so "read-all" is never captured as an :id segment
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .where('isRead', '==', false)
      .get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
      await batch.commit();
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('PATCH /notifications/read-all error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /notifications/:id/read — mark a single notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('notifications').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ success: false, message: 'Forbidden' });
    await ref.update({ isRead: true });
    return res.json({ success: true });
  } catch (err) {
    console.error('PATCH /notifications/:id/read error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /notifications/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('notifications').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ success: false, message: 'Forbidden' });
    await ref.delete();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /notifications/:id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
