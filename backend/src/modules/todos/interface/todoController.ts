/**
 * Todo controller — thin adapter. Derives ownership from the authenticated
 * user (never from the client), delegates to TodoService, shapes responses.
 */
import type { Request, Response } from 'express';
import { toTodoDto } from '../domain/todo.js';
import type { TodoService } from '../application/todoService.js';
import type { CreateTodoBody, ListTodosQuery, UpdateTodoBody } from './todoSchemas.js';

export class TodoController {
  constructor(private readonly todos: TodoService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateTodoBody;
    const todo = await this.todos.create({ userId: req.user!.id, ...body });
    res.status(201).json({ todo: toTodoDto(todo) });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as unknown as ListTodosQuery;
    const { items, total } = await this.todos.list({ userId: req.user!.id, ...q });
    res.status(200).json({
      todos: items.map(toTodoDto),
      pagination: { total, limit: q.limit, skip: q.skip },
    });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const todo = await this.todos.getForUser(id, req.user!.id);
    res.status(200).json({ todo: toTodoDto(todo) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateTodoBody;
    const todo = await this.todos.update(id, req.user!.id, body);
    res.status(200).json({ todo: toTodoDto(todo) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.todos.remove(id, req.user!.id);
    res.status(204).send();
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const todo = await this.todos.restore(id, req.user!.id);
    res.status(200).json({ todo: toTodoDto(todo) });
  };
}
