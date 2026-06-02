# .claude/output-styles/ — Output Templates

Standard formats so deliverables are consistent, comparable, and complete. Commands/agents produce output in the matching template.

| Style                                         | Used by                           |
| --------------------------------------------- | --------------------------------- |
| [architecture-review](architecture-review.md) | Architect, phase gates            |
| [security-review](security-review.md)         | `/security-audit`, Security agent |
| [pull-request-review](pull-request-review.md) | PR reviews                        |
| [feature-plan](feature-plan.md)               | `/plan`                           |
| [aws-review](aws-review.md)                   | `/aws-review`                     |
| [refactoring-plan](refactoring-plan.md)       | `/refactor`                       |

Each template lists required sections. Don't omit sections — write "N/A — reason" instead.
