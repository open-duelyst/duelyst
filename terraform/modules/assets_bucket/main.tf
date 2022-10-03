resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
}

# This may not be what we need for CORS from App -> CDN.
#resource "aws_s3_bucket_cors_configuration" "cors_config" {
#  bucket = aws_s3_bucket.bucket.id
#
#  cors_rule {
#    allowed_headers = ["*"]
#    allowed_methods = ["GET", "HEAD"]
#    allowed_origins = [var.domain_name, var.cdn_domain_name]
#    expose_headers  = ["ETag"]
#    max_age_seconds = 3600
#  }
#}
