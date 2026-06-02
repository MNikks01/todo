/**
 * Rate limiting (docs/security.md §4, §2.5). A global limiter plus a stricter
 * one for auth endpoints. Memory store for Phase 2; Redis store in production
 * (documented swap). On limit, forwards a RateLimitError to the error handler.
 */
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { RateLimitError } from '../core/errors/index.js';

export const globalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Too many attempts, please try again later'));
  },
});
