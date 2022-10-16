variable "name" {
  type        = string
  description = "Name of the IAM user and policy."
}

variable "allowed_actions" {
  type        = string
  description = "Comma-separated list of permissions."
}

variable "allowed_resource" {
  type        = string
  description = "Target resource for allowed_actions."
  default     = "*"
}
