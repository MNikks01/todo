variable "name" {
  type        = string
  description = "Name prefix (e.g. todo-dev)."
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "alert_email" {
  type        = string
  default     = ""
  description = "Email for SNS alerts (empty = no subscription created)."
}

variable "log_retention_days" {
  type        = number
  default     = 14
  description = "CloudWatch Logs retention (docs/logging.md §7)."
}

variable "error_5xx_threshold" {
  type        = number
  default     = 5
  description = "5xx count over 5 min that triggers the alarm."
}

variable "latency_p95_ms" {
  type        = number
  default     = 400
  description = "p95 latency (ms) alarm threshold (docs/architecture.md §3 NFR)."
}

variable "auth_failure_threshold" {
  type        = number
  default     = 50
  description = "Auth failures over 5 min indicating a possible attack."
}

variable "tags" {
  type    = map(string)
  default = {}
}
