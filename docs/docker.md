# Containerization Strategy

> **Status:** Implemented (Phase 6) · **Owner:** DevOps · Multi-stage builds, dev/prod parity, minimal images.
> Same image promoted across environments; config injected at runtime (12-factor).

## Implemented (Phase 6)

- **`infrastructure/docker/backend.Dockerfile`** — multi-stage (build → prod-deps → runtime) on `node:22-bookworm-slim` (glibc, so argon2 prebuilds load without a compile). Non-root `node` user, `HEALTHCHECK` against `/health` via Node's global `fetch`. Build context = repo root.
- **`infrastructure/docker/frontend.Dockerfile`** — Vite build → `nginx:1.27-alpine`. `VITE_API_BASE_URL` baked via build-arg. nginx config (`nginx/default.conf`) does SPA fallback, gzip, asset caching, and sets the **SPA CSP + security headers** (closes SF-6 at the edge; headers repeated per `location` because nginx `add_header` doesn't inherit into a location that defines its own).
- **`docker-compose.yml`** — `mongo` (healthchecked), `redis`, `mailpit`, `api`, `frontend`. `api` waits for `mongo` healthy. SPA on `:8080`, API on `:3000` (same-site localhost → cookies + CSP `connect-src` line up). Local runs `NODE_ENV=development` so cookies aren't `Secure` over plain HTTP.
- **Verified:** `docker compose up` → `/ready` reports `db:true`; full register → login → create todo → list round-trips; SPA serves with CSP headers and client-route fallback. One command: `make up`.

---

## 1. Goals

- **Parity:** local ≈ staging ≈ prod (same base images, same artifact).
- **Small & secure:** multi-stage, distroless/alpine, non-root user, no dev deps in runtime.
- **Reproducible:** pinned base image digests, lockfile installs.
- **Fast:** layer caching (deps before source), `.dockerignore`.

## 2. Backend Dockerfile (multi-stage, conceptual)

```
# Stage 1 deps      — install prod deps from lockfile
# Stage 2 build     — install all deps, tsc → dist/
# Stage 3 runtime   — node:alpine, copy prod deps + dist, non-root USER, HEALTHCHECK
```

- Runs as non-root `node` user.
- `HEALTHCHECK` hits `/health`.
- `NODE_ENV=production`; tini/`--init` for signal handling (graceful shutdown drains connections, closes Mongoose).

## 3. Frontend Dockerfile (multi-stage)

```
# Stage 1 build  — vite build → static assets
# Stage 2 serve  — nginx:alpine serving /dist, SPA fallback to index.html, gzip, cache headers
```

For AWS, the built assets are uploaded to **S3+CloudFront** instead of running Nginx — the Nginx image is for local/self-hosted parity.

## 4. Docker Compose — Local

`docker-compose.yml` services:
| Service | Purpose |
|---|---|
| `api` | backend (hot-reload via bind mount in dev) |
| `mongo` | local MongoDB (replica-set single node for transactions) |
| `redis` | optional cache/rate-limit (mirrors prod) |
| `mailhog` | catches outgoing email locally |
| `frontend` | vite dev server (or nginx for prod-like) |

- `.env` (gitignored) feeds config; `.env.example` documents keys.
- `depends_on` + healthchecks so `api` waits for `mongo` ready.
- `docker-compose.override.yml` adds dev-only bind mounts/hot reload.

## 5. Environment-specific Compose

`infrastructure/docker/compose/`:

- `docker-compose.dev.yml` — hot reload, mailhog, verbose logs.
- `docker-compose.staging.yml` — prod-like, real-ish config, no bind mounts.
- `docker-compose.prod.yml` — restart policies, resource limits, no source mounts, secrets from env injected by host.

## 6. Image Tagging & Registry

- Tag = **git SHA** (immutable) + `latest` per env channel.
- Pushed to **ECR**; scanned by Trivy in CI before push.
- Promotion = retag/redeploy the _same_ digest across envs.

## 7. Security

- Non-root user, read-only root filesystem where possible, drop capabilities.
- No secrets baked into images — injected at runtime via env from Secrets Manager.
- Minimal base; regular rebuilds for patches; Trivy gate on high/critical CVEs.
- `.dockerignore` excludes `.git`, `node_modules`, `.env`, tests, docs.

## 8. Local Workflow (Makefile targets)

```
make up        # docker compose up -d
make down      # stop
make logs      # tail api logs
make seed      # seed dev DB
make test      # run tests in container
make rebuild   # no-cache rebuild
```
