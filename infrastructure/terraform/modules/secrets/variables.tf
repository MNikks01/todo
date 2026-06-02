variable "name" {
  type        = string
  description = "Secret name prefix, e.g. todo/dev."
}

variable "mongodb_uri_placeholder" {
  type        = string
  default     = "mongodb+srv://REPLACE_ME"
  description = "Initial MONGODB_URI value; replace out-of-band with the real Atlas URI."
}

variable "tags" {
  type    = map(string)
  default = {}
}
