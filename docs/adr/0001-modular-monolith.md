# ADR-0001: Modular Monolith over Microservices

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect
- **Context tags:** architecture

## Context

The app is a learning vehicle operated by one engineer at low traffic. We want clean boundaries and future optionality without the operational cost of distributed systems.

## Decision

Build a **modular monolith**: a single deployable backend internally divided into feature modules (`auth`, `users`, `todos`) with explicit boundaries and Clean Architecture layering.

## Options Considered

1. **Modular monolith** — one deploy, clean internal boundaries. _Pro:_ simple ops, cheap, easy local dev, testable; preserves split-later optionality. _Con:_ discipline needed to keep boundaries.
2. **Microservices** — per-feature services. _Pro:_ independent scaling/deploy. _Con:_ massive ops/cost/complexity overhead unjustified at this scale; distributed debugging; a learning anti-goal.
3. **Single-layer monolith** (no modules) — _Con:_ turns into a big ball of mud; no path to split.

## Consequences

- Positive: low cost/ops, fast iteration, clear learning focus on architecture.
- Negative: boundaries enforced by convention + lint, not by network.
- Revisit trigger: a module needing independent scaling or team ownership at real scale.

## Links

`docs/architecture.md` §4–§7.
