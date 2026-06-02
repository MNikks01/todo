import { describe, expect, it } from 'vitest';
import { InMemoryLoginAttemptTracker } from '../../modules/auth/infrastructure/inMemoryLoginAttemptTracker.js';

describe('InMemoryLoginAttemptTracker', () => {
  it('locks after the threshold and reports the lock', async () => {
    const tracker = new InMemoryLoginAttemptTracker(3, 60_000, 60_000);
    expect(await tracker.recordFailure('a@b.com')).toBe(false);
    expect(await tracker.recordFailure('a@b.com')).toBe(false);
    expect(await tracker.recordFailure('a@b.com')).toBe(true); // 3rd hits threshold
    expect(await tracker.isLocked('a@b.com')).toBe(true);
  });

  it('reset clears the lock and counter', async () => {
    const tracker = new InMemoryLoginAttemptTracker(2, 60_000, 60_000);
    await tracker.recordFailure('a@b.com');
    await tracker.recordFailure('a@b.com');
    await tracker.reset('a@b.com');
    expect(await tracker.isLocked('a@b.com')).toBe(false);
  });

  it('starts a fresh window after it elapses', async () => {
    const tracker = new InMemoryLoginAttemptTracker(2, -1, 60_000); // window already expired
    await tracker.recordFailure('a@b.com');
    expect(await tracker.recordFailure('a@b.com')).toBe(false); // window reset each time
    expect(await tracker.isLocked('a@b.com')).toBe(false);
  });

  it('is not locked for an unknown key', async () => {
    const tracker = new InMemoryLoginAttemptTracker();
    expect(await tracker.isLocked('nobody@b.com')).toBe(false);
  });
});
