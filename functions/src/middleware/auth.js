const admin = require('firebase-admin');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(authHeader.slice(7));
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.slice(7));
    if (!ADMIN_EMAIL || decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Silently resolves auth — sets req.isAdmin without blocking the request.
// Reuses req.user if requireAuth already ran (avoids double token verification).
async function resolveAdmin(req, _res, next) {
  req.isAdmin = false;
  if (req.user) {
    req.isAdmin = Boolean(ADMIN_EMAIL && req.user.email === ADMIN_EMAIL);
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.slice(7));
    req.isAdmin = Boolean(ADMIN_EMAIL && decoded.email === ADMIN_EMAIL);
    req.user = decoded;
  } catch { /* ignore */ }
  next();
}

module.exports = { requireAuth, requireAdmin, resolveAdmin };
