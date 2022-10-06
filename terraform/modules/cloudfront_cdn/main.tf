resource "aws_cloudfront_distribution" "distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  aliases             = [var.cdn_domain_name]
  price_class         = "PriceClass_100" # North America + Europe only.

  origin {
    domain_name = var.bucket_dns_name
    origin_id   = var.bucket_origin_id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.bucket_origin_id
    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 3600  # 1 hour.
    max_ttl                = 86400 # 1 day.

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
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

resource "aws_cloudfront_response_headers_policy" "cors_policy" {
  name    = "cors-policy"
  comment = "Enable CORS for CDN requests"

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
