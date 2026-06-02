/**
 * Vitest setup (docs/testing.md §6). Sets test env BEFORE config loads, then
 * provides an isolated ephemeral Mongo per test file, cleared between tests.
 */
process.env.NODE_ENV ??= 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-secret-test-secret-test-secret-0123';
process.env.JWT_ACCESS_TTL ??= '15m';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/todo-test';
// Keep IP rate limits out of the way; abuse tests exercise account lockout.
process.env.RATE_LIMIT_MAX ??= '100000';
process.env.AUTH_RATE_LIMIT_MAX ??= '100000';
process.env.ACCOUNT_LOCK_THRESHOLD ??= '5';
process.env.ACCOUNT_LOCK_WINDOW_MS ??= '900000';
process.env.ACCOUNT_LOCK_DURATION_MS ??= '900000';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

let mem: MongoMemoryServer | undefined;

beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mem?.stop();
});
