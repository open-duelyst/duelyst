module "assets_bucket" {
  source      = "../modules/s3_bucket"
  bucket_name = var.assets_bucket_name
  api_origin  = "https://${var.staging_domain_name}"
  cdn_origin  = "https://${var.cdn_domain_name}"
}

module "replays_bucket" {
  source      = "../modules/s3_bucket"
  bucket_name = var.replays_bucket_name
  api_origin  = "https://${var.staging_domain_name}"
  cdn_origin  = "https://${var.cdn_domain_name}"
}

module "cloudfront_cdn" {
  source           = "../modules/cloudfront_cdn"
  bucket_dns_name  = module.assets_bucket.bucket_dns_name
  bucket_origin_id = "duelyst-assets"
  app_domain_name  = var.staging_domain_name
  cdn_domain_name  = var.cdn_domain_name
  cdn_path_prefix  = "staging/"
  certificate_arn  = module.cdn_ssl_certificate.arn
}

module "cdn_ssl_certificate" {
  source      = "../modules/ssl_certificate"
  domain_name = var.cdn_domain_name
}
