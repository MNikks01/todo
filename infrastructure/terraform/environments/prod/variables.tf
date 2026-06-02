variable "region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "name" {
  type    = string
  default = "todo-prod"
}

variable "github_repository" {
  type        = string
  description = "owner/name for the OIDC deploy role."
}

variable "spa_bucket_name" {
  type        = string
  description = "Globally-unique S3 bucket name for the SPA."
}

variable "hosted_zone_name" {
  type        = string
  description = "Route53 hosted zone, e.g. example.com."
}

variable "api_domain" {
  type        = string
  description = "API FQDN, e.g. api.example.com."
}

variable "app_origin" {
  type        = string
  description = "SPA origin for CORS, e.g. https://app.example.com."
}

variable "alert_email" {
  type    = string
  default = ""
}

variable "create_oidc_provider" {
  type    = bool
  default = false # usually already created by the dev environment
}
