module "ecr_repository_api" {
  source = "../modules/ecr_repository"
  name   = "duelyst-api"
}

module "ecr_repository_game" {
  source = "../modules/ecr_repository"
  name   = "duelyst-game"
}

module "ecr_repository_sp" {
  source = "../modules/ecr_repository"
  name   = "duelyst-sp"
}

module "ecr_repository_worker" {
  source = "../modules/ecr_repository"
  name   = "duelyst-worker"
}

module "ecr_repository_migrate" {
  source = "../modules/ecr_repository"
  name   = "duelyst-migrate"
}
