variable "name" {
  type        = string
  description = "The name of this security group."
}

variable "description" {
  type        = string
  description = "The description of this security group."
}

variable "vpc_id" {
  type        = string
  description = "The VPC in which to create this security group."
}

variable "ingress_configs" {
  type = list(object)
  description = "A list of ingress config blocks with description, port, protocol, and cidr keys."
  default = []
}
