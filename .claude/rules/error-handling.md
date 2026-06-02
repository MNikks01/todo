# Rule: Error Handling

- Use **typed errors** (`AppError` subclasses: `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`).
- A **single central error middleware** (registered last) maps errors → safe HTTP responses.
- **Never leak internals** (stack traces, DB errors, secrets) to clients. Stack traces only in non-prod logs.
- **No swallowed errors** — never `catch {}` silently; log with context or rethrow.
- Async route handlers wrapped (`asyncHandler`) so rejections reach the error middleware.
- Distinguish expected (4xx, domain) from unexpected (5xx) errors; alarm on 5xx.
- Frontend: handle loading/error/empty states explicitly; no unhandled promise rejections.

**Verified by:** integration tests asserting safe error shapes + review.
