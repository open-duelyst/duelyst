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
  type = list(object({
    description = string
    port        = number
    cidr_blocks = list(string)
  }))
  description = "A list of ingress configuration objects."
  default     = []
}
