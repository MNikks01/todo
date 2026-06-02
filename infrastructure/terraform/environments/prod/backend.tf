# Remote state (see environments/dev/backend.tf for the init -backend-config form).
# Offline validation: terraform init -backend=false
terraform {
  backend "s3" {}
}
