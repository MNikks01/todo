# Runbook: Provision & Deploy (cheapest tier)

> Audience: operator. Prereqs: AWS account, `aws` CLI configured, `terraform`,
> a MongoDB Atlas cluster, a registered domain (optional for the SPA).
> **Provisioning is billable** (~$15–25/mo, docs/aws.md §8).

## 1. One-time account bootstrap (remote state)

```bash
aws s3api create-bucket --bucket <state-bucket> --region <region>
aws s3api put-bucket-versioning --bucket <state-bucket> \
  --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name <lock-table> \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region <region>
```

## 2. Provision the environment

```bash
cd infrastructure/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars   # edit: region, repo, unique bucket
terraform init \
  -backend-config="bucket=<state-bucket>" \
  -backend-config="key=todo/dev/terraform.tfstate" \
  -backend-config="region=<region>" \
  -backend-config="dynamodb_table=<lock-table>"
terraform plan      # review
terraform apply     # billable
```

Capture the outputs: `github_actions_role_arn`, `ecr_repository_urls`,
`spa_url`, `app_host_ip`, `app_secret_arn`.

## 3. Real secrets

Replace the seeded `MONGODB_URI` in Secrets Manager with the Atlas connection
string (Atlas: allow the EC2 Elastic IP):

```bash
aws secretsmanager put-secret-value --secret-id todo/dev/app \
  --secret-string '{"JWT_ACCESS_SECRET":"<keep-or-rotate>","MONGODB_URI":"mongodb+srv://..."}'
```

## 4. Wire CI (docs/cicd.md)

Set GitHub **repository variables**: `AWS_DEPLOY_ENABLED=true`, `AWS_ROLE_ARN`
(=`github_actions_role_arn`), `AWS_REGION`, `ECR_REGISTRY` (registry host from the
ECR URLs), `API_BASE_URL`, `HEALTH_URL`. Create the `development`/`staging`/
`production` GitHub Environments (production = required reviewers).

## 5. First deploy

Merge to `develop` (or run `cd-dev` via dispatch). The CD job builds + pushes
images to ECR and runs the SSM deploy (writes compose + `.env` from Secrets
Manager on the host, `docker compose up -d`), then publishes the SPA to S3 +
invalidates CloudFront, and smoke-tests `/health`.

## 6. Verify

- `curl https://api.<domain>/health` → `{"status":"ok"}`
- Open `spa_url` → SPA loads, register/login works.

## Rollback / restore / rotate

- **Rollback:** `rollback.yml` (manual) → previous image tag (docs/cicd.md §6).
- **Restore / key rotation:** see sibling runbooks (added with the prod tier).
