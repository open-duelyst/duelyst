resource "aws_db_instance" "postgres" {
  engine            = "postgres"
  engine_version    = var.postgres_version
  instance_class    = var.instance_type
  availability_zone = var.availability_zone
  allocated_storage = var.storage

  db_name  = var.database_name
  username = var.username
  password = var.password

  tags = {
    Name = var.name
  }
}
