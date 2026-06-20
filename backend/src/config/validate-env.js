/**
 * Boot-time environment validator (Workstream A3).
 *
 * Round 1 added a single inline JWT_SECRET guard in middleware/auth.js. This
 * generalizes that guard so the *class* of config-drift Round 1 found
 * (committed placeholder secrets, weak secrets, missing prod config) can't
 * recur silently. It is declarative: each entry names a var and the checks it
 * must pass. Required-ness is conditioned on NODE_ENV so dev stays low-friction
 * while production fails fast.
 *
 * SECURITY: this module reports variable NAMES and pass/fail only. It MUST NOT
 * print secret values. Throwing before the HTTP listener binds means a
 * misconfigured deploy never serves traffic with a forgeable token, an exposed
 * admin surface, or a wide-open CORS policy.
 */

// Values shipped in backend/.env.example. A live value matching any of these
// means the operator never replaced the template — treat as unconfigured.
const PLACEHOLDERS = new Set([
  'your_jwt_secret_key_here',
  'your-refresh-token-secret-here',
  'your-secret-here',
  'https://matrix.yourdomain.com',
  'matrix.yourdomain.com',
  'your-firebase-project-id',
  'your-service-account-email',
  'your-private-key-with-literal-newlines',
  'your-email@gmail.com',
  'your-app-password',
]);

const isProd = (env) => env.NODE_ENV === 'production';

/**
 * Declarative spec. Each rule:
 *   name        — env var name (never its value)
 *   required    — boolean | (env) => boolean
 *   minLength   — minimum string length when present
 *   noPlaceholder — reject values in PLACEHOLDERS
 *   validate    — (value, env) => string|null  (return an error reason or null)
 */
const SPEC = [
  {
    name: 'JWT_SECRET',
    required: true,
    minLength: 32,
    noPlaceholder: true,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    validate: (v) => (/^postgres(ql)?:\/\//.test(v) ? null : 'must be a postgres:// connection string'),
  },
  {
    name: 'REDIS_URL',
    required: true,
    validate: (v) => (/^rediss?:\/\//.test(v) ? null : 'must be a redis:// or rediss:// URL'),
  },
  // Matrix is mandatory in production (the moderated room-per-borrow flow and
  // session-revocation depend on it); optional in dev so the API can run
  // without a homeserver.
  {
    name: 'MATRIX_HOMESERVER_URL',
    required: isProd,
    noPlaceholder: true,
    validate: (v) => {
      try { new URL(v); return null; } catch { return 'must be a valid URL'; }
    },
  },
  { name: 'MATRIX_DOMAIN', required: isProd, noPlaceholder: true },
  { name: 'MATRIX_SHARED_SECRET', required: isProd, minLength: 32, noPlaceholder: true },
  // Required in prod: without it, session revocation (C1) and token refresh
  // silently fail closed and a deactivated user keeps live Matrix access.
  { name: 'MATRIX_ADMIN_TOKEN', required: isProd, noPlaceholder: true },
  {
    name: 'NODE_ENV',
    required: false,
    validate: (v) =>
      ['development', 'test', 'production'].includes(v)
        ? null
        : "must be one of 'development' | 'test' | 'production'",
  },
];

function validateEnv(env = process.env) {
  const errors = [];

  for (const rule of SPEC) {
    const value = env[rule.name];
    const present = typeof value === 'string' && value.length > 0;
    const required = typeof rule.required === 'function' ? rule.required(env) : rule.required;

    if (!present) {
      if (required) errors.push(`${rule.name} is required but missing`);
      continue; // remaining checks only apply to present values
    }

    if (rule.noPlaceholder && PLACEHOLDERS.has(value)) {
      errors.push(`${rule.name} is still set to a known .env.example placeholder`);
      continue;
    }
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`${rule.name} is too weak (must be at least ${rule.minLength} characters)`);
      continue;
    }
    if (rule.validate) {
      const reason = rule.validate(value, env);
      if (reason) errors.push(`${rule.name} ${reason}`);
    }
  }

  // Cross-cutting production sanity checks.
  if (isProd(env)) {
    const corsConfigured =
      (env.CORS_ORIGINS && env.CORS_ORIGINS.trim()) || (env.FRONTEND_URL && env.FRONTEND_URL.trim());
    if (!corsConfigured) {
      // server.js silently falls back to an empty allowlist in prod — every
      // cross-origin request would break with no signal. Fail loudly instead.
      errors.push('CORS_ORIGINS or FRONTEND_URL must be set in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration — refusing to start:\n` +
        errors.map((e) => `  • ${e}`).join('\n') +
        `\n(see backend/.env.example for the required variables)`
    );
  }
}

module.exports = { validateEnv, PLACEHOLDERS };
