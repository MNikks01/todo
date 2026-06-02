variable "name" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "target_group_arn" {
  type = string
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "image_repository_url" {
  type        = string
  description = "ECR repo URL for the backend image."
}

variable "image_tag" {
  type    = string
  default = "prod"
}

variable "app_secret_arn" {
  type        = string
  description = "Secrets Manager ARN holding JWT_ACCESS_SECRET + MONGODB_URI."
}

variable "cors_origins" {
  type        = string
  description = "Allowed SPA origin(s), e.g. https://app.example.com."
}

variable "task_cpu" {
  type    = number
  default = 512
}

variable "task_memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  type    = number
  default = 2
}

variable "max_count" {
  type    = number
  default = 6
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}
