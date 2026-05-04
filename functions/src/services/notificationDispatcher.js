const { db } = require('./firestore');
const admin = require('firebase-admin');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Fan-out on write: called async after a note is published.
// Finds all subscribers (by author + by category), adds admin, deduplicates,
// then writes one notification doc per recipient.
async function dispatchNotifications(note) {
  const { id: noteId, title, categoryId, ownerId, ownerEmail } = note;

  try {
    // Resolve admin UID so we can always include them
    let adminUid = null;
    if (ADMIN_EMAIL) {
      try {
        const adminUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        adminUid = adminUser.uid;
      } catch { /* admin account may not exist yet */ }
    }

    const [authorSnap, categorySnap] = await Promise.all([
      db.collection('subscriptions').where('type', '==', 'user').where('targetId', '==', ownerId).get(),
      db.collection('subscriptions').where('type', '==', 'category').where('targetId', '==', categoryId).get(),
    ]);

    const recipients = new Set();
    authorSnap.docs.forEach((d) => recipients.add(d.data().subscriberId));
    categorySnap.docs.forEach((d) => recipients.add(d.data().subscriberId));

    // Admin is always notified regardless of explicit subscriptions
    if (adminUid) recipients.add(adminUid);

    // Never notify the author about their own note
    recipients.delete(ownerId);

    if (recipients.size === 0) return;

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    recipients.forEach((userId) => {
      const ref = db.collection('notifications').doc();
      batch.set(ref, {
        userId,
        noteId,
        noteTitle: title,
        authorId: ownerId,
        authorEmail: ownerEmail || '',
        categoryId,
        isRead: false,
        createdAt: now,
      });
    });

    await batch.commit();
  } catch (err) {
    console.error('dispatchNotifications error:', err.message);
  }
}

module.exports = { dispatchNotifications };
