# .claude/agents/ — Specialized Agents

Each agent is a **role** with defined responsibilities, scope, limitations, workflows, and examples. Use the right agent for the task so work stays focused and within guardrails. Agents follow the root [CLAUDE.md](../../CLAUDE.md) and `rules/`.

## Roster

| Agent                             | Use for                                                 |
| --------------------------------- | ------------------------------------------------------- |
| [architect](architect.md)         | System design, ADRs, tradeoffs, cross-cutting decisions |
| [frontend](frontend.md)           | React feature work, UI, state, data fetching            |
| [backend](backend.md)             | Express modules, services, repositories, APIs           |
| [devops](devops.md)               | Docker, CI/CD, deployment, environments                 |
| [security](security.md)           | Threat modeling, auth, security reviews                 |
| [qa](qa.md)                       | Test strategy, test authoring, coverage                 |
| [documentation](documentation.md) | Docs, CLAUDE.md, ADRs, runbooks                         |
| [refactoring](refactoring.md)     | Safe restructuring without behavior change              |
| [aws](aws.md)                     | Terraform, AWS topology, cost, IAM                      |
| [monitoring](monitoring.md)       | Logging, metrics, alarms, dashboards, SLOs              |

## Common rules for all agents

- Stay within **scope**; if work crosses boundaries, hand off (name the agent) rather than overreach.
- Obey `rules/` and the relevant `skills/`.
- Produce output using the matching `output-styles/` template when applicable.
- Documentation-First: update docs/ADRs with changes.
- Never invent secrets, never weaken security to "make it work."
