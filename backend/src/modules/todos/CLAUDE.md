# backend/modules/todos/CLAUDE.md

## Purpose

Core domain: per-user todos. Create, read, list (filter/sort/paginate/search), update, toggle complete, soft-delete, restore.

## Architecture (Clean Architecture slice)

- `domain/` — `Todo` entity, value objects (`Priority`, `Tag`), invariants (title length, etc.), domain errors.
- `application/` — `TodoService` (use-cases enforcing ownership), DTOs, query/filter objects.
- `infrastructure/` — `TodoRepository` (Mongoose), mappers; all queries **scoped by `userId`**.
- `interface/` — router (`/api/v1/todos`, auth-guarded), controller, Zod schemas (create/update/list-query).
- `todos.module.ts` — factory wiring.

## Responsibilities

- Enforce **ownership** on every operation: queries filter `{ _id, userId, deletedAt: null }`. Cross-user access → 404 (don't reveal existence).
- Pagination with capped page size; text search; tag/priority/status filters; sorting.
- Soft-delete (`deletedAt`) + restore; hard-delete job after retention.

## Dependencies

`core/logger`, `core/errors`, `infrastructure/database`, `auth.middleware` (user context). Indexes per `docs/database.md`.

## Coding Rules

- **Never trust client `userId`** — derive from authenticated context. Ownership in the query, not just a post-check.
- Validate all inputs (Zod); cap limits; project only needed fields; `.lean()` for lists.
- No `any`; no Mongoose leakage past `infrastructure/`.

## Testing Requirements

- Unit (service ownership logic, domain invariants), integration (CRUD, **cross-user denial**, pagination bounds, search, soft-delete/restore). 100% on ownership; ≥ 80% overall.
