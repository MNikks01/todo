---
name: test
description: Add or strengthen tests to meet coverage and abuse-path requirements.
---

# /test

**Purpose:** Reach test/coverage targets for an area.

**Inputs:** target feature/module.

**Agent:** QA (lead).

**Steps**

1. Enumerate behaviors + edge/abuse cases (auth, ownership, validation, rate-limit).
2. Add unit tests first, then integration (ephemeral resources/MSW), then E2E if a core journey.
3. Ensure determinism + isolation; add a11y assertions for UI.
4. Verify coverage ≥ 80% (100% auth/ownership); gate green.

**Output style:** test summary (cases added, coverage delta).

**Example:** `/test todos ownership` → cross-user denial + pagination bounds + soft-delete tests.
