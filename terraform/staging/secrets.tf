module "kms_key" {
  source      = "../modules/kms_key"
  name        = "duelyst-staging"
  description = "KMS key for duelyst-staging."
}

data "aws_ssm_parameter" "postgres_password" {
  name = "/duelyst/staging/postgres/password"
}
