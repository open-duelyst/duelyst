variable "bucket_dns_name" {
  type        = string
  description = "The bucket_regional_domain_name attribute of your S3 bucket."
}

variable "bucket_origin_id" {
  type        = string
  description = "A unique name for this origin."
}

variable "root_object" {
  type    = string
  default = "staging/index.html"
}

variable "dns_aliases" {
  type    = list(string)
  default = []
}

variable "certificate_arn" {
  type        = string
  description = "The ACM SSL certificate ARN to use for this distribution."
}
