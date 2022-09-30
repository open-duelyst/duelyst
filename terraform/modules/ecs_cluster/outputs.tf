output "id" {
  value = aws_ecs_cluster.cluster.id
}

output "capacity_provider" {
  value = aws_ecs_capacity_provider.capacity_provider.name
}
