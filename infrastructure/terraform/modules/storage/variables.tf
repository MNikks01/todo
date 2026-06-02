variable "bucket_name" {
  type        = string
  description = "Globally-unique S3 bucket name for the SPA."
}

variable "force_destroy" {
  type        = bool
  default     = false
  description = "Allow destroying a non-empty bucket."
}

variable "tags" {
  type    = map(string)
  default = {}
}
