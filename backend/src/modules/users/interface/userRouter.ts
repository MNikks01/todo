/** Admin user routes — all require an authenticated admin (docs/security.md §3). */
import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../core/http/asyncHandler.js';
import { requireRole } from '../../../middleware/rbac.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';
import type { UserController } from './userController.js';
import {
  listUsersQuerySchema,
  setRoleSchema,
  setStatusSchema,
  userIdParamSchema,
} from './userSchemas.js';

export function createUserRouter(
  controller: UserController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();
  router.use(authMiddleware, requireRole('admin'));

  router.get('/', validate({ query: listUsersQuerySchema }), asyncHandler(controller.list));
  router.patch(
    '/:id/role',
    validate({ params: userIdParamSchema, body: setRoleSchema }),
    asyncHandler(controller.setRole),
  );
  router.patch(
    '/:id/status',
    validate({ params: userIdParamSchema, body: setStatusSchema }),
    asyncHandler(controller.setStatus),
  );

  return router;
}
