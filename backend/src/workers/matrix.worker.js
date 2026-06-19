const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const { provisionMatrixUser } = require('../utils/matrix');
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const worker = new Worker(
  'matrix-provisioning',
  async (job) => {
    const { userId } = job.data;

    // Re-derive details from the DB so PII (name/email) never sits in the
    // Redis-persisted job payload, and guard idempotency: if the user already
    // has a Matrix account, do nothing — a retried job must not register a
    // second Synapse account (generateUniqueLocalpart would pick a new
    // localpart and orphan a duplicate). Mirrors room.worker.js.
    const { rows } = await query(
      'SELECT first_name, last_name, email, matrix_user_id FROM users WHERE id = $1',
      [userId]
    );
    const u = rows[0];
    if (!u) {
      console.warn(`[Matrix] User ${userId} not found — skipping provisioning`);
      return { skipped: 'user-not-found' };
    }
    if (u.matrix_user_id) {
      return { matrixUserId: u.matrix_user_id, skipped: 'already-provisioned' };
    }

    console.log(`[Matrix] Provisioning user ${userId} (${u.email})`);

    const displayName = `${u.first_name} ${u.last_name}`;
    const matrixCreds = await provisionMatrixUser(u.first_name, u.last_name, displayName);

    const matrixPasswordHash = await bcrypt.hash(
      matrixCreds.matrixPassword, 10
    );

    // Persist only while still unprovisioned, so a raced job can't overwrite an
    // existing Matrix identity (one Matrix account per user).
    const persisted = await query(
      `UPDATE users
       SET matrix_user_id = $1,
           matrix_access_token = $2,
           matrix_device_id = $3,
           matrix_password_hash = $4
       WHERE id = $5 AND matrix_user_id IS NULL`,
      [
        matrixCreds.matrixUserId,
        matrixCreds.matrixAccessToken,
        matrixCreds.matrixDeviceId,
        matrixPasswordHash,
        userId,
      ]
    );

    if (persisted.rowCount === 0) {
      console.warn(
        `[Matrix] User ${userId}: matrix_user_id already set by a concurrent job; orphaned ${matrixCreds.matrixUserId}`
      );
      return { matrixUserId: matrixCreds.matrixUserId, orphaned: true };
    }

    console.log(`[Matrix] Provisioned ${matrixCreds.matrixUserId}`);
    return { matrixUserId: matrixCreds.matrixUserId };
  },
  {
    connection: redis,
    concurrency: 2, // max 2 Matrix provisioning jobs at once
  }
);

worker.on('failed', (job, err) => {
  console.error(
    `[Matrix] Job ${job.id} failed for user ${job.data.userId}:`,
    err.message
  );
});

worker.on('completed', (job) => {
  console.log(
    `[Matrix] Job ${job.id} completed for user ${job.data.userId}`
  );
});

module.exports = { worker };
