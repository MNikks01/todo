# ADR-0005: React Query (TanStack Query) Owns Server State

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Frontend
- **Context tags:** frontend

## Context

The SPA must fetch, cache, synchronize, and mutate server data (todos, current user) with good UX: caching, background refetch, retries, request dedup, optimistic updates, and invalidation. We must also decide where this responsibility lives relative to client state (see ADR-0002).

## Decision

Use **TanStack Query (React Query)** as the **single owner of server state**. All API reads are queries; all writes are mutations that invalidate the relevant query keys. Server data is **never** copied into Zustand.

## Options Considered

1. **React Query (chosen)** — _Pro:_ purpose-built server-cache (staleness, retries, dedup, optimistic updates, invalidation), small surface, pairs cleanly with Zustand for client state. _Con:_ another concept to learn; query-key discipline required.
2. **Manual fetch + `useEffect` + local state** — _Pro:_ no dependency. _Con:_ reinvents caching/retries/dedup poorly; race conditions; boilerplate. Rejected.
3. **RTK Query** — _Pro:_ integrated if using Redux. _Con:_ pulls in Redux (rejected in ADR-0002) and overlaps React Query. Rejected.

## Consequences

- Positive: less client state, robust data UX, clear separation (server=RQ, client=Zustand).
- Negative: must standardize query-key structure + invalidation; cache config (`staleTime`/`gcTime`) per resource.
- Conventions: query keys are arrays (`['todos', filters]`); mutations call `invalidateQueries` on settle; optimistic updates roll back on error.

## Links

`docs/architecture.md` §5; ADR-0002; `.claude/skills/react.md`; `frontend/CLAUDE.md`.
