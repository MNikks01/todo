output "bucket_name" {
  value = aws_s3_bucket.spa.id
}

output "bucket_arn" {
  value = aws_s3_bucket.spa.arn
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.spa.domain_name
  description = "Public SPA URL (https://<this>)."
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.spa.id
}
