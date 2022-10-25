/* Disabling Cluster-wide alarms, since we prevent these by right-sizing services.
resource "aws_cloudwatch_metric_alarm" "cpu_alarm" {
  alarm_name        = "ECS CPU Utilization"
  alarm_description = "ECS CPU utilization is over ${var.cpu_threshold}%"

  namespace           = "AWS/ECS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.cpu_threshold

  dimensions = {
    ClusterName = var.cluster_name
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "memory_alarm" {
  alarm_name        = "ECS Memory Utilization"
  alarm_description = "ECS memory utilization is over ${var.memory_threshold}%"

  namespace           = "AWS/ECS"
  metric_name         = "MemoryUtilization"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.memory_threshold

  dimensions = {
    ClusterName = var.cluster_name
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
*/

resource "aws_cloudwatch_metric_alarm" "service_cpu_alarm" {
  for_each = toset(var.service_names)

  alarm_name        = "ECS Service CPU Utilization for ${each.key}"
  alarm_description = "ECS service CPU utilization for ${each.key} is over ${var.cpu_threshold}%"

  namespace           = "AWS/ECS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.cpu_threshold

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = each.key
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "service_memory_alarm" {
  for_each = toset(var.service_names)

  alarm_name        = "ECS Service Memory Utilization for ${each.key}"
  alarm_description = "ECS service memory utilization for ${each.key} is over ${var.memory_threshold}%"

  namespace           = "AWS/ECS"
  metric_name         = "MemoryUtilization"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.memory_threshold

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = each.key
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
