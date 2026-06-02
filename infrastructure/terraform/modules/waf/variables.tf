variable "name" {
  type = string
}

variable "alb_arn" {
  type        = string
  description = "ARN of the ALB to associate the Web ACL with."
}

variable "rate_limit" {
  type        = number
  default     = 2000
  description = "Max requests per 5-min per IP before blocking."
}

variable "tags" {
  type    = map(string)
  default = {}
}
