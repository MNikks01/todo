# frontend/features/todos/CLAUDE.md

## Purpose

Todo management UI: list, create, edit, complete, delete, filter, sort, search, paginate — scoped to the current user.

## Architecture

- `api/` — React Query hooks: `useTodos(filters)` (query), `useCreateTodo`, `useUpdateTodo`, `useToggleTodo`, `useDeleteTodo` (mutations with cache invalidation / optimistic updates).
- `components/` — `TodoList`, `TodoItem`, `TodoForm`, `Filters`, `Pagination`, `EmptyState`.
- `hooks/` — `useTodoFilters` (derives query params).
- `store/` — Zustand: **filter/sort/search UI state and modal state only**. Todo data lives in React Query, never duplicated here.
- `routes.tsx` — `/todos`, `/todos/:id` (protected).

## Responsibilities

- Present server data from React Query; reflect loading/error/empty states.
- Optimistic toggle/delete with rollback on failure.

## Dependencies

`shared/api`, `shared/components`, React Query, Zustand, React Router. Backend `todos` module contract.

## Coding Rules

- **No server data in Zustand.** Mutations invalidate the right query keys.
- Typed (no `any`); presentational components; logic in hooks.
- Handle empty/loading/error explicitly; accessible list semantics.

## Testing Requirements

- Component tests (render list, item interactions), integration with MSW (CRUD + optimistic update rollback, filter→query param), a11y. ≥ 80% coverage.
