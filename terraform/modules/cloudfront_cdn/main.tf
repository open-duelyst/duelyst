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
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.origin_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.response_headers_policy.id
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
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.origin_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.response_headers_policy.id
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

resource "aws_cloudfront_cache_policy" "cache_policy" {
  name        = "cache-policy"
  min_ttl     = 60    # 1 minute.
  default_ttl = 600   # 10 minutes.
  max_ttl     = 86400 # 1 day.

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false

    cookies_config { cookie_behavior = "none" }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Origin"]
      }
    }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_cache_policy" "cache_policy_resources" {
  name        = "cache-policy-resources"
  min_ttl     = 600   # 10 minutes.
  default_ttl = 86400 # 1 day.
  max_ttl     = 86400 # 1 day.

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config { cookie_behavior = "none" }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Origin"]
      }
    }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_origin_request_policy" "origin_policy" {
  name = "origin-policy"

  cookies_config { cookie_behavior = "none" }
  headers_config { header_behavior = "allViewer" }
  query_strings_config { query_string_behavior = "none" }
}

resource "aws_cloudfront_response_headers_policy" "response_headers_policy" {
  name = "response-headers-policy"

  cors_config {
    access_control_allow_credentials = false
    origin_override                  = true

    access_control_allow_headers { items = ["*"] }
    access_control_allow_methods { items = ["GET", "HEAD", "OPTIONS"] }
    access_control_allow_origins {
      items = [
        "https://${var.app_domain_name}",
        "https://${var.cdn_domain_name}"
      ]
    }
  }
}
