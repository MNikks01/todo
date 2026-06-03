# Todo Application — Production-Grade Reference Project

A multi-user Todo app built as a **learning vehicle for production engineering**: React architecture, Node.js Clean Architecture, security, AWS, Docker, CI/CD, observability, and design patterns. The domain is simple on purpose — the rigor lives in the engineering.

> **Documentation-First.** Every phase updates the docs in the same change; significant decisions are recorded as ADRs. Start with the docs below.

---

## Tech Stack

**Frontend:** React · Vite · TypeScript · React Router · TanStack Query · Zustand · Axios · Tailwind · Feature-Based Architecture
**Backend:** Node.js · Express · TypeScript · MongoDB/Mongoose · JWT + refresh tokens · RBAC · Winston · Zod · rate limiting · Helmet · CORS · compression
**Infra:** Docker · Docker Compose · AWS (EC2/ECS, ECR, S3, CloudFront, CloudWatch, IAM, Secrets Manager, Route53, ACM, ALB, VPC) · Terraform
**CI/CD:** GitHub Actions

## Documentation Map

| Doc                                                                        | What                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [docs/architecture.md](docs/architecture.md)                               | The why — requirements, decisions, tradeoffs, strategies, patterns |
| [docs/roadmap.md](docs/roadmap.md)                                         | Phased delivery plan (Phase 0 → 11)                                |
| [docs/folder-structure.md](docs/folder-structure.md)                       | Target tree for every part of the repo                             |
| [docs/security.md](docs/security.md)                                       | Threat model + controls (authn/z, API, infra, frontend)            |
| [docs/database.md](docs/database.md)                                       | Collections, indexes, query patterns, scaling                      |
| [docs/aws.md](docs/aws.md)                                                 | Cheap & prod AWS topologies, cost, IAM, networking                 |
| [docs/aws-free-tier-learning-plan.md](docs/aws-free-tier-learning-plan.md) | ₹0 Free-Tier learning plan, cost-risk report, cleanup checklist    |
| [docs/docker.md](docs/docker.md)                                           | Containerization & compose                                         |
| [docs/cicd.md](docs/cicd.md)                                               | GitHub Actions pipeline & rollback                                 |
| [docs/git-strategy.md](docs/git-strategy.md)                               | Branching & release flow                                           |
| [docs/hotfix-process.md](docs/hotfix-process.md)                           | Incident & hotfix runbook                                          |
| [docs/logging.md](docs/logging.md)                                         | Structured logging, correlation IDs, redaction                     |
| [docs/monitoring.md](docs/monitoring.md)                                   | Metrics, alarms, dashboards, SLOs                                  |
| [docs/testing.md](docs/testing.md)                                         | Test pyramid, coverage gates                                       |
| [docs/adr/](docs/adr/)                                                     | Architecture Decision Records                                      |

## How to run it

See **[RUNNING.md](RUNNING.md)** — every command, what it does under the hood, how
to access the app, ports, the E2E/LocalStack flows, and troubleshooting.

## Operating System for AI Assistance

This repo is driven with **Claude Code**. See [CLAUDE.md](CLAUDE.md) for the operating guide and [.claude/](.claude/) for agents, rules, commands, skills, and output styles.

## Environments

`local` → `development` → `qa` → `staging` → `production`. Same image, env-injected config.

## Status

**Phase 11 — Disaster Recovery & Polish: complete. All roadmap phases (0–11) done.** Summary:

- **Phase 0** — full documentation system + `.claude` operating system.
- **Phase 1** — monorepo tooling: strict TS, ESLint (with Clean-Architecture + feature-isolation boundary rules), Prettier, Husky/commitlint, Zod config loaders, CI.
- **Phase 2** — backend auth: register/login, JWT access + rotating refresh (reuse detection + family revoke), per-account lockout, CSRF, RBAC, audit logging, `users` admin module.
- **Phase 3** — backend `todos` module (owner-scoped CRUD, filter/sort/paginate/search, soft-delete) + React SPA (feature-based: auth + todos, React Query, Zustand, Axios refresh interceptor, Tailwind, protected routes).
- **Phase 4** — security hardening: login timing equalization (SF-1), session revocation on account disable (SF-2), no compression on auth responses (SF-4), NoSQL operator sanitization, locked-down API CSP (SF-6). See [docs/security.md](docs/security.md) §10.2.
- **Phase 5** — testing & quality gates: **Playwright E2E** (9 specs) driving the real stack via an ephemeral-Mongo backend + built SPA; coverage thresholds enforced per workspace and **wired into CI** (lint → typecheck → format → coverage → E2E). **109 tests** (81 backend + 19 frontend + 9 E2E).
- **Phase 6** — dockerization: multi-stage images (backend on bookworm-slim, frontend → nginx with SPA CSP/security headers), `docker-compose.yml` (mongo + redis + mailpit + api + frontend) with healthchecks. **Verified end-to-end** — `make up` serves the SPA on :8080 and API on :3000.
- **Phase 7** — CI/CD: GitHub Actions for quality gates, Playwright E2E, **security scans** (npm audit, gitleaks, Trivy, CodeQL), Docker image-build validation, and **gated deploy/rollback** workflows (OIDC→ECR, per-env, prod = digest promotion). Dependabot enabled. AWS-dependent steps are wired-but-gated until configured (see [docs/cicd.md](docs/cicd.md)).
- **Phase 8** — AWS infra as **Terraform** (cheapest tier): modules for VPC/SG, Graviton EC2 (Docker, SSM-only), ECR, S3+CloudFront SPA hosting, Secrets Manager, and the GitHub-OIDC deploy role. `terraform validate`-clean against the AWS provider; **not applied** (applying is billable — `infrastructure/terraform/README.md` + `infrastructure/aws/runbooks/deploy.md`).
- **Phase 9** — observability: backend **EMF metrics** (RED + security counters) → CloudWatch `Todo/API` namespace; Terraform `observability` module (log group, SNS alerts, alarms for 5xx/latency/auth-failure spike, dashboard — validate-clean); SLO/error-budget docs. **113 tests** (85 backend + 19 frontend + 9 E2E).
- **Phase 10** — production-HA Terraform (ADR-0009, validate-clean): `network-ha` (2-AZ public/private + NAT), `alb` (ALB + ACM TLS + Route53), `ecs` (Fargate, autoscaling, Secrets injection, rolling deploy + auto-rollback), `waf` (managed rules + rate limiting). Composed in `environments/prod`.
- **Phase 11** — DR & polish: **accessibility pass** (added `<main>` landmarks, fixed a serious link-contrast WCAG violation, verified with `@axe-core/playwright` — **12 E2E incl. 3 a11y**); backups bucket (Terraform, versioned + Glacier lifecycle); runbooks (restore, rotate-keys, region-rebuild) + ops scripts; postmortem template; [docs/disaster-recovery.md](docs/disaster-recovery.md).

**The roadmap is complete.** The remaining real-world step is to **apply** the Terraform to an AWS account (billable; see `infrastructure/aws/runbooks/deploy.md`) and flip on the gated CD workflows.

### Running locally

```bash
npm ci
npm run test          # unit + integration (both workspaces)
npm run test:coverage # with coverage gates
npm run test:e2e      # Playwright (boots backend + SPA automatically)
```

## Getting Started

```bash
make setup     # first-time local setup
make up        # docker compose up full stack
make test      # run tests
```

(Commands are documented now; scripts arrive in Phase 1/6.)

## License

TBD.
