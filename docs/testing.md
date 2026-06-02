# Testing Strategy

> **Status:** Draft v1.0 · **Owner:** QA Lead · Test pyramid, ≥ 80% coverage, 100% on auth/ownership.
> Tests are a deliverable of every phase, not an afterthought.

---

## 1. Test Pyramid

```
        ▲  E2E (Playwright)         few, high-value journeys
       ─── Integration              API + DB, component+API
      ───── Unit                    many, fast, isolated
```

Bias toward many fast unit tests, fewer integration, fewest E2E.

## 2. Backend

| Layer            | Tool                                                                             | Scope                                                                                           |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Unit**         | Vitest/Jest                                                                      | domain entities, services (mock repos), validators, mappers, token service — pure logic, no I/O |
| **Integration**  | Vitest + Supertest + ephemeral Mongo (`mongodb-memory-server` or test container) | route → controller → service → real repo → DB; auth flows; ownership enforcement                |
| **API/contract** | Supertest against built `app.ts`                                                 | status codes, validation errors, RBAC denials, pagination                                       |

**Must-test backend cases:** register/login/refresh-rotation/reuse-detection/logout-all; RBAC denial (user hits admin route → 403); ownership (user A cannot read/update/delete user B's todo → 404/403); validation rejects bad input; rate limit triggers; error handler shapes safe responses.

## 3. Frontend

| Layer           | Tool                     | Scope                                                                                                  |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Unit**        | Vitest                   | hooks, utils, store logic, guards                                                                      |
| **Component**   | React Testing Library    | render, user interaction, accessibility roles                                                          |
| **Integration** | RTL + **MSW** (mock API) | feature flows: login form → success/redirect, todo CRUD against mocked API, React Query cache behavior |

**Principles:** test behavior not implementation; query by role/label (a11y); MSW for network so no real backend needed.

## 4. End-to-End

- **Playwright** against the Dockerized full stack (real API + test DB).
- Core journeys: register → login → create todo → edit → complete → delete → logout; refresh-token expiry/refresh; unauthorized access redirect.
- Deterministic: seeded DB per run, isolated test users, retries on known flakiness, trace-on-failure artifacts.

## 5. Coverage

- **Targets:** ≥ 80% lines/branches overall; **100%** on auth, RBAC, ownership, token logic.
- Enforced in CI via coverage thresholds (build fails below target).
- Coverage from unit+integration merged; E2E not counted toward unit coverage but gates releases.

## 6. Test Data & Isolation

- Factories/builders for entities (`backend/src/test`, `frontend/src/test`).
- Each integration test gets a clean DB (drop/seed) — no shared mutable state.
- No tests against shared cloud resources.

## 7. Quality Gates (CI)

1. Lint + typecheck (no `any`, no errors).
2. Unit + integration green.
3. Coverage ≥ threshold.
4. Security scans pass.
5. E2E green (on PR to staging/prod).

## 8. Non-Functional Testing

- **Load** (later): k6/Artillery against staging to validate latency SLOs and find saturation point.
- **Security**: automated (npm audit, Trivy, CodeQL, gitleaks) + manual review checklist (`docs/security.md` §11).
- **Accessibility**: axe checks in component/E2E tests for core flows (WCAG 2.1 AA).

## 9. Conventions

- Tests co-located as `*.test.ts(x)` beside source; shared infra in `test/`.
- Arrange-Act-Assert; one behavior per test; descriptive names (`rejects cross-user todo access`).
- No network/time/randomness without control (fake timers, seeded ids).
