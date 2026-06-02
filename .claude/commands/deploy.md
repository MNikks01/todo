---
name: deploy
description: Deploy an environment safely via the pipeline, with verification and rollback readiness.
---

# /deploy

**Purpose:** Ship to an environment following `docs/cicd.md`. Same immutable image promoted across envs.

**Inputs:** target env (dev/qa/staging/prod) + image tag (git SHA).

**Agent:** DevOps (lead) + AWS.

**Steps**

1. Verify CI green (lint/typecheck/test/coverage/scan) for the SHA.
2. For prod: require approval; promote the **staging-validated** digest (no rebuild).
3. Deploy (rolling/blue-green or instance refresh / SSM).
4. Smoke test `/ready` + happy-path; watch dashboards.
5. On failure → `/hotfix` mitigation (rollback to previous SHA).

**Output style:** deploy summary (env, SHA, health, rollback tag).

**Example:** `/deploy staging 9af3c1`.
