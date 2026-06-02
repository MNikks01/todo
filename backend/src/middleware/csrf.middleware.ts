/**
 * Double-submit CSRF protection for cookie-bearing auth endpoints
 * (docs/security.md §8.1). The client echoes the non-HttpOnly `csrfToken`
 * cookie in the `X-CSRF-Token` header; we compare them in constant time.
 * Bearer-authorized routes don't need this (CSRF-immune).
 */
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { ForbiddenError } from '../core/errors/index.js';

const CSRF_COOKIE = 'csrfToken';
const CSRF_HEADER = 'x-csrf-token';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export const doubleSubmitCsrf: RequestHandler = (req, _res, next) => {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    throw new ForbiddenError('Invalid or missing CSRF token');
  }
  next();
};
