# ADR-0007: Clean Architecture + Repository Pattern (Backend)

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Backend
- **Context tags:** backend, architecture

## Context

Within the modular monolith (ADR-0001), we need an internal structure that is testable, keeps business rules independent of frameworks/DB, and lets us swap infrastructure (e.g., Mongoose ↔ in-memory for tests) without touching domain logic. This is a primary learning goal of the project.

## Decision

Adopt **Clean Architecture** layering per feature module — `domain` → `application` → `infrastructure` / `interface` — with the **dependency rule** (inner layers never import outer). Persistence is accessed via the **Repository pattern**: services depend on repository **interfaces**; Mongoose implementations live in `infrastructure/`. Wiring happens in per-module **factories** (`*.module.ts`) — the composition root — realizing **Dependency Inversion**.

## Options Considered

1. **Clean Architecture + Repository (chosen)** — _Pro:_ testable (mock repos), framework/DB-independent domain, clear boundaries, swappable infra, strong learning value. _Con:_ more files/indirection; mappers/DTOs add ceremony.
2. **Layered MVC (controllers→services→Mongoose directly)** — _Pro:_ fewer files, faster to start. _Con:_ domain coupled to Mongoose, harder unit testing, leaky abstractions. Rejected as a learning anti-goal.
3. **Active Record (logic on Mongoose models)** — _Pro:_ minimal. _Con:_ business logic welded to the ORM; poor separation/testability. Rejected.

## Consequences

- Positive: high testability (100% on auth/ownership achievable), infra swappable, boundaries enforceable.
- Negative: boilerplate (DTOs, mappers, interfaces); risk of over-abstraction — mitigated by KISS and "patterns only where justified" (`architecture.md` §16).
- Enforcement: ESLint `no-restricted-imports`/boundary rules (Phase 1), `rules/architecture.md`, Architecture Review gate.

## Links

`docs/architecture.md` §4.4–§4.5, §16; `backend/CLAUDE.md`; ADR-0001.
