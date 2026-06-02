# Dev environment (cheapest topology) — composes the modules (docs/aws.md §2).
# Authoring/validation only; `apply` is a deliberate, billable action.

module "network" {
  source = "../../modules/network"
  name   = var.name
}

module "ecr" {
  source = "../../modules/ecr"
}

module "secrets" {
  source = "../../modules/secrets"
  name   = "todo/${var.environment}"
}

module "storage" {
  source      = "../../modules/storage"
  bucket_name = var.spa_bucket_name
}

module "compute" {
  source              = "../../modules/compute"
  name                = var.name
  environment         = var.environment
  subnet_id           = module.network.public_subnet_id
  security_group_id   = module.network.app_security_group_id
  ecr_repository_arns = module.ecr.repository_arns
  app_secret_arn      = module.secrets.secret_arn
}

module "github_oidc" {
  source               = "../../modules/github-oidc"
  name                 = var.name
  github_repository    = var.github_repository
  create_oidc_provider = var.create_oidc_provider
  ecr_repository_arns  = module.ecr.repository_arns
  spa_bucket_arn       = module.storage.bucket_arn
}

module "observability" {
  source      = "../../modules/observability"
  name        = var.name
  environment = var.environment
  region      = var.region
  alert_email = var.alert_email
}
