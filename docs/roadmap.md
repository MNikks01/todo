# Project Roadmap — Todo Application

> **Status:** Draft v1.0 · **Owner:** Principal Architect · **Last updated:** 2026-06-02
> Documentation-First. **No phase begins implementation until the docs it depends on are approved.**
> Each phase lists: Goals · Deliverables · Risks · Dependencies · Definition of Done (DoD).

---

## Phasing Philosophy

Ship a **thin vertical slice** early (auth + one todo CRUD path, locally) and harden outward (security → tests → infra → cloud → observability). Every phase ends with documentation updates, an optional ADR, and a review gate. We never "jump ahead."

```
P0 Docs  →  P1 Foundations  →  P2 Auth  →  P3 Todos  →  P4 Hardening
   →  P5 Testing  →  P6 Docker/Local  →  P7 CI/CD  →  P8 AWS Cheap
   →  P9 Observability  →  P10 Prod-HA  →  P11 DR & Polish
```

---

## Phase 0 — Documentation & Design (CURRENT)

- **Goals:** Produce the complete documentation system before any code. Establish architecture, security, AWS, DB, testing, CI/CD, Git, hotfix, and the `.claude` operating system.
- **Deliverables:** All `/docs/*.md`, all `CLAUDE.md`/`SKILLS.md`, full folder-structure spec, `.claude/` agents/rules/commands/skills/output-styles.
- **Risks:** Analysis paralysis; docs drifting from reality. _Mitigation:_ timebox; treat docs as living, ADR-gated.
- **Dependencies:** None.
- **DoD:** Every Phase-1→5 documentation requirement from the project brief exists, cross-links resolve, and an Architecture + Security review pass on the docs.

## Phase 1 — Repository & Tooling Foundations

- **Goals:** Monorepo skeleton, TypeScript strict, linting, formatting, commit hooks, env validation, shared config.
- **Deliverables:** `frontend/`, `backend/`, `infrastructure/` scaffolds; ESLint+Prettier; `tsconfig` strict; Husky + lint-staged + commitlint; `.env.example` per app; Zod-based config loader; base `package.json` scripts.
- **Risks:** Toolchain churn. _Mitigation:_ pin versions; document in SKILLS.
- **Dependencies:** P0.
- **DoD:** `npm run lint && npm run typecheck` pass on empty scaffolds; pre-commit hooks block bad commits; CI placeholder green.

## Phase 2 — Authentication & RBAC (backend, vertical slice)

- **Goals:** Implement Clean-Architecture auth feature: register, login, refresh rotation, logout, RBAC middleware.
- **Deliverables:** `auth` and `users` feature modules; JWT access + rotating refresh; bcrypt/argon2 hashing; Zod request schemas; repository + service + controller; refresh-token reuse detection; audit log for auth events.
- **Risks:** Token security mistakes. _Mitigation:_ follow `docs/security.md` checklist; security review gate.
- **Dependencies:** P1, `docs/security.md`, `docs/database.md`.
- **DoD:** Unit + integration tests for all auth flows ≥ 90%; security review passed; no secrets in code; happy + abuse paths covered.

## Phase 3 — Todos Feature (backend) + Frontend vertical slice

- **Goals:** Full Todo CRUD with ownership, filtering, pagination, search; React app consuming auth + todos.
- **Deliverables:** `todos` backend module; React feature-based `auth` + `todos` features; React Query hooks; Zustand UI store; Axios client with interceptors (token refresh); Tailwind UI; React Router protected routes.
- **Risks:** Frontend/backend contract drift. _Mitigation:_ shared types package / generated types; contract tests.
- **Dependencies:** P2.
- **DoD:** End-to-end happy path works locally (register→login→CRUD todo); component + integration tests; ownership enforced & tested (cross-user access denied).

## Phase 4 — Security Hardening

- **Goals:** Apply all middleware-level protections and frontend token strategy.
- **Deliverables:** Helmet, CORS allowlist, rate limiting (auth-stricter), compression, body-size limits, NoSQL-injection sanitization, CSP, HttpOnly refresh cookie + CSRF defense, PII redaction in logs.
- **Risks:** Over-restrictive CORS/CSP breaking the app. _Mitigation:_ per-env config; staging verification.
- **Dependencies:** P2, P3.
- **DoD:** Security review checklist 100%; automated security scans pass; OWASP Top 10 mapped to mitigations.

## Phase 5 — Testing & Quality Gates

- **Goals:** Reach coverage targets; add E2E.
- **Deliverables:** Vitest/Jest unit + integration (backend with test DB), RTL component tests (frontend), Playwright E2E for core journeys; coverage thresholds enforced in CI.
- **Risks:** Flaky E2E. _Mitigation:_ test data isolation, retries, deterministic seeding.
- **Dependencies:** P2–P4.
- **DoD:** ≥ 80% coverage overall, 100% on auth/ownership; Playwright happy paths green; coverage gate enforced in CI.

## Phase 6 — Dockerization & Local Parity

- **Goals:** Containerize everything; one-command local environment.
- **Deliverables:** Multi-stage Dockerfiles (frontend, backend); `docker-compose.yml` (api + mongo + redis-optional + mailhog); `.dockerignore`; healthchecks; Makefile scripts.
- **Risks:** Dev/prod drift. _Mitigation:_ same base images; config via env.
- **Dependencies:** P1–P5.
- **DoD:** `docker compose up` yields a working app + DB; healthchecks pass; image sizes optimized.

## Phase 7 — CI/CD Pipeline

- **Goals:** Automated build/test/scan/deploy.
- **Deliverables:** GitHub Actions: lint, typecheck, test+coverage, security scan (npm audit, Trivy, CodeQL, gitleaks), Docker build, push to ECR, deploy, rollback workflow; branch protection; required checks.
- **Risks:** Secrets exposure in CI. _Mitigation:_ OIDC to AWS (no long-lived keys), GitHub secrets, gitleaks.
- **Dependencies:** P6, AWS account/ECR.
- **DoD:** PR runs full pipeline; merge to `develop` deploys to dev automatically; rollback tested.

## Phase 8 — AWS Cheapest Deployment

- **Goals:** Get prod-like running on the low-cost topology.
- **Deliverables:** Terraform for EC2 + security groups + S3/CloudFront + Route53 + ACM; SSM-based deploy; Secrets Manager wiring; Atlas connection.
- **Risks:** Cost overrun, misconfig exposure. _Mitigation:_ budgets+alerts; security-group least access; `docs/aws.md` checklist.
- **Dependencies:** P7.
- **DoD:** Public HTTPS URL serving the app; secrets from Secrets Manager; cost under budget; security groups least-privilege.

## Phase 9 — Observability

- **Goals:** See and be alerted about the system.
- **Deliverables:** Structured logs → CloudWatch; correlation/trace IDs end-to-end; custom metrics; dashboards; alarms → SNS email; `/health` & `/ready`.
- **Risks:** Alert fatigue. _Mitigation:_ SLO-based alarms only; tuned thresholds.
- **Dependencies:** P8.
- **DoD:** Dashboard live; alarms fire in a drill; logs queryable by correlation ID; MTTD < 5 min validated.

## Phase 10 — Production HA Topology (optional/advanced)

- **Goals:** Upgrade to ALB + autoscaling + private subnets (and/or ECS Fargate migration).
- **Deliverables:** VPC public/private subnets, ALB+ACM, ASG or ECS service, WAF, Atlas dedicated; blue-green or rolling deploy.
- **Risks:** Cost, complexity. _Mitigation:_ feature-flag the topology via Terraform workspace; only if learning goal pursued.
- **Dependencies:** P8, P9.
- **DoD:** Zero-downtime deploy demonstrated; AZ-failure tolerated in a drill.

## Phase 11 — Disaster Recovery & Polish

- **Goals:** Prove we can recover; finalize runbooks & docs.
- **Deliverables:** Backup automation, restore runbook + drill, key-rotation runbook, region-rebuild via IaC, postmortem template, accessibility & performance pass.
- **Risks:** Untested backups. _Mitigation:_ mandatory restore drill in DoD.
- **Dependencies:** P10 (or P8 for cheap tier).
- **DoD:** Successful restore drill within RTO/RPO; all runbooks executed once; docs reconciled with reality.

---

## Cross-Phase Cadence (every phase)

1. Update affected `CLAUDE.md` / `docs/*`.
2. Write an ADR if a significant decision changed.
3. Run **Architecture Review** (`.claude/output-styles/architecture-review`).
4. Run **Security Review** (`.claude/output-styles/security-review`).
5. Ensure tests + coverage gates green.

## Milestones

- **M1 (end P3):** Working local full-stack app.
- **M2 (end P7):** Automated pipeline to dev.
- **M3 (end P9):** Observable cloud deployment (cheap).
- **M4 (end P11):** Production-grade, recoverable system.
