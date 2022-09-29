resource "aws_subnet" "subnet" {
  vpc_id            = var.vpc_id
  cidr_block        = var.cidr
  availability_zone = var.availability_zone

  tags = {
    Name = var.name
  }
}
