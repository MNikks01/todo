# Application secrets (docs/security.md §5). The JWT signing secret is generated
# here; MONGODB_URI is seeded as a placeholder and updated out-of-band (Atlas).
# `ignore_changes` keeps Terraform from reverting manually-rotated values.

terraform {
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.60" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

resource "random_password" "jwt_access_secret" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "app" {
  name        = "${var.name}/app"
  description = "Todo app runtime secrets (${var.name})"
  tags        = var.tags
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    JWT_ACCESS_SECRET = random_password.jwt_access_secret.result
    MONGODB_URI       = var.mongodb_uri_placeholder
  })

  lifecycle {
    ignore_changes = [secret_string] # values rotated out-of-band after creation
  }
}
