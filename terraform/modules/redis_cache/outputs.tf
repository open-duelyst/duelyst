output "instance_dns" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "instance_type" {
  value = aws_elasticache_cluster.redis.node_type
}
