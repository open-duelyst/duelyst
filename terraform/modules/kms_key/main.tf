resource "aws_kms_key" "key" {
  description = var.description
  key_usage   = "ENCRYPT_DECRYPT"
}

resource "aws_kms_alias" "alias" {
  name          = "alias/${var.name}"
  target_key_id = aws_kms_key.key.key_id
}
