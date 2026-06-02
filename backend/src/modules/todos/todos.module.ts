/** Todos module composition root (Factory). */
import type { RequestHandler, Router } from 'express';
import { TodoService } from './application/todoService.js';
import { MongoTodoRepository } from './infrastructure/mongoTodoRepository.js';
import { TodoController } from './interface/todoController.js';
import { createTodoRouter } from './interface/todoRouter.js';

export interface TodosModuleDeps {
  authMiddleware: RequestHandler;
}

export interface TodosModule {
  router: Router;
  service: TodoService;
}

export function createTodosModule(deps: TodosModuleDeps): TodosModule {
  const service = new TodoService(new MongoTodoRepository());
  const controller = new TodoController(service);
  const router = createTodoRouter(controller, deps.authMiddleware);
  return { router, service };
}
