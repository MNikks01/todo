/**
 * Role-based authorization (docs/security.md §3). Must run after auth.
 * The frontend only hints UI — this is the authority.
 */
import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../core/errors/index.js';
import type { Role } from '../core/types/roles.js';

export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (!allowed.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
