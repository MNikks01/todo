# Rule: Input Validation

- **Every external input is validated with Zod** at the interface boundary (body, params, query) before business logic.
- Reject unknown/extra keys (`.strict()`); coerce/parse types explicitly.
- Sanitize against NoSQL operator injection (strip `$`/`.` keys); never build queries from raw strings.
- Enforce bounds: string lengths, array sizes, pagination caps (max page size).
- Validation failures return a consistent, safe 400 shape — no internal details.
- Mongoose schema is a **second** gate, not the only one.
- Frontend validates for UX, but **server validation is authoritative.**

**Verified by:** integration tests for invalid input + review.
