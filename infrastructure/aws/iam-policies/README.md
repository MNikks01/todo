# IAM Policies

The **source of truth** for IAM is Terraform (`infrastructure/terraform/modules`),
which renders these policies via `aws_iam_policy_document`. This folder documents
the intent + least-privilege rationale (docs/security.md §7).

## GitHub Actions deploy role (`modules/github-oidc`)

Assumed via OIDC (no long-lived keys), trust scoped to `repo:<owner>/<repo>:*`.
Grants exactly what CD needs:

- **ECR:** auth token (all) + push/pull on the two project repo ARNs.
- **SSM:** `SendCommand` / `GetCommandInvocation` to drive the pull-and-restart deploy.
- **S3 + CloudFront:** publish the SPA and create invalidations.

## EC2 instance role (`modules/compute`)

- `AmazonSSMManagedInstanceCore` (Session Manager — no SSH).
- **ECR:** auth token + image pull on the project repos.
- **Secrets Manager:** `GetSecretValue` on the single app secret ARN only.

## Principles

Roles (not users); scoped to specific ARNs (no `*` resources except where the
API requires it, e.g. `ecr:GetAuthorizationToken`); OIDC over static keys; deny
by default. Tighten the SPA `s3:*` scope in prod (currently allows the bucket ARN).
