const express = require('express');
const router = express.Router();
const path = require('path');
const { admin } = require('./services/firestore');

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB original file

// POST /upload  { filename, contentType, data: base64string }
router.post('/', async (req, res) => {
  try {
    const { filename, contentType, data } = req.body;
    if (!filename || !data) {
      return res.status(400).json({ success: false, message: 'filename and data are required' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ success: false, message: 'File too large (max 10 MB)' });
    }

    const ext = path.extname(filename) || '';
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}${ext.includes('.') ? '' : ext}`;
    const storagePath = `images/${safeName}`;

    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: { contentType: contentType || 'application/octet-stream' },
      public: true,
    });

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    return res.json({ success: true, url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
