output "repository_urls" {
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
  description = "Map of repo name → URL."
}

output "repository_arns" {
  value = [for r in aws_ecr_repository.this : r.arn]
}
