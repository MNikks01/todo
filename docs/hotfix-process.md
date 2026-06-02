# Enterprise Hotfix Process

> **Status:** Draft v1.0 · **Owner:** On-call / Eng Lead · For urgent production defects requiring out-of-band fix.
> Speed **with** safety: minimal scope, full traceability, mandatory postmortem.

---

## 1. When to Use

A hotfix is for a **production-impacting** issue that cannot wait for the normal release train: outage, data-integrity bug, security vulnerability, or severe degradation. Everything else goes through the normal `develop` flow.

## 2. Severity

| Sev      | Definition                                  | Response                           |
| -------- | ------------------------------------------- | ---------------------------------- |
| **SEV1** | Outage / data loss / active security breach | Immediate, all-hands, page         |
| **SEV2** | Major feature broken, no workaround         | Hotfix within hours                |
| **SEV3** | Minor/with workaround                       | Next release, usually not a hotfix |

## 3. Process

### Step 1 — Detection

- Source: alarm (CloudWatch→SNS), synthetic canary, user report, error spike.
- Acknowledge; open an **incident** with an ID and a timeline doc. Assign an incident commander (IC).
- Capture the `correlationId`(s) and dashboards.

### Step 2 — Triage & Mitigate First

- Decide: **mitigate now** (rollback, feature-flag off, scale up, rate-limit) vs. fix-forward.
- **Rollback is the default mitigation** if a recent deploy caused it (`rollback.yml` → previous image SHA). Mitigation buys time; root cause comes next.

### Step 3 — Root Cause Analysis (RCA)

- Reproduce (use logs by correlation ID, metrics, recent diffs).
- Identify the true cause, not just the symptom (5 Whys).
- Document in the incident timeline as you go.

### Step 4 — Fix

- Branch `hotfix/<incident-id>-<slug>` **from `main`** (the live code), not `develop`.
- Smallest possible change. Add a **regression test** that fails before, passes after.
- Update relevant docs/ADR if behavior/architecture changed.

### Step 5 — Verification

- Full CI on the hotfix branch (lint, typecheck, tests, coverage, security scan).
- Deploy to **staging**; run smoke + the new regression test + targeted E2E.
- Security review if the fix touches auth/data/permissions.

### Step 6 — Deployment

- Merge `hotfix/*` → `main` (tag `vX.Y.(Z+1)`), gated approval.
- Deploy to prod (rolling/blue-green). Post-deploy smoke + watch dashboards.
- **Back-merge** `main` → `develop` (and any active `release/*`) so the fix isn't lost in the next release.

### Step 7 — Postmortem (blameless, within 48h)

- Use the template: summary, impact (users/time/$), timeline, root cause, detection gap, what went well, action items (owners + dates).
- Action items become tracked issues (e.g., add alarm, add test, fix runbook).
- Store in `docs/` / incident log.

## 4. Hotfix Branch Lifecycle

```
main ──●────────────●  v1.2.1 (deployed)
        \          /│
         hotfix/INC-42  ──► PR → CI → staging verify → merge
                         └─► back-merge into develop & release/*
```

## 5. Postmortem Template

```
# Postmortem — INC-<id>
Severity: SEVx | Date: | IC: | Duration:
## Summary
## Impact (users, duration, data, $)
## Timeline (UTC, with correlationIds)
## Root Cause
## Detection (how found, MTTD)
## Resolution & Mitigation
## What went well / What didn't
## Action Items (owner, due, tracking link)
```

## 6. Guardrails

- Never bypass CI/tests "because it's urgent" — mitigate first (rollback) to remove the time pressure, _then_ fix properly.
- Hotfixes are minimal; refactors wait.
- Every hotfix gets a regression test and a postmortem. No exceptions.
