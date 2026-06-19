const crypto = require('crypto')
const { pool } = require('../config/db')

// Idempotency middleware: dedupes retried mutations via a client Idempotency-Key so a
// double-tap / network retry replays the stored response instead of duplicating writes.
// No-op when the header is absent, so existing clients and response shapes are preserved.
function idempotency(req, res, next) {
  const key = req.headers['idempotency-key']
  if (!key || typeof key !== 'string') {
    return next()
  }
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // Hash route + body so a reused key with different params is rejected, not silently replayed.
  const payloadHash = crypto
    .createHash('sha256')
    .update(`${req.method}:${req.originalUrl}:${JSON.stringify(req.body || {})}`)
    .digest('hex')

  run(req, res, next, key, payloadHash).catch((err) => {
    console.error('[idempotency] Error:', err)
    res.status(500).json({ error: 'Internal server error' })
  })
}

async function run(req, res, next, key, payloadHash) {
  // Try to claim the key; ON CONFLICT means this key was seen before (replay).
  const claim = await pool.query(
    `INSERT INTO idempotency_keys (user_id, idempotency_key, payload_hash, status)
     VALUES ($1, $2, $3, 'STARTED')
     ON CONFLICT (user_id, idempotency_key) DO NOTHING
     RETURNING id`,
    [req.user.userId, key, payloadHash]
  )

  if (claim.rows.length === 0) {
    const existing = await pool.query(
      `SELECT payload_hash, status, response_status, response_body
       FROM idempotency_keys
       WHERE user_id = $1 AND idempotency_key = $2`,
      [req.user.userId, key]
    )
    const row = existing.rows[0]
    if (row && row.payload_hash !== payloadHash) {
      return res.status(409).json({ error: 'Idempotency-Key reused with different parameters' })
    }
    if (row && row.status === 'COMPLETED' && row.response_status != null) {
      return res.status(row.response_status).json(row.response_body)
    }
    // Original request is still STARTED (in flight) or FAILED — ask the client to retry later.
    return res.status(409).json({ error: 'A request with this Idempotency-Key is already in progress' })
  }

  // First time we have seen this key: run the handler, capturing its response to persist.
  const originalJson = res.json.bind(res)
  res.json = (body) => {
    const status = res.statusCode || 200
    const finalStatus = status >= 200 && status < 300 ? 'COMPLETED' : 'FAILED'
    pool
      .query(
        `UPDATE idempotency_keys
         SET status = $3, response_status = $4, response_body = $5, completed_at = NOW()
         WHERE user_id = $1 AND idempotency_key = $2`,
        [req.user.userId, key, finalStatus, status, body]
      )
      .catch((err) => console.error('[idempotency] Failed to persist response:', err))
    return originalJson(body)
  }
  next()
}

module.exports = { idempotency }
