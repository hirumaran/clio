/**
 * Lightweight abuse-signal alerter (Workstream B2).
 *
 * Prevention without detection means an in-progress attack or safety incident
 * goes unnoticed. This emits an alert (structured `[SECURITY-ALERT]` log, plus
 * an optional webhook POST) when a threshold trips. At pilot scale an in-process
 * windowed counter is sufficient.
 *
 * LIMITATIONS (documented in the runbook): counters are in-memory, so they are
 * per-process and reset on restart. For a multi-instance / PM2 deployment, move
 * the counters to Redis (ioredis is already a dependency). Alerts land in the
 * app logs by default; set ALERT_WEBHOOK_URL to also POST them to Slack/PagerDuty.
 *
 * SECURITY: alert payloads carry identifiers and counts only — never secrets,
 * tokens, or credentials.
 */

const num = (name, fallback) => {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

const MIN = 60 * 1000;
const THRESHOLDS = {
  // signal: { window(ms), max } — alert when count within window exceeds max
  failed_login: { windowMs: 15 * MIN, max: num('ALERT_FAILED_LOGIN_THRESHOLD', 10) },
  registration: { windowMs: 60 * MIN, max: num('ALERT_REGISTRATION_THRESHOLD', 20) },
  report: { windowMs: 24 * 60 * MIN, max: num('ALERT_REPORT_THRESHOLD', 5) },
};

// signal -> Map(key -> number[] timestamps)
const hits = new Map();
// de-dupe: signal:key -> last alert epoch, so a tripped window alerts once.
const lastAlert = new Map();

function emitAlert(type, detail) {
  const payload = { type, detail, at: new Date().toISOString() };
  console.error('[SECURITY-ALERT]', JSON.stringify(payload));

  const webhook = process.env.ALERT_WEBHOOK_URL;
  if (webhook) {
    // Best-effort, fire-and-forget — alerting must never throw into the caller.
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `[Clio SECURITY-ALERT] ${type}: ${JSON.stringify(detail)}` }),
    }).catch((err) => console.error('[alerts] webhook POST failed:', err.message));
  }
}

/**
 * Records one occurrence of `signal` for `key`; alerts (once per window) when
 * the count in the trailing window exceeds the configured max.
 */
function record(signal, key, extra = {}) {
  const cfg = THRESHOLDS[signal];
  if (!cfg) return;
  const now = Date.now();
  const mapKey = `${signal}:${key}`;

  let arr = hits.get(mapKey);
  if (!arr) {
    arr = [];
    hits.set(mapKey, arr);
  }
  // Drop timestamps outside the window (keeps memory bounded for active keys).
  const cutoff = now - cfg.windowMs;
  let i = 0;
  while (i < arr.length && arr[i] < cutoff) i++;
  if (i > 0) arr.splice(0, i);
  arr.push(now);

  if (arr.length > cfg.max) {
    const last = lastAlert.get(mapKey) ?? 0;
    if (now - last >= cfg.windowMs) {
      lastAlert.set(mapKey, now);
      emitAlert(signal, { key, count: arr.length, windowMs: cfg.windowMs, ...extra });
    }
  }
}

// ---- Specific abuse signals -------------------------------------------------

/** Failed login — keyed by IP and (when known) by account, to catch both
 *  credential stuffing (one IP, many accounts) and targeting (one account). */
function recordFailedLogin(ip, accountKey) {
  if (ip) record('failed_login', `ip:${ip}`);
  if (accountKey) record('failed_login', `acct:${accountKey}`);
}

/** Mass/automated registration abusing async Matrix provisioning. */
function recordRegistration(ip) {
  if (ip) record('registration', `ip:${ip}`);
}

/** Report-volume spike against a single user. */
function recordReport(reportedUserId) {
  if (reportedUserId != null) record('report', `user:${reportedUserId}`);
}

/** Cross-tenant admin action — a global admin acting on a school other than
 *  their own. Single occurrence is worth surfacing (threshold 1, immediate). */
function alertCrossTenantAdmin({ adminUserId, adminSchoolId, targetSchoolId, action, ip }) {
  if (targetSchoolId != null && adminSchoolId != null && targetSchoolId !== adminSchoolId) {
    emitAlert('cross_tenant_admin', { adminUserId, adminSchoolId, targetSchoolId, action, ip });
  }
}

const KNOWN_MATRIX_ADMIN_SOURCES = new Set([
  'session_refresh',     // /auth/matrix/refresh -> regenerateMatrixToken
  'create_borrow_room',  // room.worker
  'redact_message',      // moderation enforcement
  'shutdown_room',       // moderation enforcement
  'revoke_sessions',     // C1 deactivate/block revocation
]);

/** Matrix admin-token use outside a recognized flow — a tripwire for misuse. */
function checkMatrixAdminSource(source, ctx = {}) {
  if (!KNOWN_MATRIX_ADMIN_SOURCES.has(source)) {
    emitAlert('matrix_admin_unexpected_use', { source: source ?? 'unspecified', ...ctx });
  }
}

module.exports = {
  recordFailedLogin,
  recordRegistration,
  recordReport,
  alertCrossTenantAdmin,
  checkMatrixAdminSource,
  KNOWN_MATRIX_ADMIN_SOURCES,
};
