module "ecs_cluster" {
  source           = "../modules/ecs_cluster"
  name             = "duelyst-staging"
  use_custom_ami   = true
  custom_ami_id    = var.custom_ami_id
  root_volume_size = 8
  ssh_public_key   = var.ssh_public_key

  # Increase capacity to allow graceful deployments without stopping live containers.
  min_capacity      = 0
  max_capacity      = 0
  min_spot_capacity = 2
  max_spot_capacity = 2

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
  capacity_provider = module.ecs_cluster.spot_capacity_provider
  task_role         = module.ecs_cluster.task_role
  image_name        = "public.ecr.aws/${var.ecr_registry_id}/${module.ecr_repository_api.id}"
  deployed_version  = "1.97.12"
  container_count   = 1
  container_mem     = 450
  service_port      = 3000
  alb_target_group  = module.staging_load_balancer.api_target_group_arn

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "REDIS_HOST", value = module.redis.instance_dns },
    { name = "FIREBASE_URL", value = var.firebase_url },
    { name = "FIREBASE_PROJECT_ID", value = var.firebase_project },
    { name = "CDN_DOMAIN_NAME", value = var.cdn_domain_name },
    { name = "DEFAULT_GAME_SERVER", value = var.staging_domain_name },
    { name = "S3_REPLAYS_BUCKET", value = var.replays_bucket_name }
  ]

  secrets = [
    { name = "FIREBASE_LEGACY_TOKEN", valueFrom = "/duelyst/staging/firebase/legacy-token" },
    { name = "FIREBASE_CLIENT_EMAIL", valueFrom = "/duelyst/staging/firebase/client-email" },
    { name = "FIREBASE_PRIVATE_KEY", valueFrom = "/duelyst/staging/firebase/private-key" },
    { name = "POSTGRES_CONNECTION", valueFrom = "/duelyst/staging/postgres/connection-string" }
  ]
}

module "ecs_service_game" {
  source            = "../modules/ecs_service"
  name              = "duelyst-game-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.spot_capacity_provider
  task_role         = module.ecs_cluster.task_role
  image_name        = "public.ecr.aws/${var.ecr_registry_id}/${module.ecr_repository_game.id}"
  deployed_version  = "1.97.12"
  container_count   = 1
  container_mem     = 350
  service_port      = 8001
  alb_target_group  = module.staging_load_balancer.game_target_group_arn

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "GAME_PORT", value = 8001 },
    { name = "REDIS_HOST", value = module.redis.instance_dns },
    { name = "FIREBASE_URL", value = var.firebase_url }
  ]

  secrets = [
    { name = "FIREBASE_LEGACY_TOKEN", valueFrom = "/duelyst/staging/firebase/legacy-token" }
  ]
}

module "ecs_service_sp" {
  source            = "../modules/ecs_service"
  name              = "duelyst-sp-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.spot_capacity_provider
  task_role         = module.ecs_cluster.task_role
  image_name        = "public.ecr.aws/${var.ecr_registry_id}/${module.ecr_repository_sp.id}"
  deployed_version  = "1.97.12"
  container_count   = 1
  container_mem     = 350
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

module "ecs_service_worker" {
  source            = "../modules/ecs_service"
  name              = "duelyst-worker-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.spot_capacity_provider
  task_role         = module.ecs_cluster.task_role
  image_name        = "public.ecr.aws/${var.ecr_registry_id}/${module.ecr_repository_worker.id}"
  deployed_version  = "1.97.12"
  container_count   = 1
  container_mem     = 450

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "REDIS_HOST", value = module.redis.instance_dns },
    { name = "FIREBASE_URL", value = var.firebase_url },
    { name = "FIREBASE_PROJECT_ID", value = var.firebase_project },
    { name = "DEFAULT_GAME_SERVER", value = var.staging_domain_name },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "S3_REPLAYS_BUCKET", value = var.replays_bucket_name }
  ]

  secrets = [
    { name = "FIREBASE_CLIENT_EMAIL", valueFrom = "/duelyst/staging/firebase/client-email" },
    { name = "FIREBASE_PRIVATE_KEY", valueFrom = "/duelyst/staging/firebase/private-key" },
    { name = "POSTGRES_CONNECTION", valueFrom = "/duelyst/staging/postgres/connection-string" }
  ]
}

module "ecs_service_migrate" {
  source            = "../modules/ecs_service"
  name              = "duelyst-migrate-staging"
  cluster           = module.ecs_cluster.id
  capacity_provider = module.ecs_cluster.spot_capacity_provider
  task_role         = module.ecs_cluster.task_role
  image_name        = "public.ecr.aws/${var.ecr_registry_id}/${module.ecr_repository_migrate.id}"
  deployed_version  = "1.97.12"
  container_count   = 0 # Change to 1 to apply database migrations.
  container_mem     = 350

  environment_variables = [
    { name = "NODE_ENV", value = "staging" }
  ]

  secrets = [
    { name = "POSTGRES_CONNECTION", valueFrom = "/duelyst/staging/postgres/connection-string" }
  ]
}
