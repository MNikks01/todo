---
name: plan
description: Produce a phased, reviewable implementation plan for a feature or change.
---

# /plan

**Purpose:** Turn a request into a concrete, sequenced plan before coding.

**Inputs:** feature/change description + constraints.

**Agent:** Architect (lead) + relevant domain agent.

**Steps**

1. Restate goal + acceptance criteria.
2. Identify affected modules/features, contracts, data model, and indexes.
3. Break into steps/phases with dependencies and risks.
4. Note security, testing, and doc/ADR impact.
5. Define Definition of Done.

**Output style:** [feature-plan](../output-styles/feature-plan.md).

**Example:** `/plan add due-date reminders` → module impact, schema/index changes, jobs, risks, tests, ADR need.
