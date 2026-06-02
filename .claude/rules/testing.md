# Rule: Testing

- **Every feature ships with tests** (unit + integration as applicable). No "tests later."
- Coverage **≥ 80%** overall; **100%** on auth, RBAC, ownership, and token logic.
- Test **behavior**, not implementation; query by role/label on the frontend (a11y).
- Integration tests use ephemeral/isolated resources (in-memory/test-container Mongo, MSW) — no shared mutable state, no real cloud.
- Include **abuse paths**: cross-user access, invalid input, RBAC denial, rate-limit.
- E2E (Playwright) for core journeys must be deterministic (seeded data, retries, trace on failure).
- Coverage gate **fails the build** below target.

**Verified by:** CI coverage gate + QA review.
