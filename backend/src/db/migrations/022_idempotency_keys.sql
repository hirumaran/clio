-- Migration 022: idempotency keys for mutating /requests actions.
-- Dedupes retried calls (double-tap / network retry). Unique (user_id, idempotency_key)
-- enforces single-execution; payload_hash rejects a reused key with different params.
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  payload_hash    TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'STARTED'
                  CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED')),
  response_status INTEGER,
  response_body   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT uq_idempotency_user_key UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_user_key
  ON idempotency_keys(user_id, idempotency_key);
