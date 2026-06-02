variable "name" {
  type        = string
  description = "Name prefix."
}

variable "environment" {
  type        = string
  description = "Environment tag value (dev|qa|staging|prod) — used for SSM targeting."
}

variable "subnet_id" {
  type        = string
  description = "Public subnet to launch into."
}

variable "security_group_id" {
  type        = string
  description = "App security group id."
}

variable "instance_type" {
  type        = string
  default     = "t4g.small"
  description = "EC2 instance type (ARM/Graviton)."
}

variable "root_volume_gb" {
  type    = number
  default = 20
}

variable "ecr_repository_arns" {
  type        = list(string)
  default     = []
  description = "ECR repos the instance may pull."
}

variable "app_secret_arn" {
  type        = string
  description = "Secrets Manager ARN the instance may read."
}

variable "tags" {
  type    = map(string)
  default = {}
}
