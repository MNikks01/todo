/**
 * Refresh + CSRF cookie helpers (docs/security.md §2.3, §8.1–§8.2).
 * Refresh: HttpOnly, scoped to the auth path. CSRF: readable by JS (double-submit).
 * Both Secure (forced in prod) + SameSite=Strict.
 */
import type { CookieOptions, Response } from 'express';
import { config, isProduction } from '../../../config/env.js';

export const REFRESH_COOKIE = 'refreshToken';
export const CSRF_COOKIE = 'csrfToken';

const REFRESH_PATH = '/api/v1/auth';
const maxAgeMs = config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  const options: CookieOptions = {
    secure: isProduction || config.COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: maxAgeMs,
  };
  if (config.COOKIE_DOMAIN) {
    options.domain = config.COOKIE_DOMAIN;
  }
  return options;
}

export function setSessionCookies(res: Response, refreshToken: string, csrfToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions(),
    httpOnly: true,
    path: REFRESH_PATH,
  });
  res.cookie(CSRF_COOKIE, csrfToken, { ...baseOptions(), httpOnly: false, path: '/' });
}

export function clearSessionCookies(res: Response): void {
  const opts = baseOptions();
  const domainOpt = opts.domain ? { domain: opts.domain } : {};
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_PATH, ...domainOpt });
  res.clearCookie(CSRF_COOKIE, { path: '/', ...domainOpt });
}
