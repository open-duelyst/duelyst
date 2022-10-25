resource "aws_cloudwatch_metric_alarm" "unhealthy_target_alarm" {
  for_each = var.all_target_group_ids

  alarm_name        = "Unhealthy targets in group ${each.key}"
  alarm_description = "At least ${var.unhealthy_target_threshold} targets are unhealthy in target group ${each.key}."

  namespace           = "AWS/ApplicationELB"
  metric_name         = "UnHealthyHostCount"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.unhealthy_target_threshold

  dimensions = {
    LoadBalancer = var.load_balancer_id
    TargetGroup  = each.value
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "error_rate_alarm" {
  for_each = var.http_target_group_ids

  alarm_name        = "Elevated 5xx for targets in group ${each.key}"
  alarm_description = "Observed more than ${var.error_threshold} 5xx errors for target ${each.key} in window."

  namespace           = "AWS/ApplicationELB"
  metric_name         = "HTTPCode_Target_5XX_Count"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.error_threshold

  dimensions = {
    LoadBalancer = var.load_balancer_id
    TargetGroup  = each.value
  }

  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "60" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 5    # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 3    # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
