/**
 * Structured request logging (docs/logging.md §3). Logs completion with method,
 * route, status, and duration. Correlation id is injected by the logger.
 */
import type { RequestHandler } from 'express';
import { logger } from '../core/logger/logger.js';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('http.request', {
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
    });
  });
  next();
};
