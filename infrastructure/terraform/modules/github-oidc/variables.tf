variable "name" {
  type        = string
  description = "Name prefix for the IAM role."
}

variable "github_repository" {
  type        = string
  description = "GitHub repo in owner/name form, e.g. MNikks01/todo."
}

variable "create_oidc_provider" {
  type        = bool
  default     = true
  description = "Create the GitHub OIDC provider (set false if it already exists in the account)."
}

variable "ecr_repository_arns" {
  type        = list(string)
  default     = []
  description = "ECR repo ARNs the role may push to."
}

variable "spa_bucket_arn" {
  type        = string
  default     = ""
  description = "S3 bucket ARN for the SPA (empty = allow all, tighten in prod)."
}

variable "tags" {
  type    = map(string)
  default = {}
}
