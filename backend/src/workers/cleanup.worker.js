const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const { query } = require('../config/db');

// Run cleanup every 24 hours via BullMQ repeating job
const worker = new Worker(
  'cleanup',
  async (job) => {
    if (job.name === 'purge-expired-refresh-tokens') {
      const result = await query(
        `DELETE FROM refresh_tokens 
         WHERE expires_at < NOW() OR revoked = TRUE`
      );
      console.log(
        `[Cleanup] Purged ${result.rowCount} expired/revoked refresh tokens`
      );
    }
  },
  { connection: redis }
);

worker.on('failed', (job, err) => {
  console.error(`[Cleanup] Job ${job?.id} (${job?.name}) failed:`, err.message);
});

module.exports = { worker };
