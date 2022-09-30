resource "aws_elasticache_cluster" "redis" {
  cluster_id           = var.name
  engine               = "redis"
  node_type            = var.instance_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.2"
  subnet_group_name    = aws_elasticache_subnet_group.subnet_group.name
  security_group_ids   = var.security_group_ids
  port                 = 6379
}

resource "aws_elasticache_subnet_group" "subnet_group" {
  name       = "${var.name}-subnet"
  subnet_ids = var.subnet_ids
  depends_on = [aws_iam_service_linked_role.service_linked_role]
}

resource "aws_iam_service_linked_role" "service_linked_role" {
  aws_service_name = "elasticache.amazonaws.com"
}
