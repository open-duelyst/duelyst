variable "bucket_name" {
  type        = string
  description = "The globally unique name for this S3 bucket."
}

variable "api_origin" {
  type        = string
  description = "The CORS origin for the API server."
}

variable "cdn_origin" {
  type        = string
  description = "The CORS origin for the CDN."
}
