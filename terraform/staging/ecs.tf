module "ecs_cluster" {
  source             = "../modules/ecs_cluster"
  name               = "duelyst-staging"
  ssh_public_key     = var.ssh_public_key
  security_group_ids = [module.internal_security_group.id]

  subnets = [
    module.first_subnet.id,
    module.second_subnet.id,
    module.third_subnet.id,
  ]
}

module "ecs_service_api" {
  source           = "../modules/ecs_service"
  name             = "duelyst-api-staging"
  cluster          = module.ecs_cluster.id
  container_image  = "nginx:latest" # FIXME
  container_count  = 1
  service_port     = 80
  alb_target_group = module.staging_load_balancer.api_target_group_arn
}
