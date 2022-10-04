locals {
  memory_available = {
    "db.t4g.micro" = 1.0 * 1000 * 1000 * 1000 # Bytes.
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_alarm" {
  alarm_name        = "RDS CPU Utilization"
  alarm_description = "RDS CPU utilization is over ${var.cpu_threshold}%"

  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.cpu_threshold

  dimensions = {
    DBInstanceIdentifier = var.database_id
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "memory_alarm" {
  alarm_name        = "RDS Memory Utilization"
  alarm_description = "RDS memory utilization is over ${var.memory_threshold}%"

  namespace           = "AWS/RDS"
  metric_name         = "FreeableMemory"
  statistic           = "Minimum"
  comparison_operator = "LessThanOrEqualToThreshold"
  threshold           = local.memory_available[var.instance_type] * (100 - var.memory_threshold) / 100

  dimensions = {
    DBInstanceIdentifier = var.database_id
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
