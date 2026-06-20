/**
 * Append-only audit-log writer (Workstream B1).
 *
 * Two entry points by integrity need:
 *   writeAudit(client, entry)      — runs inside the caller's transaction and
 *                                    PROPAGATES errors, so the audited action
 *                                    and its audit row commit or roll back
 *                                    together (use for borrow state transitions).
 *   writeAuditBestEffort(entry)    — autocommit via the pool; NEVER throws into
 *                                    the request path (logs and continues).
 *                                    Use for auth events, moderation, admin, and
 *                                    Matrix-credential use where the action has
 *                                    already happened.
 *
 * SECURITY: callers must pass identifiers and event metadata ONLY — never
 * tokens, password hashes, shared secrets, admin tokens, or message content.
 */

const { pool } = require('../config/db');

const COLUMNS = `(actor_user_id, actor_role, actor_school_id, action,
                  target_type, target_id, target_school_id, correlation_id, ip, metadata)`;
const PLACEHOLDERS = '($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';

function paramsFrom(entry) {
  return [
    entry.actorUserId ?? null,
    entry.actorRole ?? null,
    entry.actorSchoolId ?? null,
    entry.action,
    entry.targetType ?? null,
    entry.targetId != null ? String(entry.targetId) : null,
    entry.targetSchoolId ?? null,
    entry.correlationId ?? null,
    entry.ip ?? null,
    entry.metadata ? JSON.stringify(entry.metadata) : '{}',
  ];
}

/**
 * Transactional audit write. Pass the same pg client the action uses so the
 * row is part of that transaction. Throws on failure (intentional — the
 * caller's transaction should roll back so no unaudited transition commits).
 */
async function writeAudit(client, entry) {
  await client.query(
    `INSERT INTO audit_log ${COLUMNS} VALUES ${PLACEHOLDERS}`,
    paramsFrom(entry)
  );
}

/** Best-effort autocommit audit write. Never throws. */
async function writeAuditBestEffort(entry) {
  try {
    await pool.query(
      `INSERT INTO audit_log ${COLUMNS} VALUES ${PLACEHOLDERS}`,
      paramsFrom(entry)
    );
  } catch (err) {
    // Auditing must never break the request — but surface the gap loudly.
    console.error('[audit] failed to write audit row:', err.message, '(action:', entry.action, ')');
  }
}

/**
 * Extracts actor/context fields from an authenticated request so call sites
 * stay terse: writeAuditBestEffort({ ...actorFromReq(req), action, ... }).
 */
function actorFromReq(req) {
  return {
    actorUserId: req.user?.userId ?? null,
    actorRole: req.user?.role ?? null,
    actorSchoolId: req.user?.schoolId ?? null,
    correlationId: req.id ?? null,
    ip: req.ip ?? null,
  };
}

module.exports = { writeAudit, writeAuditBestEffort, actorFromReq };
