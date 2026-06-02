import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '../../core/errors/index.js';
import { validate } from '../../middleware/validate.middleware.js';

const schema = z.object({ name: z.string().min(1) }).strict();
const res = {} as Response;

describe('validate middleware', () => {
  it('passes and replaces body with the parsed result on valid input', () => {
    const req = { body: { name: 'ok' } } as Request;
    const next = vi.fn() as unknown as NextFunction;
    validate({ body: schema })(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'ok' });
  });

  it('forwards a ValidationError on invalid input', () => {
    const req = { body: { name: '' } } as Request;
    const error = vi.fn();
    validate({ body: schema })(req, res, error as unknown as NextFunction);
    const arg = error.mock.calls[0]?.[0] as unknown;
    expect(arg).toBeInstanceOf(ValidationError);
  });

  it('rejects unexpected keys (strict)', () => {
    const req = { body: { name: 'ok', extra: 1 } } as Request;
    const error = vi.fn();
    validate({ body: schema })(req, res, error as unknown as NextFunction);
    expect(error.mock.calls[0]?.[0]).toBeInstanceOf(ValidationError);
  });
});
