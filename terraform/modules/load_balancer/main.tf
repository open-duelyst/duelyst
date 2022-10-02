resource "aws_lb" "lb" {
  name                       = var.name
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = var.security_groups
  subnets                    = var.subnets
  enable_deletion_protection = false

  access_logs {
    enabled = false
    bucket  = ""
  }
}

resource "aws_lb_listener" "http_to_https_listener" {
  load_balancer_arn = aws_lb.lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = var.api_listen_port
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "api_listener" {
  load_balancer_arn = aws_lb.lb.arn
  port              = var.api_listen_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_target_group.arn
  }
}

resource "aws_lb_target_group" "api_target_group" {
  name             = "${var.name}-api"
  vpc_id           = var.vpc_id
  port             = var.api_service_port
  protocol         = "HTTP"
  protocol_version = "HTTP1"

  health_check {
    matcher = "200"
    path    = "/healthcheck"
  }
}

resource "aws_lb_listener" "sp_listener" {
  load_balancer_arn = aws_lb.lb.arn
  port              = var.sp_listen_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.sp_target_group.arn
  }
}

resource "aws_lb_target_group" "sp_target_group" {
  name             = "${var.name}-sp"
  vpc_id           = var.vpc_id
  port             = var.sp_service_port
  protocol         = "HTTP"
  protocol_version = "HTTP1"

  health_check {
    protocol = "TCP"
  }
}
