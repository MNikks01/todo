# Todo Application — Production-Grade Reference Project

A multi-user Todo app built as a **learning vehicle for production engineering**: React architecture, Node.js Clean Architecture, security, AWS, Docker, CI/CD, observability, and design patterns. The domain is simple on purpose — the rigor lives in the engineering.

> **Documentation-First.** No implementation code exists until the documentation phases are complete and reviewed. Start with the docs below.

---

## Tech Stack

**Frontend:** React · Vite · TypeScript · React Router · TanStack Query · Zustand · Axios · Tailwind · Feature-Based Architecture
**Backend:** Node.js · Express · TypeScript · MongoDB/Mongoose · JWT + refresh tokens · RBAC · Winston · Zod · rate limiting · Helmet · CORS · compression
**Infra:** Docker · Docker Compose · AWS (EC2/ECS, ECR, S3, CloudFront, CloudWatch, IAM, Secrets Manager, Route53, ACM, ALB, VPC) · Terraform
**CI/CD:** GitHub Actions

## Documentation Map

| Doc                                                  | What                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| [docs/architecture.md](docs/architecture.md)         | The why — requirements, decisions, tradeoffs, strategies, patterns |
| [docs/roadmap.md](docs/roadmap.md)                   | Phased delivery plan (Phase 0 → 11)                                |
| [docs/folder-structure.md](docs/folder-structure.md) | Target tree for every part of the repo                             |
| [docs/security.md](docs/security.md)                 | Threat model + controls (authn/z, API, infra, frontend)            |
| [docs/database.md](docs/database.md)                 | Collections, indexes, query patterns, scaling                      |
| [docs/aws.md](docs/aws.md)                           | Cheap & prod AWS topologies, cost, IAM, networking                 |
| [docs/docker.md](docs/docker.md)                     | Containerization & compose                                         |
| [docs/cicd.md](docs/cicd.md)                         | GitHub Actions pipeline & rollback                                 |
| [docs/git-strategy.md](docs/git-strategy.md)         | Branching & release flow                                           |
| [docs/hotfix-process.md](docs/hotfix-process.md)     | Incident & hotfix runbook                                          |
| [docs/logging.md](docs/logging.md)                   | Structured logging, correlation IDs, redaction                     |
| [docs/monitoring.md](docs/monitoring.md)             | Metrics, alarms, dashboards, SLOs                                  |
| [docs/testing.md](docs/testing.md)                   | Test pyramid, coverage gates                                       |
| [docs/adr/](docs/adr/)                               | Architecture Decision Records                                      |

## Operating System for AI Assistance

This repo is driven with **Claude Code**. See [CLAUDE.md](CLAUDE.md) for the operating guide and [.claude/](.claude/) for agents, rules, commands, skills, and output styles.

## Environments

`local` → `development` → `qa` → `staging` → `production`. Same image, env-injected config.

## Status

**Phase 2 — Authentication & RBAC: complete.** Phases done so far:

- **Phase 0** — full documentation system + `.claude` operating system.
- **Phase 1** — monorepo tooling: strict TS, ESLint (with Clean-Architecture boundary rules), Prettier, Husky/commitlint, Zod config loaders, CI.
- **Phase 2** — backend auth: register/login, JWT access + rotating refresh (reuse detection + family revoke), per-account lockout, CSRF, RBAC, audit logging, `users` admin module, 62 tests (auth service 100% lines). See [docs/roadmap.md](docs/roadmap.md).

Next: **Phase 3 — Todos feature + frontend vertical slice.**

## Getting Started

```bash
make setup     # first-time local setup
make up        # docker compose up full stack
make test      # run tests
```

(Commands are documented now; scripts arrive in Phase 1/6.)

## License

TBD.
