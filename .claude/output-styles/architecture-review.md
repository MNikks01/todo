# Output Style: Architecture Review

```
# Architecture Review — <scope> (<date>)
Reviewer: Architect | Phase: <n>

## Summary
<1–3 sentence verdict: Approved / Approved-with-conditions / Changes-required>

## What changed
<components/modules/contracts affected>

## Adherence Check
- Clean Architecture / layering: <pass/fail + notes>
- Feature/module boundaries: <...>
- State management split (RQ/Zustand): <...>
- Patterns justified (no gratuitous): <...>
- DRY/SOLID/KISS: <...>

## Tradeoffs & Risks
<key tradeoffs, scalability/perf risks, debt introduced>

## ADR
<new/updated ADR ids, or "none needed because ...">

## Required Actions (blocking)
1. ...

## Recommendations (non-blocking)
- ...

## Verdict
<Approved / Conditions / Changes-required>
```
