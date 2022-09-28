# Creates an SNS topic which sends emails to the provided address.
# SNS is billed based on deliveries, and is free for the first 1,000 monthly deliveries.
resource "aws_sns_topic" "topic" {
  name = "send-email-topic"
}

# NOTE: You will need to manually confirm this subscription outside of Terraform before it can be
# used or deleted.
resource "aws_sns_topic_subscription" "subscription" {
  topic_arn = aws_sns_topic.topic.arn
  endpoint  = var.email_address
  protocol  = "email"

  lifecycle {
    # AWS does not allow programmatic deletion of SNS topics.
    prevent_destroy = true
  }
}
