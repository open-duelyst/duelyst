variable "name" {
  type        = string
  description = "The name of the ALB."
}

variable "security_groups" {
  type        = list(string)
  description = "The security groups to use for this ALB."
}

variable "subnets" {
  type        = list(string)
  description = "The subnets to use for this ALB."
}
