---
name: implement
description: Build one roadmap phase/feature following all rules. Code + tests + docs.
---

# /implement

**Purpose:** Execute an approved plan/phase. **Only runs once Phase 0 docs are complete and the phase is current** (`docs/roadmap.md`).

**Inputs:** the plan/phase to build.

**Agent:** Backend and/or Frontend (lead), QA (tests), Documentation.

**Steps**

1. Confirm the phase is current and dependencies are met. Don't jump ahead.
2. Implement per Clean Architecture / feature slices and `rules/`.
3. Add validation, authz/ownership, logging, error handling.
4. Write tests (unit + integration), meet coverage gates.
5. Update docs/CLAUDE.md; add ADR if a decision changed.
6. Run lint/typecheck/tests, then `/security-audit` and Architecture Review.

**Output style:** implementation summary + checklist (root CLAUDE.md DoD).

**Example:** `/implement Phase 2 auth module`.
