const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const notesRouter = require('./notes/index');
const categoriesRouter = require('./notes/categories');
const sectionsRouter = require('./notes/sections');
const tagsRouter = require('./notes/tags');
const uploadRouter = require('./upload');

const app = express();

// CORS - allow Firebase Hosting origin and localhost
app.use(cors({
  origin: [
    /^https:\/\/.*\.web\.app$/,
    /^https:\/\/.*\.firebaseapp\.com$/,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/notes', notesRouter);
app.use('/categories', categoriesRouter);
app.use('/sections', sectionsRouter);
app.use('/tags', tagsRouter);
app.use('/upload', uploadRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

exports.api = functions.https.onRequest(app);
