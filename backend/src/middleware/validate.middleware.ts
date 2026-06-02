/**
 * Zod request validation at the HTTP boundary (rules/validation.md).
 * Parses body/query/params, replaces them with the typed/coerced result, and
 * converts failures into a consistent 400 ValidationError.
 */
import type { RequestHandler } from 'express';
import { type ZodError, type ZodTypeAny, ZodError as ZodErrorClass } from 'zod';
import { ValidationError } from '../core/errors/index.js';

export interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function formatIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as typeof req.body;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodErrorClass) {
        next(new ValidationError('Validation failed', formatIssues(error)));
        return;
      }
      next(error);
    }
  };
}
