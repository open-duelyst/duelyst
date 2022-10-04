module "email_sns_topic" {
  source        = "../modules/alarms/email_sns_topic"
  email_address = var.email_address_for_alarms
}

module "billing_alarm" {
  source        = "../modules/alarms/billing"
  threshold     = var.billing_alarm_threshold
  alarm_actions = [module.email_sns_topic.topic_arn]
}

module "redis_alarms" {
  source               = "../modules/alarms/elasticache"
  cluster_id           = "duelyst-staging"
  node_id              = "0001"
  instance_type        = module.redis.instance_type
  cpu_threshold        = 90
  engine_cpu_threshold = 90
  memory_threshold     = 90
  alarm_actions        = [module.email_sns_topic.topic_arn]
}
