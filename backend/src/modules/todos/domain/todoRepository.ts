/**
 * TodoRepository interface (ADR-0007). EVERY operation is scoped by `userId` —
 * there is no way to fetch/mutate a todo without its owner, enforcing tenant
 * isolation at the contract level (docs/security.md §3, backend CLAUDE.md).
 */
import type { Priority, Todo } from './todo.js';

// Optional fields explicitly allow `undefined` because they are populated from
// Zod `.optional()` outputs under `exactOptionalPropertyTypes`.
export interface CreateTodoInput {
  userId: string;
  title: string;
  description?: string | null | undefined;
  priority?: Priority | undefined;
  dueDate?: Date | null | undefined;
  tags?: string[] | undefined;
}

export interface UpdateTodoInput {
  title?: string | undefined;
  description?: string | null | undefined;
  completed?: boolean | undefined;
  priority?: Priority | undefined;
  dueDate?: Date | null | undefined;
  tags?: string[] | undefined;
}

export type TodoSortField = 'createdAt' | 'dueDate' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface TodoQuery {
  userId: string;
  completed?: boolean | undefined;
  priority?: Priority | undefined;
  tag?: string | undefined;
  search?: string | undefined;
  sortBy: TodoSortField;
  sortDir: SortDirection;
  limit: number;
  skip: number;
}

export interface TodoPage {
  items: Todo[];
  total: number;
}

export interface TodoRepository {
  create(input: CreateTodoInput): Promise<Todo>;
  /** Owner-scoped fetch; returns null if not owned or soft-deleted. */
  findByIdForUser(id: string, userId: string): Promise<Todo | null>;
  query(query: TodoQuery): Promise<TodoPage>;
  updateForUser(id: string, userId: string, changes: UpdateTodoInput): Promise<Todo | null>;
  softDeleteForUser(id: string, userId: string): Promise<boolean>;
  restoreForUser(id: string, userId: string): Promise<Todo | null>;
}
