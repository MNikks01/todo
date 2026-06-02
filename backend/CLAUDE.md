# backend/CLAUDE.md — Backend Operating Guide

Refines the root [CLAUDE.md](../CLAUDE.md) for the Express API. **Clean Architecture + Modular Monolith.**

## Purpose

A secure REST API (`/api/v1`) for auth (JWT + rotating refresh, RBAC) and todos (CRUD, filter, search, paginate, soft-delete), with structured logging, validation, and observability.

## Layering (dependency rule: inward only)

```
interface (router/controller/zod)  → no business logic
application (services/use-cases)    → orchestration, transactions
domain (entities/value objects)     → pure rules, no I/O
infrastructure (mongoose repos,     → I/O behind interfaces
  logger, token svc, cache, mail)
```

- **Controllers**: validate (Zod) → call service → shape response. Nothing else.
- **Services** depend on **repository interfaces**, not Mongoose.
- **Repositories** (in `infrastructure`) implement those interfaces. Mongoose stays here.
- Wiring happens in each `modules/<x>/<x>.module.ts` **factory** (composition root) and `app.ts`.

## Modules

`modules/auth`, `modules/users`, `modules/todos` — each with `domain/ application/ infrastructure/ interface/ <x>.module.ts CLAUDE.md`.

## Cross-cutting (`core/`, `middleware/`)

- Logger (Winston, module singleton) + request-scoped child (`logger.child`) via AsyncLocalStorage (correlation ID).
- Middleware chain: correlationId → requestLogger → (route) auth → rbac → validate → handler → errorHandler (last).
- Typed errors (`AppError` subclasses); central error handler maps to safe responses.

## Coding Rules

- TS `strict`, **no `any`**. DTOs at boundaries; **no Mongoose types leak out of `infrastructure`**.
- **Validate every input** with Zod (body/params/query). Sanitize against NoSQL operator injection.
- **AuthN + AuthZ + ownership** on every protected route. Ownership scoped in queries (`{ _id, userId }`).
- **Log** structured + correlation ID; **never log PII/secrets** (redaction configured).
- Secrets from Secrets Manager/env (Zod-validated config); never committed.
- Graceful shutdown: drain server, close Mongoose connection.

## Dependencies

express, mongoose, zod, winston, jsonwebtoken, argon2/bcrypt, helmet, cors, compression, express-rate-limit. Tests: Vitest/Jest, Supertest, mongodb-memory-server. See `backend/SKILLS.md`.

## Testing Requirements

- Unit (domain/services with mocked repos), Integration (route→DB via ephemeral Mongo), API/contract (Supertest). 100% on auth/RBAC/ownership/token logic; ≥ 80% overall.

## Definition of Done

Clean layering respected · controller has no logic · inputs validated · authz+ownership tested · no `any`, no leaked Mongoose · logging+errors · docs/ADR updated · scans green.
