variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "api_domain" {
  type        = string
  description = "FQDN for the API, e.g. api.example.com."
}

variable "hosted_zone_name" {
  type        = string
  description = "Route53 hosted zone, e.g. example.com."
}

variable "tags" {
  type    = map(string)
  default = {}
}
