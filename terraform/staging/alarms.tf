module "email_sns_topic" {
  source        = "../modules/alarms/email_sns_topic"
  email_address = var.email_address_for_alarms
}

module "billing_alarm" {
  source        = "../modules/alarms/billing"
  threshold     = var.billing_alarm_threshold
  alarm_actions = [module.email_sns_topic.topic_arn]
}

module "ecs_alarms" {
  source        = "../modules/alarms/ecs"
  cluster_name  = "duelyst-staging"
  service_names = []
  alarm_actions = [module.email_sns_topic.topic_arn]
}

module "redis_alarms" {
  source        = "../modules/alarms/elasticache"
  cluster_id    = "duelyst-staging"
  node_id       = "0001"
  instance_type = module.redis.instance_type
  alarm_actions = [module.email_sns_topic.topic_arn]
}

module "postgres_alarms" {
  source        = "../modules/alarms/rds"
  database_id   = "duelyst-staging"
  instance_type = module.postgres.instance_type
  alarm_actions = [module.email_sns_topic.topic_arn]
}
