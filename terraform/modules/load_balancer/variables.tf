variable "name" {
  type        = string
  description = "The name of the ALB."
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID for this load balancer and its targets."
}

variable "security_groups" {
  type        = list(string)
  description = "The security groups to use for this ALB."
}

variable "subnets" {
  type        = list(string)
  description = "The subnets to use for this ALB."
}

variable "certificate_arn" {
  type        = string
  description = "The SSL certificate ARN to use for this load balancer."
}

variable "api_listen_port" {
  type        = number
  description = "Traffic port for the API listener."
  default     = 443
}

variable "api_service_port" {
  type        = number
  description = "Traffic port for the API service."
  default     = 3000
}

variable "game_listen_port" {
  type        = number
  description = "Traffic port for the Game listener."
  default     = 8001
}

variable "game_service_port" {
  type        = number
  description = "Traffic port for the Game service."
  default     = 8001
}

variable "sp_listen_port" {
  type        = number
  description = "Traffic port for the SP listener."
  default     = 8000
}

variable "sp_service_port" {
  type        = number
  description = "Traffic port for the SP service."
  default     = 8000
}

variable "cdn_domain_name" {
  type        = string
  description = "The CDN domain name to use for static asset redirects."
}

variable "cdn_path_prefix" {
  type        = string
  description = "The CDN path prefix to use for static asset requests, e.g. 'staging/'."
}
