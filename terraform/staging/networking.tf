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

module "internal_security_group" {
  source      = "../modules/security_group"
  name        = "internal-only"
  description = "Disallows all ingress traffic"
  vpc_id      = module.internal_vpc.id
  ingress_configs = [
    {
      description = "Allow TCP/80 from VPC"
      port        = 80
      cidr_blocks = ["10.0.0.0/16"]
    },
    {
      description = "Allow TCP/443 from VPC"
      port        = 443
      cidr_blocks = ["10.0.0.0/16"]
    },
    {
      description = "Allow TCP/3000 from VPC"
      port        = 3000
      cidr_blocks = ["10.0.0.0/16"]
    },
    # Not running Postgres in ECS currently.
    #{
    #  description = "Allow TCP/5432 from VPC"
    #  port        = 5432
    #  cidr_blocks = ["10.0.0.0/16"]
    #},
    # Not running Redis in ECS currently.
    #{
    #  description = "Allow TCP/6379 from VPC"
    #  port        = 6379
    #  cidr_blocks = ["10.0.0.0/16"]
    #},
    {
      description = "Allow TCP/8000 from VPC"
      port        = 8000
      cidr_blocks = ["10.0.0.0/16"]
    },
    {
      description = "Allow TCP/8001 from VPC"
      port        = 8001
      cidr_blocks = ["10.0.0.0/16"]
    },
    # Temporary SSH access.
    #{
    #  description = "Allow TCP/22 from public Internet"
    #  port        = 22
    #  cidr_blocks = ["0.0.0.0/0"]
    #}
  ]
}

module "load_balancer_security_group" {
  source      = "../modules/security_group"
  name        = "https"
  description = "Allows load balancer access from the public Internet"
  vpc_id      = module.internal_vpc.id
  ingress_configs = [
    {
      description = "Allow TCP/80 from 0.0.0.0/0"
      port        = 80
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allow TCP/443 from 0.0.0.0/0"
      port        = 443
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allows TCP/8000 from 0.0.0.0/0"
      port        = 8000
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allows TCP/8001 from 0.0.0.0/0"
      port        = 8001
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "postgres_security_group" {
  source      = "../modules/security_group"
  name        = "postgres"
  description = "Allows Postgres traffic from the VPC"
  vpc_id      = module.internal_vpc.id
  ingress_configs = [
    {
      description = "Allow TCP/5432 from VPC"
      port        = 5432
      cidr_blocks = ["10.0.0.0/16"]
    }
  ]
}

module "redis_security_group" {
  source      = "../modules/security_group"
  name        = "redis"
  description = "Allow Redis traffic from the VPC"
  vpc_id      = module.internal_vpc.id
  ingress_configs = [
    {
      description = "Allow TCP/6379 from VPC"
      port        = 6379
      cidr_blocks = ["10.0.0.0/16"]
    }
  ]
}
