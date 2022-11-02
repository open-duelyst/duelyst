resource "aws_service_discovery_service" "service" {
  name = var.name

  dns_config {
    namespace_id = var.namespace_id

    dns_records {
      type = "A"
      ttl  = 10 # Seconds.
    }
  }
}
