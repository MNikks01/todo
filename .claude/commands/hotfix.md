---
name: hotfix
description: Execute the enterprise hotfix/incident process for a production issue.
---

# /hotfix

**Purpose:** Resolve a production-impacting issue safely and fast, per `docs/hotfix-process.md`.

**Inputs:** incident description + severity.

**Agent:** DevOps/IC (lead) + Backend/Frontend + Security (if security-related).

**Steps**

1. **Detect & open incident** (ID, timeline, IC). Capture correlationIds/dashboards.
2. **Mitigate first** — rollback to previous image SHA / toggle flag / scale.
3. **RCA** — reproduce via logs+metrics; 5 Whys.
4. **Fix** on `hotfix/*` from `main`; minimal change + regression test.
5. **Verify** — full CI + staging smoke + security review if needed.
6. **Deploy** to prod (gated); back-merge to `develop`/`release/*`.
7. **Postmortem** (blameless, ≤48h) with action items.

**Output style:** incident timeline + postmortem template.

**Example:** `/hotfix SEV2 login returns 500 after deploy`.
