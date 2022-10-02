# NOTE: Accessing the SSM parameter here will include it in the Terraform state.
# There may not be a way to avoid this aside from migrating to AWS Secrets Manager.
data "aws_ssm_parameter" "postgres_password" {
  name = "/duelyst/staging/postgres/password"
}

module "postgres" {
  source = "../modules/postgres_db"
  name   = "duelyst-staging"
  subnet_ids = [
    module.first_subnet.id,
    module.second_subnet.id,
    module.third_subnet.id,
  ]
  security_group_ids = [module.postgres_security_group.id]
  username           = var.database_user
  password           = data.aws_ssm_parameter.postgres_password.value
}
