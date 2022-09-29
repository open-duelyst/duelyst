module "internal_vpc" {
  source = "../modules/vpc"
  name   = "duelyst-vpc"
  cidr   = "10.0.0.0/16" # 65534 addresses.
}

module "first_subnet" {
  source            = "../modules/subnet"
  name              = "duelyst-subnet-1"
  vpc_id            = module.internal_vpc.id
  cidr              = "10.0.1.0/24" # 254 addresses.
  availability_zone = var.first_availability_zone
}

module "second_subnet" {
  source            = "../modules/subnet"
  name              = "duelyst-subnet-2"
  vpc_id            = module.internal_vpc.id
  cidr              = "10.0.2.0/24" # 254 addresses.
  availability_zone = var.second_availability_zone
}

module "third_subnet" {
  source            = "../modules/subnet"
  name              = "duelyst-subnet-3"
  vpc_id            = module.internal_vpc.id
  cidr              = "10.0.3.0/24" # 254 addresses.
  availability_zone = var.third_availability_zone
}
