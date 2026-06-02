/**
 * Todo list UI state (Zustand) — filters/sort/search only. Server data lives in
 * React Query and is never duplicated here (frontend/features/todos/CLAUDE.md).
 */
import { create } from 'zustand';
import type { TodoFilters } from '@/shared/types/todo';

interface FilterState extends TodoFilters {
  setFilters: (patch: Partial<TodoFilters>) => void;
  reset: () => void;
}

// All filter keys are present (optional ones as undefined) so a merge-based
// reset actually clears them (Zustand `set` shallow-merges).
const defaults: TodoFilters = {
  completed: undefined,
  priority: undefined,
  search: undefined,
  sortBy: 'createdAt',
  sortDir: 'desc',
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setFilters: (patch) => set(patch),
  reset: () => set(defaults),
}));
