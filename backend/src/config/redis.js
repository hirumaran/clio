const { Redis } = require('ioredis');

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required');
}

// Defense-in-depth nudge: an unauthenticated/exposed Redis is an RCE + job-data
// disclosure risk. We can't enforce network controls from here, but warn loudly
// if a production deployment points at a Redis with no auth and no TLS.
if (process.env.NODE_ENV === 'production') {
  const url = process.env.REDIS_URL;
  const hasAuth = /\/\/[^@/]+@/.test(url);
  const isTls = url.startsWith('rediss://');
  if (!hasAuth || !isTls) {
    console.warn(
      '[Redis] SECURITY WARNING: REDIS_URL appears to lack auth and/or TLS. In production, bind Redis to a private interface, require a password/ACL, enable TLS (rediss://), and never expose it publicly.'
    );
  }
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,    // required by BullMQ
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
  // Do not crash — log and continue
});

redis.on('connect', () => {
  console.log('Redis connected');
});

module.exports = { redis };
