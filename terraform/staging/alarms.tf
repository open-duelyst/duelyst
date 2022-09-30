module "email_sns_topic" {
  source        = "../modules/alarms/email_sns_topic"
  email_address = var.email_address_for_alarms
}

module "data_transfer_alarm" {
  source        = "../modules/alarms/data_transfer"
  alarm_actions = [module.email_sns_topic.topic_arn]
}

module "billing_alarm" {
  source        = "../modules/alarms/billing"
  threshold     = var.billing_alarm_threshold
  alarm_actions = [module.email_sns_topic.topic_arn]
}
