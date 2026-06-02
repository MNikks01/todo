# ADR-0008: Winston for Structured Logging

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Backend, DevOps
- **Context tags:** backend, observability

## Context

We need structured (JSON) application logging with: a single shared logger, request-scoped child loggers carrying a `correlationId` (via AsyncLocalStorage), centralized PII/secret redaction, environment-driven levels, and a clean path to CloudWatch. (Supersedes the earlier draft choice of Pino.)

## Decision

Use **Winston** as the logging library. Configure a module-singleton logger with `format.combine(timestamp(), redactFormat(), json())`, `defaultMeta` for `service`/`env`, custom levels (`trace…fatal`), and a **Console transport** to stdout. Request-scoped context is added via `logger.child({ correlationId, userId })` resolved from AsyncLocalStorage. Redaction is a **custom format** that scrubs `authorization`, `cookie`, `password`, `passwordHash`, `token`, `refreshToken`, `email` anywhere in the payload.

## Options Considered

1. **Winston (chosen)** — _Pro:_ mature, flexible transports/formats, large ecosystem, easy custom redaction format + custom levels, `child()` support, stdout→CloudWatch via agent. _Con:_ heavier and slower than Pino; redaction is hand-rolled (not built-in).
2. **Pino** — _Pro:_ fastest, low overhead, built-in `redact` paths, `pino-pretty`. _Con:_ team chose Winston for familiarity/flexibility; performance difference is immaterial at this app's scale.
3. **console + JSON.stringify** — _Con:_ no levels/redaction/child context; unstructured discipline. Rejected.

## Consequences

- Positive: flexible formatting/transports, centralized redaction, correlation context, env-driven levels; logs ship to CloudWatch via stdout (12-factor) with optional `winston-cloudwatch` transport.
- Negative: must **unit-test the redaction format** (no built-in guarantee); slightly higher overhead than Pino (acceptable).
- Enforcement: `rules/logging.md`, redaction unit test, no `console.log` in prod code.

## Links

`docs/logging.md`; `docs/security.md` §10; `.claude/skills/security.md`; `.claude/rules/logging.md`.
