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

variable "ssh_public_key" {
  type = string
}

variable "assets_bucket_name" {
  type = string
}

variable "replays_bucket_name" {
  type = string
}

variable "staging_domain_name" {
  type = string
}

variable "cdn_domain_name" {
  type = string
}

variable "first_availability_zone" {
  type = string
}

variable "second_availability_zone" {
  type = string
}

variable "third_availability_zone" {
  type = string
}

variable "firebase_project" {
  type = string
}

variable "firebase_url" {
  type = string
}

variable "database_user" {
  type = string
}

variable "ecr_registry_id" {
  type = string
}

variable "email_address_for_alarms" {
  type = string
}
