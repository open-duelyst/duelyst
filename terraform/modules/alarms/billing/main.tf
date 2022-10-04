# NOTE: You must enable monitoring of estimated charges before creating alerts.
# Docs: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html#turning_on_billing_metrics
resource "aws_cloudwatch_metric_alarm" "alarm" {
  alarm_name        = "Estimated monthly bill will exceed target threshold"
  alarm_description = "AWS bill is on track to exceed ${var.threshold} USD this month"

  namespace           = "AWS/Billing"
  metric_name         = "EstimatedCharges"
  statistic           = "Maximum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = var.threshold

  dimensions = {
    Currency = "USD"
  }

  # Check the metric once per hour.
  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "3600" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 1      # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 1      # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
