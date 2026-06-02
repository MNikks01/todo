import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundError, ValidationError } from '../../core/errors/index.js';
import { errorHandler } from '../../middleware/errorHandler.middleware.js';

interface CapturedRes {
  statusCode: number;
  body: unknown;
  res: Response;
}

function mockRes(): CapturedRes {
  const captured: CapturedRes = { statusCode: 0, body: undefined, res: {} as Response };
  const res = {
    status(code: number) {
      captured.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
      return res;
    },
  } as unknown as Response;
  captured.res = res;
  return captured;
}

const req = {} as Request;
const next: NextFunction = vi.fn();

describe('errorHandler', () => {
  it('maps an AppError to its status + code + safe message', () => {
    const cap = mockRes();
    errorHandler(new NotFoundError('User not found'), req, cap.res, next);
    expect(cap.statusCode).toBe(404);
    expect(cap.body).toMatchObject({ error: 'NOT_FOUND', message: 'User not found' });
  });

  it('includes structured details when present', () => {
    const cap = mockRes();
    errorHandler(
      new ValidationError('bad', [{ path: 'email', message: 'invalid' }]),
      req,
      cap.res,
      next,
    );
    expect(cap.statusCode).toBe(400);
    expect(cap.body).toMatchObject({ error: 'VALIDATION_ERROR', details: [{ path: 'email' }] });
  });

  it('normalizes a raw ZodError to a 400', () => {
    const cap = mockRes();
    const zodErr = z.object({ a: z.string() }).safeParse({});
    errorHandler(zodErr.success ? new Error('unexpected') : zodErr.error, req, cap.res, next);
    expect(cap.statusCode).toBe(400);
    expect(cap.body).toMatchObject({ error: 'VALIDATION_ERROR' });
  });

  it('maps an unexpected error to a generic 500', () => {
    const cap = mockRes();
    errorHandler(new Error('database exploded'), req, cap.res, next);
    expect(cap.statusCode).toBe(500);
    expect(cap.body).toMatchObject({ error: 'INTERNAL', message: 'An unexpected error occurred' });
    // Never leaks the internal message.
    expect(JSON.stringify(cap.body)).not.toContain('database exploded');
  });
});
