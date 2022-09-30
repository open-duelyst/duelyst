module "staging_load_balancer" {
  source          = "../modules/load_balancer"
  name            = "duelyst-staging"
  vpc_id          = module.internal_vpc.id
  security_groups = [module.https_security_group.id]
  subnets = [
    module.first_subnet.id,
    module.second_subnet.id,
    module.third_subnet.id,
  ]
  certificate_arn = module.staging_ssl_certificate.arn

  api_listen_port  = 443
  api_service_port = 3000
  sp_listen_port   = 8000
  sp_service_port  = 8000
}

module "staging_ssl_certificate" {
  source      = "../modules/ssl_certificate"
  domain_name = var.staging_domain_name
}
