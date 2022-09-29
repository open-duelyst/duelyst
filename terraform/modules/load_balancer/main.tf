resource "aws_lb" "lb" {
  name               = var.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = var.security_groups
  subnets            = var.subnets

  enable_deletion_protection = true

  access_logs {
    enabled = false
    bucket  = ""
  }
}
