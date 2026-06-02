/**
 * Integration test helpers — build the real app and parse Set-Cookie.
 */
import type { Express } from 'express';
import { createApp } from '../../app.js';

export function buildApp(): Express {
  return createApp();
}

export interface ParsedCookies {
  refreshToken?: string;
  csrfToken?: string;
  /** Cookie header value to send back on subsequent requests. */
  header: string;
}

export function parseCookies(setCookie: string[] | undefined): ParsedCookies {
  const cookies: Record<string, string> = {};
  for (const entry of setCookie ?? []) {
    const firstPart = entry.split(';')[0] ?? '';
    const eq = firstPart.indexOf('=');
    if (eq > 0) {
      cookies[firstPart.slice(0, eq)] = firstPart.slice(eq + 1);
    }
  }
  const header = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  const result: ParsedCookies = { header };
  if (cookies.refreshToken !== undefined) result.refreshToken = cookies.refreshToken;
  if (cookies.csrfToken !== undefined) result.csrfToken = cookies.csrfToken;
  return result;
}
