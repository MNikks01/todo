/**
 * Todo domain entity + DTO (docs/database.md §2.2, backend/modules/todos/CLAUDE.md).
 * Pure domain — no I/O. Ownership (`userId`) is intrinsic to every todo.
 */
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  tags: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function toTodoDto(todo: Todo): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    priority: todo.priority,
    dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
    tags: todo.tags,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
