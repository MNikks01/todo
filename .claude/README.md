# .claude/ — Claude Code Operating System

This directory configures how Claude Code (and any AI assistant) operates in this repo. It encodes our **roles, rules, workflows, and output formats** so AI assistance is consistent, reviewable, and safe.

## Structure

| Folder           | Purpose                                                        | Usage                                                                |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `agents/`        | Specialized role definitions (Architect, Backend, Security, …) | Invoke a role for focused work; each defines scope, limits, workflow |
| `hooks/`         | Event-driven automation (pre/post tool, on commit)             | Enforce rules automatically (lint, secret-scan, doc checks)          |
| `plugins/`       | External/MCP integrations & extensions                         | Add capabilities (e.g., AWS, GitHub) when wired                      |
| `skills/`        | Best-practice playbooks (React, Node, AWS, …)                  | Reference before building in an area                                 |
| `commands/`      | Reusable prompts/workflows (`/analyze`, `/deploy`, …)          | One-word triggers for repeatable procedures                          |
| `rules/`         | Hard constraints (no `any`, validation required, …)            | Always-on guardrails                                                 |
| `output-styles/` | Templates for reviews/plans                                    | Consistent, comparable deliverables                                  |

## How it fits together

```
rules/         = what you must always do/not do (constraints)
skills/        = how to do it well (knowledge)
agents/        = who does it (roles + scope)
commands/      = repeatable procedures (verbs)
output-styles/ = how results are formatted (templates)
hooks/         = automatic enforcement (events)
plugins/       = extra capabilities (integrations)
```

## Principles

- **Documentation-First** — see root [CLAUDE.md](../CLAUDE.md).
- Agents have **explicit scope and limitations**; they don't act outside them.
- Commands produce output in the matching **output-style** and run the relevant **review** afterward.
- Rules are non-negotiable and checked by hooks/CI where possible.

Each subfolder has its own `README.md` with details and examples.
