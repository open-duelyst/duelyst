# Provide these variables in a terraform.tfvars file.

variable "aws_region" {
  type = string
}

variable "aws_access_key" {
  type = string
}

variable "aws_secret_key" {
  type = string
}

variable "email_address_for_alarms" {
  type = string
}
