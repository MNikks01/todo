# scripts/CLAUDE.md

## Purpose

Cross-cutting developer and operations scripts. Thin, composable, idempotent.

## Structure

- `setup.sh` — first-time local setup.
- `dev/` — `seed-db`, `reset-db`, `gen-types`.
- `ci/` — `wait-for-it`, `coverage-merge`.
- `ops/` — `backup`, `restore`, `rotate-secret`, migrations.

## Responsibilities

- Automate repeatable local/CI/ops tasks invoked via the Makefile and CI.

## Dependencies

Node/npm, Docker, AWS CLI (ops), MongoDB tools.

## Coding Rules

- **Idempotent** and safe to re-run. Fail fast with clear messages (`set -euo pipefail`).
- **No secrets in scripts** — read from env/Secrets Manager. Destructive ops (`reset-db`, `restore`) require explicit confirmation/flag and never default to prod.
- Document each script's purpose + usage at the top.

## Testing Requirements

Ops scripts (backup/restore) validated in a DR drill (`infrastructure/aws/runbooks`). CI scripts exercised by the pipeline.
