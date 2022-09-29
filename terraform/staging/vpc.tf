module "internal_vpc" {
  source = "../modules/vpc"
  name   = "duelyst-vpc"
  cidr   = "10.0.0.0/16" # 65534 addresses.
}

module "app_subnet" {
  source            = "../modules/subnet"
  name              = "duelyst-subnet"
  vpc_id            = module.internal_vpc.id
  cidr              = "10.0.0.0/24" # 254 addresses.
  availability_zone = var.subnet_availability_zone
}
