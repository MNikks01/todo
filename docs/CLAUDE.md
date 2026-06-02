# docs/CLAUDE.md — Documentation Operating Guide

## Purpose

`docs/` is the **source of truth for design and rationale**. Documentation-First: docs change _before or with_ code, never after as an afterthought.

## Structure

- Strategy docs: `architecture.md`, `roadmap.md`, `folder-structure.md`, `security.md`, `database.md`, `aws.md`, `docker.md`, `cicd.md`, `git-strategy.md`, `hotfix-process.md`, `logging.md`, `monitoring.md`, `testing.md`.
- `adr/` — Architecture Decision Records (immutable history of decisions).
- `api/` — OpenAPI spec / endpoint reference (added when API lands).

## Rules

- **One source of truth per topic.** Cross-link, don't duplicate. If two docs disagree, fix it.
- **ADRs are append-only.** To change a decision, write a new ADR that supersedes the old (mark the old `Superseded by ADR-XXXX`).
- Keep `architecture.md` the index; deep dives link from it.
- Diagrams as **Mermaid** (versionable in git) where possible.
- Convert relative dates to absolute. Keep status/owner/date headers current.
- Every doc change is reviewable in a PR; significant ones run an Architecture Review.

## ADR Workflow

1. Copy `adr/0000-template.md` → `adr/NNNN-short-title.md`.
2. Status: Proposed → Accepted (or Rejected/Superseded).
3. Reference it from `architecture.md` §5 and any affected doc.

## Definition of Done (docs change)

Single source of truth preserved · cross-links resolve · ADR added/updated if a decision changed · headers current · no secrets/PII in examples.
