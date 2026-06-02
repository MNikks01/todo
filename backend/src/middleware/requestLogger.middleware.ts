/**
 * Structured request logging (docs/logging.md §3). Logs completion with method,
 * route, status, and duration. Correlation id is injected by the logger.
 */
import type { RequestHandler } from 'express';
import { logger } from '../core/logger/logger.js';
import { recordRequest } from '../core/metrics/metrics.js';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    // Prefer the matched route pattern over the raw URL to bound log cardinality.
    const route = `${req.baseUrl}${req.route?.path ?? req.path}`;
    logger[level]('http.request', {
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
    });
    // RED metrics → CloudWatch via EMF (docs/monitoring.md §2).
    recordRequest({ method: req.method, route, statusCode: res.statusCode, durationMs });
  });
  next();
};
