terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
}

# Point the AWS provider at LocalStack (http://localhost:4566). Credentials are
# fake and never leave the machine — no real AWS account, so a bill is impossible.
provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    ec2        = "http://localhost:4566"
    s3         = "http://localhost:4566"
    iam        = "http://localhost:4566"
    sts        = "http://localhost:4566"
    ecr        = "http://localhost:4566"
    logs       = "http://localhost:4566"
    cloudwatch = "http://localhost:4566"
    ssm        = "http://localhost:4566"
  }

  default_tags {
    tags = {
      project = "todo"
      env     = "localstack"
      managed = "terraform"
    }
  }
}
