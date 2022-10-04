output "api_target_group_arn" {
  value = aws_lb_target_group.api_target_group.arn
}

output "sp_target_group_arn" {
  value = aws_lb_target_group.sp_target_group.arn
}

output "load_balancer_id" {
  value = aws_lb.lb.arn_suffix
}

output "target_group_ids" {
  value = [
    aws_lb_target_group.api_target_group.arn_suffix,
    aws_lb_target_group.sp_target_group.arn_suffix,
  ]
}
