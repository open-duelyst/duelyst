module "ecs_cluster" {
  source             = "../modules/ecs_cluster"
  name               = "duelyst-staging"
  ssh_public_key     = var.ssh_public_key
  desired_capacity   = 2 # 4 vCPU for 4 services.
  max_capacity       = 3 # 2 more vCPU for temporary deployment capacity.
  security_group_ids = [module.internal_security_group.id]
  subnets = [
    module.first_subnet.id,
    module.second_subnet.id,
    module.third_subnet.id,
  ]
}

module "ecs_service_api" {
  source            = "../modules/ecs_service"
  name              = "duelyst-api-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.capacity_provider
  task_role         = module.ecs_cluster.task_role
  ecr_registry      = var.ecr_registry_id
  ecr_repository    = module.ecr_repository_api.id
  deployed_version  = "1.97.0"
  container_count   = 1
  service_port      = 3000
  alb_target_group  = module.staging_load_balancer.api_target_group_arn

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "REDIS_HOST", value = module.redis.instance_dns },
    { name = "FIREBASE_URL", value = var.firebase_url },
    { name = "FIREBASE_PROJECT_ID", value = var.firebase_project },
    { name = "S3_ASSETS_DOMAIN", value = var.cdn_domain_name },
    { name = "ALL_CARDS_AVAILABLE", value = true }
  ]

  secrets = [
    { name = "FIREBASE_LEGACY_TOKEN", valueFrom = "/duelyst/staging/firebase/legacy-token" },
    { name = "FIREBASE_CLIENT_EMAIL", valueFrom = "/duelyst/staging/firebase/client-email" },
    { name = "FIREBASE_PRIVATE_KEY", valueFrom = "/duelyst/staging/firebase/private-key" },
    { name = "POSTGRES_CONNECTION", valueFrom = "/duelyst/staging/postgres/connection-string" }
  ]
}

module "ecs_service_sp" {
  source            = "../modules/ecs_service"
  name              = "duelyst-sp-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.capacity_provider
  task_role         = module.ecs_cluster.task_role
  ecr_registry      = var.ecr_registry_id
  ecr_repository    = module.ecr_repository_sp.id
  deployed_version  = "1.97.0"
  container_count   = 1
  service_port      = 8000
  alb_target_group  = module.staging_load_balancer.sp_target_group_arn

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "REDIS_HOST", value = module.redis.instance_dns },
    { name = "FIREBASE_URL", value = var.firebase_url }
  ]

  secrets = [
    { name = "FIREBASE_LEGACY_TOKEN", valueFrom = "/duelyst/staging/firebase/legacy-token" }
  ]
}

module "ecs_service_migrate" {
  source            = "../modules/ecs_service"
  name              = "duelyst-migrate-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.capacity_provider
  task_role         = module.ecs_cluster.task_role
  ecr_registry      = var.ecr_registry_id
  ecr_repository    = module.ecr_repository_migrate.id
  deployed_version  = "1.97.0"
  container_count   = 0 # Change to 1 to apply database migrations.
  container_cpu     = 1
  container_mem     = 350 # "1GB" instances are actually 936MB; system uses 158MB.
  enable_lb         = false
  service_port      = 0
  alb_target_group  = ""

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
  ]

  secrets = [
    { name = "POSTGRES_CONNECTION", valueFrom = "/duelyst/staging/postgres/connection-string" }
  ]
}
