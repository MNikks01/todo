import { describe, expect, it } from 'vitest';
import { config } from '../../config/env.js';
import { database } from '../../infrastructure/database/connection.js';

// The test harness (src/test/setup.ts) already connects mongoose to an ephemeral
// Mongo, so these exercise the non-destructive lifecycle paths.
describe('database connection (singleton)', () => {
  it('reports connected', () => {
    expect(database.isConnected).toBe(true);
  });

  it('connect() is a no-op when already connected', async () => {
    await expect(database.connect(config.MONGODB_URI)).resolves.toBeUndefined();
    expect(database.isConnected).toBe(true);
  });

  it('ping() succeeds against a live connection', async () => {
    expect(await database.ping()).toBe(true);
  });
});
