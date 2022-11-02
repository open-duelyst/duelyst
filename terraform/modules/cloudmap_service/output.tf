output "service_arn" {
  value = aws_service_discovery_service.service.arn
}

output "dns_name" {
  value = "${aws_service_discovery_service.service.name}.${var.namespace_name}"
}
