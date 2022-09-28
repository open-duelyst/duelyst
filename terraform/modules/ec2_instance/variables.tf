variable "architecture" {
  type        = string
  description = "The machine architecture for this instance (amd64 or arm64)"
  default     = "arm64"
}

variable "instance_type" {
  type        = string
  description = "The AWS EC2 instance type to provision."
  default     = "t4g.micro"
}
