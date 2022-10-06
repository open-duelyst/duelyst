variable "bucket_dns_name" {
  type        = string
  description = "The bucket_regional_domain_name attribute of your S3 bucket."
}

variable "bucket_origin_id" {
  type        = string
  description = "A unique name for this origin."
}

variable "cdn_domain_name" {
  type        = string
  description = "Domain name for the Cloudfront distribution."
}

variable "app_domain_name" {
  type        = string
  description = "Domain name for the Duelyst API service."
}

variable "cdn_path_prefix" {
  type        = string
  description = "The CDN path prefix to use for static asset policies, e.g. 'staging/'."
}

variable "certificate_arn" {
  type        = string
  description = "The ACM SSL certificate ARN to use for this distribution."
}
