module "kms_key" {
  source      = "../modules/kms_key"
  name        = "duelyst-staging"
  description = "KMS key for duelyst-staging."
}
