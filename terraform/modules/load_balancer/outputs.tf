output "api_target_group_arn" {
  value = aws_lb_target_group.api_target_group.arn
}

output "game_target_group_arn" {
  value = aws_lb_target_group.game_target_group.arn
}

output "sp_target_group_arn" {
  value = aws_lb_target_group.sp_target_group.arn
}

output "load_balancer_id" {
  value = aws_lb.lb.arn_suffix
}

# Used in Cloudwatch alarms.
output "http_target_group_ids" {
  value = {
    api = aws_lb_target_group.api_target_group.arn_suffix
  }
}

# Used in Cloudwatch alarms.
output "all_target_group_ids" {
  value = {
    api  = aws_lb_target_group.api_target_group.arn_suffix
    game = aws_lb_target_group.game_target_group.arn_suffix
    sp   = aws_lb_target_group.sp_target_group.arn_suffix
  }
}
