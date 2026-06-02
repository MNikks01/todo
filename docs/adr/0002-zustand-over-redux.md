# ADR-0002: Zustand over Redux Toolkit for Client State

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, Frontend
- **Context tags:** frontend

## Context

React Query owns all **server** state (todos, current user) with caching, retries, and invalidation. The remaining **client** state is small: auth-UI flags, filters/sort/search, modals, theme. We need a state tool sized to that.

## Decision

Use **Zustand** for client UI state. React Query remains the sole owner of server state.

## Options Considered

1. **Zustand** — _Pro:_ ~1KB, minimal boilerplate, selective subscriptions, low learning curve, fits small client state. _Con:_ no first-class time-travel/action audit.
2. **Redux Toolkit** — _Pro:_ powerful devtools, structure, RTK Query. _Con:_ more boilerplate; RTK Query overlaps React Query (redundant); heavier for the little client state we have.
3. **Context only** — _Con:_ re-render issues, no good selector story for growing state.

## Consequences

- Positive: least ceremony, keeps focus on architecture; no server/client state duplication.
- Negative: if cross-feature, audited client state grows large, we lack Redux's tooling.
- Revisit trigger: complex, deeply shared, action-audited client state → migrate to RTK (documented here).

## Links

`docs/architecture.md` §5.1; `.claude/skills/react.md`.
