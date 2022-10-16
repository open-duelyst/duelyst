variable "name" {
  type        = string
  description = "The name of this VPC."
}

variable "cidr" {
  type        = string
  description = "The CIDR to create for this VPC."
}

variable "region" {
  type        = string
  description = "The AWS region to use for the S3 VPC endpoint."
}
