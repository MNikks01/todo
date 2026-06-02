/** Todo routes — all require authentication; ownership enforced in the service. */
import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../core/http/asyncHandler.js';
import { validate } from '../../../middleware/validate.middleware.js';
import type { TodoController } from './todoController.js';
import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamSchema,
  updateTodoSchema,
} from './todoSchemas.js';

export function createTodoRouter(
  controller: TodoController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', validate({ query: listTodosQuerySchema }), asyncHandler(controller.list));
  router.post('/', validate({ body: createTodoSchema }), asyncHandler(controller.create));
  router.get('/:id', validate({ params: todoIdParamSchema }), asyncHandler(controller.get));
  router.patch(
    '/:id',
    validate({ params: todoIdParamSchema, body: updateTodoSchema }),
    asyncHandler(controller.update),
  );
  router.delete('/:id', validate({ params: todoIdParamSchema }), asyncHandler(controller.remove));
  router.post(
    '/:id/restore',
    validate({ params: todoIdParamSchema }),
    asyncHandler(controller.restore),
  );

  return router;
}
