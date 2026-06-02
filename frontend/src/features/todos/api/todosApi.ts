import { api } from '@/shared/api/client';
import type {
  CreateTodoInput,
  Todo,
  TodoFilters,
  TodoPage,
  UpdateTodoInput,
} from '@/shared/types/todo';

function toQueryParams(filters: TodoFilters): Record<string, string> {
  const params: Record<string, string> = {
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  };
  if (filters.completed !== undefined) params.completed = String(filters.completed);
  if (filters.priority !== undefined) params.priority = filters.priority;
  if (filters.search) params.search = filters.search;
  return params;
}

export async function fetchTodos(filters: TodoFilters): Promise<TodoPage> {
  const { data } = await api.get<TodoPage>('/todos', { params: toQueryParams(filters) });
  return data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const { data } = await api.post<{ todo: Todo }>('/todos', input);
  return data.todo;
}

export async function updateTodo(id: string, changes: UpdateTodoInput): Promise<Todo> {
  const { data } = await api.patch<{ todo: Todo }>(`/todos/${id}`, changes);
  return data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
}
