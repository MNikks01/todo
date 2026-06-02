/**
 * Self-contained backend for E2E (docs/testing.md §4). Boots an ephemeral
 * in-memory MongoDB, then the real Express app, so Playwright can drive the full
 * stack without external services. Env is set BEFORE importing config.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const mem = await MongoMemoryServer.create();
process.env.MONGODB_URI = mem.getUri('todo-e2e');
process.env.NODE_ENV ??= 'development';
process.env.LOG_LEVEL ??= 'warn';
process.env.JWT_ACCESS_SECRET ??= 'e2e-secret-e2e-secret-e2e-secret-0123';
process.env.CORS_ORIGINS ??= 'http://localhost:4173';
process.env.PORT ??= '3000';
// All E2E traffic originates from localhost; relax per-IP limits so the suite
// isn't throttled (rate limiting itself is covered by backend integration tests).
process.env.RATE_LIMIT_MAX ??= '100000';
process.env.AUTH_RATE_LIMIT_MAX ??= '100000';

const { config } = await import('../src/config/env.js');
const { database } = await import('../src/infrastructure/database/connection.js');
const { createApp } = await import('../src/app.js');
const { logger } = await import('../src/core/logger/logger.js');

await mongoose.connect(config.MONGODB_URI);
await database.connect(config.MONGODB_URI);

const app = createApp();
const server = app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[e2e] backend listening on http://localhost:${String(config.PORT)}`);
});

async function shutdown(): Promise<void> {
  server.close();
  await mongoose.disconnect();
  await mem.stop();
  logger.info('e2e.backend.stopped');
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
