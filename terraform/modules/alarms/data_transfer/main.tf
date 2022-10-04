# Fires a CloudWatch alarm via email when EC2 Data Transfer is on track to reach 80% of the Free Tier threshold in the
# billable month. Data Transfer is potentially the largest AWS billing line item, so this will help us avoid paying
# $0.09/GB sent.
# NOTE: Alarms targeting Standard metrics (not High-resolution metrics) are billed at $0.10/month. The first 10 alarms
# in an AWS account are free, indefinitely.
# NOTE: Aggregating metrics across dimensions (in this case InstanceId) is only available with Detailed Monitoring.
resource "aws_cloudwatch_metric_alarm" "alarm" {
  alarm_name        = "ec2-data-transfer-free-tier"
  alarm_description = "EC2 Data Transfer is at 90% of Free Tier threshold!"

  namespace           = "AWS/EC2"
  metric_name         = "NetworkOut" # In bytes.
  statistic           = "Sum"
  comparison_operator = "GreaterThanOrEqualToThreshold"

  # Set the threshold based on the past hour, in proportion to the 100GB monthly Free Tier limit.
  # Set the threshold to 80% of the limit, so we get the alarm before billing begins.
  # There are 730 hours in the average month. 100000000000 / 730 * 80% = 109589041.
  threshold = "109589041" # 109MB/hour in bytes. Proportional to 80GB/month.

  dimensions = {
    InstanceId = "*"
  }

  # Check the metric once per hour.
  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarm-evaluation
  period              = "3600" # The period in seconds over which the specified statistic is applied.
  evaluation_periods  = 1      # The number of periods over which data is compared to the specified threshold.
  datapoints_to_alarm = 1      # The number of datapoints that must be breaching to trigger the alarm.

  alarm_actions             = var.alarm_actions
  insufficient_data_actions = []
}
