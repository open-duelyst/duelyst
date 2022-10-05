resource "aws_lb_target_group" "api_target_group" {
  name                 = "${var.name}-api"
  vpc_id               = var.vpc_id
  port                 = var.api_service_port
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  deregistration_delay = 120 # Down from 300; matches Spot termination delay.

  health_check {
    path    = "/healthcheck"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "game_target_group" {
  name                 = "${var.name}-game"
  vpc_id               = var.vpc_id
  port                 = var.game_service_port
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  deregistration_delay = 120 # Down from 300.

  health_check {
    path    = "/health"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "sp_target_group" {
  name                 = "${var.name}-sp"
  vpc_id               = var.vpc_id
  port                 = var.sp_service_port
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  deregistration_delay = 120 # Down from 300.

  health_check {
    path    = "/health"
    matcher = "200"
  }
}
