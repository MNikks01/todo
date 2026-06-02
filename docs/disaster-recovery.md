# Disaster Recovery

> **Status:** Implemented (Phase 11) · Consolidates the DR strategy
> (architecture.md §14) with the concrete runbooks, automation, and drill cadence.

## Objectives

|                         | Cheap tier           | Prod-HA tier                 |
| ----------------------- | -------------------- | ---------------------------- |
| **RPO** (max data loss) | ≤ 24h (daily backup) | ≤ 1h (Atlas continuous/PITR) |
| **RTO** (recovery time) | ≤ 2h                 | ≤ 30m                        |

## What protects us

| Failure                 | Protection                                                                                                                         | Recover with                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| DB data loss/corruption | Atlas continuous backup (PITR) + `mongodump` archives in the versioned **backups bucket** (`modules/backups`, lifecycle → Glacier) | `runbooks/restore.md`            |
| Accidental delete       | Soft-delete (`deletedAt`) + S3 versioning                                                                                          | restore / un-version             |
| Host/task/AZ loss       | ECS multi-AZ + autoscaling (prod); fast IaC rebuild (cheap)                                                                        | redeploy / `terraform apply`     |
| Region loss             | IaC + immutable ECR images + DB backups                                                                                            | `runbooks/region-rebuild.md`     |
| Credential leak         | Secrets Manager + rotation; refresh reuse-detection                                                                                | `runbooks/rotate-keys.md`        |
| Bad deploy              | Immutable tags + CD rollback                                                                                                       | `rollback.yml` (docs/cicd.md §6) |

## Automation

- **Backups:** `scripts/ops/backup-db.sh` → versioned backups bucket (schedule via
  cron/EventBridge in the operating account). Atlas provides the primary continuous backup.
- **Restore:** `scripts/ops/restore-db.sh` (guarded, `--drop` to a target only).
- **Rotation:** `scripts/ops/rotate-jwt-secret.sh`.

## Runbooks

`infrastructure/aws/runbooks/`: `deploy.md`, `restore.md`, `rotate-keys.md`,
`region-rebuild.md`. Postmortem template: `docs/templates/postmortem.md`.

## Drill cadence (DoD)

Quarterly **game day**: execute `restore.md` §D against a throwaway cluster, point
a staging deploy at it, run the E2E suite, and **measure actual RTO/RPO vs
target**. File gaps as action items. An unrehearsed recovery will miss its RTO.
