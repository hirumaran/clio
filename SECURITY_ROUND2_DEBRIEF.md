# Calliope / Clio — Security Hardening Round 2: Debrief

Scope: operations, lifecycle, detection/response, and the deferred-but-gating items a code audit
structurally misses. Round 1 (see `CALLIOPE_WORKSTREAM_DEBRIEF.md`) is not re-litigated. Every item below
was verified against the actual code/config before any change. Three buckets are used honestly:
**FIX** (app code now), **CONFIG** (infra/config + runbook), **RECOMMEND/INVESTIGATE** (findings, not half-built).

**[SAFETY-GATE]** marks items that block onboarding minors.

---

## Per-item results

### Workstream A — Synapse currency & config-drift control

- **A1 — repin off the archived line — CONFIG (done) + runbook.**
  Confirmed: `synapse/docker-compose.yml:8` and `synapse/generate-config.sh:9` both pinned the **archived**
  `matrixdotorg/synapse:v1.106.0` (~2 years stale). Repointed both to the maintained
  **`ghcr.io/element-hq/synapse:v1.155.0`** (current stable, 2026-06-16; AGPLv3). This is the source-of-truth
  change; the live upgrade is **not** a blind bump — see runbook §1 (config dry-run, intervening upgrade notes,
  AGPL note, backup-first, rollback). Could not run a live Synapse config-check here (no Docker daemon).

- **A2 — upgrade/advisory cadence — RECOMMEND.** No CI, no Dependabot/Renovate, no cadence doc existed (only an
  inline "bump on a tracked cadence" comment). F3 (below) adds the automation; the standing process is in runbook §8.

- **A3 — generalized boot-time config validator — FIX (done).** Round 1's guard was a single inline JWT check in
  `middleware/auth.js`. Added declarative `backend/src/config/validate-env.js`, required **first** in `server.js`
  (before db/redis/auth load). It fail-fasts on: missing required secrets (prod-conditioned for Matrix vars),
  weak secrets (JWT/`MATRIX_SHARED_SECRET` < 32), shipped-`.env.example` placeholders, bad `NODE_ENV`, a
  malformed `DATABASE_URL`/`REDIS_URL`/`MATRIX_HOMESERVER_URL`, and an empty prod CORS allowlist (the latent
  `server.js` prod footgun). **Reports variable names + pass/fail only — never values.**

### Workstream B — Detection, response & audit logging

- **B1 — append-only audit log — FIX (done, migration) — [SAFETY-GATE].** No audit table or helper existed.
  Added migration `025_audit_log.sql` (table + indexes) and `backend/src/utils/audit.js`
  (`writeAudit(client,…)` for in-transaction atomic writes; `writeAuditBestEffort(…)` autocommit/never-throws;
  `actorFromReq(req)`), plus `middleware/request-context.js` (per-request `X-Request-Id` correlation id).
  Wired: borrow transitions (`borrow.create/approve/reject/cancel/pickup/return` — approve/pickup/return audit
  **inside the existing transaction** so the row and the state change commit together), auth events
  (`auth.register/login/login.failed/login.denied_deactivated/logout/password_reset`), moderation
  (`block/unblock/report.create/report.<action>`), admin (`admin.user.activate/deactivate` +
  `…matrix_revocation_failed`), and every Matrix admin-token use (`matrix.admin_login`, `matrix.room_delete`,
  `matrix.sessions_invalidated`, `matrix.account_deactivated`).
  **Append-only enforced by triggers** (UPDATE/DELETE/TRUNCATE all raise), because the app connects as the table
  owner so a REVOKE alone would not bind (see B1b). **No secrets/tokens/hashes/message content are written.**

- **B1b — least-privilege DB role for true append-only — CONFIG (runbook §3).** The app uses one `DATABASE_URL`
  that owns the schema; an owner bypasses table-privilege REVOKEs. The trigger enforces immutability regardless;
  the role split + `REVOKE UPDATE,DELETE,TRUNCATE` is documented as defense-in-depth.

- **B2 — alerting on abuse signals — FIX (done, lightweight) + CONFIG.** Added `backend/src/utils/alerts.js`:
  in-process windowed-threshold counters emitting structured `[SECURITY-ALERT]` logs (+ optional
  `ALERT_WEBHOOK_URL` POST). Wired to: failed-login spikes (per-IP and per-account), mass registration (per-IP),
  report-volume spikes (per reported user), cross-tenant admin actions (immediate), and a tripwire for Matrix
  admin-token use outside a recognized flow. Thresholds are env-tunable. **Limitation (runbook §4):** counters are
  per-process/in-memory — move to Redis for a multi-instance deploy.

### Workstream C — Account lifecycle & token/session revocation — [SAFETY-GATE]

- **C1 — real revocation on deactivate/block, including Matrix — FIX (done) — [SAFETY-GATE].**
  Drift: there is no `user.controller.js`; deactivate lives in `admin.controller.js` `toggleUserStatus`. It only
  flipped `is_active`, and worse, neither `login`, `authenticateToken`, nor `regenerateMatrixToken` checked
  `is_active` — so a "disabled" user could re-login and mint a **fresh Matrix token**. Fixes:
  - `utils/matrix.js`: added `invalidateMatrixSessions()` (lists then `delete_devices` via Synapse admin v2 —
    invalidates all access tokens, reversibly) and `deactivateMatrixUser()` (permanent `…/deactivate` for
    deprovision). Endpoints verified against the Synapse admin API docs.
  - `toggleUserStatus` on disable now: `revokeAllUserTokens` (app refresh tokens) + `invalidateMatrixSessions`
    (immediate chat cutoff) + NULLs the stored `matrix_access_token`. **Fail-closed:** if Matrix revocation
    fails, it does **not** report success — the response carries `matrixRevocation:'failed'` and an audit row is
    written for manual follow-up.
  - `login` now refuses a deactivated account; `regenerateMatrixToken`/`refreshMatrix` now refuse one too.
  - **Block now severs the live room** (closes Round-1's deferred "block-severs-rooms"): `blockUser` finds the
    shared borrow room(s) and `shutdownRoom`s them; failures are surfaced, not swallowed.
  Residual (documented): an in-flight 15-min app access token still works for REST until expiry — acceptable
  because the Matrix/chat cutoff is immediate and refresh is revoked. Synapse endpoints could not be exercised
  live here (runbook §5).

- **C2 — school-churn deprovisioning — RECOMMEND (+ helper provided).** No deprovisioning/retention path exists;
  `cleanup.worker.js` only purges expired refresh tokens. Provided the reusable `deactivateMatrixUser(erase)`
  primitive; the retention/deletion policy and the bulk end-of-year process are recommended (policy-first; tied to
  COPPA, I3) in runbook §6 — not built, to avoid irreversible data loss before a policy exists.

### Workstream D — Media / upload safety

- **D1 — strip EXIF/GPS on ingest — FIX (done) — [SAFETY-GATE].** Verified Cloudinary **retains** EXIF/GPS on the
  stored *original* by default (only rendered derivatives are auto-stripped), and the app serves the original's
  `secure_url`. Added `flags: 'force_strip'` to the incoming upload transformation in `config/cloudinary.js` so the
  stored original is stripped at ingest. **Must be verified live** (runbook §7): upload a GPS photo, `exiftool` the
  served asset.

- **D2 — upload type/content validation & SVG — FIX (done).** SVG and forged files were already rejected
  (Cloudinary `allowed_formats` content-sniff) and media is served cross-origin from `res.cloudinary.com`, so the
  feared same-origin SVG-XSS does not exist. Added a multer `fileFilter` (MIME allowlist, rejects junk before
  streaming) and a `uploadImages()` wrapper so multer/size/type errors return clean 4xx instead of opaque 500s.

### Workstream E — Authentication flows: password reset & email

- **E1 — reset-token lifecycle — already-handled (no change).** Verified sound on every axis: 256-bit random,
  SHA-256-hashed at rest, single-use, 1h expiry, invalidated on reissue and on password change (revokes all refresh
  tokens), uniform anti-enumeration response, and the reset URL is built from `FRONTEND_URL` (not the `Host`
  header). Optional housekeeping (purge used/expired rows) noted in Deferred.

- **E1b — email case-insensitivity — FIX (done, migration).** Confirmed: register/login matched verbatim while
  forgot-password lowercased — uppercase accounts could log in but never reset. `auth.controller` now normalizes
  on write (register) and read (login/forgot via `lower(email)`). Migration `026_email_case_insensitive.sql`
  backfills to lowercase and adds a `lower(email)` unique index; it is **safe-by-design** — it aborts before any
  write if case-variant collisions exist (verified: zero rows mutated on a dirty DB). Folded into `schema.sql` for
  fresh installs. Pre-flight collision query in runbook §2.

- **E2 — email-sending security — FIX (done) + CONFIG.** Verified nodemailer v8 already strips CR/LF from headers,
  so no exploitable injection exists today. Added explicit CR/LF rejection + length caps in `contact.controller`
  (defense-in-depth, so header safety doesn't silently depend on a transitive dep across future bumps). SPF/DKIM/
  DMARC are DNS — runbook §9.

### Workstream F — Software supply chain

- **F1 — dependency vulnerabilities — INVESTIGATE (triaged, not blind-bumped).** `npm/pnpm audit` ran on all three
  packages: backend **5 high / 11 moderate**, frontend **7 high** (mostly dev/build-time tailwind/vite chain),
  mobile **11 moderate** (Expo toolchain). Triage:
  - `cloudinary` (high, argument injection): reachable but the injectable params are hardcoded, not user-controlled;
    the fix is **1.x→2.x, a major bump** requiring API-compat verification of `uploader.destroy()` + CloudinaryStorage.
  - `multer` (high, DoS): reachable, but **no patched release exists in range** at audit time — mitigated by the
    10MB/5-file caps; track upstream.
  - `nodemailer` (high, `raw:` file/SSRF): the vulnerable `raw:` option is **never used** → not exploitable as written.
  - frontend `glob/minimatch/picomatch` ReDoS + `vite`/`react-router` highs: build-time/SPA-mode → low runtime exposure.
  Deliberately **not** run `npm audit fix --force` (breaking-bump risk; cannot run the app to test here). The bumps
  are queued as a reviewed PR (runbook §10).

- **F3 — SCA gate — CONFIG (done).** Added `.github/dependabot.yml` (backend/frontend/mobile/docker/actions) and
  `.github/workflows/audit.yml` (`npm`/`pnpm audit --audit-level=high` on PR + weekly). The audit steps are
  `continue-on-error: true` until the F1 backlog clears (otherwise every PR fails on the pre-existing highs); flip
  to blocking afterward.

- **F4 — secret history scan — already-clean (INVESTIGATE).** Full-history scan (manual, no gitleaks installed):
  `.env` never tracked; only placeholder templates committed; no real `syt_`/JWT/key/vendor-token literals in any of
  78 commits. No history rewrite needed. Installing `gitleaks` as a pre-commit/CI hook is recommended (runbook §8).

### Workstream G — Incident review (Round-1 placeholder JWT secret)

- **G1 — was the forgeable secret ever live/reachable? — INVESTIGATE (determination written).**
  **Determination: no evidence of internet exposure; insufficient logging to positively rule out exploitation.**
  Evidence: `backend/.env` is gitignored and was never committed; the placeholder Round 1 saw equals the value in
  `.env.example`, and a local untracked `.env` exists — i.e. the "live config" was local dev. No backend deploy
  artifact exists in-tree (no Dockerfile/Procfile/IaC; the only compose is Synapse, bound to loopback). The
  dangerous window was commits **before** `45ad7fb` (the old guard was presence-only and would boot with a
  non-empty placeholder). There is no audit log for the period, so exploitation cannot be positively excluded —
  which is itself the argument for B1/B2. **Action for the owner:** confirm whether any backend instance was ever
  publicly bound; if yes, treat as confirmed disclosure → rotate `JWT_SECRET` (done R1) + `revokeAllUserTokens`
  for all users. No secret values were printed during this review.

### Workstream H — Remaining hardening

- **H1 — app JWT → httpOnly cookies — RECOMMEND (sequenced).** Confirmed the app JWT + refresh token are persisted
  in `localStorage` (the Matrix token is correctly excluded). A cookie migration touches both layers + introduces
  CSRF surface + forks web/mobile auth transport — per the ticket's own guidance it is recommended as a dedicated,
  well-tested PR, not rushed. Migration plan in Deferred. Mitigations already reduce urgency (15-min access token,
  refresh rotation + reuse-revocation, CSP `scriptSrc 'self'`).

- **H2 — admin MFA + login lockout — lockout FIX (done); MFA RECOMMEND.** Added per-account lockout: migration
  `027_login_lockout.sql` (`failed_login_attempts`, `locked_until`), login increments on bad password and locks
  (auto-expiring, default 5 attempts / 15 min, env-tunable) with a **uniform** response so it leaks neither account
  existence nor lockout state. Admin TOTP MFA is a multi-file feature (enrollment + verify + frontend) — recommended
  as its own change (plan in Deferred).

- **H3 — holistic rate-limit strategy — FIX (done) + CONFIG.** Added a **global default limiter** in `server.js`
  (backstop for every otherwise-unlimited route) and a per-user **upload limiter** on the item routes (the highest
  unit-cost endpoints). Confirmed existing per-endpoint limiters (login/register/refresh/reset/contact/borrow-create)
  are sound. **CONFIG (runbook §4):** added `trust proxy` (env-guarded via `TRUST_PROXY_HOPS`) for correct IP keying
  behind nginx; the in-memory limiter store should move to Redis for multi-instance.

### Workstream I — Out-of-band (RECOMMEND)

- **I1 — backups & recovery + token encryption-at-rest — RECOMMEND.** No backup config/doc exists; `matrix_access_token`
  is plaintext in the DB. Runbook §11: tested+immutable+offsite encrypted backups, TLS to the DB, and envelope/KMS
  encryption of the Matrix token column (shrinks DB-dump blast radius). Backups carry the same minors'-PII blast radius.

- **I2 — independent external validation — RECOMMEND — [SAFETY-GATE].** All assurance to date is self-audit; the
  child-safety controls (contact-gating, reporting, blocking, the new revocation) are reasoned-through, not
  independently tested. An external pentest/DAST + independent review of those flows is the launch gate (runbook §12).

- **I3 — COPPA / child-safety program — RECOMMEND (legal) — [SAFETY-GATE].** No privacy policy (only a dangling UI
  link), no consent pathway, no retention/deletion implementation, no written infosec program. Carry forward to
  counsel + a privacy owner (runbook §13). Not legal advice.

---

## Deferred (reported, not done)

- **H1 cookie migration plan:** (1) backend `Set-Cookie` httpOnly+Secure+SameSite for access+refresh on
  login/register/refresh; (2) `middleware/auth.js` reads `req.cookies` (add `cookie-parser`), Bearer kept during
  transition; (3) CORS → `credentials:true` with exact-origin allowlist; (4) frontend stops persisting tokens
  (`auth-store` partialize) and sends `credentials:'include'` (drop the `Authorization` builder in `lib/api.ts`);
  (5) CSRF tokens for all state-changing routes; (6) decide RN transport (no shared cookie jar) — likely keep Bearer
  for mobile. Ship as its own PR.
- **H2 admin MFA plan:** `totp_secret` column + enrollment + verify-on-login step-up when `role='admin'`, enforced
  before issuing an admin-scoped token; prefer a vetted TOTP lib; add a frontend enrollment/verify screen.
- **C2 retention/deletion:** define policy first (esp. minors), then add `users.deactivated_at/deleted_at` +
  roster/graduation signal, extend `cleanup.worker.js` (job-name dispatcher) with purge jobs, and pair user deletion
  with `deactivateMatrixUser(erase:true)` + room shutdown.
- **E1 housekeeping:** periodic purge of used/expired `password_reset_tokens` (mirror the refresh-token cleanup job).
- **B2 / H3 at scale:** move the alerter counters and the rate-limit store to Redis (ioredis already present) for a
  multi-instance/PM2 deploy.
- **F1 dependency bumps:** reviewed PR — `cloudinary` ^2.7 (verify API compat), `nodemailer` >9, track `multer`;
  frontend `vite`/`react-router-dom` + pnpm overrides for the tailwind ReDoS chain; roll Expo on its cadence.
- **A3 cleanup:** `REFRESH_TOKEN_SECRET`/`REFRESH_TOKEN_EXPIRES_IN` in `.env.example` are dead config (refresh tokens
  are random+hashed, not signed) — drop them from the example.

---

## Deploy / ops runbook

1. **Synapse upgrade (A1) — maintenance window, backup-first.** Take a Synapse-DB backup. Bump is from v1.106.0 →
   v1.155.0 (~2yr): read the intervening upgrade notes for renamed/removed keys; validate `homeserver.yaml` with a
   config dry-run (`docker run … ghcr.io/element-hq/synapse:v1.155.0 … --generate-config` diff or container
   config-check) — re-verify the `retention` block, `enable_authenticated_media`, media-repo and `rc_login`/`rc_message`
   shapes. Confirm `GET /_synapse/admin/v1/server_version` reports v1.155.0 and the unencrypted-DM/moderation flow
   still works. Have a rollback (prior image + DB snapshot). **AGPLv3:** the maintained image is AGPL — flag for
   whoever owns commercial/legal strategy.
2. **E1b email migration (026) — pre-flight collision audit.** Before applying to a populated DB run:
   `SELECT lower(email), count(*) FROM users GROUP BY 1 HAVING count(*)>1;` — resolve any collisions manually. The
   migration **aborts non-destructively** if collisions remain (verified), so it is safe to attempt.
3. **Audit append-only role (B1b).** Provision a least-privilege app role (not the table owner); run
   `REVOKE UPDATE,DELETE,TRUNCATE ON audit_log FROM <app_role>; GRANT INSERT,SELECT ON audit_log TO <app_role>;`.
   The triggers enforce immutability even for the owner as defense-in-depth.
4. **Rate-limit / IP correctness (H3).** Set `TRUST_PROXY_HOPS=1` in production (behind nginx) for correct `req.ip`
   (rate-limit keys + audit source IP). Move the express-rate-limit store and the B2 alerter counters to Redis for a
   multi-instance deploy. Optional alert sink: `ALERT_WEBHOOK_URL`.
5. **C1 Matrix revocation — verify live.** Requires `MATRIX_ADMIN_TOKEN` with admin rights. Verify against live
   Synapse: deactivate a user → their stored Matrix token no longer authenticates and they're out of shared rooms;
   two users who block each other can no longer see/post in the prior room (`shutdownRoom`). On `matrixRevocation:'failed'`
   in the deactivate response, revoke manually and check the `…matrix_revocation_failed` audit row.
6. **End-of-year deprovisioning (C2).** Define retention policy first; then bulk-deactivate by school (each disable
   now revokes app+Matrix sessions) and deprovision with `deactivateMatrixUser(erase)` once policy allows.
7. **EXIF strip — verify live (D1).** Upload a photo with known GPS EXIF; run `exiftool` on the served Cloudinary
   asset and confirm no GPS/EXIF. If any persists, enable account-level metadata stripping or serve a derived URL.
8. **Cadence (A2/F3/F4).** Dependabot + the audit workflow are committed; subscribe to element-hq/synapse releases +
   Matrix security disclosures; install `gitleaks` as a pre-commit/CI hook; flip `audit.yml` to blocking once F1 clears.
9. **Email DNS (E2).** Publish SPF, DKIM, and DMARC records for the `SMTP_FROM` domain; verify mail passes all three.
10. **Dependency bumps (F1).** Apply as a reviewed PR with the existing `node --check`/`tsc`/test gates; do not
    `npm audit fix --force`. `cloudinary` 1→2 is a major bump — test the item upload + image-delete flow.
11. **Backups & secrets (I1).** Tested, encrypted, offsite/immutable Postgres backups (RPO/RTO + restore drills);
    TLS to the DB (`sslmode=require`); envelope/KMS-encrypt `users.matrix_access_token`. Move all secrets into a
    manager with rotation (carry-forward from R1).
12. **External validation before minors (I2) — launch gate.** Scoped external pentest + authenticated DAST against a
    staging deploy with live Synapse, plus an independent review of contact-gating/reporting/blocking/revocation.
13. **COPPA program (I3) — launch gate.** Real privacy policy, school/parental-consent pathway, retention+deletion
    policy, written infosec program — with counsel.
14. **`npm run db:migrate` is DESTRUCTIVE (carried from R1).** `schema.sql` drops all tables. Apply migrations
    025–027 individually on a populated DB; never via the bootstrap script.

---

## Verification performed

- **Static:** `node --check` on every backend JS file (clean). `bash -n synapse/generate-config.sh` + YAML/no-tab
  check on `docker-compose.yml` (clean). No frontend files changed → no `tsc` run needed.
- **Migrations (real Postgres 15, throwaway cluster):** full chain `schema.sql + 010..027` applied cleanly and a
  **two-pass re-run** confirmed idempotency. **B1 append-only verified:** `audit_log` INSERT works; UPDATE/DELETE/
  TRUNCATE are all blocked by the triggers. **E1b verified:** the `lower(email)` unique index rejects case-variant
  duplicates, and migration 026's collision guard **aborts with zero writes** on a dirty DB. **H2 verified:** lockout
  columns present with default 0.
- **Could NOT verify here (flagged in runbook):** live Synapse upgrade config-load (no Docker daemon); Cloudinary
  `force_strip` against a real asset (no live Cloudinary) — exiftool check in §7; Synapse admin revocation endpoints
  (no live Synapse) — §5; full app run (needs Redis + env + Synapse).
