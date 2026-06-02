output "vpc_id" {
  value = module.network.vpc_id
}

output "security_group_id" {
  value = module.network.app_security_group_id
}

output "instance_id" {
  value = aws_instance.app.id
}

output "spa_bucket" {
  value = aws_s3_bucket.spa.id
}

output "log_group" {
  value = aws_cloudwatch_log_group.api.name
}

output "ssm_parameter" {
  value = aws_ssm_parameter.jwt_secret.name
}
