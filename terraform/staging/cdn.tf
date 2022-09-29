module "assets_bucket" {
  source      = "../modules/assets_bucket"
  bucket_name = var.assets_bucket_name
}

module "cloudfront_cdn" {
  source           = "../modules/cloudfront_cdn"
  bucket_dns_name  = module.assets_bucket.bucket_dns_name
  bucket_origin_id = "duelyst-assets"
  dns_aliases      = [var.cdn_domain_name]
  certificate_arn  = module.cdn_ssl_certificate.arn
}

module "staging_ssl_certificate" {
  source      = "../modules/ssl_certificate"
  domain_name = var.staging_domain_name
}

module "cdn_ssl_certificate" {
  source      = "../modules/ssl_certificate"
  domain_name = var.cdn_domain_name
}
