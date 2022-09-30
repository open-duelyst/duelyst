variable "name" {
  type        = string
  description = "The name of this Redis instance."
}

variable "instance_type" {
  type        = string
  description = "The instance type of this Redis instance."
  default     = "cache.t3.micro"
}

variable "subnet_ids" {
  type        = list(string)
  description = "The subnets for this Redis instance."
}

variable "security_group_ids" {
  type        = list(string)
  description = "The security groups for this Redis instance."
}
