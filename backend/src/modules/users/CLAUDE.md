# backend/modules/users/CLAUDE.md

## Purpose

User accounts and profile/role management. Provides user lookups for `auth`, and admin operations (list users, disable account, change role).

## Architecture (Clean Architecture slice)

- `domain/` — `User` entity, `Role` (`user|admin`), `AccountStatus`, domain errors.
- `application/` — `UserService` (create, getById, getByEmail, setRole, disable); DTOs (never expose `passwordHash`).
- `infrastructure/` — `UserRepository` (Mongoose), mappers (entity ↔ document).
- `interface/` — router (`/api/v1/users`, admin-guarded), controller, Zod schemas.
- `users.module.ts` — factory wiring.

## Responsibilities

- CRUD on users with unique email enforcement.
- **RBAC-guarded** admin actions; every admin action **audit-logged**.
- Expose a clean `User` DTO (no secrets) to other modules/transport.

## Dependencies

`core/logger`, `core/errors`, `infrastructure/database`. Consumed by `auth` and `todos` (ownership).

## Coding Rules

- Never return `passwordHash` or internal fields. Email is **PII** → masked/redacted in logs.
- Admin routes require `rbac.middleware` (`admin`). Self-service vs admin paths clearly separated.
- No `any`; mappers keep Mongoose out of `application/`/`domain/`.

## Testing Requirements

- Unit (service/mappers), integration (RBAC denial for non-admin, unique email conflict, disable flow). 100% on role/permission logic.
