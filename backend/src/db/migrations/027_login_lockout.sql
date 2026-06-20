-- Workstream H2 — per-account login lockout.
--
-- Complements the IP-keyed loginLimiter: a distributed attacker rotating IPs is
-- otherwise unthrottled against a single high-value (admin) account. The login
-- handler increments failed_login_attempts on a bad password and sets
-- locked_until once the threshold is reached (auto-expiring), resetting both on
-- a successful login. Idempotent.

ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
