# Rule: Documentation

- **Documentation-First.** Update docs/CLAUDE.md **with** the change, in the same PR — never after.
- Significant decisions get an **ADR** (`docs/adr/`); supersede rather than rewrite history.
- One **source of truth** per topic; cross-link instead of duplicating.
- New module/feature → create/maintain its `CLAUDE.md`.
- New endpoint → update `docs/api/openapi.yaml`.
- Keep doc headers (status/owner/date) current; use absolute dates.
- No secrets/PII in docs or examples.

**Verified by:** PR template checklist + Documentation agent review.
