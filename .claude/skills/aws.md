# Skill: AWS

## Best Practices

- **IaC only** (Terraform); remote state in S3 + DynamoDB lock. Per-env workspaces/dirs.
- **Least-privilege IAM**: roles not users; scope to specific ARNs; no `*` resources; GitHub OIDC for CI.
- **Network**: VPC with public (ALB/NAT) + private (app/DB egress) subnets across ≥2 AZs (prod). Only ALB public; **no public DB**.
- **Security groups** reference other SGs, not broad CIDRs. No open SSH — use SSM.
- **Secrets** in Secrets Manager; fetched at boot; TF outputs marked sensitive.
- **TLS** via ACM (CloudFront cert in us-east-1). **Cost**: Graviton, savings plans, NAT instance vs gateway, non-prod scale-to-zero, log retention caps.
- Immutable images in ECR; scan before deploy. CloudWatch alarms → SNS.

## Checklist

- [ ] Resource defined in Terraform (no click-ops)
- [ ] IAM scoped (no wildcards), roles/OIDC
- [ ] SGs least-access; DB not public; SSH via SSM
- [ ] Secrets in Secrets Manager; sensitive outputs
- [ ] Multi-AZ where prod; health checks
- [ ] tfsec/checkov clean; cost estimated
- [ ] Diagrams + runbooks updated

## Anti-Patterns

- Console-created prod resources; long-lived access keys in CI.
- `0.0.0.0/0` on app/DB SGs; publicly reachable database.
- Wildcard IAM policies; secrets in TF state output or env files.
- Single-AZ prod without acceptance; NAT gateway when a NAT instance suffices for cost.

## Examples

- Cheap: EC2 t4g.small + Caddy TLS + Docker, Atlas, S3/CloudFront, Route53, ACM, Secrets Manager.
- Prod: ALB+ACM+WAF, ECS Fargate (2 tasks, autoscale), private subnets, NAT, CloudWatch dashboards/alarms.
- OIDC: GitHub Actions assumes a scoped deploy role — zero static keys.
