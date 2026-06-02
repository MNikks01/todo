---
name: analyze
description: Understand a code area, feature, or problem before changing it. Read-only.
---

# /analyze

**Purpose:** Build an accurate mental model before any change. No edits.

**Inputs:** target area/feature/question.

**Agent:** Architect (lead), relevant domain agent.

**Steps**

1. Locate relevant files (folder-structure, module CLAUDE.md).
2. Map the flow across layers (interface→application→domain→infrastructure or feature slice).
3. Identify dependencies, contracts, invariants, and risks.
4. Note rule/architecture violations or tech debt.
5. Summarize: what exists, how it works, constraints, and options.

**Output style:** plain analysis summary (and `architecture-review` if structural).

**Example:** `/analyze how refresh token rotation works` → flow + storage + reuse detection + gaps.
