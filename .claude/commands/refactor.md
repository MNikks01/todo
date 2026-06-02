---
name: refactor
description: Behavior-preserving cleanup — reduce duplication, fix layering, improve names/types.
---

# /refactor

**Purpose:** Improve internal quality without changing behavior or contracts.

**Inputs:** target area + smell/goal.

**Agent:** Refactoring (lead), QA (safety net).

**Steps**

1. Ensure tests cover the area (add characterization tests if missing).
2. Make small, reversible steps; run tests after each.
3. Verify no API/behavior change (diff contracts/snapshots).
4. Update docs only if structure changed; ADR if a decision changed.

**Output style:** [refactoring-plan](../output-styles/refactoring-plan.md).

**Example:** `/refactor extract duplicated todo validation into shared schema`.
