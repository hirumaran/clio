const crypto = require('crypto');

/**
 * Assigns a per-request correlation id (Workstream B1/B2). Generated
 * server-side so it can't be forged by a client to confuse the audit trail;
 * echoed back as X-Request-Id for client/log correlation. Mounted before the
 * routes so every audit row and log line can reference req.id.
 */
function requestContext(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = { requestContext };
