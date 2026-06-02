# Rule: Logging

- **Structured JSON logs only** (Winston, JSON format). No `console.log` in production code.
- Every log line carries `correlationId` (via AsyncLocalStorage), `service`, `env`, `level`, `time`.
- **Never log** passwords, tokens, refresh tokens, auth headers, cookies, or raw PII (email masked/hashed). Redaction configured at the logger.
- Use correct levels: `info` normal, `warn` recoverable, `error` needs attention, `fatal` cannot continue.
- Log meaningful events (request in/out, errors, security/audit), not noise.
- Correlation ID returned to the client (esp. on errors) for support traceability.

**Verified by:** redaction unit test + review. See `docs/logging.md`.
