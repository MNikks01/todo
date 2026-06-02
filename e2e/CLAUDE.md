# e2e/CLAUDE.md

## Purpose

End-to-end tests (Playwright) validating core user journeys against the Dockerized full stack (real API + test DB).

## Architecture

- `playwright.config.ts` — projects, base URL per env, retries, trace-on-failure.
- `tests/` — `auth.spec.ts`, `todos.spec.ts` (core journeys).
- `fixtures/` — seeded users/data, auth helpers.

## Responsibilities

- Verify journeys: register → login → create/edit/complete/delete todo → logout; refresh-token expiry/refresh; unauthorized redirect.
- Run in CI on PRs to staging/prod (see `docs/cicd.md`).

## Dependencies

Dockerized stack (`docker-compose`), seeded test DB. Playwright.

## Coding Rules

- Deterministic: seed data per run, isolated test users, no shared mutable state.
- Query by role/label (a11y). Retries only for known flakiness; capture traces on failure.
- Never run against shared/prod resources.

## Testing Requirements

Core journeys green before staging/prod promotion. Not counted toward unit coverage but gates releases (`docs/testing.md`).
