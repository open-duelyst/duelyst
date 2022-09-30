resource "aws_db_instance" "postgres" {
  identifier             = var.name
  engine                 = "postgres"
  engine_version         = var.postgres_version
  vpc_security_group_ids = var.security_group_ids
  db_subnet_group_name   = aws_db_subnet_group.subnet_group.id
  instance_class         = var.instance_type
  allocated_storage      = var.storage
  skip_final_snapshot    = true

  db_name  = var.database_name
  username = var.username
  password = var.password
}

resource "aws_db_subnet_group" "subnet_group" {
  name       = var.name
  subnet_ids = var.subnet_ids
}
