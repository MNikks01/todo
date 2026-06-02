# .claude/plugins/ — Integrations & Extensions

Documents external capabilities (MCP servers, integrations) the assistant may use, plus their scope and guardrails. Nothing here grants access by itself — actual wiring lives in Claude Code settings / MCP config. This folder records **what** we integrate and **why**.

## Candidate integrations

| Plugin/Integration     | Purpose                                     | Scope/Guardrails                                                  |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| GitHub (`gh`/MCP)      | PRs, issues, CI status, reviews             | Read/write to this repo only; no force-push to protected branches |
| AWS (MCP/CLI)          | Inspect resources, read CloudWatch, plan TF | **Read-mostly**; applies are gated/manual; least-privilege role   |
| MongoDB Atlas          | Inspect indexes, slow queries (non-prod)    | Read-only on non-prod; never prod creds in chat                   |
| Filesystem/Docs search | Navigate repo & docs                        | Local only                                                        |
| Playwright (MCP)       | Drive E2E / verify UI                       | Test env only                                                     |

## Rules

- Plugins must respect `rules/` (esp. security): no secrets in chat, least privilege, prod actions gated.
- Prefer **read-only** by default; mutating actions require explicit confirmation and an audit trail.
- Document any new integration here (purpose, scope, risks) before enabling — Documentation-First.

## Status

None enabled yet (Phase 0). Integrations are wired starting Phase 7 (CI/CD) and Phase 8 (AWS).
