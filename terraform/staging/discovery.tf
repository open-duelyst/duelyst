/* Disabled: Not running Redis or Postgres in ECS currently.
module "cloudmap_namespace" {
  source = "../modules/cloudmap_namespace"
  name   = "duelyst.local"
  vpc_id = module.internal_vpc.id
}

module "cloudmap_service_redis" {
  source         = "../modules/cloudmap_service"
  name           = "redis"
  namespace_id   = module.cloudmap_namespace.id
  namespace_name = module.cloudmap_namespace.name
}

module "cloudmap_service_postgres" {
  source         = "../modules/cloudmap_service"
  name           = "postgres"
  namespace_id   = module.cloudmap_namespace.id
  namespace_name = module.cloudmap_namespace.name
}
*/
