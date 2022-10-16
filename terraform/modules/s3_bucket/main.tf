resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_cors_configuration" "cors_config" {
  bucket = aws_s3_bucket.bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [var.api_origin, var.cdn_origin]
    expose_headers = [
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Origin",
      "Access-Control-Max-Age",
      "ETag",
    ]
    max_age_seconds = 86400
  }
}
