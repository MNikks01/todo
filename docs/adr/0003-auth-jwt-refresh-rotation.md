# ADR-0003: JWT Access Tokens + Rotating Refresh Tokens

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Security
- **Context tags:** security, backend

## Context

We need stateless, scalable authentication for a horizontally-scalable API, while retaining the ability to revoke sessions and resist token theft.

## Decision

Issue a **short-lived access JWT (15 min)** for stateless authorization, plus a **long-lived opaque refresh token (7 days)** stored **hashed** in MongoDB with a TTL index. Refresh tokens **rotate** on each use, with **reuse detection** that revokes the whole token family on replay. Refresh token is delivered as an `HttpOnly; Secure; SameSite=Strict` cookie; the access token lives in browser memory.

## Options Considered

1. **Access JWT + rotating refresh (chosen)** — _Pro:_ stateless reads, revocable sessions, theft detection. _Con:_ refresh store + rotation complexity.
2. **Stateful server sessions** — _Pro:_ instant revocation. _Con:_ shared session store, less stateless, scaling friction.
3. **Long-lived JWT only** — _Con:_ cannot revoke; large theft window. Rejected.

## Consequences

- Positive: scalable, revocable, theft-resilient; access token not exposed to XSS via storage.
- Negative: must implement rotation/reuse detection carefully (100% test coverage required).
- Revisit trigger: need for instant access-token revocation → introduce short denylist/JTI check.

## Links

`docs/security.md` §2; `backend/src/modules/auth/CLAUDE.md`.
