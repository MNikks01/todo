import { describe, expect, it } from 'vitest';
import { redactValue } from '../../core/logger/logger.js';

// docs/logging.md §6, §9 — redaction must scrub PII/secrets anywhere, without
// mutating the caller's objects.
describe('logger redaction', () => {
  it('redacts sensitive keys (case-insensitive)', () => {
    expect(redactValue('password', 'hunter2')).toBe('[REDACTED]');
    expect(redactValue('Authorization', 'Bearer x')).toBe('[REDACTED]');
    expect(redactValue('refreshToken', 'abc')).toBe('[REDACTED]');
    expect(redactValue('email', 'a@b.com')).toBe('[REDACTED]');
  });

  it('passes through non-sensitive primitives', () => {
    expect(redactValue('count', 5)).toBe(5);
    expect(redactValue('ok', true)).toBe(true);
    expect(redactValue('name', 'alice')).toBe('alice');
  });

  it('redacts nested objects without mutating the original', () => {
    const original = { user: { email: 'a@b.com', id: '1' }, token: 't' };
    const redacted = redactValue('meta', original) as {
      user: { email: string; id: string };
      token: string;
    };
    expect(redacted.user.email).toBe('[REDACTED]');
    expect(redacted.user.id).toBe('1');
    expect(redacted.token).toBe('[REDACTED]');
    // Original untouched.
    expect(original.user.email).toBe('a@b.com');
    expect(original.token).toBe('t');
  });

  it('redacts sensitive values inside arrays', () => {
    const result = redactValue('list', [{ password: 'p' }, { id: '2' }]) as Array<
      Record<string, unknown>
    >;
    expect(result[0]?.password).toBe('[REDACTED]');
    expect(result[1]?.id).toBe('2');
  });

  it('serializes Errors to name/message/stack', () => {
    const result = redactValue('error', new Error('boom')) as {
      name: string;
      message: string;
      stack?: string;
    };
    expect(result.name).toBe('Error');
    expect(result.message).toBe('boom');
    expect(result).toHaveProperty('stack');
  });

  it('handles null', () => {
    expect(redactValue('x', null)).toBeNull();
  });
});
