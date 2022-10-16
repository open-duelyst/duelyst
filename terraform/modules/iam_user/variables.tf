variable "name" {
  type        = string
  description = "Name of the IAM user and policy."
}

variable "allowed_actions" {
  type        = list(string)
  description = "List of IAM actions allowed for the user."
}

variable "allowed_resource" {
  type        = string
  description = "Target resource for allowed_actions."
  default     = "*"
}
