# Skill: Testing

## Best Practices

- Test pyramid: many unit, fewer integration, fewest E2E. Bias toward fast tests.
- Test **behavior**, not implementation. Arrange-Act-Assert; one behavior per test; descriptive names.
- Backend: unit (services with mocked repos), integration (route→DB via `mongodb-memory-server`/container), API (Supertest). Frontend: unit (hooks/utils), component (RTL, query by role/label), integration (MSW).
- Deterministic: seed data, fake timers, controlled ids; isolate DB per test.
- Cover **abuse paths**: cross-user access, RBAC denial, invalid input, rate-limit, token reuse.
- E2E (Playwright) for core journeys; trace on failure; retries for known flakiness.
- Enforce coverage in CI (≥80%, 100% auth/ownership).

## Checklist

- [ ] Unit tests for logic; mocks at boundaries
- [ ] Integration with ephemeral resources
- [ ] Abuse/edge cases covered (auth/ownership/validation)
- [ ] a11y assertions on core UI flows
- [ ] Deterministic (no real network/time/random)
- [ ] Coverage gate green

## Anti-Patterns

- Testing implementation details / snapshots of everything.
- Shared mutable DB state across tests; order-dependent tests.
- Mocking so much that nothing real is verified.
- Skipping ownership/authz tests ("happy path only").
- Flaky E2E left with blanket retries instead of fixing root cause.

## Examples

- Ownership: `it('returns 404 when user B fetches user A todo')`.
- Auth: integration test for refresh rotation + reuse-detection family revoke.
- Frontend: `userEvent.click(getByRole('button', { name: /add/i }))` → asserts optimistic item, then settled.
