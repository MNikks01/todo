# backend/modules/auth/CLAUDE.md

## Purpose

Authentication: register, login, refresh-token rotation (with reuse detection), logout, logout-all. Issues access (JWT) + refresh tokens. Emits audit events.

## Architecture (Clean Architecture slice)

- `domain/` — `Credentials`, `RefreshToken` value objects, domain errors (`InvalidCredentials`, `TokenReuseDetected`).
- `application/` — `AuthService` orchestrating hashing, token issue/rotate, repository calls; DTOs.
- `infrastructure/` — `RefreshTokenRepository` (Mongoose), `TokenService` (sign/verify), `PasswordHasher` (argon2).
- `interface/` — router (`/api/v1/auth`), controller, Zod schemas (register/login/refresh).
- `auth.module.ts` — factory wiring deps (composition root).

## Responsibilities

- Hash/verify passwords (argon2id). Issue 15-min access JWT + 7-day opaque refresh (hashed at rest, TTL index).
- **Rotate** refresh on use; **detect reuse** → revoke token family; logout-all on password change.
- **CSRF for cookie endpoints** (`/refresh`, `/logout`): set a non-HttpOnly `csrfToken` cookie + validate the echoed `X-CSRF-Token` header (double-submit, constant-time), plus Origin check. Bearer-authorized routes are CSRF-immune (see `docs/security.md` §8.1).
- **Brute-force protection:** per-IP + per-account throttling with progressive delay and temporary lockout; generic errors only (`docs/security.md` §2.5).
- Audit: `auth.login.success/failure`, `auth.logout_all`, `auth.account_locked`, reuse detection.

## Dependencies

`core/logger`, `core/errors`, `infrastructure/security`, `infrastructure/database`, `users` module (read user). Config: JWT keys/TTLs from Secrets Manager.

## Coding Rules

- Controller validates + delegates only. No token logic in controllers.
- Generic auth errors (no enumeration). Rate-limited routes (stricter). **Never log passwords/tokens.**
- Constant-time compare via hashing lib; refresh stored hashed only.

## Testing Requirements

- **100% coverage.** Unit (service with mocked repos/token svc), integration (full flows incl. rotation, reuse detection → family revoke, logout-all, expiry, rate-limit). Abuse paths required.
