# Remote state in S3 with DynamoDB locking (docs/aws.md §9). Values are supplied
# via `-backend-config` at init time (the bucket/table are created out-of-band,
# once per account) so this file stays free of environment specifics:
#
#   terraform init \
#     -backend-config="bucket=<state-bucket>" \
#     -backend-config="key=todo/dev/terraform.tfstate" \
#     -backend-config="region=<region>" \
#     -backend-config="dynamodb_table=<lock-table>"
#
# For offline validation use: terraform init -backend=false
terraform {
  backend "s3" {}
}
