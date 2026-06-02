output "role_arn" {
  value       = aws_iam_role.deploy.arn
  description = "Set this as the AWS_ROLE_ARN GitHub variable (docs/cicd.md)."
}
