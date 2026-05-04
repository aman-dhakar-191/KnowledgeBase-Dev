const express = require('express');
const router = express.Router();
const { db } = require('../services/firestore');
const admin = require('firebase-admin');
const { requireAuth } = require('../middleware/auth');

// GET /subscriptions — list the current user's subscriptions
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('subscriptions')
      .where('subscriberId', '==', req.user.uid)
      .get();
    return res.json({ success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('GET /subscriptions error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /subscriptions — subscribe to a user or category
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, targetId, targetName } = req.body;
    if (!type || !['user', 'category'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "user" or "category"' });
    }
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'targetId is required' });
    }

    // Idempotent — return existing subscription if already subscribed
    const existing = await db.collection('subscriptions')
      .where('subscriberId', '==', req.user.uid)
      .where('type', '==', type)
      .where('targetId', '==', targetId)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
    }

    const ref = db.collection('subscriptions').doc();
    const data = {
      subscriberId: req.user.uid,
      subscriberEmail: req.user.email || '',
      type,
      targetId,
      targetName: targetName || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return res.status(201).json({ success: true, data: { id: ref.id, ...data } });
  } catch (err) {
    console.error('POST /subscriptions error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /subscriptions/by-target?type=user&targetId=xxx — unsubscribe by target
// Must be defined before /:id to avoid "by-target" being captured as an id
router.delete('/by-target', requireAuth, async (req, res) => {
  try {
    const { type, targetId } = req.query;
    if (!type || !targetId) {
      return res.status(400).json({ success: false, message: 'type and targetId query params required' });
    }
    const snap = await db.collection('subscriptions')
      .where('subscriberId', '==', req.user.uid)
      .where('type', '==', type)
      .where('targetId', '==', targetId)
      .get();

    if (snap.empty) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /subscriptions/by-target error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /subscriptions/:id — unsubscribe by document id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('subscriptions').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Subscription not found' });
    if (doc.data().subscriberId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await ref.delete();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /subscriptions/:id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
