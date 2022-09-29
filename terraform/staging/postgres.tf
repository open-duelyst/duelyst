module "postgres" {
  source            = "../modules/postgres_db"
  name              = "duelyst-staging"
  availability_zone = var.first_availability_zone
  username          = var.database_user
  password          = var.database_password
}
