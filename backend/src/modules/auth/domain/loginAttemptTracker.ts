/**
 * Per-account login throttling (docs/security.md §2.5).
 * Strategy interface so the in-memory implementation can be swapped for a
 * Redis-backed one in production without touching the service.
 */
export interface LoginAttemptTracker {
  /** True if the key (email) is currently locked out. */
  isLocked(key: string): Promise<boolean>;
  /** Record a failed attempt; returns true if this failure triggered a lock. */
  recordFailure(key: string): Promise<boolean>;
  /** Clear attempts (on successful login). */
  reset(key: string): Promise<void>;
}
