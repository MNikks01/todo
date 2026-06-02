/**
 * In-memory login-attempt tracker (docs/security.md §2.5).
 *
 * Phase 2 implementation: process-local. Documented limitation — not shared
 * across instances; a Redis-backed implementation replaces this in production
 * (Strategy pattern; the AuthService depends only on LoginAttemptTracker).
 */
import { config } from '../../../config/env.js';
import type { LoginAttemptTracker } from '../domain/loginAttemptTracker.js';

interface AttemptState {
  count: number;
  windowStart: number;
  lockedUntil: number;
}

export class InMemoryLoginAttemptTracker implements LoginAttemptTracker {
  private readonly attempts = new Map<string, AttemptState>();

  constructor(
    private readonly threshold = config.ACCOUNT_LOCK_THRESHOLD,
    private readonly windowMs = config.ACCOUNT_LOCK_WINDOW_MS,
    private readonly lockMs = config.ACCOUNT_LOCK_DURATION_MS,
  ) {}

  isLocked(key: string): Promise<boolean> {
    const state = this.attempts.get(key);
    if (!state) {
      return Promise.resolve(false);
    }
    return Promise.resolve(state.lockedUntil > Date.now());
  }

  recordFailure(key: string): Promise<boolean> {
    const now = Date.now();
    const state = this.attempts.get(key);

    if (!state || now - state.windowStart > this.windowMs) {
      this.attempts.set(key, { count: 1, windowStart: now, lockedUntil: 0 });
      return Promise.resolve(false);
    }

    state.count += 1;
    if (state.count >= this.threshold) {
      state.lockedUntil = now + this.lockMs;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  reset(key: string): Promise<void> {
    this.attempts.delete(key);
    return Promise.resolve();
  }
}
