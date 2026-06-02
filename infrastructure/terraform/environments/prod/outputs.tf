output "api_url" {
  value = module.alb.api_url
}

output "spa_url" {
  value = "https://${module.storage.cloudfront_domain}"
}

output "ecs_cluster" {
  value = module.ecs.cluster_name
}

output "ecs_service" {
  value = module.ecs.service_name
}

output "github_actions_role_arn" {
  value = module.github_oidc.role_arn
}

output "alerts_topic_arn" {
  value = module.observability.alerts_topic_arn
}

output "backups_bucket" {
  value = module.backups.bucket_name
}
