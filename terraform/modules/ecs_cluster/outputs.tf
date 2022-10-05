output "id" {
  value = aws_ecs_cluster.cluster.id
}

output "capacity_provider" {
  value = aws_ecs_capacity_provider.capacity_provider.name
}

output "spot_capacity_provider" {
  value = aws_ecs_capacity_provider.spot_capacity_provider.name
}

output "task_role" {
  value = aws_iam_role.task_role.arn
}
