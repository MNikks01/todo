variable "region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region."
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "name" {
  type        = string
  default     = "todo-dev"
  description = "Name prefix for resources."
}

variable "github_repository" {
  type        = string
  description = "owner/name, e.g. MNikks01/todo (for the OIDC deploy role)."
}

variable "spa_bucket_name" {
  type        = string
  description = "Globally-unique S3 bucket name for the SPA."
}

variable "create_oidc_provider" {
  type        = bool
  default     = true
  description = "Create the GitHub OIDC provider (false if it already exists)."
}
