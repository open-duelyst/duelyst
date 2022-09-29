resource "aws_subnet" "subnet" {
  vpc_id            = var.vpc_id
  cidr_block        = var.cidr
  availability_zone = var.availability_zone

  # Temporarily ensure all EC2 instances get public IPs (debugging).
  # Can remove this later once we have things better defined.
  map_public_ip_on_launch = true

  tags = {
    Name = var.name
  }
}
