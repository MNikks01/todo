import { describe, expect, it } from 'vitest';
import { sanitizeValue } from '../../middleware/sanitize.middleware.js';

describe('NoSQL operator sanitization', () => {
  it('drops keys starting with $', () => {
    expect(sanitizeValue({ email: { $ne: null } })).toEqual({ email: {} });
    expect(sanitizeValue({ $where: 'evil', ok: 1 })).toEqual({ ok: 1 });
  });

  it('drops keys containing a dot', () => {
    expect(sanitizeValue({ 'a.b': 1, c: 2 })).toEqual({ c: 2 });
  });

  it('recurses into nested objects and arrays', () => {
    expect(sanitizeValue({ list: [{ $gt: 1, keep: 2 }] })).toEqual({ list: [{ keep: 2 }] });
  });

  it('leaves clean primitives and objects untouched', () => {
    expect(sanitizeValue('hello')).toBe('hello');
    expect(sanitizeValue(42)).toBe(42);
    expect(sanitizeValue({ title: 'Buy milk', tags: ['a', 'b'] })).toEqual({
      title: 'Buy milk',
      tags: ['a', 'b'],
    });
  });
});
