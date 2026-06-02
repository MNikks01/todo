import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoInput, TodoFilters, TodoPage, UpdateTodoInput } from '@/shared/types/todo';
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './todosApi';

const TODOS_KEY = ['todos'] as const;

export function useTodos(filters: TodoFilters) {
  return useQuery({
    queryKey: [...TODOS_KEY, filters],
    queryFn: () => fetchTodos(filters),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateTodoInput }) =>
      updateTodo(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

/** Optimistic completion toggle with rollback (frontend/skills/react.md). */
export function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const prev = qc.getQueriesData<TodoPage>({ queryKey: TODOS_KEY });
      qc.setQueriesData<TodoPage>({ queryKey: TODOS_KEY }, (old) =>
        old
          ? { ...old, todos: old.todos.map((t) => (t.id === id ? { ...t, completed } : t)) }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      context?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

/** Optimistic delete with rollback. */
export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const prev = qc.getQueriesData<TodoPage>({ queryKey: TODOS_KEY });
      qc.setQueriesData<TodoPage>({ queryKey: TODOS_KEY }, (old) =>
        old
          ? {
              ...old,
              todos: old.todos.filter((t) => t.id !== id),
              pagination: { ...old.pagination, total: Math.max(0, old.pagination.total - 1) },
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      context?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}
