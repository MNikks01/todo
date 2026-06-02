/**
 * Authentication middleware — verifies the Bearer access token and attaches
 * the user to the request + context (docs/security.md §2.2). Factory so the
 * TokenService is injected (testable).
 */
import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../core/errors/index.js';
import { setContextUserId } from '../core/context/requestContext.js';
import type { TokenService } from '../infrastructure/security/tokenService.js';

export function createAuthMiddleware(tokens: TokenService): RequestHandler {
  return (req, _res, next) => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }
    const token = header.slice('Bearer '.length).trim();
    const claims = tokens.verifyAccessToken(token);
    req.user = { id: claims.sub, role: claims.role };
    setContextUserId(claims.sub);
    next();
  };
}
