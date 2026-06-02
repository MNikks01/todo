# Folder Structure Specification

> **Status:** Draft v1.0 · This is the target tree. **No code yet** — this documents _where_ things will live and _why_.
> Conventions: kebab-case files for configs/docs, camelCase for TS modules, PascalCase for React components and classes. Every major folder carries a `CLAUDE.md`.

---

## Top-Level (Monorepo)

```
todo/
├── README.md                  # Entry point: what/why/how to run
├── CLAUDE.md                  # Root agent operating guide
├── SKILLS.md                  # Index of skills & where they apply
├── package.json               # Workspaces root (npm/pnpm workspaces)
├── .nvmrc / .node-version     # Pinned Node version
├── .editorconfig
├── .gitignore
├── .dockerignore
├── Makefile                   # one-command dev workflows
├── docker-compose.yml         # local full-stack environment
├── docker-compose.override.yml
├── .github/                   # CI/CD (see §CI-CD)
├── .claude/                   # Claude Code operating system (see §.claude)
├── docs/                      # All documentation (see §docs)
├── frontend/                  # React app (see §frontend)
├── backend/                   # Express API (see §backend)
├── infrastructure/            # Terraform + AWS + Docker (see §infra)
├── scripts/                   # Cross-cutting dev/ops scripts (see §scripts)
└── monitoring/                # Dashboards, alarms-as-code (see §monitoring)
```

---

## Frontend (Feature-Based Architecture)

```
frontend/
├── CLAUDE.md
├── SKILLS.md
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── public/
└── src/
    ├── main.tsx                 # bootstrap: providers (Query, Router)
    ├── App.tsx                  # route tree shell
    ├── app/                     # app-wide composition
    │   ├── providers/           # QueryClientProvider, theme, error boundary
    │   ├── router/              # route definitions, ProtectedRoute, lazy routes
    │   └── store/               # Zustand root store registration
    ├── features/                # ⬅ feature-based slices
    │   ├── auth/
    │   │   ├── api/             # axios calls + React Query hooks
    │   │   ├── components/      # LoginForm, RegisterForm
    │   │   ├── hooks/           # useAuth, useLogin
    │   │   ├── store/           # auth UI state (Zustand slice)
    │   │   ├── types/
    │   │   ├── utils/
    │   │   ├── routes.tsx
    │   │   └── CLAUDE.md
    │   └── todos/
    │       ├── api/
    │       ├── components/      # TodoList, TodoItem, TodoForm, Filters
    │       ├── hooks/           # useTodos, useCreateTodo
    │       ├── store/           # filters/sort UI state
    │       ├── types/
    │       ├── utils/
    │       ├── routes.tsx
    │       └── CLAUDE.md
    ├── shared/                  # cross-feature reusable
    │   ├── api/                 # axios instance, interceptors, error mapping
    │   ├── components/          # Button, Input, Modal, Spinner (design system)
    │   ├── hooks/               # useDebounce, useDisclosure
    │   ├── lib/                 # query client config, constants
    │   ├── types/               # shared/global types
    │   └── utils/               # formatting, guards
    ├── config/                  # env parsing (typed), feature flags
    ├── styles/                  # tailwind base, globals
    └── test/                    # test setup, msw handlers, factories
```

**Rules:** Features never import from each other directly — only via `shared/`. Server state → React Query only. Client UI state → Zustand. No business logic in components; logic lives in hooks/utils.

---

## Backend (Clean Architecture + Modular Monolith)

```
backend/
├── CLAUDE.md
├── SKILLS.md
├── tsconfig.json
├── .env.example
├── package.json
└── src/
    ├── main.ts                  # entrypoint: build app, connect DB, listen
    ├── app.ts                   # express app factory (no listen) — testable
    ├── config/
    │   ├── env.ts               # Zod-validated env (singleton config)
    │   └── constants.ts
    ├── core/                    # framework-agnostic cross-cutting
    │   ├── errors/              # AppError, NotFound, Unauthorized, mappers
    │   ├── logger/              # Winston logger (module singleton) + child factory
    │   ├── http/                # asyncHandler, response helpers
    │   ├── context/             # AsyncLocalStorage request context (correlationId)
    │   └── types/               # shared domain-agnostic types
    ├── middleware/              # express middleware (chain of responsibility)
    │   ├── auth.middleware.ts          # verify JWT, attach user
    │   ├── rbac.middleware.ts          # role checks
    │   ├── validate.middleware.ts      # Zod request validation
    │   ├── rateLimit.middleware.ts
    │   ├── correlationId.middleware.ts
    │   ├── requestLogger.middleware.ts
    │   └── errorHandler.middleware.ts  # last; maps errors → responses
    ├── infrastructure/          # I/O implementations
    │   ├── database/            # mongoose connection (singleton), health ping
    │   ├── cache/               # CacheProvider interface + memory/redis impls (factory)
    │   ├── security/            # token service, password hasher
    │   ├── mail/                # Mailer interface + console/SES (adapter)
    │   └── aws/                 # secrets-manager adapter
    ├── modules/                 # ⬅ feature modules (vertical slices)
    │   ├── auth/
    │   │   ├── domain/          # entities, value objects, domain errors
    │   │   ├── application/     # AuthService, DTOs, use-cases
    │   │   ├── infrastructure/  # repositories impl, mappers
    │   │   ├── interface/       # router, controller, zod schemas
    │   │   ├── auth.module.ts   # factory: wires deps (composition)
    │   │   └── CLAUDE.md
    │   ├── users/
    │   │   └── ... (same shape) + CLAUDE.md
    │   └── todos/
    │       └── ... (same shape) + CLAUDE.md
    ├── routes/
    │   └── index.ts             # mounts module routers under /api/v1
    └── test/                    # test helpers, in-memory mongo, factories, fixtures
```

**Rules:** Dependency rule inward only. Controllers → services (interfaces) → repositories (interfaces). Mongoose lives only in `infrastructure`. Composition happens in `*.module.ts` factories and `app.ts`.

---

## Infrastructure

```
infrastructure/
├── CLAUDE.md
├── docker/
│   ├── backend.Dockerfile        # multi-stage
│   ├── frontend.Dockerfile       # build → nginx static
│   ├── nginx/                    # reverse proxy / SPA config
│   └── compose/                  # env-specific compose overrides
│       ├── docker-compose.dev.yml
│       ├── docker-compose.staging.yml
│       └── docker-compose.prod.yml
├── terraform/
│   ├── modules/
│   │   ├── network/              # VPC, subnets, SGs, NAT
│   │   ├── compute/              # EC2/ASG or ECS service
│   │   ├── alb/                  # ALB + ACM + listeners
│   │   ├── storage/              # S3 + CloudFront
│   │   ├── dns/                  # Route53 records
│   │   ├── secrets/              # Secrets Manager
│   │   ├── ecr/
│   │   └── observability/        # CloudWatch dashboards/alarms, SNS
│   ├── environments/
│   │   ├── dev/                  # tfvars + backend config
│   │   ├── qa/
│   │   ├── staging/
│   │   └── prod/
│   └── README.md
└── aws/
    ├── iam-policies/             # least-privilege JSON policy docs
    ├── architecture-diagrams/    # cheap + prod topology (md/mermaid/png)
    └── runbooks/                 # deploy, restore, rotate-keys, region-rebuild
```

---

## Documentation

```
docs/
├── CLAUDE.md
├── architecture.md
├── roadmap.md
├── folder-structure.md
├── security.md
├── database.md
├── aws.md
├── docker.md
├── cicd.md
├── git-strategy.md
├── hotfix-process.md
├── logging.md
├── monitoring.md
├── testing.md
├── api/                          # OpenAPI spec, endpoint reference
│   └── openapi.yaml
└── adr/                          # Architecture Decision Records
    ├── 0000-template.md
    ├── 0001-modular-monolith.md
    ├── 0002-zustand-over-redux.md
    └── ...
```

---

## CI/CD

```
.github/
├── workflows/
│   ├── ci.yml                    # lint, typecheck, test, coverage, security scan
│   ├── cd-dev.yml                # build+push ECR, deploy dev on merge to develop
│   ├── cd-staging.yml
│   ├── cd-prod.yml               # gated, manual approval
│   ├── rollback.yml              # manual: redeploy previous image tag
│   └── codeql.yml
├── actions/                      # composite/custom actions (reusable steps)
├── CODEOWNERS
├── pull_request_template.md
└── ISSUE_TEMPLATE/
```

## Testing

```
# co-located unit tests live beside source as *.test.ts(x)
# cross-cutting test infra:
frontend/src/test/       # RTL setup, MSW, render helpers, factories
backend/src/test/        # in-memory/ephemeral mongo, supertest helpers, fixtures
e2e/
├── playwright.config.ts
├── tests/                # auth.spec.ts, todos.spec.ts
├── fixtures/
└── CLAUDE.md
```

## Monitoring

```
monitoring/
├── CLAUDE.md
├── dashboards/                   # CloudWatch dashboard JSON
├── alarms/                       # alarm definitions (also in terraform/observability)
├── slo/                          # SLO/error-budget definitions
└── healthchecks/                 # synthetic check definitions
```

## Scripts

```
scripts/
├── CLAUDE.md
├── dev/                          # seed-db, reset-db, gen-types
├── ci/                           # wait-for-it, coverage-merge
├── ops/                          # backup, restore, rotate-secret
└── setup.sh                      # first-time local setup
```

---

## Naming & Boundary Rules (enforced by lint + review)

- No deep cross-feature imports (enforce with eslint `no-restricted-imports` / boundaries plugin).
- Each feature owns its types; shared types live in `shared/`/`core/`.
- One responsibility per file; barrel `index.ts` only at module public boundaries.
- Every directory listed above with business meaning must contain a `CLAUDE.md`.
