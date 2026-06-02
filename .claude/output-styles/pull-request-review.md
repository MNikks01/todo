# Output Style: Pull Request Review

```
# PR Review — <title> (#<num>)
Reviewer: <agent> | Verdict: <Approve / Request changes / Comment>

## Summary
<what the PR does, in 1–2 sentences>

## Correctness
<bugs, edge cases, logic issues — or "none found">

## Rules & Architecture
- No `any` / strict types: <ok/issue>
- Layering / no logic in controllers: <...>
- Validation + authz + ownership: <...>
- Tests + coverage gate: <...>
- Logging + error handling: <...>
- Docs/ADR updated: <...>

## Suggestions (non-blocking)
- file:line — <suggestion>

## Blocking Issues
1. file:line — <must fix>

## Verdict
<Approve / Request changes>
```
