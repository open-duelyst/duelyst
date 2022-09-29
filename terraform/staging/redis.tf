module "redis" {
  source     = "../modules/redis_cache"
  name       = "duelyst-staging"
  subnet_ids = [module.app_subnet.id]
}
