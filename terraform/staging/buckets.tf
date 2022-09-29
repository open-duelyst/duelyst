module "assets_bucket" {
  source      = "../modules/assets_bucket"
  bucket_name = var.assets_bucket_name
}

module "cloudfront_cdn" {
  source           = "../modules/cloudfront_cdn"
  bucket_dns_name  = module.assets_bucket.bucket_dns_name
  bucket_origin_id = "duelyst-assets"

  # Requires SSL cert.
  #dns_aliases      = [var.cdn_domain_name]
}
