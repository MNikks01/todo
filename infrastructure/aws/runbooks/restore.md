# Runbook: Restore (database & environment)

> Recovery objectives (docs/architecture.md §14): **RPO** ≤ 24h cheap / ≤ 1h prod;
> **RTO** ≤ 2h cheap / ≤ 30m prod. Run a restore **drill quarterly**.

## A. MongoDB restore

### A1. From Atlas (primary path — prod)

Atlas keeps continuous backups with point-in-time recovery (PITR).

1. Atlas UI → cluster → **Backup** → choose a snapshot or a PITR timestamp.
2. Restore to a **new** cluster (never overwrite the live one during triage).
3. Update the `MONGODB_URI` in Secrets Manager to the restored cluster:
   ```bash
   aws secretsmanager put-secret-value --secret-id todo/<env>/app \
     --secret-string "$(aws secretsmanager get-secret-value --secret-id todo/<env>/app \
       --query SecretString --output text | jq '.MONGODB_URI="<new-uri>"')"
   ```
4. Roll the service so it picks up the new secret (ECS: `aws ecs update-service
--force-new-deployment`; EC2: re-run the SSM deploy).

### A2. From an S3 export (secondary — `mongodump` archives)

Backups are produced by `scripts/ops/backup-db.sh` and stored versioned in the
backups bucket (lifecycle → Glacier).

```bash
scripts/ops/restore-db.sh s3://<backups-bucket>/mongo/<timestamp>.archive.gz "<target-mongodb-uri>"
```

The script downloads the archive and runs `mongorestore --gzip --archive --drop`
against the target. **`--drop` is destructive** — only run against a restore target.

## B. SPA restore

The SPA is rebuilt + re-published by CD, so the fastest restore is a redeploy.
Manual: `aws s3 sync ./dist s3://<spa-bucket> --delete` then
`aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`.
S3 versioning also allows object-level rollback.

## C. Verify (must pass to close the incident)

- `curl https://api.<domain>/ready` → `{"db":true}`.
- Log in as a known test account; list todos; create + delete one.
- Confirm data is at the expected recovery point (spot-check recent records).
- Record actual RPO/RTO achieved vs target in the incident timeline.

## D. Drill checklist (quarterly)

- [ ] Restore the latest backup to a throwaway cluster.
- [ ] Point a staging deploy at it; run the E2E suite (`PLAYWRIGHT_BASE_URL`).
- [ ] Measure RTO (start → healthy) and RPO (data gap); compare to targets.
- [ ] File any gaps as action items.
