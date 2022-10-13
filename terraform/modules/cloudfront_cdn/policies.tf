locals {
  code_ttl     = 3600  # 1 hour.
  resource_ttl = 86400 # 1 day.
}

resource "aws_cloudfront_cache_policy" "cache_policy" {
  name        = "cache-policy"
  min_ttl     = local.code_ttl
  default_ttl = local.code_ttl
  max_ttl     = local.code_ttl

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false

    cookies_config { cookie_behavior = "none" }
    headers_config {
      header_behavior = "whitelist"
      headers { items = ["Origin"] }
    }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_cache_policy" "cache_policy_resources" {
  name        = "cache-policy-resources"
  min_ttl     = local.resource_ttl
  default_ttl = local.resource_ttl
  max_ttl     = local.resource_ttl

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config { cookie_behavior = "none" }
    headers_config {
      header_behavior = "whitelist"
      headers { items = ["Origin"] }
    }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_origin_request_policy" "origin_policy" {
  name = "origin-policy"

  cookies_config { cookie_behavior = "none" }
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ]
    }
  }
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
        "https://${var.cdn_domain_name}",
      ]
    }
  }
}
