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

# Redirect requests for static assets to CloudFront, bypassing API.
resource "aws_lb_listener_rule" "cdn_redirect" {
  listener_arn = aws_lb_listener.api_listener.arn
  priority     = 100

  action {
    type = "redirect"
    redirect {
      host        = var.cdn_domain_name
      path        = "/${var.cdn_path_prefix}#{path}"
      status_code = "HTTP_301"
    }
  }

  condition {
    path_pattern {
      values = [
        "/*.css",
        "/*.ico",
        "/*.gif",
        "/*.js",
        "/resources/*"
      ]
    }
  }
}

resource "aws_lb_listener" "game_listener" {
  load_balancer_arn = aws_lb.lb.arn
  port              = var.game_listen_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.game_target_group.arn
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
