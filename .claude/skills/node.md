# Skill: Node.js / Express

## Best Practices

- Clean Architecture layers; **thin controllers** (validate → service → respond). Logic in services.
- App factory (`app.ts`) without `listen` for testability; `main.ts` boots (connect DB, listen, graceful shutdown).
- Middleware order: correlationId → requestLogger → security (helmet/cors) → rate-limit → body parse (size-limited) → routes → 404 → error handler (last).
- `asyncHandler` wrapper so async rejections reach the error middleware.
- Typed `AppError` hierarchy; central error mapping; no internal leakage.
- Config validated with Zod at boot (fail fast). Single Mongoose connection (singleton). Structured logging (Winston, JSON format) + AsyncLocalStorage correlation context.
- Graceful shutdown on SIGTERM: stop accepting, drain, close DB.

## Checklist

- [ ] Controller has no business logic
- [ ] Inputs validated (Zod) at boundary
- [ ] authn + authz + ownership enforced
- [ ] Errors typed + central handler; nothing leaks
- [ ] Structured logs + correlationId; no PII/secrets
- [ ] Rate limiting on sensitive routes
- [ ] Graceful shutdown wired
- [ ] No `any`; DTOs at boundaries; Mongoose not leaked

## Anti-Patterns

- Business logic / DB calls in controllers.
- `try/catch` swallowing errors; unhandled promise rejections.
- Multiple DB connections; global mutable state.
- Building queries from raw user input; trusting client IDs.
- `console.log` in prod; secrets in env files committed to git.

## Examples

- **Module factory:** `createTodosModule({ db, logger })` wires repo→service→controller→router.
- **Error handler:** maps `NotFoundError`→404, `ValidationError`→400, unknown→500 (logged, generic body).
- **Ownership:** `repo.findByIdForUser(id, userId)` returns null → controller 404.
