# Skill: Docker

## Best Practices

- **Multi-stage builds**: deps → build → slim runtime. Alpine/distroless runtime.
- Order layers for caching: copy lockfile + install deps **before** copying source.
- Run as **non-root** user; add `HEALTHCHECK`; use `--init`/tini for signals.
- Install prod-only deps in the runtime stage; `NODE_ENV=production`.
- `.dockerignore` excludes `.git`, `node_modules`, `.env`, tests, docs.
- Pin base image by digest; rebuild for patches; Trivy-scan before push.
- Inject config/secrets at **runtime** (env), never bake into the image. Immutable tags = git SHA.

## Checklist

- [ ] Multi-stage; slim final image
- [ ] Non-root user; HEALTHCHECK present
- [ ] Deps cached before source copy
- [ ] No secrets baked in; `.dockerignore` complete
- [ ] Trivy scan clean (no high/critical)
- [ ] Graceful shutdown handles SIGTERM
- [ ] Compose healthchecks + depends_on ordering

## Anti-Patterns

- Single-stage images shipping dev deps + toolchain.
- Running as root; `latest` mutable tags in deploys.
- Baking `.env`/secrets into layers.
- `COPY . .` before installing deps (cache busting).
- No healthcheck; ignoring signal handling (zombie processes).

## Examples

- Backend stages: `deps` (prod install) · `build` (tsc) · `runtime` (copy dist + prod deps, USER node, HEALTHCHECK /health).
- Compose: `api` depends_on `mongo` (healthy), `redis`, `mailhog`; `.env` provides config.
