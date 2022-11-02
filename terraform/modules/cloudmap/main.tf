resource "aws_service_discovery_private_dns_namespace" "namespace" {
  name = var.name
  vpc  = var.vpc_id
}

// TODO: Move this to its own module.
resource "aws_service_discovery_service" "redis" {
  name = "redis"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.namespace.id

    dns_records {
      type = "SRV"
      ttl  = 10 # Seconds.
    }
  }
}
