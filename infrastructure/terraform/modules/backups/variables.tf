variable "bucket_name" {
  type        = string
  description = "Globally-unique S3 bucket name for backups."
}

variable "glacier_after_days" {
  type    = number
  default = 30
}

variable "expire_after_days" {
  type    = number
  default = 365
}

variable "tags" {
  type    = map(string)
  default = {}
}
