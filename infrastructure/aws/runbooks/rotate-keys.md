# Runbook: Key & Credential Rotation

> Scheduled (e.g. quarterly) and on suspected compromise (docs/security.md §5).
> All secrets live in Secrets Manager; nothing in code/images.

## A. JWT access secret (`JWT_ACCESS_SECRET`)

Rotating invalidates all existing **access tokens** immediately (signature no
longer verifies). Refresh tokens are opaque + DB-backed, so sessions survive via
refresh — but to be safe, plan to also revoke sessions on a suspected breach.

```bash
NEW=$(openssl rand -base64 48 | tr -d '\n')
scripts/ops/rotate-jwt-secret.sh <env> "$NEW"     # updates Secrets Manager
# roll the service so new tasks pick up the new secret:
aws ecs update-service --cluster todo-<env>-cluster --service todo-<env>-api --force-new-deployment
```

On suspected token theft, also force a global logout (clear refresh tokens) —
e.g. an admin/maintenance task that empties the `refreshTokens` collection, or
rely on reuse-detection (which already burns stolen families).

## B. MongoDB credentials (Atlas)

1. Atlas → Database Access → create a new user (or reset the password).
2. Update `MONGODB_URI` in Secrets Manager (see restore.md A1 step 3).
3. Roll the service. 4. Remove the old DB user once all tasks are healthy.

## C. AWS deploy role / OIDC

- No long-lived keys to rotate (OIDC). To revoke CI access, update the trust
  policy or delete the role (`modules/github-oidc`); re-`apply` to restore.

## D. Verify

- New deploy healthy (`/ready`); a fresh login issues a working access token.
- Old access tokens now 401 (expected after JWT rotation).
- Audit log shows the rotation window; no unexpected auth failures after.
