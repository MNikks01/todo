/**
 * TodoService — todo use-cases (application layer). Enforces ownership on every
 * operation: a todo that isn't owned by the caller is indistinguishable from a
 * missing one (404), so existence is never revealed (docs/security.md §3).
 */
import { NotFoundError } from '../../../core/errors/index.js';
import type { Todo } from '../domain/todo.js';
import type {
  CreateTodoInput,
  TodoPage,
  TodoQuery,
  TodoRepository,
  UpdateTodoInput,
} from '../domain/todoRepository.js';

export class TodoService {
  constructor(private readonly todos: TodoRepository) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.todos.create(input);
  }

  async getForUser(id: string, userId: string): Promise<Todo> {
    const todo = await this.todos.findByIdForUser(id, userId);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    return todo;
  }

  async list(query: TodoQuery): Promise<TodoPage> {
    return this.todos.query(query);
  }

  async update(id: string, userId: string, changes: UpdateTodoInput): Promise<Todo> {
    const todo = await this.todos.updateForUser(id, userId, changes);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    return todo;
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.todos.softDeleteForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Todo not found');
    }
  }

  async restore(id: string, userId: string): Promise<Todo> {
    const todo = await this.todos.restoreForUser(id, userId);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    return todo;
  }
}
