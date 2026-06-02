/**
 * Auth module composition root (architecture.md §16.2 — Factory). Wires
 * repositories → service → controller → router from shared infrastructure.
 */
import type { RequestHandler, Router } from 'express';
import type { PasswordHasher } from '../../infrastructure/security/passwordHasher.js';
import type { TokenService } from '../../infrastructure/security/tokenService.js';
import type { UserService } from '../users/application/userService.js';
import { AuthService } from './application/authService.js';
import type { AuditLogger } from './domain/auditLogger.js';
import type { LoginAttemptTracker } from './domain/loginAttemptTracker.js';
import { MongoRefreshTokenRepository } from './infrastructure/mongoRefreshTokenRepository.js';
import { AuthController } from './interface/authController.js';
import { createAuthRouter } from './interface/authRouter.js';

export interface AuthModuleDeps {
  userService: UserService;
  tokens: TokenService;
  hasher: PasswordHasher;
  audit: AuditLogger;
  loginAttempts: LoginAttemptTracker;
  authMiddleware: RequestHandler;
}

export interface AuthModule {
  router: Router;
  service: AuthService;
}

export function createAuthModule(deps: AuthModuleDeps): AuthModule {
  const service = new AuthService({
    users: deps.userService,
    refreshTokens: new MongoRefreshTokenRepository(),
    hasher: deps.hasher,
    tokens: deps.tokens,
    audit: deps.audit,
    loginAttempts: deps.loginAttempts,
  });

  const controller = new AuthController(service, deps.userService);
  const router = createAuthRouter(controller, deps.authMiddleware);

  return { router, service };
}
