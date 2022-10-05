resource "aws_ecs_cluster" "cluster" {
  name = var.name
}

resource "aws_ecs_cluster_capacity_providers" "capacity_mapping" {
  cluster_name = aws_ecs_cluster.cluster.name
  capacity_providers = [
    aws_ecs_capacity_provider.capacity_provider.name,
    aws_ecs_capacity_provider.spot_capacity_provider.name,
  ]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.capacity_provider.name
  }
}
