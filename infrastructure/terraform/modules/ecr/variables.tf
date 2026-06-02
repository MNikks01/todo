variable "repository_names" {
  type        = list(string)
  default     = ["todo-backend", "todo-frontend"]
  description = "ECR repositories to create."
}

variable "keep_last_images" {
  type        = number
  default     = 10
  description = "Number of images to retain per repository."
}

variable "force_delete" {
  type        = bool
  default     = false
  description = "Allow deleting repositories that still contain images."
}

variable "tags" {
  type    = map(string)
  default = {}
}
