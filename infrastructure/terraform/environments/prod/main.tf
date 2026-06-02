# Production-HA environment (docs/aws.md §3, ADR-0009). Composes the HA network,
# ALB+ACM, ECS Fargate service, WAF, plus the shared ecr/secrets/storage/
# observability/oidc modules. Authoring/validation only — apply is billable.

module "network" {
  source = "../../modules/network-ha"
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

module "alb" {
  source            = "../../modules/alb"
  name              = var.name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  api_domain        = var.api_domain
  hosted_zone_name  = var.hosted_zone_name
}

module "ecs" {
  source                = "../../modules/ecs"
  name                  = var.name
  environment           = var.environment
  region                = var.region
  vpc_id                = module.network.vpc_id
  private_subnet_ids    = module.network.private_subnet_ids
  alb_security_group_id = module.alb.alb_security_group_id
  target_group_arn      = module.alb.target_group_arn
  image_repository_url  = module.ecr.repository_urls["todo-backend"]
  app_secret_arn        = module.secrets.secret_arn
  cors_origins          = var.app_origin
}

module "waf" {
  source  = "../../modules/waf"
  name    = var.name
  alb_arn = module.alb.alb_arn
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
