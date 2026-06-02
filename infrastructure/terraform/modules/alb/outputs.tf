output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "alb_arn" {
  value = aws_lb.this.arn
}

output "alb_arn_suffix" {
  value       = aws_lb.this.arn_suffix
  description = "For CloudWatch ALB metrics."
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "target_group_arn" {
  value = aws_lb_target_group.app.arn
}

output "api_url" {
  value = "https://${var.api_domain}"
}
