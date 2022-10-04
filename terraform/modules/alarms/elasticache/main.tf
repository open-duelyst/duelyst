locals {
  memory_available = {
    "cache.t3.micro" = 0.5 * 1000 * 1000 * 1000 # Bytes.
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_alarm" {
  alarm_name        = "ElastiCache CPU Utilization"
  alarm_description = "ElastiCache system CPU utilization is over ${var.cpu_threshold}%"

  namespace           = "AWS/ElastiCache"
  metric_name         = "CPUUtilization"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.cpu_threshold

  dimensions = {
    CacheClusterId = var.cluster_id
    CacheNodeId    = var.node_id
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "engine_cpu_alarm" {
  alarm_name        = "ElastiCache Engine CPU Utilization"
  alarm_description = "ElastiCache engine CPU utilization is over ${var.engine_cpu_threshold}%"

  namespace           = "AWS/ElastiCache"
  metric_name         = "EngineCPUUtilization"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.engine_cpu_threshold

  dimensions = {
    CacheClusterId = var.cluster_id
    CacheNodeId    = var.node_id
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "memory_alarm" {
  alarm_name        = "ElastiCache Memory Utilization"
  alarm_description = "ElastiCache memory utilization is over ${var.memory_threshold}%"

  namespace           = "AWS/ElastiCache"
  metric_name         = "BytesUsedForCache"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.memory_threshold * local.memory_available[var.instance_type] / 100

  dimensions = {
    CacheClusterId = var.cluster_id
    CacheNodeId    = var.node_id
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
