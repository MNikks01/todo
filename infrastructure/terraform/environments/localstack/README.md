# LocalStack learning environment (₹0, zero-risk)

Runs the AWS-learning stack against **LocalStack** — a local AWS emulator. No real
AWS account is used, so **a bill is impossible**. Chosen per
`docs/aws-free-tier-learning-plan.md` for hands-on practice with no spend risk.

## Run it

```bash
make localstack-up        # start LocalStack (docker)
make localstack-apply     # terraform init + apply against it
# ... explore (terraform state list, terraform output) ...
make localstack-destroy   # tear down the stack
make localstack-down      # stop LocalStack
```

Terraform points at `http://localhost:4566` via the provider `endpoints` block
(`versions.tf`) with fake `test`/`test` credentials — nothing leaves your machine.

## What gets created (and what you learn)

| Resource                             | Service                 | You learn                                                |
| ------------------------------------ | ----------------------- | -------------------------------------------------------- |
| VPC, subnet, IGW, route table        | **VPC**                 | CIDR, public subnet, internet routing                    |
| Security group (80/443)              | **Security Groups**     | stateful firewall rules                                  |
| EC2 instance (mocked)                | **EC2**                 | instance + profile + SG wiring (LocalStack mocks the VM) |
| S3 bucket (versioned, private)       | **S3**                  | buckets, versioning, public-access block                 |
| IAM role + policy + instance profile | **IAM**                 | roles, least-privilege policies, instance profiles       |
| SSM SecureString parameter           | **SSM Parameter Store** | free secret/config storage (vs Secrets Manager)          |
| CloudWatch log group                 | **CloudWatch**          | log groups + retention                                   |

## Not included here

- **ECR** and **CloudFront/ACM/ALB/ECS** are LocalStack **Pro** features (Community
  returns 501). Learn those from the real modules via `terraform validate`
  (`infrastructure/terraform/modules/{ecr,storage,alb,ecs}`) or on the real AWS
  Free Tier (ECR = 500 MB/12mo; CloudFront = perpetual free tier).
- Verified end-to-end: `apply` then `destroy` cleanly creates/removes 15 resources.
