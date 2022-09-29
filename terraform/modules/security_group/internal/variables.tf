variable "name" {
  type        = string
  description = "The name of this security group."
}

variable "description" {
  type        = string
  description = "The description of this security group."
  default     = "A security group with no ingress allowed."
}

variable "vpc_id" {
  type        = string
  description = "The VPC in which to create this security group."
}
