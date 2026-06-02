# Rule: TypeScript Strictness

- `tsconfig` runs in **`strict`** mode everywhere; `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess` on.
- **No `any`.** Use `unknown` + narrowing, generics, or precise types. `any` fails review.
- No `@ts-ignore`/`@ts-expect-error` without an adjacent comment explaining why + a tracking note.
- Public boundaries (API DTOs, function signatures) are explicitly typed — no inferred `any` escaping.
- Prefer discriminated unions over boolean flags for variant state.
- No unsafe casts (`as X`) to silence errors; fix the type.

**Verified by:** `tsc --noEmit` in CI + ESLint (`@typescript-eslint/no-explicit-any`: error).
