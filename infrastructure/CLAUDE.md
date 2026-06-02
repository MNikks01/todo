# infrastructure/CLAUDE.md — Infrastructure Operating Guide

Refines root [CLAUDE.md](../CLAUDE.md) for Docker, Terraform, and AWS.

## Purpose

Reproducible, secure infrastructure: container images, local/staging/prod compose, and AWS provisioning via Terraform. Reference docs: [docs/aws.md](../docs/aws.md), [docs/docker.md](../docs/docker.md), [docs/cicd.md](../docs/cicd.md).

## Layout

- `docker/` — multi-stage Dockerfiles (backend, frontend), Nginx config, env-specific compose.
- `terraform/` — `modules/` (network, compute, alb, storage, dns, secrets, ecr, observability) + `environments/{dev,qa,staging,prod}`.
- `aws/` — IAM policy docs, architecture diagrams, runbooks.

## Rules

- **IaC only** — no click-ops in prod. Every cloud resource is in Terraform. Remote state in S3 + DynamoDB lock.
- **Least privilege** — instance/task roles, scoped policies (specific ARNs), GitHub OIDC for CI. No long-lived keys.
- **No public database**; only ALB is public. Security groups reference each other, not CIDRs, where possible.
- **No secrets in code/state output** — use Secrets Manager; mark TF outputs sensitive.
- **Immutable images** (git SHA tags) in ECR; Trivy-scanned before deploy.
- **Two topologies** maintained: cheapest (EC2+compose) and prod-HA (ALB+ECS/ASG). Selected via TF variables/workspaces.
- **Parity** — same images across envs; only config/secrets differ.

## Change Process

- `terraform plan` on PR (CI) — review the diff. `apply` is gated/manual for staging/prod.
- Networking/IAM changes get a **Security Review** (`.claude/output-styles/security-review`).
- Update diagrams + runbooks with any topology change; ADR for significant infra decisions.

## Testing/Validation

- `terraform validate` + `tflint` + `checkov`/`tfsec` in CI.
- Post-apply smoke (health endpoints), and DR restore drill per `aws/runbooks`.

## Definition of Done

IaC updated · least-privilege verified · no secrets leaked · scans (tfsec/checkov/Trivy) pass · diagrams/runbooks/ADR updated · cost impact noted.
