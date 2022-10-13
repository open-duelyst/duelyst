# TODO: Add logging support.
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution#logging_config
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_realtime_log_config
resource "aws_cloudfront_distribution" "distribution" {
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [var.cdn_domain_name]
  price_class     = "PriceClass_100" # North America + Europe only.

  origin {
    domain_name = var.bucket_dns_name
    origin_id   = var.bucket_origin_id
  }

  # Cache static assets for 10 minutes by default.
  default_cache_behavior {
    target_origin_id           = var.bucket_origin_id
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    viewer_protocol_policy     = "https-only"
    compress                   = false
    cache_policy_id            = aws_cloudfront_cache_policy.cache_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.response_headers_policy.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.origin_policy.id
  }

  # Cache rarely-changed resource assets for 1 day by default.
  ordered_cache_behavior {
    path_pattern               = "/${var.cdn_path_prefix}resources/*"
    target_origin_id           = var.bucket_origin_id
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    viewer_protocol_policy     = "https-only"
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.cache_policy_resources.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.response_headers_policy.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.origin_policy.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}
