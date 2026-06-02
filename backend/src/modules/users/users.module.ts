/**
 * Users module composition root (Factory). Exposes the shared UserService (used
 * by auth) and the admin router.
 */
import type { RequestHandler, Router } from 'express';
import type { AuditLogger } from '../auth/domain/auditLogger.js';
import { UserService } from './application/userService.js';
import { MongoUserRepository } from './infrastructure/mongoUserRepository.js';
import { UserController } from './interface/userController.js';
import { createUserRouter } from './interface/userRouter.js';

export interface UsersModuleDeps {
  audit: AuditLogger;
  authMiddleware: RequestHandler;
}

export interface UsersModule {
  router: Router;
  service: UserService;
}

export function createUsersModule(deps: UsersModuleDeps): UsersModule {
  const service = new UserService(new MongoUserRepository());
  const controller = new UserController(service, deps.audit);
  const router = createUserRouter(controller, deps.authMiddleware);
  return { router, service };
}
