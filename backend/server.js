const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com", "https://images.unsplash.com", "data:"],
      connectSrc: ["'self'", process.env.MATRIX_HOMESERVER_URL ?? ''],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);
// CORS: restrict to an explicit allowlist instead of reflecting any origin.
// Auth is a Bearer token (not cookies), so credentials stay false. Origins come
// from CORS_ORIGINS (comma-separated) or FRONTEND_URL; in non-production we fall
// back to the local dev origins so the SPA keeps working without extra config.
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: false }));

// Explicit body-size cap (matches Express's default) to bound payload abuse.
app.use(express.json({ limit: '100kb' }));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

// Unmatched routes -> JSON 404 (no Express default HTML).
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler — returns opaque errors and never leaks stack traces
// to clients (a raw body-parser error would otherwise surface internals).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  console.error('[Error]', err);
  res.status(err && err.status ? err.status : 500).json({ error: 'Internal server error' });
});

// Start background workers
// TODO Phase 5: move workers to separate process with PM2
require('./src/workers/matrix.worker');
require('./src/workers/room.worker');
require('./src/workers/notification.worker');
require('./src/workers/cleanup.worker');
console.log('[Workers] Matrix, room, notification, and cleanup workers started');

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
