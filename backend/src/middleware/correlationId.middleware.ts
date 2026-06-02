/**
 * Assigns a correlation id per request and binds it to AsyncLocalStorage so
 * every log line carries it (docs/logging.md §5). Echoed back to the client.
 */
import type { RequestHandler } from 'express';
import { ulid } from 'ulid';
import { runWithRequestContext } from '../core/context/requestContext.js';

const HEADER = 'x-correlation-id';

export const correlationId: RequestHandler = (req, res, next) => {
  const incoming = req.header(HEADER) ?? req.header('x-request-id');
  const id = incoming && incoming.trim().length > 0 ? incoming.trim() : ulid();
  res.setHeader(HEADER, id);
  runWithRequestContext({ correlationId: id }, () => {
    next();
  });
};
