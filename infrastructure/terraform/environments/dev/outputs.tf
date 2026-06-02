output "app_host_ip" {
  value       = module.compute.public_ip
  description = "Elastic IP of the API host (point api.<domain> here)."
}

output "spa_url" {
  value       = "https://${module.storage.cloudfront_domain}"
  description = "Public SPA URL."
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "github_actions_role_arn" {
  value       = module.github_oidc.role_arn
  description = "Set as the AWS_ROLE_ARN GitHub variable."
}

output "app_secret_arn" {
  value = module.secrets.secret_arn
}
