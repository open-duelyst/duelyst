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

variable "assets_bucket_name" {
  type = string
}

variable "staging_domain_name" {
  type = string
}

variable "cdn_domain_name" {
  type = string
}

variable "subnet_availability_zone" {
  type = string
}

variable "email_address_for_alarms" {
  type = string
}

variable "billing_alarm_threshold" {
  type = string
}
