---
name: security-audit
description: Run the security review against a change or the whole system.
---

# /security-audit

**Purpose:** Find and rank security issues; confirm controls are present.

**Inputs:** change/PR or "full system".

**Agent:** Security (lead).

**Steps**

1. Determine attack-surface delta; update threat model if needed.
2. Check authn + authz + ownership + validation + rate limiting.
3. Check secrets handling, log redaction, error leakage, headers/CORS/TLS.
4. Run scans (npm audit, Trivy, CodeQL, gitleaks); review results.
5. Map to OWASP Top 10; list findings by severity with required fixes.

**Output style:** [security-review](../output-styles/security-review.md).

**Example:** `/security-audit new admin endpoints`.
