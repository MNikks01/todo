# .claude/rules/ — Project Rules (Guardrails)

Hard constraints that **always** apply. Rules are enforced by review, and by hooks/CI where automatable. Breaking a rule requires an explicit, documented exception (ADR) — not a silent override.

| Rule file                              | Enforces                                              |
| -------------------------------------- | ----------------------------------------------------- |
| [typescript.md](typescript.md)         | Strict TS, no `any`                                   |
| [architecture.md](architecture.md)     | Clean Architecture, layering, no logic in controllers |
| [validation.md](validation.md)         | Zod validation on all inputs                          |
| [security.md](security.md)             | authn/z, ownership, secrets, redaction                |
| [testing.md](testing.md)               | Tests required, coverage gates                        |
| [logging.md](logging.md)               | Structured logs, correlation IDs, no PII              |
| [error-handling.md](error-handling.md) | Typed errors, central handler, no leaks               |
| [documentation.md](documentation.md)   | Docs/ADR updated with changes                         |

## Precedence

Rules > convenience. If a rule and a request conflict, follow the rule and surface the conflict. Security rules are never relaxed for urgency — mitigate first (see `docs/hotfix-process.md`).
