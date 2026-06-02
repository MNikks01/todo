# Terraform — Todo infrastructure

Provisions the **cheapest topology** (docs/aws.md §2, ADR-0004): one EC2 host
running Docker, MongoDB Atlas (out-of-VPC), S3+CloudFront for the SPA, ECR,
Secrets Manager, and a GitHub Actions OIDC deploy role.

```
modules/
  network/       VPC, public subnet, IGW, app security group
  compute/       EC2 (Graviton) + instance profile + user_data (Docker)
  ecr/           backend + frontend image repos
  storage/       S3 (private) + CloudFront (OAC) for the SPA
  secrets/       Secrets Manager app secret (JWT generated, MONGODB_URI seeded)
  github-oidc/   OIDC provider + least-privilege CI deploy role
environments/
  dev/           composes the modules for the dev environment
```

## Validate (no AWS account needed)

```bash
cd environments/dev
terraform init -backend=false
terraform validate
terraform fmt -recursive -check   # from infrastructure/terraform
```

## Provision (billable — your AWS account)

> Creating these resources **costs money** (~$15–25/mo, docs/aws.md §8). This is
> a deliberate spend decision.

1. One-time per account: create the remote-state S3 bucket + DynamoDB lock table.
2. `cp terraform.tfvars.example terraform.tfvars` and edit (unique bucket name, repo).
3. `terraform init -backend-config=...` (see `backend.tf`), then `terraform plan`.
4. Review the plan, then `terraform apply`.
5. Wire CI: set the GitHub repo variables from the outputs (`github_actions_role_arn`
   → `AWS_ROLE_ARN`, ECR URLs → `ECR_REGISTRY`, etc.) and `AWS_DEPLOY_ENABLED=true`
   (docs/cicd.md). Replace the seeded `MONGODB_URI` secret with the real Atlas URI.

See `infrastructure/aws/runbooks/deploy.md` for the full procedure.
