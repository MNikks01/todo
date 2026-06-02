# .claude/commands/ — Reusable Commands

Repeatable workflows triggered by a short verb. Each command defines its purpose, inputs, steps, the agent(s) it uses, and the output-style it produces. Commands obey `rules/` and run the relevant review afterward.

| Command                              | Purpose                                 |
| ------------------------------------ | --------------------------------------- |
| [/analyze](analyze.md)               | Understand code/area before changing it |
| [/plan](plan.md)                     | Produce a phased implementation plan    |
| [/implement](implement.md)           | Build a roadmap phase per the rules     |
| [/refactor](refactor.md)             | Behavior-preserving cleanup             |
| [/test](test.md)                     | Add/strengthen tests to meet gates      |
| [/security-audit](security-audit.md) | Run the security review                 |
| [/aws-review](aws-review.md)         | Review AWS/Terraform changes            |
| [/deploy](deploy.md)                 | Deploy an environment safely            |
| [/hotfix](hotfix.md)                 | Execute the incident/hotfix process     |

## Usage

Invoke by name (e.g., `/plan add notifications feature`). The command's doc lists steps and which **agent** and **output-style** it engages. Commands are composable: `/analyze` → `/plan` → `/implement` → `/test` → `/security-audit`.
