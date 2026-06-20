-- Workstream E1b — case-insensitive email.
--
-- register/login matched email verbatim while forgot-password lowercased its
-- lookup, so an uppercase-registered account could log in but never reset, and
-- two accounts could exist for one human under different casing. The controller
-- now normalizes on write + read (lower(email)); this enforces it at the DB.
--
-- SAFE-BY-DESIGN: this aborts BEFORE any write if case-variant collisions exist,
-- so it can never destructively merge two accounts. If it aborts, resolve the
-- collisions manually (see the deploy runbook pre-flight query) and re-run.
-- Idempotent: the backfill is a no-op once applied and the index uses IF NOT
-- EXISTS.

DO $$
DECLARE
  collision_groups INT;
BEGIN
  SELECT count(*) INTO collision_groups FROM (
    SELECT lower(email) FROM users GROUP BY lower(email) HAVING count(*) > 1
  ) dups;
  IF collision_groups > 0 THEN
    RAISE EXCEPTION
      'Cannot enforce case-insensitive email: % case-variant collision group(s) exist. Resolve manually before applying (see deploy runbook), then re-run.',
      collision_groups;
  END IF;
END $$;

-- Normalize stored values to lowercase.
UPDATE users SET email = lower(email) WHERE email <> lower(email);

-- Enforce uniqueness on the normalized form. (The original case-sensitive
-- column UNIQUE remains and is harmless once all values are lowercased.)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uniq ON users (lower(email));
