# CLAUDE.md — Root Operating Guide

This file tells Claude Code (and any AI assistant) **how to work in this repository**. It is authoritative. Nested `CLAUDE.md` files refine these rules for their subtree.

---

## 1. Prime Directive: Documentation-First

- **Do not write implementation code while in Phase 0.** Check `docs/roadmap.md` for the current phase.
- Significant decisions require an **ADR** in `docs/adr/`.
- After any change, update the relevant docs and `CLAUDE.md` files in the same PR.

## 2. Architecture Rules (non-negotiable)

- **Clean Architecture** dependency rule: inner layers never import outer. Domain has no I/O.
- **Backend:** controllers have **no business logic** — they validate (Zod), call a service, shape a response. Business logic lives in `application/` services; persistence in `infrastructure/` repositories behind interfaces (Dependency Inversion).
- **Frontend:** Feature-Based. Features don't import each other — share via `shared/`. **Server state → React Query; client UI state → Zustand.** No business logic in components.
- **Mongoose models never leak past `infrastructure/`.** Use DTOs/mappers at boundaries.

## 3. Code Quality (hard rules — see `.claude/rules/`)

- TypeScript `strict`. **No `any`** (use `unknown` + narrowing).
- Every external input **validated with Zod** at the boundary.
- Every feature ships with **tests** (unit + integration as applicable). Coverage ≥ 80%, 100% on auth/ownership.
- **Logging** with the structured logger + correlation ID; **never log PII/secrets**.
- **Error handling** via typed `AppError`s and the central error middleware; no swallowed errors; no leaking internals to clients.
- **Security**: authn + authz + ownership checks on every protected route. Secrets only from Secrets Manager/env — never committed.

## 4. Workflow Expectations

- Plan before coding; for non-trivial work, present a short plan.
- Implement **one roadmap phase at a time**. Don't jump ahead.
- After each phase: update docs → ADR if needed → run Architecture Review → run Security Review (see `.claude/output-styles/`).
- Prefer small, focused diffs. Conventional Commits. Follow `docs/git-strategy.md`.

## 5. Where Things Live

| Need                    | Go to                                |
| ----------------------- | ------------------------------------ |
| Why a decision was made | `docs/architecture.md`, `docs/adr/`  |
| What to build next      | `docs/roadmap.md`                    |
| Where a file goes       | `docs/folder-structure.md`           |
| Security expectations   | `docs/security.md`, `.claude/rules/` |
| Frontend specifics      | `frontend/CLAUDE.md`                 |
| Backend specifics       | `backend/CLAUDE.md`                  |
| Infra specifics         | `infrastructure/CLAUDE.md`           |
| Reusable workflows      | `.claude/commands/`                  |
| Specialized roles       | `.claude/agents/`                    |

## 6. Design Patterns Policy

Use patterns **only where justified** (see `docs/architecture.md` §16). Singleton: logger, DB connection, config, cache client (as injected module singletons). Factory: repository creation, per-feature module composition, cache provider. Never add a pattern for its own sake.

## 7. Definition of Done (every change)

- [ ] Matches architecture & folder structure
- [ ] Validated inputs, typed, no `any`
- [ ] Tests added/updated, coverage gate green
- [ ] Logging + error handling present, no PII leaks
- [ ] Security checks (authn/z/ownership) where applicable
- [ ] Docs/CLAUDE.md/ADR updated
- [ ] Lint, typecheck, security scans pass
