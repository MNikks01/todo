# Logging Strategy

> **Status:** Draft v1.0 · **Owner:** Backend/DevOps · Structured JSON via **Winston**.
> Goal: every event traceable end-to-end by `correlationId`, zero PII/secrets in logs.

---

## 1. Principles

- **Structured, not strings.** One log line = one JSON object → machine-queryable in CloudWatch Logs Insights.
- **Contextual.** Every line carries `correlationId`, `service`, `env`, `level`, `time`.
- **Leveled.** Right signal at the right severity; noisy debug only in non-prod.
- **Safe.** Redact PII/secrets at the logger layer so it's impossible to forget at call sites.
- **Centralized config.** One logger (module singleton); request-scoped child loggers via AsyncLocalStorage.

---

## 2. Log Format (example shape)

Winston is configured with `format.combine(format.timestamp(), redactFormat(), format.json())`, producing:

```json
{
  "timestamp": "2026-06-02T10:00:00.000Z",
  "level": "info",
  "service": "todo-api",
  "env": "production",
  "correlationId": "01J...ULID",
  "traceId": "abc123",
  "userId": "65f...", // when authenticated
  "message": "todo.created",
  "route": "POST /api/v1/todos",
  "statusCode": 201,
  "durationMs": 42
}
```

`service`/`env` come from `defaultMeta`; `correlationId`/`userId` are merged in via the request-scoped `logger.child(...)` (AsyncLocalStorage).

## 3. Log Classes

| Class        | When                                             | Key fields                                       | Sink                                |
| ------------ | ------------------------------------------------ | ------------------------------------------------ | ----------------------------------- |
| **Request**  | every request (in/out)                           | method, route, status, durationMs, correlationId | CloudWatch                          |
| **Error**    | caught/uncaught errors                           | error name, message, stack (non-prod), code      | CloudWatch + alarm                  |
| **Security** | authz denials, rate-limit hits, suspicious input | actor, reason, ip                                | CloudWatch + alarm                  |
| **Audit**    | security-relevant business events                | action, actorId, targetId                        | `auditLogs` collection + CloudWatch |

## 4. Levels

Winston is configured with **custom levels** (`createLogger({ levels })`) to express the full policy below (rather than the default npm levels):
| Level | Use |
|---|---|
| `trace` | very detailed; local only |
| `debug` | dev diagnostics; non-prod |
| `info` | normal operations (default prod) |
| `warn` | recoverable anomalies (retry, deprecation, rate-limit) |
| `error` | failed operation needing attention |
| `fatal` | process cannot continue (boot failure) |
The active level is set per environment via config (`LOG_LEVEL`); `info` in production.

## 5. Correlation & Trace IDs

- **Correlation ID:** read incoming `x-request-id`/`x-correlation-id`; if absent, generate a ULID. Stored in **AsyncLocalStorage** so every downstream log/child logger includes it automatically. Returned to client in response header.
- **Trace ID:** if/when distributed tracing is added (OpenTelemetry), `traceId`/`spanId` propagate alongside. Reserved field now for forward compatibility.
- The correlation ID appears in API responses on error so users can quote it in support.

## 6. PII Redaction

A **custom Winston format** (`redactFormat`) runs before `format.json()` and deep-clones + scrubs the following keys anywhere in the log object (never logged in clear):

```
authorization        // headers
cookie               // headers
password
passwordHash
token
refreshToken
email                // mask or hash if correlation needed
```

The format walks nested objects and replaces matched keys with `"[REDACTED]"`, so redaction is enforced centrally at the logger layer — call sites cannot leak these even by accident. Emails, when needed for debugging, are masked (`j***@d***.com`) or hashed — never raw.

## 7. Pipeline

```
App (Winston Console transport → stdout, JSON)
  → Docker json-file / awslogs driver
  → CloudWatch Logs (log group per service per env)
  → CloudWatch Logs Insights (query by correlationId)
  → Metric filters → CloudWatch Alarms → SNS
```

- **Transports:** Console (stdout) in all environments — the container/agent ships stdout to CloudWatch (12-factor). A direct `winston-cloudwatch` transport is an option but stdout→agent is preferred for portability.
- **Local:** `format.combine(format.colorize(), format.simple())` for human-readable output.
- **Retention:** dev 7d, qa/staging 14d, prod 30–90d (cost-controlled), then export to S3 if needed.

## 8. What NOT to log

- Passwords, tokens, cookies, full auth headers, raw email/PII, full request bodies of auth endpoints, secrets, card/financial data (none here).

## 9. Testing & Verification

- Unit test the redaction config (assert secrets don't appear).
- Integration test asserts a `correlationId` round-trips request→log→response.
