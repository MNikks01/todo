/**
 * NoSQL operator-injection sanitization (docs/security.md §4). Recursively
 * strips keys that start with `$` or contain `.` from request body/query/params,
 * so attacker-supplied Mongo operators can never reach a query. Defense-in-depth
 * on top of Zod `.strict()` validation. Operates on copies — no prototype abuse.
 */
import type { RequestHandler } from 'express';

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue; // drop operator-like keys
      }
      out[key] = sanitize(val);
    }
    return out;
  }
  return value;
}

export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitize(req.query) as typeof req.query;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitize(req.params) as typeof req.params;
  }
  next();
};

export { sanitize as sanitizeValue };
