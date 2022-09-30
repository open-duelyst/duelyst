output "api_target_group_arn" {
  value = aws_lb_target_group.api_target_group.arn
}

output "sp_target_group_arn" {
  value = aws_lb_target_group.sp_target_group.arn
}
