variable "name" {
  type        = string
  description = "The name of this subnet."
}

variable "vpc_id" {
  type        = string
  description = "The VPC in which to create this subnet."
}

variable "cidr" {
  type        = string
  description = "The CIDR to create for this subnet."
}

variable "availability_zone" {
  type        = string
  description = "The availability zone in which to create this subnet."
}
