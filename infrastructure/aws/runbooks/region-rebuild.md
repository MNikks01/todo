# Runbook: Region Rebuild (full recovery from IaC)

> For region loss or catastrophic environment corruption. Everything is in
> Terraform + immutable images in ECR + DB backups, so the environment is
> reproducible (docs/architecture.md §14).

## Prerequisites

- Terraform state is in S3 (replicate the state bucket cross-region, or it is
  recreatable — the modules are declarative).
- Images exist in ECR (enable cross-region replication for true region-out DR).
- A recent DB backup/snapshot (Atlas is multi-region capable).

## Steps

1. **Pick the recovery region** and set `region` in the env tfvars.
2. **Provision:** from `environments/<env>`, `terraform init -backend-config=...`
   then `terraform apply` (recreates VPC, ALB, ECS/EC2, ECR, S3/CloudFront, WAF,
   secrets shell, observability).
3. **Secrets:** restore real values — set `MONGODB_URI` (restored cluster) and
   keep/rotate `JWT_ACCESS_SECRET` (restore.md A1 / rotate-keys.md A).
4. **Images:** ensure the target ECR has the image tags (replicate or re-push
   from CI: re-run `cd-<env>` / `cd-prod` digest promotion).
5. **Data:** restore the DB (restore.md A).
6. **DNS:** update Route53 (the `alb`/`storage` modules manage records; if the
   hosted zone is unaffected, alias records repoint automatically on apply).
7. **Deploy + verify:** run CD; confirm `/ready`, run E2E against the new URL.

## RTO/RPO

Target RTO ≤ 2h (cheap) / ≤ 30m (prod-HA after warm standby). Record actuals.
This is a **game-day** procedure — rehearse it; an unrehearsed rebuild will miss
the RTO.
