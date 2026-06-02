/** Todo types mirroring the backend Todo DTO (docs/api/openapi.yaml). */
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
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

export interface TodoPage {
  todos: Todo[];
  pagination: { total: number; limit: number; skip: number };
}

export interface TodoFilters {
  // Optional fields allow explicit `undefined` so a filter can be cleared
  // (under exactOptionalPropertyTypes).
  completed?: boolean | undefined;
  priority?: Priority | undefined;
  search?: string | undefined;
  sortBy: 'createdAt' | 'dueDate' | 'priority';
  sortDir: 'asc' | 'desc';
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  tags?: string[];
}

export type UpdateTodoInput = Partial<{
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
}>;
