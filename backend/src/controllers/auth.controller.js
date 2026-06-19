const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const { regenerateMatrixToken } = require('../utils/matrix');
const { matrixQueue } = require('../queues');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../utils/tokens');
const { sendPasswordResetEmail } = require('../utils/email');

/**
 * POST /api/v1/auth/register
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, schoolId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Server-verify the tenant: a claimed schoolId must reference an existing active school, and
    // (when the school has a domain configured) the email domain must match it. The JWT tenant
    // claim must derive from a trusted, verified value — never arbitrary client input.
    if (schoolId) {
      const emailDomain = String(email).toLowerCase().split('@')[1] || '';
      const schoolCheck = await query(
        'SELECT id, domain FROM schools WHERE id = $1 AND is_active = TRUE',
        [schoolId]
      );
      const school = schoolCheck.rows[0];
      if (!school) {
        return res.status(400).json({ error: 'Invalid school' });
      }
      if (school.domain && emailDomain !== school.domain.toLowerCase()) {
        return res.status(403).json({ error: 'Email domain does not match the selected school' });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, school_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, school_id, role, avatar_url, bio, created_at`,
      [email, passwordHash, firstName, lastName, schoolId || null]
    );
    const user = userResult.rows[0];

    // Enqueue Matrix provisioning — runs async, does not block registration
    try {
      await matrixQueue.add('provision', {
        userId: user.id,
        firstName,
        lastName,
        email,
      });
    } catch (queueErr) {
      console.error('[Matrix] Failed to enqueue provisioning job:', queueErr.message);
    }

    const accessToken = generateAccessToken(user.id, user.school_id, user.role);
    const refreshToken = await generateRefreshToken(
      user.id,
      req.headers['user-agent'] ?? null
    );

    res.status(201).json({
      token: accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        schoolId: user.school_id,
        role: user.role,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        matrixUserId: null,
        matrixAccessToken: null,
        matrixDeviceId: null,
      },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, school_id, role, avatar_url, bio,
              matrix_user_id, matrix_access_token, matrix_device_id
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Track last login timestamp
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const accessToken = generateAccessToken(user.id, user.school_id, user.role);
    const refreshToken = await generateRefreshToken(
      user.id,
      req.headers['user-agent'] ?? null
    );

    res.status(200).json({
      token: accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        schoolId: user.school_id,
        role: user.role,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        matrixUserId: user.matrix_user_id,
        matrixAccessToken: user.matrix_access_token,
        matrixDeviceId: user.matrix_device_id,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /api/v1/auth/refresh
 * Token rotation: revoke old refresh token, issue new access + refresh pair.
 * No authenticateToken middleware — the refresh token itself is the credential.
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken: rawToken } = req.body;

    if (!rawToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokenRecord = await verifyRefreshToken(rawToken);

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    if (!tokenRecord.is_active) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    // Rotate: revoke old token, issue new pair
    await revokeRefreshToken(rawToken);

    const newAccessToken = generateAccessToken(
      tokenRecord.user_id,
      tokenRecord.school_id,
      tokenRecord.role
    );
    const newRefreshToken = await generateRefreshToken(
      tokenRecord.user_id,
      req.headers['user-agent'] ?? null
    );

    return res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
    });
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}

/**
 * POST /api/v1/auth/logout
 * Revokes the supplied refresh token. No-ops gracefully if token is absent or already revoked.
 */
async function logout(req, res) {
  try {
    const { refreshToken: rawToken } = req.body;

    if (rawToken) {
      await revokeRefreshToken(rawToken).catch(() => {});
    }

    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
}

/**
 * GET /api/v1/auth/me
 */
async function me(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, school_id, role, avatar_url, bio,
              matrix_user_id, matrix_access_token, matrix_device_id
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      schoolId: user.school_id,
      role: user.role,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      matrixUserId: user.matrix_user_id,
      matrixAccessToken: user.matrix_access_token,
      matrixDeviceId: user.matrix_device_id,
    });
  } catch (err) {
    console.error('[Auth] Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * GET /api/v1/auth/matrix/refresh
 * Regenerate a Matrix access token via the Synapse admin API.
 * Does not require the Matrix password — uses MATRIX_ADMIN_TOKEN.
 */
async function refreshMatrix(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const creds = await regenerateMatrixToken(userId);

    res.status(200).json({
      matrixAccessToken: creds.matrixAccessToken,
      matrixDeviceId: creds.matrixDeviceId,
    });
  } catch (err) {
    console.error('[Auth] refreshMatrix error:', err);

    if (err.message === 'User has no Matrix account') {
      return res.status(404).json({ error: 'No Matrix account found for this user' });
    }

    res.status(500).json({ error: 'Failed to refresh Matrix token' });
  }
}

/**
 * POST /api/v1/auth/forgot-password
 * Always returns 200 — never reveals whether the email exists (anti-enumeration).
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const { rows } = await query(
      `SELECT id FROM users WHERE email = $1 AND is_active = TRUE`,
      [email.toLowerCase()]
    );

    if (rows.length > 0) {
      const userId = rows[0].id;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing unused reset tokens for this user
      await query(
        `UPDATE password_reset_tokens SET used = TRUE 
         WHERE user_id = $1 AND used = FALSE`,
        [userId]
      );

      await query(
        `INSERT INTO password_reset_tokens 
           (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
      );

      // Fire and forget — don't block response on email delivery
      sendPasswordResetEmail(email, rawToken).catch((err) => {
        console.error('[Email] Password reset send failed:', err.message);
      });
    }

    // Always same response — no enumeration
    return res.status(200).json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('[Auth] Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

/**
 * POST /api/v1/auth/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const { rows } = await query(
      `SELECT prt.user_id
       FROM password_reset_tokens prt
       WHERE prt.token_hash = $1
         AND prt.used = FALSE
         AND prt.expires_at > NOW()`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = rows[0].user_id;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, userId]
    );

    // Mark token as used
    await query(
      `UPDATE password_reset_tokens SET used = TRUE 
       WHERE token_hash = $1`,
      [tokenHash]
    );

    // Revoke all refresh tokens — forces re-login on all devices after reset
    await revokeAllUserTokens(userId).catch(() => {});

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('[Auth] Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

module.exports = { register, login, refreshToken, logout, me, refreshMatrix, forgotPassword, resetPassword };
