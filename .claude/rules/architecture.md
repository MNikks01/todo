# Rule: Architecture & Layering

- **Clean Architecture dependency rule:** inner layers never import outer. Domain has zero I/O imports.
- **No business logic in controllers.** Controllers: validate → call service → shape response.
- **Services depend on interfaces**, not concrete Mongoose repositories.
- **Mongoose stays in `infrastructure/`.** No Mongoose types past that layer — use DTOs/mappers.
- **Frontend feature isolation:** features import only from `shared/`, never from each other.
- **Server state → React Query; client UI state → Zustand.** Never duplicate server data in Zustand.
- Composition/wiring only at module factories (`*.module.ts`) and `app.ts`.
- New patterns require justification (`docs/architecture.md` §16) — no pattern-for-its-own-sake.

**Verified by:** review + ESLint `no-restricted-imports`/boundary rules + Architecture Review gate.
