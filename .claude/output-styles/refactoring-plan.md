# Output Style: Refactoring Plan

```
# Refactoring Plan — <area> (<date>)
Author: Refactoring + QA

## Goal
<smell + desired end state. Behavior MUST NOT change.>

## Safety Net
<existing tests covering the area; characterization tests to add first>

## Steps (small, reversible)
1. ...
2. ...  (run tests after each)

## Behavior/Contract Invariance
<how we prove no API/behavior change: diffs, snapshots, tests>

## Risks
<...>

## Docs / ADR
<structure change → docs; decision change → ADR; else none>

## Definition of Done
- [ ] Tests green before & after
- [ ] No contract/behavior change
- [ ] Layering/rules satisfied
```
