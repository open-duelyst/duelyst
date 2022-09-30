resource "aws_security_group" "security_group" {
  name        = var.name
  description = var.description
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_configs
    content {
      description = ingress.value["description"]
      from_port   = ingress.value["port"]
      to_port     = ingress.value["port"]
      protocol    = "tcp"
      cidr_blocks = ingress.value["cidr_blocks"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
