# LocalStack learning environment. Exercises the core services you want to learn
# (IAM, VPC, Security Groups, EC2, S3, ECR, CloudWatch, SSM) against the local
# emulator. Reuses the real `network` + `ecr` modules; other resources are inline
# and kept to LocalStack-community-supported services (no CloudFront/ALB/ECS).

# --- VPC + subnet + IGW + Security Group (real module) ---
module "network" {
  source = "../../modules/network"
  name   = "todo-localstack"
}

# NOTE: ECR is a LocalStack *Pro* feature (Community returns 501), so it is not
# created here. Learn ECR from `modules/ecr` (terraform validate) or on the real
# AWS Free Tier (500 MB/12mo). Everything else below runs in Community.

# --- S3: a private, versioned bucket (object storage basics) ---
resource "aws_s3_bucket" "spa" {
  bucket        = "todo-localstack-spa"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "spa" {
  bucket = aws_s3_bucket.spa.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "spa" {
  bucket                  = aws_s3_bucket.spa.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- IAM: an app role with a least-privilege inline policy ---
data "aws_iam_policy_document" "assume_ec2" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "todo-localstack-app"
  assume_role_policy = data.aws_iam_policy_document.assume_ec2.json
}

resource "aws_iam_role_policy" "app" {
  name = "todo-localstack-app"
  role = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:GetObject", "s3:ListBucket"], Resource = [aws_s3_bucket.spa.arn, "${aws_s3_bucket.spa.arn}/*"] },
      { Effect = "Allow", Action = ["ssm:GetParameter", "ssm:GetParameters"], Resource = "*" },
    ]
  })
}

resource "aws_iam_instance_profile" "app" {
  name = "todo-localstack-app"
  role = aws_iam_role.app.name
}

# --- SSM Parameter Store: config/secret as a SecureString ---
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/todo/localstack/JWT_ACCESS_SECRET"
  type  = "SecureString"
  value = "localstack-dev-secret-not-real-0123456789"
}

# --- CloudWatch Logs: where app logs would ship ---
resource "aws_cloudwatch_log_group" "api" {
  name              = "/todo/localstack/api"
  retention_in_days = 7
}

# --- EC2: a (mock) instance in the public subnet using the app SG + profile ---
resource "aws_instance" "app" {
  ami                    = var.mock_ami_id
  instance_type          = "t3.micro"
  subnet_id              = module.network.public_subnet_id
  vpc_security_group_ids = [module.network.app_security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.app.name
  tags                   = { Name = "todo-localstack-host", app = "todo", env = "localstack" }
}
