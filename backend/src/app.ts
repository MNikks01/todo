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
import { createAuthMiddleware } from './middleware/auth.middleware.js';
import { createPasswordHasher } from './infrastructure/security/passwordHasher.js';
import { createTokenService } from './infrastructure/security/tokenService.js';
import { MongoAuditLogger } from './modules/auth/infrastructure/mongoAuditLogger.js';
import { InMemoryLoginAttemptTracker } from './modules/auth/infrastructure/inMemoryLoginAttemptTracker.js';
import { createAuthModule } from './modules/auth/auth.module.js';
import { createUsersModule } from './modules/users/users.module.js';
import { createHealthRouter } from './modules/health/healthRouter.js';

export function createApp(): Express {
  // --- Shared infrastructure (composition root) ---
  const tokens = createTokenService();
  const hasher = createPasswordHasher();
  const audit = new MongoAuditLogger();
  const loginAttempts = new InMemoryLoginAttemptTracker();
  const authMiddleware = createAuthMiddleware(tokens);

  // --- Feature modules ---
  const usersModule = createUsersModule({ audit, authMiddleware });
  const authModule = createAuthModule({
    userService: usersModule.service,
    tokens,
    hasher,
    audit,
    loginAttempts,
    authMiddleware,
  });

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind ALB/reverse proxy (correct client IP for rate limiting)

  // --- Security & parsing ---
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGINS.length > 0 ? config.CORS_ORIGINS : false,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));

  // --- Observability (must precede routes) ---
  app.use(correlationId);
  app.use(requestLogger);
  app.use(globalRateLimiter);

  // --- Routes ---
  app.use(createHealthRouter());
  app.use('/api/v1/auth', authModule.router);
  app.use('/api/v1/users', usersModule.router);

  // --- Error handling (last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
