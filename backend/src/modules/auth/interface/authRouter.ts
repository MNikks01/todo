/**
 * Auth routes (docs/api/openapi.yaml). Bearer-immune mutations vs cookie-bearing
 * endpoints have different protections (docs/security.md §8.1).
 */
import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../core/http/asyncHandler.js';
import { doubleSubmitCsrf } from '../../../middleware/csrf.middleware.js';
import { authRateLimiter } from '../../../middleware/rateLimit.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';
import type { AuthController } from './authController.js';
import { loginSchema, registerSchema } from './authSchemas.js';

export function createAuthRouter(
  controller: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.post(
    '/register',
    authRateLimiter,
    validate({ body: registerSchema }),
    asyncHandler(controller.register),
  );
  router.post(
    '/login',
    authRateLimiter,
    validate({ body: loginSchema }),
    asyncHandler(controller.login),
  );

  // Cookie-bearing → CSRF double-submit + rate limit.
  router.post('/refresh', authRateLimiter, doubleSubmitCsrf, asyncHandler(controller.refresh));
  router.post('/logout', doubleSubmitCsrf, asyncHandler(controller.logout));

  // Bearer-authorized (CSRF-immune).
  router.post('/logout-all', authMiddleware, asyncHandler(controller.logoutAll));
  router.get('/me', authMiddleware, asyncHandler(controller.me));

  return router;
}
