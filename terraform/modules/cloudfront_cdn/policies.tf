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
        items = [
          "Origin",
          "Access-Control-Request-Method",
          "Access-Control-Request-Headers",
        ]
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
        items = [
          "Origin",
          # Don't think we need these to be part of the cache key.
          #"Access-Control-Request-Method",
          #"Access-Control-Request-Headers",
        ]
      }
    }
    query_strings_config { query_string_behavior = "none" }
  }
}

# https://aws.amazon.com/premiumsupport/knowledge-center/no-access-control-allow-origin-error/
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
        "https://${var.cdn_domain_name}", # Was previously missing 'https://'.
      ]
    }
  }
}
