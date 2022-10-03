variable "bucket_name" {
  type        = string
  description = "The globally unique name for this S3 bucket."
}

variable "domain_name" {
  type        = string
  description = "The primary domain for CORS configuration."
}

variable "cdn_domain_name" {
  type        = string
  description = "The CDN domain name for CORS configuration."
}
