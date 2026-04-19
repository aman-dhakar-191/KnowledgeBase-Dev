const admin = require('firebase-admin');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const token = authHeader.slice(7);
    const decoded = await admin.auth().verifyIdToken(token);
    if (!ADMIN_EMAIL || decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { requireAdmin };
