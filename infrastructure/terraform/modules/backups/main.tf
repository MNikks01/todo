# Versioned backups bucket (docs/architecture.md §14, runbooks/restore.md A2).
# Holds mongodump archives + S3 exports. Lifecycle: transition to Glacier, then
# expire — bounding cost while keeping a recovery window.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
}

resource "aws_s3_bucket" "backups" {
  bucket        = var.bucket_name
  force_destroy = false
  tags          = var.tags
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket                  = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "archive-then-expire"
    status = "Enabled"
    filter {}

    transition {
      days          = var.glacier_after_days
      storage_class = "GLACIER"
    }
    expiration {
      days = var.expire_after_days
    }
    noncurrent_version_expiration {
      noncurrent_days = var.expire_after_days
    }
  }
}
