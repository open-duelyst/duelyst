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
  password_ssm_path  = "/duelyst/staging/postgres/password"
}
