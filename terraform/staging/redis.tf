module "redis" {
  source             = "../modules/redis_cache"
  name               = "duelyst-staging"
  subnet_ids         = [module.first_subnet.id]
  security_group_ids = [module.redis_security_group.id]
}
