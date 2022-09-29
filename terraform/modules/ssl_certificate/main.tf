# To validate a cert, create a CNAME record with the name and value provided by AWS ACM.
# Docs: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"
}
