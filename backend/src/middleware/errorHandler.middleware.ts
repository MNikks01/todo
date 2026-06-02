/**
 * Central error handler (rules/error-handling.md). Maps errors to a safe Problem
 * envelope (docs/api/openapi.yaml). Never leaks internals; logs unexpected 5xx.
 * Registered LAST.
 */
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { getCorrelationId } from '../core/context/requestContext.js';
import { isAppError, NotFoundError, ValidationError } from '../core/errors/index.js';
import { logger } from '../core/logger/logger.js';

interface ProblemBody {
  error: string;
  message: string;
  correlationId: string;
  details?: unknown;
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError('Route not found'));
};

// Express identifies error handlers by arity (4 args) — `next` must stay.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const correlationId = getCorrelationId() ?? 'unknown';

  // Zod errors that reach here (not via validate middleware) → 400.
  const normalized = err instanceof ZodError ? new ValidationError('Validation failed') : err;

  if (isAppError(normalized)) {
    const body: ProblemBody = {
      error: normalized.code,
      message: normalized.message,
      correlationId,
    };
    if (normalized.details !== undefined) {
      body.details = normalized.details;
    }
    res.status(normalized.statusCode).json(body);
    return;
  }

  // Unexpected → 500, log with stack (logger redacts), return generic message.
  logger.error('http.unhandled_error', { error: normalized });
  const body: ProblemBody = {
    error: 'INTERNAL',
    message: 'An unexpected error occurred',
    correlationId,
  };
  res.status(500).json(body);
};
