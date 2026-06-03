# RUNNING.md — How to run this project (and what happens under the hood)

This is the practical "how do I actually run it, and what does each command really
do" guide. For _why_ things are built the way they are, see [`docs/`](docs/).

- **Just want to use the app?** → [§2 Quick start](#2-quick-start-fastest-path).
- **Want to develop with hot reload?** → [§4 Local dev](#4-local-development-hot-reload).
- **Want to learn AWS at ₹0?** → [§8 LocalStack](#8-localstack-aws-learning-0).

---

## 1. Prerequisites

| Tool                    | Version                  | Used for                          |
| ----------------------- | ------------------------ | --------------------------------- |
| **Node.js**             | 22–24 (`.nvmrc` pins 24) | running/building the apps + tests |
| **npm**                 | ≥ 10                     | workspaces, scripts               |
| **Docker** + Compose v2 | recent                   | `make up`, LocalStack             |
| **Terraform**           | ≥ 1.6                    | infra (validate + LocalStack)     |
| **Git**                 | any                      | hooks (Husky)                     |

Check: `node -v && npm -v && docker --version && docker compose version`.

This is an **npm workspaces monorepo**: `backend/` (Express API) and `frontend/`
(React SPA) are separate packages; `e2e/` holds Playwright tests; `infrastructure/`
holds Docker + Terraform. The root `package.json` orchestrates all of them.

---

## 2. Quick start (fastest path)

```bash
make up        # build images + start the whole stack in Docker
```

Then open **http://localhost:8080**, click **Register**, and you're in.

```bash
make down      # stop everything
```

> `make up` runs `docker compose up -d --build`. See [§5](#5-running-with-docker-the-full-stack)
> for what that actually does, service by service.

---

## 3. The command map (what each entry point really runs)

Everything is a thin wrapper. Here's the chain from what you type → what executes.

### Make targets (`Makefile`)

| You run                 | Under the hood                                                       | Effect                                             |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| `make setup`            | `npm install`                                                        | install all workspace deps + git hooks             |
| `make up`               | `docker compose up -d --build`                                       | build + start mongo, redis, mailpit, api, frontend |
| `make down`             | `docker compose down`                                                | stop containers                                    |
| `make logs`             | `docker compose logs -f api`                                         | tail API logs                                      |
| `make lint`             | `npm run lint` → `eslint .`                                          | lint everything                                    |
| `make typecheck`        | `npm run typecheck` → per-workspace `tsc --noEmit`                   | type-check                                         |
| `make test`             | `npm test` → per-workspace `vitest run`                              | unit + integration tests                           |
| `make build`            | `npm run build` → per-workspace build                                | compile backend + build SPA                        |
| `make localstack-up`    | `docker compose -f …/docker-compose.localstack.yml up -d`            | start the AWS emulator                             |
| `make localstack-apply` | `cd …/localstack && terraform init && terraform apply -auto-approve` | create AWS resources locally                       |

### Root npm scripts (`package.json`) — fan out to both workspaces

| You run                 | Under the hood                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run lint`          | `eslint .` (flat config: strict TS, no-`any`, **architecture boundary rules**)                        |
| `npm run format`        | `prettier --write .`                                                                                  |
| `npm run typecheck`     | `npm run typecheck --workspaces` → backend `tsc -p tsconfig.json --noEmit`, frontend `tsc --noEmit`   |
| `npm test`              | `npm run test --workspaces` → each runs `vitest run`                                                  |
| `npm run test:coverage` | each workspace `vitest run --coverage` (enforces coverage thresholds)                                 |
| `npm run test:e2e`      | `playwright test --config e2e/playwright.config.ts` (see [§7](#7-end-to-end-tests-what-the-magic-is)) |
| `npm run build`         | backend `tsc -p tsconfig.build.json` → `dist/`; frontend `tsc --noEmit && vite build` → `dist/`       |

### Backend scripts (`backend/package.json`)

| You run (in `backend/`) | Under the hood                                                             |
| ----------------------- | -------------------------------------------------------------------------- |
| `npm run dev`           | `tsx watch src/main.ts` — runs TS directly, restarts on change             |
| `npm run build`         | `tsc -p tsconfig.build.json` → compiles `src/` to `dist/` (excludes tests) |
| `npm start`             | `node dist/main.js` — runs the compiled server                             |
| `npm test`              | `vitest run` — unit + integration (spins an in-memory Mongo)               |

### Frontend scripts (`frontend/package.json`)

| You run (in `frontend/`) | Under the hood                                                   |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | `vite` — dev server with HMR on **:5173**                        |
| `npm run build`          | `tsc --noEmit && vite build` — type-check then bundle to `dist/` |
| `npm run preview`        | `vite preview` — serve the built `dist/` (prod-like)             |

---

## 4. Local development (hot reload)

For day-to-day coding, run the API and SPA directly (not in Docker) so changes
reload instantly. You need a MongoDB — the easiest is the Docker one:

```bash
# 1) a database (just Mongo from the compose stack)
docker compose up -d mongo

# 2) backend — copy env, then watch-run
cd backend
cp .env.example .env            # defaults point at mongodb://localhost:27017/todo
npm run dev                     # → tsx watch src/main.ts  (API on :3000)

# 3) frontend — in another terminal
cd frontend
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:3000/api/v1
npm run dev                     # → vite  (SPA on :5173 with hot reload)
```

**What happens under the hood when `npm run dev` (backend) starts:**

1. `tsx` loads `src/main.ts` (TypeScript, no build step).
2. `src/config/env.ts` parses + **validates** the environment with Zod — the
   process refuses to boot on bad config (fail fast).
3. `database.connect()` opens the single Mongoose connection (a singleton).
4. `createApp()` wires the middleware chain + feature modules (the composition root).
5. `app.listen(3000)` starts; `SIGTERM/SIGINT` trigger graceful shutdown.

**Access:** SPA at **http://localhost:5173**, talking to the API at **:3000**.

---

## 5. Running with Docker (the full stack)

```bash
make up      # = docker compose up -d --build
```

**What `docker compose up -d --build` does, step by step:**

1. **Builds two images** from `infrastructure/docker/*.Dockerfile` (multi-stage):
   - `backend.Dockerfile`: install deps → `tsc` build → slim runtime (non-root, healthcheck).
   - `frontend.Dockerfile`: `vite build` → copy `dist/` into **nginx** (serves the SPA + sets CSP/security headers).
2. **Starts services** defined in `docker-compose.yml`, in dependency order:
   - `mongo` (with a healthcheck) → `api` waits until Mongo is **healthy**.
   - `redis`, `mailpit` start in parallel.
   - `api` boots (connects to `mongodb://mongo:27017/todo`, reads env from compose).
   - `frontend` (nginx) starts and serves the built SPA.
3. The **browser** loads the SPA from nginx on `:8080`; the SPA's JS calls the API
   on `:3000` (same-site `localhost`, so cookies + the CSP `connect-src` line up).

| Service            | URL / port            | What it is                                     |
| ------------------ | --------------------- | ---------------------------------------------- |
| **Frontend (SPA)** | http://localhost:8080 | nginx serving the React build — **start here** |
| **API**            | http://localhost:3000 | Express; try http://localhost:3000/health      |
| **Mongo**          | localhost:27017       | database (data persists in a Docker volume)    |
| **Mailpit**        | http://localhost:8025 | catches outgoing email (web UI)                |
| **Redis**          | localhost:6379        | cache/rate-limit (present for parity)          |

Useful: `make logs` (tail API), `docker compose ps` (status), `make down` (stop),
`make rebuild` (rebuild images no-cache).

---

## 6. Accessing & using the product

1. Open **http://localhost:8080** (Docker) or **http://localhost:5173** (dev).
2. **Register** an account (email + password ≥ 8 chars). You're auto-logged-in.
3. Add a todo, toggle it complete, filter by status/priority, delete it, log out.
4. **Check the API directly** (no UI):
   ```bash
   curl http://localhost:3000/health        # {"status":"ok"}
   curl http://localhost:3000/ready         # {"status":"ready","db":true}
   # register + login (capture the access token)
   curl -s -X POST http://localhost:3000/api/v1/auth/register \
     -H 'Content-Type: application/json' \
     -d '{"email":"me@example.com","password":"password123"}'
   ```
   The full API surface is documented in [`docs/api/openapi.yaml`](docs/api/openapi.yaml).

**How auth works at runtime (so the UI makes sense):** login returns a short-lived
**access token** (kept in memory) plus an **HttpOnly refresh cookie**. The SPA's
Axios interceptor attaches the token; on a 401 it silently calls `/auth/refresh`
and retries. That's why a page reload keeps you logged in.

---

## 7. End-to-end tests (what the "magic" is)

```bash
npm run test:e2e        # Playwright drives a real browser against the real stack
```

**Under the hood (`e2e/playwright.config.ts`):** Playwright's `webServer` boots the
**whole stack for you**, then runs Chromium against it:

1. Starts `backend/scripts/e2e-server.ts` → an **in-memory MongoDB** + the real
   Express app on **:3000** (no external DB needed).
2. Builds the SPA and serves it with `vite preview` on **:4173**.
3. Runs the specs in `e2e/tests/` (auth journeys, todo CRUD, accessibility via axe).
4. Tears the servers down at the end.

So one command spins up DB + API + SPA + browser and verifies the real user
journeys — nothing to set up manually.

---

## 8. LocalStack (AWS learning, ₹0)

Practice AWS against a local emulator — **no real account, so no bill is possible**.

```bash
make localstack-up        # start the emulator (docker) on :4566
make localstack-apply     # terraform init + apply → creates VPC/SG/EC2/S3/IAM/SSM/CloudWatch
# inspect:
cd infrastructure/terraform/environments/localstack
terraform state list      # what Terraform manages
terraform output          # the created resource IDs
# tidy up:
cd - && make localstack-destroy && make localstack-down
```

**Under the hood of `make localstack-apply`:** Terraform's AWS provider is pointed
at `http://localhost:4566` with fake credentials (`infrastructure/terraform/environments/localstack/versions.tf`).
`terraform apply` makes the same AWS API calls it would in real AWS — they just
hit the emulator. Details + a per-resource learning guide:
[`infrastructure/terraform/environments/localstack/README.md`](infrastructure/terraform/environments/localstack/README.md)
and [`docs/aws-free-tier-learning-plan.md`](docs/aws-free-tier-learning-plan.md).

Validate the real (cloud) Terraform without applying:

```bash
cd infrastructure/terraform/environments/dev   # or prod
terraform init -backend=false && terraform validate
```

---

## 9. What happens when you `git commit`

Commits are guarded automatically (Husky hooks, installed by `npm install`):

1. **pre-commit** → `npx lint-staged`: runs `eslint --fix` + `prettier --write` on
   the files you staged (auto-formats, blocks lint errors).
2. **commit-msg** → `npx commitlint`: enforces **Conventional Commits**
   (`feat:`, `fix:`, `docs:` …). A non-conforming message is rejected.

This is why every commit in the history is formatted and conventionally named.

## 10. What CI runs (`.github/workflows/ci.yml`)

On every push/PR, GitHub Actions runs four jobs in parallel:

- **verify** — `format:check` → `lint` → `typecheck` → `test:coverage` (gates).
- **e2e** — installs Chromium, runs `npm run test:e2e`.
- **security** — `npm audit`, gitleaks (secrets), Trivy (filesystem) → SARIF.
- **docker-build** — builds both Docker images to prove the Dockerfiles work.

(Deploy workflows exist but stay dormant until AWS is configured — see `docs/cicd.md`.)

---

## 11. Ports at a glance

| Port  | Who                       | When                     |
| ----- | ------------------------- | ------------------------ |
| 8080  | SPA (nginx)               | `make up`                |
| 5173  | SPA (vite dev)            | `npm run dev` (frontend) |
| 4173  | SPA (vite preview)        | during E2E               |
| 3000  | API (Express)             | always                   |
| 27017 | MongoDB                   | Docker                   |
| 8025  | Mailpit web UI            | `make up`                |
| 6379  | Redis                     | `make up`                |
| 4566  | LocalStack (all AWS APIs) | `make localstack-up`     |

---

## 12. Troubleshooting

| Symptom                              | Fix                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| `terraform: command not found`       | install it: `brew tap hashicorp/tap && brew install hashicorp/tap/terraform`            |
| Port already in use (3000/8080/4173) | something's still running: `make down`; or `lsof -ti tcp:3000 \| xargs kill -9`         |
| API `/ready` shows `db:false`        | Mongo isn't up/healthy: `docker compose up -d mongo`, wait, retry                       |
| SPA loads but API calls fail (CORS)  | API `CORS_ORIGINS` must include the SPA origin; in dev that's `http://localhost:5173`   |
| `connection refused :4566`           | LocalStack stopped: `make localstack-up`                                                |
| Husky hook didn't run                | run `npm install` once (it installs the hooks via `prepare`)                            |
| Cookies not sticking in dev          | use the documented ports (same-site `localhost`); don't mix `127.0.0.1` and `localhost` |

## 13. Stopping & cleaning up

```bash
make down                 # stop the app stack
make localstack-destroy   # remove LocalStack resources
make localstack-down      # stop LocalStack
make clean                # remove node_modules + build artifacts
docker compose down -v    # also delete the Mongo data volume (wipes local data)
```
