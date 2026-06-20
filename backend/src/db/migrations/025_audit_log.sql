-- Workstream B1 — append-only audit log.
--
-- Records security- and child-safety-relevant events so "what happened, when,
-- to whom" is answerable after an incident. Prerequisite for B2 alerting.
--
-- APPEND-ONLY ENFORCEMENT: B1b confirmed the app connects to Postgres as the
-- table OWNER, so a privilege REVOKE alone would not bind (owners bypass table
-- privilege checks). We therefore enforce immutability with triggers that block
-- UPDATE / DELETE / TRUNCATE for ALL roles, owner included. In production also
-- run the role-based REVOKE in the deploy runbook as defense-in-depth.
--
-- actor_user_id is intentionally NOT a foreign key: an audit trail must survive
-- the deletion of the user it references (and an ON DELETE cascade/SET NULL
-- would itself be a blocked mutation against this table). Identity is captured
-- by value.
--
-- Idempotent: safe to re-run (CREATE ... IF NOT EXISTS / OR REPLACE; triggers
-- are dropped-then-created).

CREATE TABLE IF NOT EXISTS audit_log (
  id               BIGSERIAL PRIMARY KEY,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id    INTEGER,                       -- no FK: audit outlives the user
  actor_role       TEXT,
  actor_school_id  INTEGER,
  action           TEXT NOT NULL,                 -- e.g. 'auth.login.failed', 'borrow.approve', 'moderation.shutdown_room', 'matrix.admin_login'
  target_type      TEXT,                          -- e.g. 'user', 'borrow_request', 'room', 'report'
  target_id        TEXT,
  target_school_id INTEGER,                        -- enables cross-tenant detection
  correlation_id   TEXT,                          -- per-HTTP-request id (X-Request-Id)
  ip               TEXT,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb
  -- NOTE: never write secrets/tokens/password hashes/decrypted message content
  -- here. Identifiers and event metadata only.
);

CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON audit_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor       ON audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action      ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target      ON audit_log (target_type, target_id);

CREATE OR REPLACE FUNCTION audit_log_block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_update   ON audit_log;
DROP TRIGGER IF EXISTS audit_log_no_delete   ON audit_log;
DROP TRIGGER IF EXISTS audit_log_no_truncate ON audit_log;

CREATE TRIGGER audit_log_no_update   BEFORE UPDATE   ON audit_log FOR EACH ROW       EXECUTE FUNCTION audit_log_block_mutation();
CREATE TRIGGER audit_log_no_delete   BEFORE DELETE   ON audit_log FOR EACH ROW       EXECUTE FUNCTION audit_log_block_mutation();
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log FOR EACH STATEMENT EXECUTE FUNCTION audit_log_block_mutation();

-- Deploy runbook (defense-in-depth; role-specific so left as documentation):
--   REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM <app_role>;
--   GRANT  INSERT, SELECT          ON audit_log TO   <app_role>;
-- where <app_role> is a least-privilege role distinct from the migration/owner role.
