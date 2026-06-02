/**
 * Express application factory (composition root). Builds the middleware chain
 * and wires feature modules from shared infrastructure. Does NOT call listen —
 * `main.ts` owns the lifecycle, and tests import this directly (testable).
 */
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { config } from './config/env.js';
import { correlationId } from './middleware/correlationId.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { sanitizeRequest } from './middleware/sanitize.middleware.js';
import { createAuthMiddleware } from './middleware/auth.middleware.js';
import { createPasswordHasher } from './infrastructure/security/passwordHasher.js';
import { createTokenService } from './infrastructure/security/tokenService.js';
import { MongoAuditLogger } from './modules/auth/infrastructure/mongoAuditLogger.js';
import { MongoRefreshTokenRepository } from './modules/auth/infrastructure/mongoRefreshTokenRepository.js';
import { InMemoryLoginAttemptTracker } from './modules/auth/infrastructure/inMemoryLoginAttemptTracker.js';
import { createAuthModule } from './modules/auth/auth.module.js';
import { createUsersModule } from './modules/users/users.module.js';
import { createTodosModule } from './modules/todos/todos.module.js';
import { createHealthRouter } from './modules/health/healthRouter.js';

export function createApp(): Express {
  // --- Shared infrastructure (composition root) ---
  const tokens = createTokenService();
  const hasher = createPasswordHasher();
  const audit = new MongoAuditLogger();
  const loginAttempts = new InMemoryLoginAttemptTracker();
  const refreshTokens = new MongoRefreshTokenRepository();
  const authMiddleware = createAuthMiddleware(tokens);
  // Adapter: disabling a user revokes its refresh tokens (SF-2), without
  // coupling the users module to auth internals.
  const sessionRevoker = {
    revokeAllForUser: (userId: string) => refreshTokens.deleteAllForUser(userId),
  };

  // --- Feature modules ---
  const usersModule = createUsersModule({ audit, authMiddleware, sessionRevoker });
  const authModule = createAuthModule({
    userService: usersModule.service,
    refreshTokens,
    tokens,
    hasher,
    audit,
    loginAttempts,
    authMiddleware,
  });
  const todosModule = createTodosModule({ authMiddleware });

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind ALB/reverse proxy (correct client IP for rate limiting)

  // --- Security & parsing ---
  // This is a JSON API; lock CSP down to nothing-renderable. The SPA gets its
  // own CSP at the static edge (docs/security.md §8, SF-6).
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: { 'default-src': ["'none'"], 'frame-ancestors': ["'none'"] },
      },
    }),
  );
  app.use(
    cors({
      origin: config.CORS_ORIGINS.length > 0 ? config.CORS_ORIGINS : false,
      credentials: true,
    }),
  );
  // Don't compress auth responses (they carry the access token): avoids the
  // BREACH side-channel (SF-4).
  app.use(
    compression({
      filter: (req, res) => !req.path.startsWith('/api/v1/auth') && compression.filter(req, res),
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));

  // --- Observability (must precede routes) ---
  app.use(correlationId);
  app.use(requestLogger);
  app.use(globalRateLimiter);
  app.use(sanitizeRequest);

  // --- Routes ---
  app.use(createHealthRouter());
  app.use('/api/v1/auth', authModule.router);
  app.use('/api/v1/users', usersModule.router);
  app.use('/api/v1/todos', todosModule.router);

  // --- Error handling (last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
