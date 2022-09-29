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

variable "ingress_description" {
  type        = string
  description = "The description of the ingress service."
}

variable "ingress_port" {
  type        = number
  description = "The port on which to allow ingress traffic."
}

variable "ingress_protocol" {
  type        = string
  description = "The protocol of ingress traffic."
  default     = "tcp"
}

variable "ingress_cidr_blocks" {
  type        = list(string)
  description = "The networks from which to allow ingress traffic."
  default     = ["0.0.0.0/0"]
}
